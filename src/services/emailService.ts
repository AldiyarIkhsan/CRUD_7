import "dotenv/config";
import nodemailer from "nodemailer";

export class RealEmailService {
  private transporter;

  constructor() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("❌ SMTP ENV VARIABLES MISSING");
      console.error("SMTP_USER:", process.env.SMTP_USER);
      console.error("SMTP_PASS:", process.env.SMTP_PASS);
      throw new Error("Missing SMTP credentials");
    }

    console.log("📨 Using SMTP:");
    console.log("- user:", process.env.SMTP_USER);
    console.log("- pass length:", process.env.SMTP_PASS.length);

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Проверка состояния SMTP
    this.transporter.verify((err, success) => {
      if (err) {
        console.error("❌ SMTP Connection Error:", err);
      } else {
        console.log("✅ SMTP server is ready to send emails");
      }
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const result = await this.transporter.sendMail({
        from: `"My App" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });

      console.log("📤 Email sent successfully:", result.messageId);
      return result;
    } catch (err) {
      console.error("❌ Error sending email:", err);
      throw err;
    }
  }

  async sendRegistration(email: string, code: string) {
    const link = `https://some-front.com/confirm-registration?code=${encodeURIComponent(code)}`;

    const html = `
      <h1>Thank for your registration</h1>
      <p>To finish registration please follow the link below:</p>
      <a href="${link}">complete registration</a>
    `;

    return this.sendEmail(email, "Registration confirmation", html);
  }
}
