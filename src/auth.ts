// auth.ts
import { Express, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { UserModel } from "./models/UserModel";
import { authMiddleware } from "./middleware";
import { ConsoleEmailService } from "./services/emailService";
import { makeConfirmationCode, hoursFromNow } from "./utils/auth";
import { setJestState } from "./utils/jestState";

const emailService = new ConsoleEmailService();

// ===== validators
const vLogin = [
  body("loginOrEmail").trim().notEmpty().withMessage("loginOrEmail is required"),
  body("password").trim().notEmpty().withMessage("password is required"),
];
const vReg = [
  body("login").trim().isLength({ min: 3, max: 10 }).withMessage("login 3-10"),
  body("password").trim().isLength({ min: 6, max: 20 }).withMessage("password 6-20"),
  body("email").trim().isEmail().withMessage("invalid email"),
];
const vConfirm = [body("code").trim().notEmpty().withMessage("code is required")];
const vResend = [body("email").trim().isEmail().withMessage("invalid email")];

// ===== helpers
const send400 = (res: Response, errors: { field: string; message: string }[]) =>
  res.status(400).json({ errorsMessages: errors });

// express-validator v7: используем e.path (fallback на e.param)
const mapValidationErrors = (req: Request) => {
  const vr = validationResult(req);
  return vr.array({ onlyFirstError: true }).map((e: any) => ({
    message: e.msg,
    field: e.path ?? e.param ?? "unknown",
  }));
};

export const setupAuth = (app: Express) => {
  // POST /auth/login
  app.post("/auth/login", vLogin, async (req: Request, res: Response) => {
    const vr = validationResult(req);
    if (!vr.isEmpty()) return send400(res, mapValidationErrors(req));

    const { loginOrEmail, password } = req.body as { loginOrEmail: string; password: string };

    const user = await UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
    if (!user) return res.sendStatus(401);
    if (!user.emailConfirmation?.isConfirmed) return res.sendStatus(401);

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.sendStatus(401);

    const secret: Secret = process.env.JWT_SECRET ?? "secret";
    const expiresIn: SignOptions["expiresIn"] = (process.env.JWT_EXPIRES ?? "1h") as any;

    const token = jwt.sign({ userId: user._id.toString() }, secret, {
      expiresIn,
      algorithm: "HS256",
    });

    // Store access token in Jest state
    setJestState('accessToken', token);

    return res.status(200).json({ accessToken: token });
  });

  // GET /auth/me
  app.get("/auth/me", authMiddleware, async (req: Request, res: Response) => {
    const user = await UserModel.findById((req as any).userId);
    if (!user) return res.sendStatus(401);
    return res.status(200).json({
      email: user.email,
      login: user.login,
      userId: user._id.toString(),
    });
  });

  // POST /auth/registration
  app.post("/auth/registration", vReg, async (req: Request, res: Response) => {
    const vr = validationResult(req);
    if (!vr.isEmpty()) return send400(res, mapValidationErrors(req));

    const { login, email, password } = req.body as { login: string; email: string; password: string };

    // Уникальность login/email
    const byLogin = await UserModel.findOne({ login });
    if (byLogin) return send400(res, [{ field: "login", message: "login should be unique" }]);
    const byEmail = await UserModel.findOne({ email });
    if (byEmail) return send400(res, [{ field: "email", message: "email should be unique" }]);

    const confirmationCode = makeConfirmationCode();
    const expirationDate = hoursFromNow(1);
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      login,
      email,
      passwordHash,
      emailConfirmation: { isConfirmed: false, confirmationCode, expirationDate },
    });

    // Store confirmation code in Jest state
    setJestState('code', confirmationCode);

    await emailService.sendRegistration(email, confirmationCode, process.env.FRONT_URL);
    return res.sendStatus(204); // Без тела
  });

  app.post("/auth/registration-confirmation", vConfirm, async (req: Request, res: Response) => {
    const vr = validationResult(req);
    if (!vr.isEmpty()) return send400(res, mapValidationErrors(req));

    const { code } = req.body as { code: string };

    const user = await UserModel.findOne({ "emailConfirmation.confirmationCode": code });
    if (!user || !user.emailConfirmation)
      return send400(res, [{ field: "code", message: "Confirmation code is incorrect" }]);

    // Если уже подтвержден — даём ошибку
    if (user.emailConfirmation.isConfirmed)
      return send400(res, [{ field: "code", message: "Email already confirmed" }]);

    // Проверка срока действия кода
    if (!user.emailConfirmation.expirationDate || user.emailConfirmation.expirationDate < new Date())
      return send400(res, [{ field: "code", message: "Confirmation code is expired" }]);

    // Подтверждаем
    user.emailConfirmation.isConfirmed = true;
    await user.save();

    return res.sendStatus(204);
  });

  // POST /auth/registration-email-resending
  app.post("/auth/registration-email-resending", vResend, async (req: Request, res: Response) => {
    const vr = validationResult(req);
    if (!vr.isEmpty()) return send400(res, mapValidationErrors(req));

    const { email } = req.body as { email: string };

    const user = await UserModel.findOne({ email });

    // If user doesn't exist, return 400 error
    if (!user) {
      return send400(res, [{ field: "email", message: "User with this email doesn't exist" }]);
    }

    // If email is already confirmed, return 400 error
    if (user.emailConfirmation?.isConfirmed) {
      return send400(res, [{ field: "email", message: "Email is already confirmed" }]);
    }

    if (!user.emailConfirmation) (user as any).emailConfirmation = { isConfirmed: false };

    const code = makeConfirmationCode();
    (user.emailConfirmation as any).confirmationCode = code;
    (user.emailConfirmation as any).expirationDate = hoursFromNow(1);
    await user.save();

    // Store confirmation code in Jest state
    setJestState('code', code);

    await emailService.sendRegistration(user.email, code, process.env.FRONT_URL);
    return res.sendStatus(204);
  });
};
