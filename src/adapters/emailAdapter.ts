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

  console.log("=== EMAIL SENT ===");
  console.log(html);

  const urlMatch = html.match(/code=([^"&'<>%]+)/);
  const htmlMatch = html.match(/<b>([^<]+)<\/b>/);

  const codeMatch = urlMatch || htmlMatch;

  if (codeMatch && codeMatch[1]) {
    let code = codeMatch[1].trim();
    try {
      code = decodeURIComponent(code);
    } catch {}
    setJestState("code", code);
    console.log("Extracted code:", code);
  }

  emailBus.emit("email:sent", sentEmail);
  return sentEmail;
}

export { outbox };
