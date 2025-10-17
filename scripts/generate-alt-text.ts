#!/usr/bin/env node --experimental-strip-types

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, relative, resolve, dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { createInterface } from 'readline';

const execAsync = promisify(exec);

// ANSI color codes
const colors = {
  red: '\x1b[0;31m',
  green: '\x1b[0;32m',
  yellow: '\x1b[1;33m',
  blue: '\x1b[0;34m',
  cyan: '\x1b[0;36m',
  reset: '\x1b[0m'
} as const;

type Language = 'en' | 'fr' | 'auto';

interface ImageReference {
  filePath: string;      // Path to markdown file
  imagePath: string;     // Path to image (relative to file or absolute)
  currentAlt: string;    // Current alt text
  lineNumber: number;    // Line number in file
  lineContent: string;   // Full line content
  matchType: 'markdown' | 'html' | 'enhanced' | 'picturegrid';  // Type of image syntax
  language: Language;    // Detected or specified language
}

interface Options {
  mode: 'interactive' | 'batch';
  dryRun: boolean;
  language: Language;
  ollamaModel: string;
  contentDirs: string[];
  checkOnly: boolean;
  replaceExisting: boolean;
}

// Language prompts for Ollama
const PROMPTS = {
  en: `Describe this image in one clear, concise sentence for web accessibility (alt text). Focus on the main subject and key details. Be descriptive but brief. Answer in English only.`,
  fr: `Décris cette image en une phrase claire et concise pour l'accessibilité web (texte alt). Concentre-toi sur le sujet principal et les détails clés. Sois descriptif mais bref. Réponds uniquement en français.`
};

// Detect language from markdown frontmatter
function detectLanguage(content: string): Language {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const langMatch = frontmatterMatch[1].match(/^lang:\s*(\w+)/m);
    if (langMatch) {
      const lang = langMatch[1].toLowerCase();
      return lang === 'fr' ? 'fr' : 'en';
    }
  }
  return 'en'; // Default to English
}

// Find all images in markdown files
async function findImagesInContent(contentDir: string, options: Options): Promise<ImageReference[]> {
  const images: ImageReference[] = [];
  const mdFiles = await findMarkdownFiles(contentDir);
  
  for (const mdFile of mdFiles) {
    const content = await readFile(mdFile, 'utf-8');
    const lines = content.split('\n');
    const detectedLang = options.language === 'auto' ? detectLanguage(content) : options.language;
    
    // Match: ![alt](path) or ![](path)
    const mdImageRegex = /!\[(.*?)\]\((.+?)\)/g;
    
    // Match: <img src="path" alt="alt"> or alt="" or no alt
    // Uses (?:(?!QUOTE).)*? to match everything except the closing quote (supports apostrophes)
    const htmlImageRegex = /<img[^>]+src=(["'])((?:(?!\1).)*?)\1(?:[^>]+alt=(["'])((?:(?!\3).)*?)\3)?[^>]*>/gi;
    
    // Match: <enhanced:img src={...} alt="..." />
    // Uses (?:(?!QUOTE).)*? to match everything except the closing quote
    const enhancedImageRegex = /<enhanced:img[^>]+src=\{[^}]+\}(?:[^>]+alt=(["'])((?:(?!\1).)*?)\1)?[^>]*\/>/gi;
    
    // Match: PictureGrid component image objects: { src: imageModules['./path'], ... alt: "..." }
    // Uses (?:(?!QUOTE).)* to match everything except the closing quote (supports apostrophes in French and empty strings)
    const pictureGridRegex = /\{\s*src:\s*imageModules\['([^']+)'\][^}]*\balt:\s*(["'])((?:(?!\2).)*?)\2/g;
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Check markdown images
      let match;
      const mdRegex = new RegExp(mdImageRegex);
      while ((match = mdRegex.exec(line)) !== null) {
        const [fullMatch, alt, src] = match;
        const shouldInclude = options.replaceExisting || 
                             !alt || 
                             alt.trim() === '' || 
                             alt.toLowerCase() === 'image';
        if (shouldInclude) {
          images.push({
            filePath: mdFile,
            imagePath: src,
            currentAlt: alt || '',
            lineNumber,
            lineContent: line,
            matchType: 'markdown',
            language: detectedLang
          });
        }
      }
      
      // Check HTML images
      const htmlRegex = new RegExp(htmlImageRegex);
      while ((match = htmlRegex.exec(line)) !== null) {
        // match[1] = opening quote for src, match[2] = src value
        // match[3] = opening quote for alt (if present), match[4] = alt value (if present)
        const src = match[2];
        const alt = match[4] || '';
        const shouldInclude = options.replaceExisting || 
                             !alt || 
                             alt.trim() === '' || 
                             alt.toLowerCase() === 'image';
        if (shouldInclude) {
          images.push({
            filePath: mdFile,
            imagePath: src,
            currentAlt: alt,
            lineNumber,
            lineContent: line,
            matchType: 'html',
            language: detectedLang
          });
        }
      }
      
      // Check enhanced:img images
      const enhancedRegex = new RegExp(enhancedImageRegex);
      while ((match = enhancedRegex.exec(line)) !== null) {
        // match[1] = opening quote, match[2] = alt value
        const alt = match[2] || '';
        // Extract src path from imageModules reference
        const srcMatch = line.match(/imageModules\['([^']+)'\]/);
        if (srcMatch) {
          const relativePath = srcMatch[1];
          const shouldInclude = options.replaceExisting || 
                               !alt || 
                               alt.trim() === '' || 
                               alt.toLowerCase() === 'image';
          if (shouldInclude) {
            images.push({
              filePath: mdFile,
              imagePath: relativePath,
              currentAlt: alt,
              lineNumber,
              lineContent: line,
              matchType: 'enhanced',
              language: detectedLang
            });
          }
        }
      }
      
      // Check PictureGrid component images
      const pictureGridRegex2 = new RegExp(pictureGridRegex);
      while ((match = pictureGridRegex2.exec(line)) !== null) {
        // match[1] = path/to/image.jpg, match[2] = opening quote for alt, match[3] = alt value
        const relativePath = match[1];
        const alt = match[3] || '';
        const shouldInclude = options.replaceExisting || 
                             !alt || 
                             alt.trim() === '' || 
                             alt.toLowerCase() === 'image';
        if (shouldInclude) {
          images.push({
            filePath: mdFile,
            imagePath: relativePath,
            currentAlt: alt,
            lineNumber,
            lineContent: line,
            matchType: 'picturegrid',
            language: detectedLang
          });
        }
      }
    });
  }
  
  return images;
}

