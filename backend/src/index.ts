import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./routes";
import { startQueueProcessor } from "./queueProcessor";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter)

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Scheduler is running on port ${PORT}`);

    // Start the queue processor
    startQueueProcessor();
});

