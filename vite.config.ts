import { defineConfig } from "vite";
import { resolve } from "path";
import glsl from "vite-plugin-glsl";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    glsl(),
    dts({ entryRoot: "src", include: ["src"] }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname!, "src/index.ts"),
      name: "EdgeTicker",
      formats: ["es"],
      fileName: "edge-ticker",
    },
  },
});
