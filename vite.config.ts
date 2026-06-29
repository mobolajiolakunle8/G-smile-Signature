import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import compression from "vite-plugin-compression2";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    /* Inline JS + CSS into a single index.html.
       Images from public/ are copied to dist/ by Vite automatically,
       so they resolve correctly on every hosting platform. */
    viteSingleFile({ removeViteModuleLoader: true }),

    /* Gzip + Brotli — drastically reduces transfer size */
    compression({ algorithms: ["gzip"],           filename: "[path][base].gz"  }),
    compression({ algorithms: ["brotliCompress"],  filename: "[path][base].br"  }),
  ],

  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },

  build: {
    /* Inline imported assets under 2 MB as base64 data URIs.
       Larger files are copied to dist/assets/ as normal. */
    assetsInlineLimit: 2 * 1024 * 1024, // 2 MB

    /* Single CSS chunk */
    cssCodeSplit: false,

    /* Target modern browsers — smaller, faster output */
    target: "es2020",

    /* Minify aggressively */
    minify: "esbuild",

    rollupOptions: {
      output: {
        /* Merge all dynamic imports into the entry chunk so
           viteSingleFile can inline everything. */
        inlineDynamicImports: true,

        /* Compact variable names */
        compact: true,
      },
    },
  },

  /* Serve public/ at / in dev */
  publicDir: "public",
});
