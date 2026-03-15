import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

function copyRuntimeDirs(directories) {
  return {
    name: "copy-runtime-dirs",
    closeBundle() {
      const distDir = path.resolve("dist");
      mkdirSync(distDir, { recursive: true });

      directories.forEach((directory) => {
        const source = path.resolve(directory);
        const target = path.resolve("dist", directory);
        if (!existsSync(source)) {
          return;
        }

        cpSync(source, target, { recursive: true });
      });
    },
  };
}

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
  plugins: [copyRuntimeDirs(["maps", "assets"])],
});