// Resolve image path to absolute filesystem path
function resolveImagePath(mdFilePath: string, imagePath: string): string | null {
  // Remove query parameters
  const cleanPath = imagePath.split('?')[0];
  
  // Handle relative paths like ./images/photo.jpg
  if (cleanPath.startsWith('./') || cleanPath.startsWith('../')) {
    const mdDir = dirname(mdFilePath);
    const absolutePath = resolve(mdDir, cleanPath);
    if (existsSync(absolutePath)) {
      return absolutePath;
    }
  }
  
  // Handle absolute paths from static/
  if (cleanPath.startsWith('/')) {
    const staticPath = join(process.cwd(), 'static', cleanPath.slice(1));
    if (existsSync(staticPath)) {
      return staticPath;
    }
  }
  
  return null;
}

// Use Ollama to generate alt text
async function generateAltText(
  imagePath: string, 
  language: Language,
  model: string
): Promise<string> {
  const prompt = PROMPTS[language === 'auto' ? 'en' : language];
  
  try {
    // Read image file and convert to base64 using Node.js (handles large files better)
    const { readFile: fsReadFile, stat } = await import('fs/promises');
    const { writeFile: fsTempWrite, unlink: fsTempUnlink } = await import('fs/promises');
    const { tmpdir } = await import('os');
    
    // Check file size
    const stats = await stat(imagePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    
    if (fileSizeMB > 10) {
      console.warn(`${colors.yellow}⚠️  Large image (${fileSizeMB.toFixed(1)}MB), this may take longer...${colors.reset}`);
    }
    
    const imageBuffer = await fsReadFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    const requestBody = JSON.stringify({
      model: model,
      prompt: prompt,
      images: [base64Image],
      stream: false
    });
    
    // Write request to a temp file to avoid command line length limits
    const tempFile = join(tmpdir(), `ollama-request-${Date.now()}.json`);
    await fsTempWrite(tempFile, requestBody);
    
    try {
      // Use curl with data from file
      const curlCommand = `curl -s http://localhost:11434/api/generate -H "Content-Type: application/json" -d @"${tempFile}"`;
      
      const { stdout } = await execAsync(curlCommand, {
        maxBuffer: 50 * 1024 * 1024 // 50MB buffer for large responses
      });
      
      const response = JSON.parse(stdout);
      
      if (response.response) {
        return response.response.trim();
      }
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return '';
    } finally {
      // Clean up temp file
      try {
        await fsTempUnlink(tempFile);
      } catch {
        // Ignore cleanup errors
      }
    }
  } catch (error: any) {
    console.error(`${colors.red}Failed to generate alt text:${colors.reset}`, error.message);
    return '';
  }
}

// Interactive mode: review and apply
async function interactiveMode(images: ImageReference[], options: Options) {
  const message = options.replaceExisting 
    ? `\n${colors.cyan}📸 Found ${images.length} images${colors.reset}\n`
    : `\n${colors.cyan}📸 Found ${images.length} images without alt text${colors.reset}\n`;
  console.log(message);
  
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (query: string, prefill?: string): Promise<string> => {
    return new Promise(resolve => {
      rl.question(query, resolve);
      if (prefill) {
        // Write prefilled text to the readline
        rl.write(prefill);
      }
    });
  };
  
  for (const [index, img] of images.entries()) {
    console.log(`\n${colors.yellow}[${index + 1}/${images.length}]${colors.reset}`);
    console.log(`${colors.blue}File:${colors.reset} ${relative(process.cwd(), img.filePath)}:${img.lineNumber}`);
    console.log(`${colors.blue}Image:${colors.reset} ${img.imagePath}`);
    console.log(`${colors.blue}Language:${colors.reset} ${img.language.toUpperCase()}`);
    console.log(`${colors.blue}Current alt:${colors.reset} "${img.currentAlt}"`);
    
    const absolutePath = resolveImagePath(img.filePath, img.imagePath);
    
    if (!absolutePath) {
      console.log(`${colors.red}⚠️  Could not resolve image path${colors.reset}`);
      continue;
    }
    
    console.log(`\n${colors.cyan}🤖 Generating alt text with Ollama (${options.ollamaModel})...${colors.reset}`);
    const suggestedAlt = await generateAltText(absolutePath, img.language, options.ollamaModel);
    
    if (!suggestedAlt) {
      console.log(`${colors.red}❌ Failed to generate alt text${colors.reset}`);
      continue;
    }
    
    console.log(`\n${colors.green}✨ Suggested:${colors.reset} "${suggestedAlt}"\n`);
    
    const answer = await question('Options: [a]ccept, [e]dit, [s]kip, [q]uit: ');
    
    if (answer.toLowerCase() === 'q') {
      console.log('\n👋 Exiting...');
      rl.close();
      return;
    }
    
    if (answer.toLowerCase() === 's') {
      console.log('⏭️  Skipped');
      continue;
    }
    
    let finalAlt = suggestedAlt;
    
    if (answer.toLowerCase() === 'e') {
      const edited = await question(`Edit alt text: `, suggestedAlt);
      finalAlt = edited || suggestedAlt;
    }
    
    // Apply the change
    if (!options.dryRun) {
      await updateAltText(img, finalAlt);
      console.log(`${colors.green}✅ Updated${colors.reset}`);
    } else {
      console.log(`${colors.yellow}📝 [DRY RUN] Would update${colors.reset}`);
    }
  }
  
  rl.close();
  console.log(`\n${colors.green}✨ Done!${colors.reset}\n`);
}

// Batch mode: auto-generate all
async function batchMode(images: ImageReference[], options: Options) {
  console.log(`\n${colors.cyan}📸 Processing ${images.length} images...${colors.reset}\n`);
  
  let processed = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const [index, img] of images.entries()) {
    console.log(`[${index + 1}/${images.length}] ${relative(process.cwd(), img.filePath)}:${img.lineNumber}`);
    
    const absolutePath = resolveImagePath(img.filePath, img.imagePath);
    
    if (!absolutePath) {
      console.log(`  ${colors.red}⚠️  Could not resolve image path${colors.reset}`);
      skipped++;
      continue;
    }
    
    const alt = await generateAltText(absolutePath, img.language, options.ollamaModel);
    
    if (!alt) {
      console.log(`  ${colors.red}❌ Failed to generate alt text${colors.reset}`);
      failed++;
      continue;
    }
    
    console.log(`  ${colors.blue}${img.language.toUpperCase()}:${colors.reset} "${alt}"`);
    
    if (!options.dryRun) {
      try {
        await updateAltText(img, alt);
        console.log(`  ${colors.green}✅ Updated${colors.reset}`);
        processed++;
      } catch (error: any) {
        console.log(`  ${colors.red}❌ Failed to update: ${error.message}${colors.reset}`);
        failed++;
      }
    } else {
      console.log(`  ${colors.yellow}📝 [DRY RUN] Would update${colors.reset}`);
      processed++;
    }
  }
  
  console.log(`\n${colors.green}✨ Done!${colors.reset}`);
  console.log(`Processed: ${processed}, Failed: ${failed}, Skipped: ${skipped}\n`);
}

