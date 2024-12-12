import dotenv from "dotenv"
import { defineConfig } from "vite"
import { SvelteKitPWA } from "@vite-pwa/sveltekit"
import { sveltekit } from "@sveltejs/kit/vite"
import svg from "@poppanator/sveltekit-svg"
import { join } from "path"

dotenv.config({ path: ".env.local" })
dotenv.config({ path: ".env" })

export default defineConfig({

  build: {
    outDir: 'electronapp',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: join(__dirname, 'main.ts'),
        //preload: join(__dirname, 'preload.ts')
      }
    }
  },
  server: {
    port: 1847,
  },
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 ** 2, // 5 MB or set to something else
      },
      manifest: {
        name: process.env.VITE_PLATFORM_NAME,
        short_name: process.env.VITE_PLATFORM_NAME,
        theme_color: process.env.VITE_PLATFORM_ACCENT,
        description: process.env.VITE_PLATFORM_DESCRIPTION,
        // @ts-ignore
        permissions: ["clipboardRead", "clipboardWrite", "unlimitedStorage"],
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
    svg({
      svgoOptions: {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                removeViewBox: false,
              },
            },
          },
          "removeDimensions",
        ],
      },
    }),
  ],
})
