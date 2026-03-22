import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Legacy tooling and admin surfaces are out of the current public-frontend scope.
    "scripts/**",
    "server.js",
    "src/app/admin/**",
    "src/app/api/admin/**",
  ]),
]);

export default eslintConfig;
