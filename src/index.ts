import express, { Request, Response } from "express";
import dotenv from "dotenv";
import logger from "./utils/logger";
import pinoHttp from "pino-http";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import { execSync } from "child_process";

dotenv.config();

// Run migrations on startup
if (process.env.NODE_ENV === "production" || process.env.RUN_MIGRATIONS === "true") {
  try {
    logger.info("Running database migrations...");
    const stdout = execSync("bun x prisma migrate deploy");
    logger.info(`Database migrations completed successfully:\n${stdout.toString()}`);
  } catch (error: any) {
    logger.error(`Database migration failed: ${error.message}`);
    if (error.stdout) logger.error(`stdout: ${error.stdout.toString()}`);
    if (error.stderr) logger.error(`stderr: ${error.stderr.toString()}`);
  }
}

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
