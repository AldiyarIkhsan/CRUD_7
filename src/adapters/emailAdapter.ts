import { EventEmitter } from "events";
import { setJestState } from "../utils/jestState";

// 🔔 Эмиттер событий для тестов
export const emailBus = new EventEmitter();

// Тип письма
type SentEmail = { to: string; subject: string; html: string };

// Память для писем (используется автотестами)
const outbox: SentEmail[] = [];

// Очистка outbox (автотесты вызывают /testing/all-data)
export const clearOutbox = () => {
  outbox.length = 0;
};

// 🚀 Основная функция отправки письма
export async function sendEmail(to: string, subject: string, html: string) {
  const sentEmail = { to, subject, html };
  outbox.push(sentEmail);

  // Лог для debug (не мешает автотестам)
  console.log("========================================");
  console.log("📧 EMAIL SENT");
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("HTML:");
  console.log(html);
  console.log("========================================");

  // 🧩 Попытка извлечения confirmation code:
  //
  // 1) ловим код из URL:  ...?code=xxxx
  // 2) ловим <b>xxxx</b> — здесь может быть UUID или число
  //
  const codeMatch =
    html.match(/code=([^"']+)/) || // code from URL
    html.match(/<b>([^<]+)<\/b>/); // code inside <b>...</b>

  if (codeMatch && codeMatch[1]) {
    const code = codeMatch[1];
    setJestState("code", code);
    console.log("✅ Extracted confirmation code:", code);
  } else {
    console.log("⚠️ Confirmation code not found in email HTML!");
  }

  // 📡 Сообщаем тестам, что письмо отправлено
  emailBus.emit("email:sent", sentEmail);

  return sentEmail;
}
