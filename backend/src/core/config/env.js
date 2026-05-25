import { z } from "zod";
import dotenv from "dotenv";

// Load .env before validation
dotenv.config();

// Helper function to substitute ${VAR_NAME} patterns with actual env values
function substituteEnvVars(str) {
  if (!str) return str;
  return str.replace(/\$\{([^}]+)\}/g, (_, varName) => {
    return process.env[varName] || '';
  });
}

const envSchema = z.object({
  // Server
  PORT: z.string().transform(Number).default("4000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  FRONTEND_URL: z.string().url(),
  ALLOWED_ORIGINS: z.string().optional().transform(val => val ? val.split(",") : []),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().transform(val => val ? substituteEnvVars(val.trim()) : val).pipe(z.string().url()).optional(),
  REDIS_HOST: z.string().default("redis"),
  REDIS_PORT: z.string().transform(Number).default("6379"),
  REDIS_PASSWORD: z.string().optional(),

  // Auth
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // AWS/S3
  S3_REGION: z.string().default("auto"),
  S3_BUCKET_NAME: z.string(),
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  S3_ENDPOINT: z.string().url().optional(),
  S3_PUBLIC_URL: z.string().url().optional(),

  // App Configs
  CHALLENGX_RUNNERS_PATH: z.string().optional(),
  CODEARENA_RUNNERS_PATH: z.string().optional(),
  JUDGE_POOL_SIZE: z.string().transform(Number).default("10"),
  MATCHMAKING_RANK_THRESHOLD: z.string().transform(Number).default("2000"),
  WORKER_CONCURRENCY: z.string().transform(Number).default("10"),

  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_CALLBACK_URL: z.string().optional(),

  // AI
  GEMINI_API_KEY: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", JSON.stringify(_env.error.format(), null, 2));
  process.exit(1);
}

export const env = _env.data;
console.log(`[ENV] GEMINI_API_KEY Loaded: ${env.GEMINI_API_KEY ? env.GEMINI_API_KEY.substring(0, 8) + '...' : 'MISSING'}`);
export default env;
