# 0gust1 - website

A Sveltekit-powered static website generator.

## Features

- Static website, no server runtime needed.
- Content is written in markdown, with special powers thanks to [mdsvex](https://mdsvex.com/).
- Optimized images, powerful image layouting component, lightbox-like image gallery.
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
