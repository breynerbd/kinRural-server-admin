import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { corsOptions } from "./cors-configuration.js";
import { helmetConfiguration } from "./helmet-configuration.js";
import { requestLimit } from "../middlewares/request-limit.js";

import { userRouter } from "../src/users/user.router.js";
import { accountRouter } from "../src/accounts/account.router.js";
import { movementRouter } from "../src/movements/movement.router.js";
import { errorHandler } from "../middlewares/handle-errors.js";
import { roleRouter } from "../src/roles/role.router.js";
import { reversalRouter } from "../src/reversals/reversal.router.js";
import { transactionRouter } from "../src/transactions/transaction.router.js";
import { loanRouter } from "../src/loans/loan.router.js";
import { cardRouter } from "../src/cards/card.router.js";
import { accountRequestRouter } from "../src/accountsRequest/accountRequest.router.js";

const BASE_URL = "/kinrural/v1";

export const initServer = () => {

    const app = express();
    app.use(express.json());

    app.use(cors(corsOptions));
    app.use(helmet(helmetConfiguration));
    app.use(express.urlencoded({ extended: false }));
    app.use(morgan("dev"));
    app.use(requestLimit);


    app.use(`${BASE_URL}/users`, userRouter);
    app.use(`${BASE_URL}/accounts`, accountRouter);
    app.use(`${BASE_URL}/movements`, movementRouter);
    app.use(`${BASE_URL}/roles`, roleRouter);
    app.use(`${BASE_URL}/reversals`, reversalRouter);
    app.use(`${BASE_URL}/transactions`, transactionRouter);
    app.use(`${BASE_URL}/loans`, loanRouter);
    app.use(`${BASE_URL}/cards`, cardRouter);
    app.use(`${BASE_URL}/account-requests`, accountRequestRouter);

    app.get(`${BASE_URL}/health`, (req, res) => {
        res.status(200).json({
            success: true,
            message: "Kinrural Bank API running correctly"
        });
    });

    app.use(errorHandler);

    return app;
};
