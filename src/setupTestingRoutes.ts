// setupTestingRoutes.ts
import { Express, Request, Response } from "express";
import { BlogModel } from "./models/BlogModel";
import { PostModel } from "./models/PostModel";
import { UserModel } from "./models/UserModel";
import { CommentModel } from "./models/CommentModel";
import { clearOutbox } from "./adapters/emailAdapter";
import { clearJestState } from "./utils/jestState";

export const setupTestingRoutes = (app: Express) => {
  app.delete("/testing/all-data", async (_req: Request, res: Response) => {
    await Promise.all([
      BlogModel.deleteMany({}),
      PostModel.deleteMany({}),
      UserModel.deleteMany({}),
      CommentModel.deleteMany({}), // <-- добавить
    ]);
    clearOutbox(); // <-- добавить
    clearJestState(); // Clear Jest state as well
    res.sendStatus(204);
  });
};
