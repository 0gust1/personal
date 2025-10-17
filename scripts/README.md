# Helper Scripts

This folder contains utility scripts for content management and workflow automation.

## Available Scripts

### 1. Content Creation Script

**File**: `create-content.ts`

Quickly scaffold new blog posts or logs with proper structure and frontmatter.

#### Usage

```bash
# Create a new post
./scripts/create-content.ts post "My New Blog Post"

# Create a new log entry
./scripts/create-content.ts log "Quick Update"

# Via Makefile
make new-post TITLE="My New Blog Post"
make new-log TITLE="Quick Update"
```

#### What It Does

- - Generates a date-prefixed folder structure (`YYYY-MM-DD_slug`)
- - Creates a markdown file from template with proper frontmatter
- - Sets up a `files/` directory for assets
- - Slugifies the title (max 20 characters, URL-safe)
- - Checks for existing directories to prevent overwrites

---

### 2. Image Cleanup Script

**File**: `check-and-cleanup-images.ts`

Analyzes markdown files to find unused images in associated folders, providing detailed reports and optional cleanup functionality.

#### How to Use

```bash
# Analyze a single file (dry-run)
./scripts/check-and-cleanup-images.ts "src/content/posts/my-post/my-post.md" --dry-run

# Analyze all posts (dry-run)
./scripts/check-and-cleanup-images.ts "src/content/posts/**/*.md" --dry-run

# Analyze with pattern (dry-run)
./scripts/check-and-cleanup-images.ts "src/content/posts/2025-*/*.md" --dry-run

# Via Makefile
make extract-images          # Show usage instructions
make extract-images-dry      # Interactive mode for specific pattern
make extract-images-all      # Analyze all posts and logs
```

#### Features

- ✅ Finds all images in folders associated with markdown files
- ✅ Detects multiple image reference formats (markdown, HTML, `<enhanced:img>`, PictureGrid)
- ✅ Identifies unused images that can be safely deleted
- ✅ Reports total size of unused images
- ✅ Safe dry-run mode by default
- ✅ Supports glob patterns for batch analysis

---

### 3. Alt Text Generator Script

**File**: `generate-alt-text.ts`

Automatically generates descriptive alt text for images in your markdown content using:

- **Ollama** (local AI, no cloud services)
- **Vision models** (qwen2.5vl:latest, genma3, llava or llava-phi3)
- **Language-aware prompts** (auto-detects EN/FR from frontmatter)

## Quick Start

### 1. One-time Setup

```bash
# Install Ollama
brew install ollama

# Download vision model
ollama pull llava

# Start Ollama server (keep running)
ollama serve
```

### 2. Use the Script

```bash
# Interactive mode (review each suggestion)
./scripts/generate-alt-text.ts

# Interactive mode (actually apply changes)
./scripts/generate-alt-text.ts --apply

# Batch mode (process all images)
./scripts/generate-alt-text.ts --batch --apply

# Force French
./scripts/generate-alt-text.ts --lang fr --apply

# Replace ALL existing alt texts (regenerate everything)
./scripts/generate-alt-text.ts --replace-existing --batch --apply
```

## Features

- ✨ **Multi-language**: Auto-detects French/English from frontmatter
- 🔍 **Smart detection**: Finds markdown, HTML, `<enhanced:img>`, and PictureGrid images
- 🤖 **Local AI**: Uses Ollama (privacy-friendly, no API keys)
- 🛡️ **Safe**: Dry-run by default, requires `--apply` to make changes
- 🎯 **Two modes**: Interactive (review each) or batch (auto-process all)
- 👀 **Check-only mode**: Scan and report without needing Ollama

## What It Detects

The script finds images with missing or generic alt text:

```markdown
![](./images/photo.jpg)              ← Empty alt
![image](./images/photo.jpg)         ← Generic alt
```

```html
<img src="/photo.jpg" alt="">        ← Empty alt
<img src="/photo.jpg">               ← Missing alt
```

```svelte
<enhanced:img src={...} />           ← Missing alt
<enhanced:img src={...} alt="" />    ← Empty alt
```

```svelte
<PictureGrid images={[
  { src: imageModules['./files/photo.jpg'], alt: "" }
]} />                                ← Empty alt in grid
```

## Language Detection

Reads frontmatter:

```yaml
---
lang: fr                             ← Generates French alt text
title: Mon article
---
```

```yaml
---
lang: en                             ← Generates English alt text
title: My Article
---
```yaml
lang: en                             ← Generates English alt text
```

Override with `--lang fr` or `--lang en` if needed.

## Example Output

```text
🖼️  Alt Text Generator
Mode: interactive
Language: auto
Model: llava

📸 Found 3 images without alt text

[1/3]
File: src/content/posts/2025-08-20_Amiens_Treguier/2025-08-20_Amiens_Treguier.md:57
Image: ./images/trajet.png
Language: FR
Current alt: ""

🤖 Generating alt text with Ollama (llava)...

✨ Suggested: "Carte de France montrant un itinéraire cycliste entre Amiens et Tréguier"

Options: [a]ccept, [e]dit, [s]kip, [q]uit: a
✅ Updated
```

In edit mode, the AI-generated text is prefilled, so you can easily modify it using your keyboard's editing keys (arrow keys, backspace, etc.).

## Privacy & Security

- ✅ 100% local processing
- ✅ No API keys required
- ✅ No cloud services
- ✅ Works offline (after model download)
- ✅ Images never leave your computer

## Help

```bash
./scripts/generate-alt-text.ts --help
```

See `scripts/ALT_TEXT_GUIDE.md` for detailed documentation.
