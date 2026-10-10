import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true";
const isUserSite =
  repositoryName?.toLowerCase().endsWith(".github.io") ?? false;

export default defineConfig({
  base:
    isGitHubPagesBuild && repositoryName && !isUserSite
      ? `/${repositoryName}/`
      : "/",
  plugins: [react()],
});
