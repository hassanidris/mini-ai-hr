import { defineConfig, env } from "prisma/config";
import type { PrismaConfig } from "prisma";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvFile(file: string) {
  try {
    const content = readFileSync(resolve(process.cwd(), file), "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (key && !process.env[key]) process.env[key] = value;
    }
  } catch {
    // file not found, skip
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

export default defineConfig({
  schema: "./db/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
} satisfies PrismaConfig);
