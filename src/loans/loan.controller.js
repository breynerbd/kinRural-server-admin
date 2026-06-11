import { db } from "../../configs/db.js";
import { Loan, LoanInstallment } from "./loan.model.js";
import { Account } from "../accounts/account.model.js";
import { Transaction } from "../transactions/transaction.model.js";
import { Movement } from "../movements/movement.model.js";
import { User } from "../users/user.model.js";
import { LOAN_STATUS } from "../constants/loanStatus.js";
import { INSTALLMENT_STATUS } from "../constants/installmentStatus.js";
import { LOAN_RULES } from "../constants/loanRules.js";
import { Transaction as SequelizeTransaction } from "sequelize";

const calcularCuota = (monto, tasaAnual, meses) => {
  if (tasaAnual === 0) {
    return parseFloat((monto / meses).toFixed(2));
  }

  const tasaMensual = tasaAnual / 100 / 12;

  const cuota =
    (monto * (tasaMensual * Math.pow(1 + tasaMensual, meses))) /
    (Math.pow(1 + tasaMensual, meses) - 1);

  return parseFloat(cuota.toFixed(2));
};

export const approveLoan = async (req, res) => {
  const t = await db.transaction();
  try {
    const { id } = req.params;
    const loan = await Loan.findByPk(id, {
      transaction: t,
      lock: SequelizeTransaction.LOCK.UPDATE,
    });

    if (!loan || loan.estado !== LOAN_STATUS.PENDING) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Préstamo no válido" });
    }

    const cuota = calcularCuota(
      parseFloat(loan.monto),
      parseFloat(loan.tasa_interes),
      loan.plazo_meses,
    );

    let saldo = parseFloat(loan.monto);
    const tasaMensual = parseFloat(loan.tasa_interes) / 100 / 12;

    for (let i = 1; i <= loan.plazo_meses; i++) {
      let interes = saldo * tasaMensual;
      interes = parseFloat(interes.toFixed(2));

      let capital = cuota - interes;
      capital = parseFloat(capital.toFixed(2));

      // Ajustar última cuota para eliminar residuo
      if (i === loan.plazo_meses) {
        capital = saldo;
      }

      saldo -= capital;

      await LoanInstallment.create(
        {
          loan_id: loan.id,
          numero_cuota: i,
          fecha_vencimiento: new Date(
            new Date().setMonth(new Date().getMonth() + i),
          ),
          monto_cuota: cuota,
          interes: interes.toFixed(2),
          capital: capital.toFixed(2),
          saldo_restante: Math.max(saldo, 0).toFixed(2),
        },
        { transaction: t },
      );
    }
    const account = await Account.findByPk(loan.account_id);

    if (!account) {
      await t.rollback();

      return res.status(404).json({
        success: false,
        message: "Cuenta no encontrada",
      });
    }

    const transaction = await Transaction.create(
      {
        tipo: LOAN_RULES.TRANSACTION_TYPES.DEPOSIT,
        monto: loan.monto,
        cuenta_destino_id: account.id,
      },
      { transaction: t },
    );

    account.saldo = parseFloat(account.saldo) + parseFloat(loan.monto);
    await account.save({ transaction: t });

    await Movement.create(
      {
        tipo_operacion: LOAN_RULES.OPERATION_TYPES.DEPOSIT,
        tipo_movimiento: LOAN_RULES.MOVEMENT_TYPES.CREDIT,
        monto: loan.monto,
        transaction_id: transaction.id,
        account_id: account.id,
      },
      { transaction: t },
    );

    loan.estado = LOAN_STATUS.ACTIVE;
    loan.cuota_mensual = cuota;
    loan.saldo_pendiente = loan.monto;
    loan.fecha_inicio = new Date();

    await loan.save({ transaction: t });

    await t.commit();
    res.json({ success: true, loan });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ success: false, message: error.message });
  }
};

