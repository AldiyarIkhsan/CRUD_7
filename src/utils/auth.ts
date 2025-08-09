// utils/auth.ts
import { randomUUID } from "crypto";

export const makeConfirmationCode = () => randomUUID();
export const hoursFromNow = (h: number) => {
  const d = new Date();
  d.setHours(d.getHours() + h);
  return d;
};
