import { cpSync, existsSync, mkdirSync } from "node:fs";
import path, { resolve } from "node:path";
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
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        character: resolve(__dirname, "character.html"),
        chat: resolve(__dirname, "chat.html"),
        game: resolve(__dirname, "game.html"),
        "room-create": resolve(__dirname, "room-create.html"),
        "room-join": resolve(__dirname, "room-join.html"),
        "room-waiting": resolve(__dirname, "room-waiting.html"),
        settings: resolve(__dirname, "settings.html"),
      },
    },
  },
  plugins: [copyRuntimeDirs(["maps", "assets"])],
});