export const payInstallment = async (req, res) => {
  const t = await db.transaction();

  try {
    const { installment_id } = req.params;

    // 1. SOLO bloqueamos la cuota (sin JOIN)
    const installment = await LoanInstallment.findByPk(installment_id, {
      transaction: t,
      lock: SequelizeTransaction.LOCK.UPDATE,
    });

    if (!installment || installment.estado === INSTALLMENT_STATUS.PAID) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Cuota inválida",
      });
    }

    // 2. Cargar préstamo aparte (evita LEFT JOIN + FOR UPDATE)
    const loan = await Loan.findByPk(installment.loan_id, {
      transaction: t,
    });

    if (!loan) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Préstamo no encontrado",
      });
    }

    // 3. Cuenta
    const account = await Account.findByPk(loan.account_id, {
      transaction: t,
      lock: SequelizeTransaction.LOCK.UPDATE,
    });

    if (!account) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: "Cuenta no encontrada",
      });
    }

    const totalPago =
      parseFloat(installment.monto_cuota) +
      parseFloat(installment.mora_acumulada);

    if (parseFloat(account.saldo) < totalPago) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Saldo insuficiente",
      });
    }

    // 4. Descontar saldo
    account.saldo = parseFloat(account.saldo) - totalPago;
    await account.save({ transaction: t });

    // 5. Transacción
    const transaction = await Transaction.create(
      {
        tipo: LOAN_RULES.TRANSACTION_TYPES.LOAN_PAYMENT,
        monto: totalPago,
        cuenta_origen_id: account.id,
      },
      { transaction: t },
    );

    // 6. Movimiento
    await Movement.create(
      {
        tipo_operacion: LOAN_RULES.OPERATION_TYPES.LOAN_PAYMENT,
        tipo_movimiento: LOAN_RULES.MOVEMENT_TYPES.DEBIT,
        monto: totalPago,
        transaction_id: transaction.id,
        account_id: account.id,
      },
      { transaction: t },
    );

    // 7. Actualizar cuota
    installment.estado = INSTALLMENT_STATUS.PAID;
    installment.mora_acumulada = 0;
    await installment.save({ transaction: t });

    // 8. Actualizar préstamo
    let nuevoSaldo =
      parseFloat(loan.saldo_pendiente) - parseFloat(installment.capital);

    nuevoSaldo = parseFloat(nuevoSaldo.toFixed(2));

    if (nuevoSaldo < 0.01) nuevoSaldo = 0;

    loan.saldo_pendiente = nuevoSaldo;

    if (nuevoSaldo === 0) {
      loan.estado = LOAN_STATUS.CLOSED;
      loan.fecha_fin = new Date();
    }

    await loan.save({ transaction: t });

    await t.commit();

    return res.json({
      success: true,
      message: "Cuota pagada correctamente",
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkDelinquency = async () => {
  const hoy = new Date();

  const installments = await LoanInstallment.findAll({
    where: { estado: INSTALLMENT_STATUS.PENDING },
    include: Loan,
  });

  for (const inst of installments) {
    const diffDays = Math.floor(
      (hoy - new Date(inst.fecha_vencimiento)) / (1000 * 60 * 60 * 24),
    );

    if (diffDays > LOAN_RULES.DELINQUENCY_DAYS) {
      inst.estado = INSTALLMENT_STATUS.DELINQUENT;

      const mora =
        parseFloat(inst.monto_cuota) * LOAN_RULES.LATE_FEE_PERCENTAGE;
      inst.mora_acumulada = parseFloat(
        (parseFloat(inst.mora_acumulada || 0) + mora).toFixed(2),
      );

      await inst.save();

      inst.loan.estado = LOAN_STATUS.DELINQUENT;
      await inst.loan.save();
    }
  }
};

export const rejectLoan = async (req, res) => {
  const loan = await Loan.findByPk(req.params.id);
  if (!loan || loan.estado !== LOAN_STATUS.PENDING)
    return res
      .status(400)
      .json({ success: false, message: "Préstamo no válido" });

  loan.estado = LOAN_STATUS.REJECTED;
  await loan.save();

  res.json({ success: true, loan });
};

/* =========================
   GET ALL LOANS
========================= */

export const getLoans = async (req, res) => {
  try {
    const loans = await Loan.findAll({
      include: [
        { model: User, attributes: ["id", "nombre", "apellido", "correo"] },
        { model: Account, attributes: ["id", "tipo", "saldo"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, loans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   GET LOAN BY ID
========================= */

export const getLoanById = async (req, res) => {
  try {
    const { id } = req.params;

    const loan = await Loan.findByPk(id, {
      include: [
        { model: User, attributes: ["id", "nombre", "apellido", "correo"] },
        { model: Account, attributes: ["id", "tipo", "saldo"] },
        { model: LoanInstallment },
      ],
    });

    if (!loan)
      return res
        .status(404)
        .json({ success: false, message: "Préstamo no encontrado" });

    res.json({ success: true, loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
