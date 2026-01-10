import express, { Router } from 'express';
import messagesRoutes from './messagesRoutes';

const apiRouter: Router = express.Router();

// Health check endpoint
apiRouter.get("/health", (_, res) => {
    res.send("OK");
});

// Messages routes
apiRouter.use("/messages", messagesRoutes);

export default apiRouter;