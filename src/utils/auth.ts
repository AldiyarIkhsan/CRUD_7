import { randomUUID } from "crypto";

export const makeConfirmationCode = () => randomUUID();

// Ровно 90 минут
export const minutesFromNow = (m: number) => new Date(Date.now() + m * 60 * 1000);
