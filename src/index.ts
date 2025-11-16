// src/server.ts
import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db";

import { setupBlogs } from "./setupBlogs";
import { setupPosts } from "./setupPosts";
import { setupUsers } from "./users";
import { setupAuth } from "./auth";
import { setupComments } from "./setupComments";
import { setupTestingRoutes } from "./setupTestingRoutes";

dotenv.config();

const app = express();
app.use(express.json());

// 🔥 Важно: НИЧЕГО не слушаем здесь, пока НЕ запущено из CLI.
// Jest будет импортировать этот app напрямую — только так он ловит state.
app.get("/", (_req, res) => res.send("API is running"));

// Подключаем все маршруты
setupTestingRoutes(app);
setupBlogs(app);
setupPosts(app);
setupUsers(app);
setupAuth(app);
setupComments(app);

// Подключение к Mongo (один раз)
connectDB();

// 🚀 Если запускаем вручную (npm run dev)
// Тогда слушаем порт. Но Jest сюда НЕ заходит,
// потому что при тестах NODE_ENV будет "test".
if (process.env.NODE_ENV !== "test" && require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`🚀 Server is running on port: ${port}`));
}

// ❗ Важно: экспорт только app, никакого listen
export default app;
