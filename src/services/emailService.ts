// services/emailService.ts
export class ConsoleEmailService {
  async sendRegistration(email: string, code: string, frontUrl?: string) {
    const url = `${frontUrl ?? "https://somesite.com"}/confirm-email?code=${encodeURIComponent(code)}`;
    console.log(
      `<h1>Thank for your registration</h1>
<p>To finish registration please follow the link below:
  <a href='${url}'>complete registration</a>
</p>`,
    );
  }
}
