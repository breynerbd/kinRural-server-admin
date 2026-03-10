import { db } from "../../configs/db.js";
import { Loan, LoanInstallment } from "./loan.model.js";
import { Account } from "../accounts/account.model.js";
import { Transaction } from "../transactions/transaction.model.js";
import { Movement } from "../movements/movement.model.js";
import { User } from "../users/user.model.js";

const calcularCuota = (monto, tasaAnual, meses) => {
    const tasaMensual = (tasaAnual/100)/12;
    const cuota = monto * (tasaMensual*Math.pow(1+tasaMensual,meses)) /
        (Math.pow(1+tasaMensual,meses)-1);
    return parseFloat(cuota.toFixed(2));
};

export const approveLoan = async (req,res)=>{
    const t = await db.transaction();
    try{

        const { id } = req.params;
        const loan = await Loan.findByPk(id);

        if(!loan || loan.estado !== "PENDING")
            return res.status(400).json({success:false,message:"Préstamo no válido"});

        const cuota = calcularCuota(
            parseFloat(loan.monto),
            parseFloat(loan.tasa_interes),
            loan.plazo_meses
        );

        let saldo = parseFloat(loan.monto);
        const tasaMensual = (parseFloat(loan.tasa_interes)/100)/12;

        for(let i=1;i<=loan.plazo_meses;i++){

            const interes = saldo*tasaMensual;
            const capital = cuota - interes;
            saldo -= capital;

            await LoanInstallment.create({
                loan_id: loan.id,
                numero_cuota: i,
                fecha_vencimiento: new Date(
                    new Date().setMonth(new Date().getMonth()+i)
                ),
                monto_cuota: cuota,
                interes: interes.toFixed(2),
                capital: capital.toFixed(2),
                saldo_restante: Math.max(saldo,0).toFixed(2)
            },{transaction:t});
        }

        const account = await Account.findByPk(loan.account_id);

        const transaction = await Transaction.create({
            tipo:"DEPOSITO",
            monto:loan.monto,
            cuenta_destino_id:account.id
        },{transaction:t});

        account.saldo = parseFloat(account.saldo) + parseFloat(loan.monto);
        await account.save({transaction:t});

        await Movement.create({
            tipo_operacion:"DEPOSITO",
            tipo_movimiento:"CREDITO",
            monto:loan.monto,
            transaction_id:transaction.id,
            account_id:account.id
        },{transaction:t});

        loan.estado="ACTIVE";
        loan.cuota_mensual=cuota;
        loan.saldo_pendiente=loan.monto;
        loan.fecha_inicio=new Date();

        await loan.save({transaction:t});

        await t.commit();
        res.json({success:true,loan});

    }catch(error){
        await t.rollback();
        res.status(400).json({success:false,message:error.message});
    }
};

export const payInstallment = async (req,res)=>{
    const t = await db.transaction();

    try{

        const { installment_id } = req.params;

        const installment = await LoanInstallment.findByPk(installment_id,{
            include: Loan
        });

        if(!installment || installment.estado === "PAGADA")
            return res.status(400).json({success:false,message:"Cuota inválida"});

        const loan = installment.loan;

        const account = await Account.findByPk(loan.account_id);

        const totalPago = parseFloat(installment.monto_cuota) + 
                          parseFloat(installment.mora_acumulada);

        if(parseFloat(account.saldo) < totalPago)
            return res.status(400).json({success:false,message:"Saldo insuficiente"});

        // Descontar saldo
        account.saldo = parseFloat(account.saldo) - totalPago;
        await account.save({transaction:t});

        // Crear transacción
        const transaction = await Transaction.create({
            tipo:"PAGO_PRESTAMO",
            monto: totalPago,
            cuenta_origen_id: account.id
        },{transaction:t});

        // Movimiento
        await Movement.create({
            tipo_operacion:"PAGO_PRESTAMO",
            tipo_movimiento:"DEBITO",
            monto: totalPago,
            transaction_id: transaction.id,
            account_id: account.id
        },{transaction:t});

        // Actualizar cuota
        installment.estado="PAGADA";
        installment.mora_acumulada=0;
        await installment.save({transaction:t});

        // Reducir saldo pendiente del préstamo
        loan.saldo_pendiente = 
            parseFloat(loan.saldo_pendiente) - 
            parseFloat(installment.capital);

        // Si terminó el préstamo
        if(loan.saldo_pendiente <= 0){
            loan.estado="CLOSED";
            loan.saldo_pendiente=0;
            loan.fecha_fin=new Date();
        }

        await loan.save({transaction:t});

        await t.commit();

        res.json({success:true,message:"Cuota pagada correctamente"});

    }catch(error){
        await t.rollback();
        res.status(500).json({success:false,message:error.message});
    }
};

export const checkDelinquency = async ()=>{

    const hoy = new Date();

    const installments = await LoanInstallment.findAll({
        where:{ estado:"PENDIENTE" },
        include: Loan
    });

    for(const inst of installments){

        const diffDays = Math.floor(
            (hoy - new Date(inst.fecha_vencimiento)) / (1000*60*60*24)
        );

        if(diffDays > 30){

            inst.estado="EN_MORA";

            const mora = parseFloat(inst.monto_cuota) * 0.03;
            inst.mora_acumulada = mora.toFixed(2);

            await inst.save();

            inst.loan.estado="DELINQUENT";
            await inst.loan.save();
        }
    }
};

export const rejectLoan = async (req,res)=>{
    const loan = await Loan.findByPk(req.params.id);
    if(!loan || loan.estado !== "PENDING")
        return res.status(400).json({success:false,message:"Préstamo no válido"});

    loan.estado="REJECTED";
    await loan.save();

    res.json({success:true,loan});
};

/* =========================
   GET ALL LOANS
========================= */

export const getLoans = async (req, res) => {
    try {

        const loans = await Loan.findAll({
            include: [
                { model: User, attributes: ["id", "nombre", "apellido", "correo"] },
                { model: Account, attributes: ["id", "tipo", "saldo"] }
            ],
            order: [["createdAt", "DESC"]]
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
                { model: LoanInstallment }
            ]
        });

        if (!loan)
            return res.status(404).json({ success: false, message: "Préstamo no encontrado" });

        res.json({ success: true, loan });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};