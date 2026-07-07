import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { AppError } from "../utils/errors";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
    req.log.error({ err }, "Handled AppError");
    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }

  // Fallback for unexpected errors
  req.log.error({ err }, "Unhandled error occurred");
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}
