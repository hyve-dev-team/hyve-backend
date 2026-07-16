import express, { Request, Response } from "express";
import dotenv from "dotenv";
import logger from "./utils/logger";
import pinoHttp from "pino-http";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();

app.use(express.json());
app.use(pinoHttp({ logger }));

app.get("/", (req: Request, res: Response) => {
  logger.info("Root route accessed");
  res.send(`${process.env.APP_NAME} is running successfully`);
});
app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
