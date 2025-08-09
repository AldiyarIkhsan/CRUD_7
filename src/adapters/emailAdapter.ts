// adapters/emailAdapter.ts
import { EventEmitter } from 'events';

export const emailBus = new EventEmitter();
type SentEmail = { to: string; subject: string; html: string };
const outbox: SentEmail[] = [];
export const clearOutbox = () => { outbox.length = 0; };

export async function sendEmail(to: string, subject: string, html: string) {
  outbox.push({ to, subject, html });
  emailBus.emit('email:sent', { to, subject, html }); // <-- тесты ждут это событие
}
