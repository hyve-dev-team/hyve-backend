import crypto from "crypto";
import { ValidationError, AuthError } from "../utils/errors";
import { sendEmail } from "../utils/mailer";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
export const prisma = new PrismaClient({ adapter });

export async function generateOtp(userId: number, email: string) {
  const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit code

  // Store OTP in DB (expires in 5 mins)
  await prisma.oTP.create({
    data: {
      userId,
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // await sendEmail(email, "Your HYVE OTP Code", `Your OTP is ${otp}`);

  return otp;
}

export async function verifyOtp(userId: number, code: string) {
  const record = await prisma.oTP.findFirst({
    where: { userId, code },
    orderBy: { createdAt: "desc" },
  });

  if (!record) throw new ValidationError("Invalid OTP");
  if (record.expiresAt < new Date()) throw new AuthError("OTP expired");

  // Mark user as verified
  await prisma.user.update({
    where: { id: userId },
    data: { kycStatus: "VERIFIED" },
  });

  return true;
}
