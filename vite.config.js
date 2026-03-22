var _a, _b, _c, _d;
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
var env = (_b = (_a = globalThis.process) === null || _a === void 0 ? void 0 : _a.env) !== null && _b !== void 0 ? _b : {};
var repoName = (_d = (_c = env.GITHUB_REPOSITORY) === null || _c === void 0 ? void 0 : _c.split("/")[1]) !== null && _d !== void 0 ? _d : "";
var isGitHubPagesBuild = env.GITHUB_ACTIONS === "true";
var isUserOrOrgSite = repoName.slice(-10) === ".github.io";
var base = isGitHubPagesBuild && repoName && !isUserOrOrgSite ? "/".concat(repoName, "/") : "/";
export default defineConfig({
    base: base,
    plugins: [react()],
    test: {
        environment: "jsdom",
        setupFiles: "./src/test/setup.ts",
        css: true,
    },
});
