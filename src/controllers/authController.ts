import { Request, Response, NextFunction } from "express";
import * as otpService from "../services/otpService";

import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";
import { prisma } from "../utils/db";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or passsword" });
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        success: false,
        message: "Password not set",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" },
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function startOnboarding(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { firstName, lastName, email, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // Create user with pending KYC
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        kycStatus: "PENDING",
      },
    });

    // Generate OTP for email verification
    const otp = await otpService.generateOtp(user.id, email);

    console.log("OTP", otp);

    // TODO: send OTP via email provider (SendGrid, Nodemailer, SES, etc.)
    res.json({ success: true, message: "OTP sent to email", userId: user.id });
  } catch (err) {
    console.error("Onboarding error:", err);
    next(err);
  }
}

export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId, code } = req.body;

    await otpService.verifyOtp(userId, code);

    res.json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
}

export async function setPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId, password } = req.body;

    // Hash password securely
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user record
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    res.json({ success: true, message: "Password set successfully" });
  } catch (err) {
    next(err);
  }
}

export async function uploadAvatar(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userId } = req.body;
    const fileUrl = req.file?.path; // local path or cloud URL

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { profilePictureUrl: fileUrl },
    });

    res.json({
      success: true,
      message: "Profile picture uploaded",
      url: fileUrl,
    });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req: Request, res: Response) {
  return res.json({
    success: false,
    messaage: "Profile fetched successfully",
    user: req.user,
  });
}
