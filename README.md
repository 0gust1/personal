# 0gust1 - website - sveltekit

I stole some code and ideas from those 2 projects:

- https://github.com/mattjennings/sveltekit-blog-template
- https://github.com/mvasigh/sveltekit-mdsvex-blog

I changed some things to make it more to my liking, and added some features.

You're free to use and adapt this code as you see fit.

## Features

- Static website, no server runtime needed.
- Content is written in markdown, with special powers thanks to [mdsvex](https://mdsvex.com/).
- RSS feeds are great, RSS is not dead.

## Run

Clone the repository, then:

### Locally, dev mode

```bash
npm ci && npm run dev
```

### Locally, prod mode

```bash
npm ci && npm run build && npm run preview
```

## Helper Scripts

The `scripts/` folder contains utilities for content management:

- **create-content.ts** - Scaffold new posts/logs with proper structure
- **generate-alt-text.ts** - AI-powered alt text generation for accessibility
- **check-and-cleanup-images.ts** - Find and remove unused images

**Quick examples:**

```bash
# Create new content
./scripts/create-content.ts post "My New Blog Post"

# Generate alt text (needs Ollama)
./scripts/generate-alt-text.ts --apply
```

📖 **See [scripts/README.md](scripts/README.md) for detailed documentation**

## Specifics

Images and image optimization: <https://kit.svelte.dev/docs/images>
