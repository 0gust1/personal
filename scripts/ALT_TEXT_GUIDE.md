# Alt Text Generator - Usage Guide

## Overview

This script automatically generates descriptive alt text for images in your markdown content using Ollama and local AI vision models. It's perfect for improving accessibility without compromising privacy.

## Key Features

✨ **Multi-language Support**: Automatically detects French (`fr`) or English (`en`) from frontmatter
🔍 **Comprehensive Image Detection**: Handles markdown, HTML, and SvelteKit enhanced images
🤖 **Local AI**: Uses Ollama (llava model) - no API keys, no cloud services
🛡️ **Safe by Default**: Dry-run mode prevents accidental changes
🎯 **Interactive & Batch Modes**: Review each suggestion or process all at once

## Prerequisites

1. **Install Ollama** (one-time setup):
   ```bash
   brew install ollama  # macOS
   ```

2. **Download a vision model** (one-time):
   ```bash
   ollama pull llava        # Standard model (~4GB)
   # or
   ollama pull llava-phi3   # Smaller alternative (~2.7GB)
   ```

3. **Start Ollama server** (each time before using the script):
   ```bash
   ollama serve
   ```
   Keep this running in a separate terminal window.

## Usage Examples

### Basic Usage (Interactive Mode)

Preview suggestions without making changes:
```bash
./scripts/generate-alt-text.ts
```

This will:
- Find all images without alt text (or with placeholder alt text)
- Show you each image path and suggested alt text
- Let you accept, edit, skip, or quit for each image

### Apply Changes (Interactive)

Actually update your files:
```bash
./scripts/generate-alt-text.ts --apply
```

### Batch Mode

Process all images automatically without interaction:
```bash
# Dry run (preview)
./scripts/generate-alt-text.ts --batch

# Apply all changes
./scripts/generate-alt-text.ts --batch --apply
```

### Force Language

Override auto-detection and force a specific language:
```bash
# Generate French alt text for all images
./scripts/generate-alt-text.ts --lang fr --apply

# Generate English alt text for all images
./scripts/generate-alt-text.ts --lang en --apply
```

### Use Different Model

If you have other vision models installed:
```bash
./scripts/generate-alt-text.ts --model llava-phi3 --apply
```

### Replace Existing Alt Texts

By default, the script only processes images with missing or generic alt text. To regenerate ALL alt texts:

```bash
# Review and replace all alt texts
./scripts/generate-alt-text.ts --replace-existing --apply

# Batch replace all alt texts
./scripts/generate-alt-text.ts --replace-existing --batch --apply

# Check how many images would be processed
./scripts/generate-alt-text.ts --replace-existing --check-only
```

**Use cases for `--replace-existing`:**
- Updating old/poor quality alt texts
- Switching to a better AI model
- Changing language (e.g., from English to French)
- Improving consistency across your site

### Specify Custom Directories

By default, the script scans `src/content/posts` and `src/content/logs`. You can specify different directories:
```bash
./scripts/generate-alt-text.ts --dir src/content/drafts --apply
```

### Check Only (Scan Without Ollama)

To see what images need alt text without running Ollama:
```bash
./scripts/generate-alt-text.ts --check-only

# Check specific directory
./scripts/generate-alt-text.ts --dir src/content/logs/2025-09-27_weppes-auriferes --check-only
```

This is useful to:
- Preview what needs work before installing Ollama
- Debug image detection
- See a summary of images by type (markdown, html, enhanced, picturegrid)

### NPM Scripts

For convenience, you can also use:
```bash
npm run generate-alt          # Interactive dry-run
npm run generate-alt:apply    # Interactive with changes
```

## How It Works

### 1. Detection

The script scans markdown files for four types of image syntax:

**Markdown images:**
```markdown
![](./images/photo.jpg)           ← Empty alt
![image](./images/photo.jpg)      ← Generic alt
```

**HTML images:**
```html
<img src="/photo.jpg" alt="">     ← Empty alt
<img src="/photo.jpg">            ← Missing alt
```

**Enhanced images (SvelteKit):**
```svelte
<enhanced:img src={imageModules['./images/photo.jpg']} />
<enhanced:img src={imageModules['./images/photo.jpg']} alt="" />
```

