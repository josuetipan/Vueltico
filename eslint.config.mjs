import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  js.configs.recommended,
  globalIgnores(["dist/**", "node_modules/**"]),
]);
