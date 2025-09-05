import { Resend } from "resend";
import nodemailer from "nodemailer";

export async function sendLoginCode(to: string, code: string) {
  const from = process.env.MAIL_FROM || "no-reply@example.com";
  const subject = "Your sign-in code";
  const text = `Your code is ${code} (valid for ~10 minutes).`;
  const html = `<p>Your code is <strong style="font-size:20px">${code}</strong> (valid ~10 minutes).</p>`;

  // Option A: Resend
  const rk = process.env.RESEND_API_KEY;
  if (rk) {
    const resend = new Resend(rk);
    try {
      const res = await resend.emails.send({ from, to, subject, text, html });
      return { ok: true, id: (res as any)?.data?.id || "resend" };
    } catch (e:any) {
      console.error("[mailer:resend] fail:", e?.message || e);
    }
  }

  // Option B: SMTP (Gmail/Outlook/Mailgun/etc.)
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT || "587");
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true";

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
      const info = await transporter.sendMail({ from, to, subject, text, html });
      return { ok: true, id: info.messageId };
    } catch (e:any) {
      console.error("[mailer:smtp] fail:", e?.message || e);
    }
  }

  // Fallback: console only (as current)
  console.log(`[mailer:none] Code for ${to}: ${code}`);
  return { ok: false, error: "no mail provider configured" };
}
