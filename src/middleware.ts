import { NextFunction, Request, Response } from "express";
import { body, check, validationResult, type ValidationError } from "express-validator";
import jwt from "jsonwebtoken";

export const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Basic ")) return res.sendStatus(401);
  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  const [login, password] = decoded.split(":");
  if (login === "admin" && password === "qwerty") return next();
  return res.sendStatus(401);
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret") as { userId: string };
    (req as any).userId = payload.userId;
    next();
  } catch {
    return res.sendStatus(401);
  }
};

const getField = (e: ValidationError): string => {
  if ("path" in (e as any) && typeof (e as any).path === "string") return (e as any).path;
  if ("param" in (e as any) && typeof (e as any).param === "string") return (e as any).param;
  if ((e as any).type === "unknown_fields" && Array.isArray((e as any).fields) && (e as any).fields.length) {
    return (e as any).fields[0];
  }
  return "unknown";
};

export const handleInputErrors = (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errorsMessages = result.array({ onlyFirstError: true }).map((e: ValidationError) => ({
    message: (e as any).msg,
    field: getField(e),
  }));
  return res.status(400).json({ errorsMessages });
};

// Валидации
export const blogValidationRules = [
  check("name").trim().notEmpty().isLength({ max: 15 }).withMessage("Name should be max 15 characters"),
  check("description").trim().notEmpty().isLength({ max: 500 }).withMessage("Description should be max 500 characters"),
  check("websiteUrl").trim().notEmpty().isLength({ max: 100 }).isURL().withMessage("Website URL should be a valid URL"),
];

export const postValidationRules = [
  check("title").trim().notEmpty().isLength({ max: 30 }),
  check("shortDescription").trim().notEmpty().isLength({ max: 100 }),
  check("content").trim().notEmpty().isLength({ max: 1000 }),
  check("blogId").notEmpty().isMongoId().withMessage("Invalid blogId"),
];

export const postValidationRulesForBlogIdInParams = [
  check("title").trim().notEmpty().isLength({ max: 30 }),
  check("shortDescription").trim().notEmpty().isLength({ max: 100 }),
  check("content").trim().notEmpty().isLength({ max: 1000 }),
];

export const userValidationRules = [
  body("login").trim().notEmpty().isLength({ min: 3, max: 10 }).withMessage("Login length must be 3-10"),
  body("password").trim().notEmpty().isLength({ min: 6, max: 20 }).withMessage("Password length must be 6-20"),
  body("email").trim().notEmpty().isEmail().withMessage("Invalid email format"),
];

export const commentValidationRules = [check("content").trim().notEmpty().isLength({ min: 20, max: 300 })];
