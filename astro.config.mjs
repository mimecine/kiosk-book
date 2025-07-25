import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://book.gh.kioskkiosk.com",
  // base: ".",
  build: {
    // Example: Generate `page.html` instead of `page/index.html` during build.
    // format: "file",
  },
  image: {
    domains: ["cdn.shopify.com"],
  },
  server: {
    port: 9000,
  },
  integrations: [mdx(), sitemap(), tailwind({ nesting: true })],
  vite: {
    // base:'./',
    build: {
      minify: false,
    },
    // plugins: [
    //   {
    //     name: 'remove-leading-slash',
    //     transform(code, id) {
    //       if (id.endsWith('.astro') || id.endsWith('.html') || id.endsWith('.md') || id.endsWith('.mdx')) {
    //         return {
    //           code: code
    //             .replace(/(href|src)=(["'])\//g, '$1=$2')
    //             .replace(/(href|src)=\{(["'])\//g, '$1={$2'),
    //           map: null
    //         };
    //       }
    //     }
    //   }
    // ]
  },
});
