import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // or use SMTP config
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // app password (not your real password!)
  },
});

export async function sendEmail(to: string, subject: string, text: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
}
