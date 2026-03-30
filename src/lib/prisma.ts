import { createRequire } from "node:module";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};
const nodeRequire = createRequire(import.meta.url);

function createPrismaClient() {
  const { PrismaLibSql } = nodeRequire("@prisma/adapter-libsql") as typeof import("@prisma/adapter-libsql");
  // PrismaLibSql requires config object with url
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || "file:./prisma/dev.db",
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
