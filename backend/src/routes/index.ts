import express, { Router } from 'express';
import messagesRoutes from './messagesRoutes';

const apiRouter: Router = express.Router();

apiRouter.get("/health", (_, res) => {
    res.send("OK");
});

apiRouter.use("/messages", messagesRoutes);

export default apiRouter;