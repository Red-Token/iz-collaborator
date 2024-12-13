import adapter from "adapter-electron"
import {vitePreprocess} from "@sveltejs/vite-plugin-svelte"

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      "@src": "src",
      "@app": "src/app",
      "@lib": "src/lib",
      "@assets": "src/assets",
    },
    csp: {
      directives: {
        "script-src": ["self", "plausible.coracle.social"],
        "worker-src": ["self", "blob:"],
        "style-src": ["self", "unsafe-inline"],
        "frame-src": ["none"],
        "child-src": ["none"],
        "form-action": ["none"],
      },
    },
  },
}
