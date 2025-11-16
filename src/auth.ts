import { Express, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "./models/UserModel";
import { makeConfirmationCode, minutesFromNow } from "./utils/auth";
import { setJestState } from "./utils/jestState";
import { authMiddleware } from "./middleware";
import { sendEmail } from "./adapters/emailAdapter";

// ===================== VALIDATION =====================

const vRegistration = [
  body("login").trim().isLength({ min: 3, max: 10 }).withMessage("login length 3-10"),
  body("password").trim().isLength({ min: 6, max: 20 }).withMessage("password length 6-20"),
  body("email").trim().isEmail().withMessage("invalid email"),
];

const vConfirm = [body("code").trim().notEmpty().withMessage("code is required")];

const vResend = [body("email").trim().isEmail().withMessage("invalid email")];

const vLogin = [
  body("loginOrEmail").trim().notEmpty().withMessage("required"),
  body("password").trim().notEmpty().withMessage("required"),
];

const send400 = (res: Response, errors: any[]) => res.status(400).json({ errorsMessages: errors });

const mapErrors = (req: Request) =>
  validationResult(req)
    .array({ onlyFirstError: true })
    .map((e) => ({
      message: e.msg,
      field: (e as any).path ?? "unknown",
    }));

// ===================== MAIN SETUP =====================

export const setupAuth = (app: Express) => {
  // ---------- LOGIN ----------
  app.post("/auth/login", vLogin, async (req: Request, res: Response) => {
    const vr = validationResult(req);
    if (!vr.isEmpty()) return send400(res, mapErrors(req));

    const { loginOrEmail, password } = req.body;

    const user = await UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });

    if (!user) return res.sendStatus(401);
    if (!user.emailConfirmation?.isConfirmed) return res.sendStatus(401);

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.sendStatus(401);

    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });

    // нужно для тестов (комментарии)
    setJestState("accessToken", token);

    return res.status(200).json({ accessToken: token });
  });

  // ---------- ME ----------
  app.get("/auth/me", authMiddleware, async (req: any, res: Response) => {
    const user = await UserModel.findById(req.userId);
    if (!user) return res.sendStatus(401);

    return res.status(200).json({
      email: user.email,
      login: user.login,
      userId: user._id.toString(),
    });
  });

  // ---------- REGISTRATION ----------
  app.post("/auth/registration", vRegistration, async (req: Request, res: Response) => {
    const vr = validationResult(req);
    if (!vr.isEmpty()) return send400(res, mapErrors(req));

    const { login, email, password } = req.body;

    if (await UserModel.findOne({ login }))
      return send400(res, [{ field: "login", message: "login should be unique" }]);

    if (await UserModel.findOne({ email }))
      return send400(res, [{ field: "email", message: "email should be unique" }]);

    const code = makeConfirmationCode();
    const expirationDate = minutesFromNow(90);
    const passwordHash = await bcrypt.hash(password, 10);

    await UserModel.create({
      login,
      email,
      passwordHash,
      emailConfirmation: {
        isConfirmed: false,
        confirmationCode: code,
        expirationDate,
      },
    });

    setJestState("code", code);

    await sendEmail(email, "Email confirmation", `<h1>Confirm email</h1><p>Your code: <b>${code}</b></p>`);

    return res.sendStatus(204);
  });

  // ---------- CONFIRM ----------
  app.post("/auth/registration-confirmation", vConfirm, async (req: Request, res: Response) => {
    const vr = validationResult(req);
    if (!vr.isEmpty()) return send400(res, mapErrors(req));

    const { code } = req.body;

    const user = await UserModel.findOne({
      "emailConfirmation.confirmationCode": code,
    });

    if (!user || !user.emailConfirmation)
      return send400(res, [{ field: "code", message: "Confirmation code is incorrect" }]);

    if (user.emailConfirmation.isConfirmed)
      return send400(res, [{ field: "code", message: "Email already confirmed" }]);

    if (user.emailConfirmation.expirationDate! < new Date())
      return send400(res, [{ field: "code", message: "Confirmation code is expired" }]);

    user.emailConfirmation.isConfirmed = true;
    user.emailConfirmation.confirmationCode = undefined as any;
    user.emailConfirmation.expirationDate = undefined as any;

    await user.save();
    return res.sendStatus(204);
  });

  // ---------- RESEND ----------
  app.post("/auth/registration-email-resending", vResend, async (req: Request, res: Response) => {
    const vr = validationResult(req);
    if (!vr.isEmpty()) return send400(res, mapErrors(req));

    const { email } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) return send400(res, [{ field: "email", message: "User with this email doesn't exist" }]);

    if (user.emailConfirmation?.isConfirmed)
      return send400(res, [{ field: "email", message: "Email is already confirmed" }]);

    const code = makeConfirmationCode();

    user.emailConfirmation = {
      isConfirmed: false,
      confirmationCode: code,
      expirationDate: minutesFromNow(90),
    };

    await user.save();

    setJestState("code", code);

    await sendEmail(email, "Email confirmation", `<h1>Confirm email</h1><p>Your code: <b>${code}</b></p>`);

    return res.sendStatus(204);
  });
};
