import { EventEmitter } from "events";
import { setJestState } from "../utils/jestState";

// 🔔 Эмиттер событий для тестов (можно оставить без изменений)
export const emailBus = new EventEmitter();

// Тип письма
type SentEmail = { to: string; subject: string; html: string };

// Память для всех отправленных писем (для Jest / автотестов)
const outbox: SentEmail[] = [];

// Очистка outbox
export const clearOutbox = () => {
  outbox.length = 0;
};

// 🚀 Основная функция отправки письма
export async function sendEmail(to: string, subject: string, html: string) {
  const sentEmail = { to, subject, html };
  outbox.push(sentEmail);

  // 🔍 Вывод письма прямо в консоль (для ручной проверки)
  console.log("📧 EMAIL SENT =====================================");
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("HTML:\n", html);
  console.log("===================================================");

  // 🧩 Извлекаем code из ?code=... или 6-значного кода между тегами <b>...</b>
  const codeMatch = html.match(/code=([^"']+)/) || html.match(/>(\d{6})</);
  if (codeMatch && codeMatch[1]) {
    setJestState("code", codeMatch[1]);
    console.log("✅ Extracted confirmation code:", codeMatch[1]);
  } else {
    console.log("⚠️ Confirmation code not found in email HTML!");
  }

  // 📡 Отправляем событие о письме (для автотестов)
  emailBus.emit("email:sent", sentEmail);

  return sentEmail;
}
