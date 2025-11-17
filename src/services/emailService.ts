import nodemailer from "nodemailer";

export class RealEmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: `"My App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  }

  async sendRegistration(email: string, code: string) {
    const link = `https://some-front.com/confirm-registration?code=${encodeURIComponent(code)}`;

    const html = `
      <h1>Thank for your registration</h1>
      <p>To finish registration please follow the link below:</p>
      <a href="${link}">complete registration</a>
    `;

    await this.sendEmail(email, "Registration confirmation", html);
  }
}
