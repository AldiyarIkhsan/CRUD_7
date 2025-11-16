import { EventEmitter } from "events";
import { setJestState } from "../utils/jestState";

export const emailBus = new EventEmitter();

type SentEmail = { to: string; subject: string; html: string };

const outbox: SentEmail[] = [];

export const clearOutbox = () => {
  outbox.length = 0;
};

export async function sendEmail(to: string, subject: string, html: string) {
  const sentEmail = { to, subject, html };
  outbox.push(sentEmail);

  console.log("========================================");
  console.log("📧 EMAIL SENT");
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("HTML:");
  console.log(html);
  console.log("========================================");

  // 🔥 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ
  const codeMatch =
    html.match(/code=([^"&]+)/) || // правильный match по ссылке
    html.match(/<b>([^<]+)<\/b>/);

  if (codeMatch && codeMatch[1]) {
    const code = codeMatch[1].trim();
    setJestState("code", code);
    console.log("✅ Extracted confirmation code:", code);
  } else {
    console.log("⚠️ Confirmation code not found in email HTML!");
  }

  emailBus.emit("email:sent", sentEmail);

  return sentEmail;
}
