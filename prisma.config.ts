import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    provider: "postgresql",
    url: process.env["DATABASE_URL"] || "postgresql://postgres:postgress@123@localhost:5432/ai_assistant",
  },
});
