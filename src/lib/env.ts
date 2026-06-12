import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  /** Short/empty values are ignored at build time; runtime cron route requires ≥16 chars (see cron-auth.ts). */
  CRON_SECRET: z.preprocess(
    (val) => {
      if (typeof val !== "string") {
        return undefined;
      }
      const trimmed = val.trim();
      return trimmed.length >= 16 ? trimmed : undefined;
    },
    z.string().min(16).optional(),
  ),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(3).default("Glanzo <termine@glanzo.app>"),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_ROOT_DOMAIN: z.string().min(1).default("glanzo.app"),
  NEXT_PUBLIC_AUTH_GOOGLE_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

function parseEnv<T extends z.ZodTypeAny>(
  schema: T,
  source: Record<string, string | undefined>,
): z.infer<T> {
  const result = schema.safeParse(source);

  if (!result.success) {
    const formatted = result.error.flatten().fieldErrors;
    throw new Error(`Invalid environment variables: ${JSON.stringify(formatted)}`);
  }

  return result.data;
}

/** Server-only secrets — never import from client components. */
export const serverEnv = parseEnv(serverEnvSchema, {
  NODE_ENV: process.env.NODE_ENV,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  CRON_SECRET: process.env.CRON_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
});

/** Build-time validated public env vars (safe for client). */
export const clientEnv = parseEnv(clientEnvSchema, {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_ROOT_DOMAIN: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
  NEXT_PUBLIC_AUTH_GOOGLE_ENABLED: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED,
});

/** Combined env for isomorphic code paths (public keys only). */
export const env = {
  ...clientEnv,
  isDev: serverEnv.NODE_ENV === "development",
  isProd: serverEnv.NODE_ENV === "production",
} as const;

export type ClientEnv = typeof clientEnv;
export type ServerEnv = typeof serverEnv;
