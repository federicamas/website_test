import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const env =
  (
    globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env ?? {};

const repoName = env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isGitHubPagesBuild = env.GITHUB_ACTIONS === "true";
const isUserOrOrgSite = repoName.slice(-10) === ".github.io";

const base = isGitHubPagesBuild && repoName && !isUserOrOrgSite ? `/${repoName}/` : "/";

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
  },
});

