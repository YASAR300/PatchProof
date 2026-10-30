import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(__dirname, "../../.env");

// Load environment variables from root .env if present
if (fs.existsSync(rootEnvPath)) {
  try {
    if (typeof process.loadEnvFile === "function") {
      process.loadEnvFile(rootEnvPath);
    } else {
      const content = fs.readFileSync(rootEnvPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const [k, ...v] = trimmed.split("=");
        if (k && !process.env[k.trim()]) {
          let val = v.join("=").trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          process.env[k.trim()] = val;
        }
      }
    }
  } catch (err) {
    console.warn("[worker/db] Could not load .env file:", err.message);
  }
}

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

export default prisma;