// Update alt text in file
async function updateAltText(img: ImageReference, newAlt: string): Promise<void> {
  const content = await readFile(img.filePath, 'utf-8');
  const lines = content.split('\n');
  const line = lines[img.lineNumber - 1];
  
  let updatedLine: string;
  
  switch (img.matchType) {
    case 'markdown':
      // Replace ![old](src) with ![new](src)
      updatedLine = line.replace(/!\[.*?\]/, `![${newAlt}]`);
      break;
      
    case 'html':
      // Add or replace alt attribute in <img> tag
      // Use negative lookahead to properly match quoted strings (handles apostrophes)
      if (line.match(/\balt=(["'])((?:(?!\1).)*?)\1/)) {
        updatedLine = line.replace(/\balt=(["'])((?:(?!\1).)*?)\1/, `alt="${newAlt}"`);
      } else {
        updatedLine = line.replace(/<img/, `<img alt="${newAlt}"`);
      }
      break;
      
    case 'enhanced':
      // Add or replace alt attribute in <enhanced:img> tag
      // Use negative lookahead to properly match quoted strings (handles apostrophes)
      if (line.match(/\balt=(["'])((?:(?!\1).)*?)\1/)) {
        updatedLine = line.replace(/\balt=(["'])((?:(?!\1).)*?)\1/, `alt="${newAlt}"`);
      } else {
        // Insert alt before the closing />
        updatedLine = line.replace(/\s*\/>/, ` alt="${newAlt}" />`);
      }
      break;
      
    case 'picturegrid':
      // Replace alt in PictureGrid component image object
      // Use negative lookahead to properly match quoted strings (handles apostrophes and empty strings)
      if (line.match(/\balt:\s*(["'])((?:(?!\1).)*?)\1/)) {
        // Alt exists, replace it
        updatedLine = line.replace(
          /\balt:\s*(["'])((?:(?!\1).)*?)\1/,
          `alt: "${newAlt}"`
        );
      } else {
        // Alt doesn't exist, add it before the closing }
        updatedLine = line.replace(/\s*}/, `, alt: "${newAlt}"}`);
      }
      break;
      
    default:
      throw new Error(`Unknown match type: ${img.matchType}`);
  }
  
  lines[img.lineNumber - 1] = updatedLine;
  await writeFile(img.filePath, lines.join('\n'), 'utf-8');
}

// Helper: recursively find markdown files
async function findMarkdownFiles(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map((entry) => {
        const path = join(dir, entry.name);
        return entry.isDirectory() ? findMarkdownFiles(path) : path;
      })
    );
    return files
      .flat()
      .filter(f => f.endsWith('.md') || f.endsWith('.svx') || f.endsWith('.svelte.md'));
  } catch (error) {
    return [];
  }
}

// Print usage
function usage(): void {
  console.log('Usage: ./scripts/generate-alt-text.ts [options]');
  console.log('');
  console.log('Options:');
  console.log('  --batch              Batch mode (auto-generate all, no interaction)');
  console.log('  --apply              Actually write changes (default is dry-run)');
  console.log('  --lang <en|fr|auto>  Language for alt text (default: auto-detect)');
  console.log('  --model <name>       Ollama model to use (default: llava)');
  console.log('  --dir <path>         Content directory to scan (can be used multiple times)');
  console.log('  --replace-existing   Replace existing alt text (not just empty ones)');
  console.log('  --check-only         Only scan and report images, don\'t generate alt text');
  console.log('  --help               Show this help');
  console.log('');
  console.log('Examples:');
  console.log('  # Interactive mode with auto language detection (dry-run)');
  console.log('  ./scripts/generate-alt-text.ts');
  console.log('');
  console.log('  # Interactive mode, apply changes');
  console.log('  ./scripts/generate-alt-text.ts --apply');
  console.log('');
  console.log('  # Batch mode with French alt text');
  console.log('  ./scripts/generate-alt-text.ts --batch --lang fr --apply');
  console.log('');
  console.log('  # Use different model');
  console.log('  ./scripts/generate-alt-text.ts --model llava-phi3');
  console.log('');
  console.log('  # Replace all existing alt texts');
  console.log('  ./scripts/generate-alt-text.ts --replace-existing --apply');
  console.log('');
  console.log('Prerequisites:');
  console.log('  - Ollama installed: brew install ollama');
  console.log('  - Vision model pulled: ollama pull llava');
  console.log('  - Ollama running: ollama serve');
  process.exit(0);
}

// Parse command line arguments
function parseArgs(): Options {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    usage();
  }
  
  const options: Options = {
    mode: args.includes('--batch') ? 'batch' : 'interactive',
    dryRun: !args.includes('--apply'),
    language: 'auto',
    ollamaModel: 'llava',
    contentDirs: ['src/content/posts', 'src/content/logs'],
    checkOnly: args.includes('--check-only'),
    replaceExisting: args.includes('--replace-existing')
  };
  
  // Parse --lang
  const langIndex = args.indexOf('--lang');
  if (langIndex !== -1 && args[langIndex + 1]) {
    const lang = args[langIndex + 1].toLowerCase();
    if (lang === 'en' || lang === 'fr' || lang === 'auto') {
      options.language = lang;
    }
  }
  
  // Parse --model
  const modelIndex = args.indexOf('--model');
  if (modelIndex !== -1 && args[modelIndex + 1]) {
    options.ollamaModel = args[modelIndex + 1];
  }
  
  // Parse --dir (can be multiple)
  const dirs: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir' && args[i + 1]) {
      dirs.push(args[i + 1]);
    }
  }
  if (dirs.length > 0) {
    options.contentDirs = dirs;
  }
  
  return options;
}

// Check if Ollama is running
async function checkOllama(model: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync('curl -s http://localhost:11434/api/tags');
    const response = JSON.parse(stdout);
    const models = response.models || [];
    const hasModel = models.some((m: any) => m.name.includes(model.split(':')[0]));
    
    if (!hasModel) {
      console.error(`${colors.red}Error: Model '${model}' not found.${colors.reset}`);
      console.error(`Run: ${colors.yellow}ollama pull ${model}${colors.reset}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`${colors.red}Error: Cannot connect to Ollama.${colors.reset}`);
    console.error(`Make sure Ollama is running: ${colors.yellow}ollama serve${colors.reset}`);
    return false;
  }
}

// Main
async function main() {
  const options = parseArgs();
  
  console.log(`${colors.cyan}🖼️  Alt Text Generator${colors.reset}`);
  console.log(`${colors.blue}Mode:${colors.reset} ${options.mode}`);
  console.log(`${colors.blue}Dry run:${colors.reset} ${options.dryRun ? 'Yes' : 'No'}`);
  console.log(`${colors.blue}Language:${colors.reset} ${options.language}`);
  console.log(`${colors.blue}Model:${colors.reset} ${options.ollamaModel}`);
  console.log(`${colors.blue}Replace existing:${colors.reset} ${options.replaceExisting ? 'Yes' : 'No'}`);
  console.log(`${colors.blue}Directories:${colors.reset} ${options.contentDirs.join(', ')}`);
  
  // Find all images
  const allImages: ImageReference[] = [];
  for (const dir of options.contentDirs) {
    const dirPath = join(process.cwd(), dir);
    if (existsSync(dirPath)) {
      const images = await findImagesInContent(dirPath, options);
      allImages.push(...images);
    }
  }
  
  if (allImages.length === 0) {
    console.log(`\n${colors.green}✨ All images have alt text!${colors.reset}\n`);
    return;
  }
  
  // If check-only mode, just report and exit
  if (options.checkOnly) {
    const message = options.replaceExisting 
      ? `\n${colors.cyan}📸 Found ${allImages.length} images (including those with existing alt text)${colors.reset}\n`
      : `\n${colors.cyan}📸 Found ${allImages.length} images without alt text${colors.reset}\n`;
    console.log(message);
    
    for (const [index, img] of allImages.entries()) {
      console.log(`${colors.yellow}[${index + 1}]${colors.reset} ${relative(process.cwd(), img.filePath)}:${img.lineNumber}`);
      console.log(`  ${colors.blue}Type:${colors.reset} ${img.matchType}`);
      console.log(`  ${colors.blue}Lang:${colors.reset} ${img.language.toUpperCase()}`);
      console.log(`  ${colors.blue}Image:${colors.reset} ${img.imagePath}`);
      console.log(`  ${colors.blue}Current alt:${colors.reset} "${img.currentAlt}"`);
      console.log();
    }
    
    console.log(`${colors.cyan}Summary by type:${colors.reset}`);
    const byType = allImages.reduce((acc, img) => {
      acc[img.matchType] = (acc[img.matchType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
    console.log(`\n${colors.yellow}Run without --check-only to generate alt text with Ollama${colors.reset}\n`);
    return;
  }
  
  // Check Ollama
  const ollamaOk = await checkOllama(options.ollamaModel);
  if (!ollamaOk) {
    process.exit(1);
  }
  
  if (options.mode === 'interactive') {
    await interactiveMode(allImages, options);
  } else {
    await batchMode(allImages, options);
  }
}

main().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
