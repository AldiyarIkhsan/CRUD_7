// adapters/emailAdapter.ts
import { EventEmitter } from "events";
import { setJestState } from "../utils/jestState"; // <- ВАЖНО: правильный путь

export const emailBus = new EventEmitter();
type SentEmail = { to: string; subject: string; html: string };
const outbox: SentEmail[] = [];
export const clearOutbox = () => {
  outbox.length = 0;
};

export async function sendEmail(to: string, subject: string, html: string) {
  const sentEmail = { to, subject, html };
  outbox.push(sentEmail);

  // Вытаскиваем код из ссылки или из <b>123456</b>
  const codeMatch = html.match(/code=([^"']+)/) || html.match(/>(\d{6})</);
  if (codeMatch && codeMatch[1]) {
    setJestState("code", codeMatch[1]); // <- теперь точно попадёт в Jest state
  }

  emailBus.emit("email:sent", sentEmail); // тесты ждут это событие
  return sentEmail;
}
