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

### Generate Alt Text with AI

Use Ollama to automatically generate alt text for images in your content:

```bash
# Prerequisites (one-time setup)
brew install ollama              # Install Ollama
ollama pull llava               # Download vision model
ollama serve                    # Start Ollama server (in another terminal)

# Interactive mode - review each suggestion
./scripts/generate-alt-text.ts

# Interactive mode - apply changes
./scripts/generate-alt-text.ts --apply

# Batch mode - auto-generate for all images (dry-run)
./scripts/generate-alt-text.ts --batch

# Batch mode - apply all changes
./scripts/generate-alt-text.ts --batch --apply

# Force language (overrides auto-detection from frontmatter)
./scripts/generate-alt-text.ts --lang fr --apply
./scripts/generate-alt-text.ts --lang en --apply

# Use different model
./scripts/generate-alt-text.ts --model llava-phi3

# Show help
./scripts/generate-alt-text.ts --help
```

The script:

- Auto-detects language from frontmatter (`lang: fr` or `lang: en`)
- Supports markdown (`![]()`), HTML (`<img>`), enhanced images (`<enhanced:img>`), and PictureGrid components
- Generates contextual alt text using local AI (private, no API keys needed)
- Safe by default (dry-run mode unless `--apply` is specified)
- Check-only mode to scan without Ollama

## Specifics

Images and image optimization: <https://kit.svelte.dev/docs/images>