**PictureGrid component:**
```svelte
<PictureGrid images={[
  { src: imageModules['./files/photo1.jpg'], alt: "" },
  { src: imageModules['./files/photo2.jpg'], alt: "" }
]} />
```

### 2. Language Detection

The script reads the frontmatter of each markdown file:

```yaml
---
lang: fr                          ← Detected as French
title: Mon article
---
```

If no `lang` field is found, it defaults to English. You can override with `--lang`.

### 3. AI Generation

For each image:
1. Resolves the image path (handles relative and absolute paths)
2. Sends the image to Ollama with a language-specific prompt
3. Receives a descriptive, accessibility-focused alt text

**English prompt:**
> "Describe this image in one clear, concise sentence for web accessibility (alt text). Focus on the main subject and key details. Be descriptive but brief. Answer in English only."

**French prompt:**
> "Décris cette image en une phrase claire et concise pour l'accessibilité web (texte alt). Concentre-toi sur le sujet principal et les détails clés. Sois descriptif mais bref. Réponds uniquement en français."

### 4. Application

In interactive mode, you can:
- **[a]ccept**: Use the suggested alt text as-is
- **[e]dit**: Modify the suggestion before applying (the AI-generated text will be prefilled for easy editing)
- **[s]kip**: Skip this image
- **[q]uit**: Exit the script

In batch mode, all changes are applied automatically (unless it's a dry run).

## Example Session

```bash
$ ./scripts/generate-alt-text.ts --apply

🖼️  Alt Text Generator
Mode: interactive
Dry run: No
Language: auto
Model: llava
Directories: src/content/posts, src/content/logs

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

[2/3]
...
```

## Supported Image Formats

- JPEG/JPG
- PNG
- WebP
- AVIF
- GIF
- SVG
- TIFF/TIF
- HEIF/HEIC

## Troubleshooting

### "Cannot connect to Ollama"

Make sure Ollama is running:
```bash
ollama serve
```

### "Model 'llava' not found"

Download the model:
```bash
ollama pull llava
```

### "Could not resolve image path"

The script tries to resolve:
- Relative paths: `./images/photo.jpg`
- Absolute paths: `/photo.jpg` (from `static/`)

Make sure your image paths are correct in your markdown files.

### Script hangs or is very slow

- Vision models are computationally intensive
- Processing time depends on your hardware
- Expect 3-10 seconds per image on modern hardware
- Consider using `llava-phi3` for faster processing (smaller model)
- Large images (>10MB) will take longer and show a warning

### "maxBuffer length exceeded"

This has been fixed in the latest version. The script now:
- Uses temporary files to avoid command line length limits
- Handles large images (up to 50MB) properly
- Shows warnings for very large images

If you still see this error, your images might be extremely large. Consider:
- Optimizing/resizing images before processing
- Using the enhanced image pipeline to generate smaller versions

## Tips

1. **Review dry runs first**: Always run without `--apply` first to see what changes will be made
2. **Use interactive mode for important content**: You can review and refine each suggestion
3. **Batch mode for drafts**: Use batch mode to quickly process many images in draft content
4. **Keep Ollama updated**: `brew upgrade ollama` for latest features and bug fixes
5. **Consider model trade-offs**: 
   - `llava`: Better quality, slower, larger (~4GB)
   - `llava-phi3`: Faster, smaller (~2.7GB), slightly less detailed

## Privacy & Security

✅ **100% local processing** - Images never leave your computer
✅ **No API keys required** - No accounts, no tracking
✅ **No internet required** - Works offline (after model download)
✅ **Safe by default** - Dry-run mode prevents accidental changes

## Integration with Git Workflow

The script fits nicely into your content creation workflow:

```bash
# 1. Create new content
./create-content.ts post "My Adventure"

# 2. Write content and add images
# ... edit your markdown file ...

# 3. Generate alt text
./scripts/generate-alt-text.ts --apply

# 4. Review and commit
git add .
git commit -m "Add new post with accessible images"
```

## Future Improvements

Potential enhancements:
- Support for more languages (ES, DE, IT, etc.)
- Custom prompts for specific image types
- Integration with image optimization pipeline
- Batch processing with progress bar
- Export/import of generated alt texts
- Support for other vision models (GPT-4V, Claude, etc.)

## Questions?

Check the help:
```bash
./scripts/generate-alt-text.ts --help
```
