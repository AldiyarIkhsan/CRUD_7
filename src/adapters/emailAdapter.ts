import { EventEmitter } from "events";
import { setJestState } from "../utils/jestState";

export const emailBus = new EventEmitter();

type SentEmail = {
  to: string;
  subject: string;
  html: string;
};

const outbox: SentEmail[] = [];

// Автотесты очищают письма через /testing/all-data
export const clearOutbox = () => {
  outbox.length = 0;
};

// Ключевая функция: должна работать НА 100% так
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

  // ================================
  // ВАЖНО: извлечение confirmation code
  // ================================
  //
  // HW7-тесты принимают два формата:
  // 1) https://site.com?code=XXXX
  // 2) <b>XXXX</b>
  //
  const codeMatch =
    html.match(/code=([^"&]+)/) || // из URL
    html.match(/<b>([^<]+)<\/b>/); // в <b>...</b>

  if (codeMatch && codeMatch[1]) {
    const code = codeMatch[1].trim();
    console.log("✅ Extracted code:", code);
    setJestState("code", code);
  } else {
    console.log("⚠️ Code NOT FOUND in email HTML!");
  }

  // Сообщаем тестам, что письмо отправлено
  emailBus.emit("email:sent", sentEmail);

  return sentEmail;
}

// Экспортируем обязательно!
export { outbox };
