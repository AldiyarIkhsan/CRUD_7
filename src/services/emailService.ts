import { sendEmail } from "../adapters/emailAdapter";

export class ConsoleEmailService {
  async sendRegistration(email: string, code: string, frontUrl?: string | null) {
    const base = frontUrl ?? "https://somesite.com";

    const url = `${base}/confirm-email?code=${encodeURIComponent(code)}`;

    const html = `
      <h1>Thank for your registration</h1>
      <p>To finish registration please follow the link below:</p>
      <p><a href="${url}">complete registration</a></p>
    `;

    // ВАЖНО: тесты слушают ТОЛЬКО sendEmail
    await sendEmail(email, "Registration confirmation", html);
  }
}
