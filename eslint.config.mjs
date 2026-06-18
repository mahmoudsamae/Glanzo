import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";
import { defineConfig, globalIgnores } from "eslint/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "src/types/database.types.ts",
  ]),
  {
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**" },
        { type: "features", pattern: "src/features/*", mode: "folder", capture: ["featureName"] },
        { type: "components-ui", pattern: "src/components/ui/**" },
        { type: "components-shared", pattern: "src/components/shared/**" },
        { type: "components-layout", pattern: "src/components/layout/**" },
        { type: "components-dashboard", pattern: "src/components/dashboard/**" },
        { type: "server", pattern: "src/server/**" },
        { type: "lib", pattern: "src/lib/**" },
        { type: "hooks", pattern: "src/hooks/**" },
        { type: "types", pattern: "src/types/**" },
      ],
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: "app",
              allow: [
                "features",
                "components-ui",
                "components-shared",
                "components-layout",
                "components-dashboard",
                "server",
                "lib",
                "hooks",
                "types",
              ],
            },
            {
              from: "features",
              allow: [
                "components-ui",
                "components-shared",
                "components-layout",
                "components-dashboard",
                "lib",
                "hooks",
                "types",
                "server",
              ],
              disallow: ["features"],
            },
            {
              from: "components-dashboard",
              allow: ["components-ui", "lib", "hooks", "types"],
              disallow: ["features", "app", "server"],
            },
            {
              from: "components-ui",
              allow: ["lib", "hooks", "types"],
              disallow: ["features", "app", "server"],
            },
            {
              from: "components-shared",
              allow: ["components-ui", "lib", "hooks", "types"],
              disallow: ["features", "app", "server"],
            },
            {
              from: "components-layout",
              allow: ["components-ui", "components-shared", "lib", "hooks", "types"],
              disallow: ["features", "app", "server"],
            },
            {
              from: "server",
              allow: ["lib", "types"],
              disallow: ["features", "app", "components-ui", "components-shared", "components-layout", "hooks"],
            },
            {
              from: "lib",
              allow: ["types"],
              disallow: ["features", "app", "server", "components-ui", "components-shared", "components-layout", "hooks"],
            },
            {
              from: "hooks",
              allow: ["lib", "types"],
              disallow: ["features", "app", "server", "components-ui", "components-shared", "components-layout"],
            },
          ],
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "framer-motion",
              importNames: ["motion"],
              message:
                "Use `m` from `framer-motion/client` inside LazyMotion strict provider — see src/lib/motion.ts.",
            },
          ],
          patterns: [
            {
              group: ["@/features/*/*"],
              message: "Import features only via their public index.ts surface.",
            },
            {
              group: ["@/lib/supabase/service", "@/lib/supabase/service.ts"],
              message:
                "Service-role Supabase client is server-only — use createServerSupabaseClient or createBrowserSupabaseClient.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["tests/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    files: ["src/server/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "framer-motion",
              importNames: ["motion"],
              message:
                "Use `m` from `framer-motion/client` inside LazyMotion strict provider — see src/lib/motion.ts.",
            },
          ],
          patterns: [
            {
              group: ["@/features/*/*"],
              message: "Import features only via their public index.ts surface.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
