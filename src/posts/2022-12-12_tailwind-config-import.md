---
title: 'Use tailwindcss custom config in JS/TS parts of a SvelteKit app'
description: 'An handy hack to use your tailwindcss tokens in your applicative code'
date: '2022-12-12'
updated_at: '2023-05-07'
tags: ['sveltekit', 'vite', 'tailwindcss', 'web', 'code']
published: true
---

_original post: https://gist.github.com/0gust1/aa8c8b831428cdd7a5535e92cbf02f04_

If you use tailwind as a styling/design-system engine for your app, you may have defined custom colors, spacings or other custom "design tokens".

Sometimes you may need to access values of this custom config in your app's JS/TS files or Svelte files (`<script>` part).

This is often the case if you do some advanced front-end rendering using [canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas), [svg](https://developer.mozilla.org/en-US/docs/Web/SVG), [d3](https://d3js.org/) or [webGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API). And/Or if you want to perform calculations or interpolation on theses values.

**TLDR;**

- Prerequisite: a working SvelteKit+tailwindcss project
- In `svelte.config.js`, add: `kit.alias.tailwindConfig: 'tailwind.config.cjs'`.
- add `optimizeDeps.include:['tailwindConfig']` and `server.fs.allow:[searchForWorkspaceRoot(process.cwd())]` in `vite.config.js`

Now you can do `import tailwindConfig from 'tailwindConfig';` in your JS/TS/Svelte files, and use it later like `tailwindConfig.theme.colors.yourCustomColor[500]`.

It may be possible that this trick works in other Vite-based projects, but I haven't tested it. If you do, please let me know.

---

as an example, our `vite.config.ts` file:

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { searchForWorkspaceRoot } from 'vite';
const config: UserConfig = {
  plugins: [sveltekit()],
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())]
    }
  },
  optimizeDeps: {
    include: ['tailwindConfig']
  }
};

export default config;
```
