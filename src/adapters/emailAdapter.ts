import { EventEmitter } from "events";

export const emailBus = new EventEmitter();
type SentEmail = { to: string; subject: string; html: string };
const outbox: SentEmail[] = [];
export const clearOutbox = () => {
  outbox.length = 0;
};

export async function sendEmail(to: string, subject: string, html: string) {
  const sentEmail = { to, subject, html };
  outbox.push(sentEmail);

  // Extract confirmation code from HTML
  const codeMatch = html.match(/code=([^"']+)/) || html.match(/>(\d{6})</);
  if (codeMatch && codeMatch[1]) {
    require("./utils/jestState").setJestState("code", codeMatch[1]);
  }

  emailBus.emit("email:sent", sentEmail);
  return sentEmail;
}
