import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  return {
    plugins: [react(), tailwindcss()],
    define: {
      "process.env": {},
    },

    build: {
      target: "es2022",
      cssCodeSplit: true,
      cssMinify: true,
      sourcemap: false,
      chunkSizeWarningLimit: 500,
      reportCompressedSize: true,
      modulePreload: {
        resolveDependencies(filename, deps, { hostType }) {
          if (hostType === "html") {
            return deps.filter(
              (dep) => !dep.includes("vendor-markdown") && !dep.includes("ReviewMarkdownViewer")
            );
          }
          return deps;
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (
                id.includes("react/") ||
                id.includes("react-dom/") ||
                id.includes("react-router")
              ) {
                return "vendor-react";
              }
              if (id.includes("@tanstack")) {
                return "vendor-query";
              }
              if (id.includes("@base-ui") || id.includes("sonner")) {
                return "vendor-ui";
              }
              if (
                id.includes("prismjs") ||
                id.includes("react-markdown") ||
                id.includes("remark-gfm") ||
                id.includes("micromark") ||
                id.includes("mdast") ||
                id.includes("unist") ||
                id.includes("unified") ||
                id.includes("vfile") ||
                id.includes("property-information") ||
                id.includes("space-separated-tokens") ||
                id.includes("comma-separated-tokens")
              ) {
                return "vendor-markdown";
              }
              if (id.includes("lucide-react")) {
                return "vendor-icons";
              }
              if (id.includes("motion")) {
                return "vendor-motion";
              }
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
      allowedHosts: true,
      proxy: {
        "/api": {
          target: "http://localhost:8080",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
