import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Codegen must stay pure: data in, strings out (ADR 0003). It's the most
  // tested module in the repo, and this keeps it runnable anywhere.
  {
    files: ["src/lib/codegen/**/*.js"],
    ignores: ["src/lib/codegen/**/*.test.js"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["react", "react-dom", "react/*", "react-dom/*", "next", "next/*"], message: "src/lib/codegen must stay pure: no React or Next.js." },
            { group: ["@/components/*", "@/editor/*", "@/app/*"], message: "src/lib/codegen must not depend on UI code." },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
  ]),
]);

export default eslintConfig;
