import {config} from "dotenv"
import {defineConfig, minimalPreset as preset} from "@vite-pwa/assets-generator/config"

config({path: ".env.local"})
config({path: ".env"})

export default defineConfig({
  preset,
  images: [process.env.VITE_PLATFORM_LOGO],
})
