
import {vitePreprocess} from "@sveltejs/vite-plugin-svelte"
import staticAdapter from '@sveltejs/adapter-static'
import nodeAdapter from '@sveltejs/adapter-node'
import multiAdapter from '@macfja/svelte-multi-adapter'



/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: multiAdapter([staticAdapter({fallback: 'index.html'}), nodeAdapter({ out: 'electron/build' })]),
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
