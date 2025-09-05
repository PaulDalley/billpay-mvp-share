import { Resend } from "resend";
import nodemailer from "nodemailer";

const provider = (process.env.MAIL_PROVIDER || "").toUpperCase();
const from = process.env.MAIL_FROM || "";

export async function sendLoginCode(to: string, code: string) {
  const subject = "Your sign-in code";
  const text = `Your code: ${code}\nIt expires in 10 minutes.`;
  if (!from) throw new Error("MAIL_FROM missing");
  if (provider === "RESEND") {
    const apiKey = process.env.RESEND_API_KEY || "";
    if (!apiKey) throw new Error("RESEND_API_KEY missing");
    const resend = new Resend(apiKey);
    await resend.emails.send({ from, to, subject, text });
    return;
  }
  const host = process.env.SMTP_HOST || "";
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  if (!host || !user || !pass) throw new Error("SMTP envs missing");
  const transporter = nodemailer.createTransport({
    host, port, secure: port === 465, auth: { user, pass }
  });
  await transporter.sendMail({ from, to, subject, text });
}
