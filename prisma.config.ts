import type { PrismaConfig } from "prisma";

export default {
  schema: "./db/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
} satisfies PrismaConfig;
