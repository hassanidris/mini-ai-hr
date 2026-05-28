import { defineConfig, env } from "prisma/config";
import type { PrismaConfig } from "prisma";

export default defineConfig({
  schema: "./db/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
} satisfies PrismaConfig);
