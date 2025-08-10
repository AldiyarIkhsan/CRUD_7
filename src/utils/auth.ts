import { randomUUID } from "crypto";

export const makeConfirmationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hoursFromNow = (h: number) => {
  const d = new Date();
  d.setHours(d.getHours() + h);
  return d;
};
