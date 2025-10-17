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

- Generates a date-prefixed folder structure (`YYYY-MM-DD_slug`)
- Creates a markdown file from template with proper frontmatter
- Sets up a `files/` directory for assets
- Slugifies the title (max 20 characters, URL-safe)
- Checks for existing directories to prevent overwrites

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

Automatically generates descriptive alt text for images using local AI (Ollama).

#### Quick Start

```bash
# One-time setup
brew install ollama
ollama pull llava
ollama serve                    # Keep running in another terminal

# Basic usage
./scripts/generate-alt-text.ts --apply

# Via Makefile
make generate-alt               # Interactive dry-run
make generate-alt-apply         # Interactive with changes
```

#### Key Features

- ✨ Multi-language support (auto-detects French/English from frontmatter)
- 🔍 Detects markdown, HTML, `<enhanced:img>`, and PictureGrid images
- 🤖 100% local processing with Ollama (no API keys, no cloud)
- 🛡️ Safe by default (dry-run mode)
- 🎯 Interactive or batch modes

#### Common Use Cases

```bash

# run on a specific folder, non-interactive, and replace existing alt texts
./scripts/generate-alt-text.ts --dir src/content/logs/2025-09-27_weppes-auriferes --model qwen2.5vl --batch --apply --replace-existing

# Review each suggestion before applying
./scripts/generate-alt-text.ts --apply

# Auto-process all images
./scripts/generate-alt-text.ts --batch --apply

# Force a specific language
./scripts/generate-alt-text.ts --lang fr --apply

# Replace existing alt texts
./scripts/generate-alt-text.ts --replace-existing --apply

# Scan without Ollama
./scripts/generate-alt-text.ts --check-only
```

📖 **See [ALT_TEXT_GUIDE.md](ALT_TEXT_GUIDE.md) for comprehensive documentation, troubleshooting, and examples**
