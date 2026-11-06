import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "icon-192.png",
        "icon-512.png",
        "icons.svg",
      ],
      workbox: {
        globPatterns: [
          "**/*.{js,mjs,css,html,ico,png,svg,txt,woff,woff2,ttf,otf,wasm,data,json,webmanifest}",
        ],
        maximumFileSizeToCacheInBytes: 25 * 1024 * 1024,
      },
      manifest: {
        id: "/",
        name: "Tap to Talk",
        short_name: "Tap to Talk",
        description: "اپلیکیشن ارتباط تصویری و گفتار فارسی",
        lang: "fa-IR",
        dir: "rtl",
        theme_color: "#3b82f6",
        background_color: "#ffffff",
        start_url: "/",
        display: "standalone",
        orientation: "portrait-primary",
        categories: ["education", "accessibility"],
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
