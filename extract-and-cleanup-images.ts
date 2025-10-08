#!/usr/bin/env node --experimental-strip-types
/**
 * Image cleanup and analysis tool for markdown content
 * Runs natively with Node.js 22.6.0+ using --experimental-strip-types
 * 
 * Analyzes markdown files to find unused images in associated folders,
 * providing detailed reports and optional cleanup functionality.
 * 
 * Usage: ./extract-and-cleanup-images.ts <pattern> [--dry-run]
 * Example: ./extract-and-cleanup-images.ts "src/content/posts/glob-pattern.md" --dry-run
 */

import { readFile, stat, readdir } from 'fs/promises';
import { dirname, basename, resolve, join } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

// Simple glob implementation for basic patterns
async function simpleGlob(pattern: string): Promise<string[]> {
  if (!pattern.includes('*')) {
    return existsSync(pattern) ? [resolve(pattern)] : [];
  }

  // Handle basic ** patterns for directories
  if (pattern.includes('**/*.md')) {
    const basePath = pattern.split('**')[0] || '.';
    return await findMarkdownFiles(basePath);
  }
  
  // Handle single * patterns in directories
  if (pattern.includes('*')) {
    return await expandGlobPattern(pattern);
  }

  return [];
}

async function findMarkdownFiles(basePath: string): Promise<string[]> {
  const files: string[] = [];
  
  async function scan(dir: string) {
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(resolve(fullPath));
        }
      }
    } catch (error) {
      // Ignore permission errors, etc.
    }
  }
  
  await scan(resolve(basePath));
  return files;
}

async function expandGlobPattern(pattern: string): Promise<string[]> {
  const files: string[] = [];
  const parts = pattern.split('/');
  const basePath = parts.slice(0, -1).join('/') || '.';
  const filePattern = parts[parts.length - 1];
  
  try {
    const entries = await readdir(basePath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (matchesPattern(entry.name, filePattern)) {
        const fullPath = resolve(join(basePath, entry.name));
        if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Directory doesn't exist or no permission
  }
  
  return files;
}

function matchesPattern(filename: string, pattern: string): boolean {
  const regex = pattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${regex}$`).test(filename);
}

// Find images in a directory with specific extensions
async function findImages(dir: string): Promise<string[]> {
  const images: string[] = [];
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg', '.tiff', '.heif'];
  
  async function scan(currentDir: string) {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.isFile()) {
          const ext = basename(entry.name).toLowerCase();
          if (extensions.some(validExt => ext.endsWith(validExt))) {
            images.push(resolve(fullPath));
          }
        }
      }
    } catch (error) {
      // Ignore errors
    }
  }
  
  await scan(dir);
  return images;
}

interface ImageReference {
  path: string;
  sourceFile: string;
  type: 'imageModule' | 'markdown' | 'html' | 'enhanced';
}

interface ImageFolder {
  path: string;
  usedByFiles: string[];
  totalImages: string[];
  unusedImages: string[];
}

interface AnalysisResult {
  totalFiles: number;
  totalFolders: number;
  totalUnused: number;
  totalSize: number;
  folders: ImageFolder[];
}

class ImageCleanupAnalyzer {
  private allReferences: ImageReference[] = [];
  private imageFolders: Map<string, ImageFolder> = new Map();
  private dryRun: boolean;
  
  constructor(dryRun: boolean = true) {
    this.dryRun = dryRun;
  }

  /**
   * Extract image references from a markdown file
   * Supports multiple formats: markdown images, HTML img tags, enhanced:img, and imageModules
   */
  private extractImageReferences(content: string, sourceFile: string): ImageReference[] {
    const references: ImageReference[] = [];
    
    // Standard markdown images: ![alt](path)
    const markdownMatches = content.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g);
    for (const match of markdownMatches) {
      references.push({
        path: match[1].replace(/^["']|["']$/g, ''),
        sourceFile,
        type: 'markdown'
      });
    }
    
    // HTML img tags: <img src="path">
    const htmlMatches = content.matchAll(/<img[^>]+src="([^"]+)"/g);
    for (const match of htmlMatches) {
      references.push({
        path: match[1],
        sourceFile,
        type: 'html'
      });
    }
    
    // Enhanced img: <enhanced:img ... src={...} />
    const enhancedMatches = content.matchAll(/<enhanced:img[^>]+src=\{([^}]+)\}/g);
    for (const match of enhancedMatches) {
      references.push({
        path: match[1].replace(/^["']|["']$/g, ''),
        sourceFile,
        type: 'enhanced'
      });
    }
    
    // ImageModules: imageModules['./path']
    const moduleMatches = content.matchAll(/imageModules\['([^']+)'\]/g);
    for (const match of moduleMatches) {
      references.push({
        path: match[1],
        sourceFile,
        type: 'imageModule'
      });
    }
    
    return references;
  }

  /**
   * Find image folders referenced by a file
   * Uses intelligent path resolution and common folder name detection
   */
  private async findImageFolders(markdownFile: string, references: ImageReference[]): Promise<string[]> {
    const fileDir = dirname(markdownFile);
    const folders = new Set<string>();
    
    // Extract folders from image references
    for (const ref of references) {
      const cleanPath = ref.path.replace(/^\.\/+/, '');
      if (cleanPath.includes('/')) {
        const folderPath = resolve(fileDir, dirname(cleanPath));
        if (existsSync(folderPath)) {
          folders.add(folderPath);
        }
      }
    }
    
    // Fallback: look for common image folder names
    if (folders.size === 0) {
      const commonNames = ['images', 'imgs', 'pictures', 'photos', 'assets'];
      for (const name of commonNames) {
        const folderPath = join(fileDir, name);
        if (existsSync(folderPath)) {
          folders.add(folderPath);
        }
      }
      
      // Check for numbered folders (images_1, images_2, etc.)
      try {
        const entries = await readdir(fileDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && entry.name.startsWith('images_')) {
            const fullPath = join(fileDir, entry.name);
            folders.add(fullPath);
          }
        }
      } catch (error) {
        // Directory doesn't exist or no permission
      }
    }
    
    return Array.from(folders);
  }

  /**
   * Analyze all markdown files for image references
   * Processes files concurrently and builds comprehensive usage map
   */
  async analyzeFiles(pattern: string): Promise<AnalysisResult> {
    // Find all matching markdown files
    const files = await simpleGlob(pattern);
    
    console.log(`📊 Analyzing ${files.length} markdown file(s) for image references...`);
    
    // Process each file
    for (const file of files) {
      const content = await readFile(file, 'utf-8');
      const references = this.extractImageReferences(content, file);
      
      console.log(`  📄 ${basename(file)}`);
      console.log(`     🖼️  ${references.length} image references`);
      
      // Add to global references
      this.allReferences.push(...references);
      
      // Find image folders for this file
      const folders = await this.findImageFolders(file, references);
      
      if (folders.length === 0) {
        console.log(`     ⚠️  No image folders found`);
        continue;
      }
      
      // Track folder usage
      for (const folderPath of folders) {
        console.log(`     📁 ${basename(folderPath)} folder`);
        
        if (!this.imageFolders.has(folderPath)) {
          this.imageFolders.set(folderPath, {
            path: folderPath,
            usedByFiles: [],
            totalImages: [],
            unusedImages: []
          });
        }
        
        const folder = this.imageFolders.get(folderPath)!;
        if (!folder.usedByFiles.includes(basename(file))) {
          folder.usedByFiles.push(basename(file));
        }
      }
    }
    
    return this.analyzeFolders();
  }

  /**
   * Analyze each folder for unused images
   * Cross-references all found images against collected references
   */
  private async analyzeFolders(): Promise<AnalysisResult> {
    if (this.imageFolders.size === 0) {
      console.log('\nNo image folders found in any of the analyzed files.');
      console.log('Nothing to clean up!');
      return {
        totalFiles: 0,
        totalFolders: 0,
        totalUnused: 0,
        totalSize: 0,
        folders: []
      };
    }
    
    console.log('\n🔍 Analyzing image folders for unused files...');
    
    let totalUnused = 0;
    let totalSize = 0;
    
    for (const [folderPath, folder] of this.imageFolders) {
      console.log(`\n📁 Folder: ${basename(folderPath)}`);
      console.log(`   Used by: ${folder.usedByFiles.join(', ')}`);
      
      // Find all images in folder
      const images = await findImages(folderPath);
      
      folder.totalImages = images;
      console.log(`   📊 Total images: ${images.length}`);
      
      if (images.length === 0) {
        console.log('   ⚠️  No images found in folder');
        continue;
      }
      
      // Check each image against all references
      for (const imagePath of images) {
        const imageBasename = basename(imagePath);
        const isReferenced = this.allReferences.some(ref => {
          const refPath = ref.path.replace(/^\.\/+/, '');
          return refPath.includes(imageBasename) || 
                 ref.path.includes(imageBasename) ||
                 imagePath.includes(refPath);
        });
        
        if (!isReferenced) {
          folder.unusedImages.push(imagePath);
        }
      }
      
      // Report results
      if (folder.unusedImages.length === 0) {
        console.log('   ✅ All images are used!');
      } else {
        console.log(`   🗑️  Unused images: ${folder.unusedImages.length}`);
        
        // Show some examples
        const examples = folder.unusedImages.slice(0, 3);
        for (const img of examples) {
          console.log(`       - ${basename(img)}`);
        }
        if (folder.unusedImages.length > 3) {
          console.log(`       ... and ${folder.unusedImages.length - 3} more`);
        }
        
        totalUnused += folder.unusedImages.length;
        
        // Calculate size
        for (const img of folder.unusedImages) {
          try {
            const stats = await stat(img);
            totalSize += stats.size;
          } catch (error) {
            // Ignore stat errors
          }
        }
      }
    }
    
    return {
      totalFiles: this.imageFolders.size,
      totalFolders: this.imageFolders.size,
      totalUnused,
      totalSize,
      folders: Array.from(this.imageFolders.values())
    };
  }

  /**
   * Process cleanup results and optionally delete unused images
   * Provides detailed summary and handles dry-run mode
   */
  async cleanup(result: AnalysisResult): Promise<void> {
    if (result.totalUnused === 0) {
      console.log('\n🎉 No unused images found across all files!');
      return;
    }
    
    console.log(`\n==================== SUMMARY ====================`);
    console.log(`Total files processed: ${result.totalFiles}`);
    console.log(`Total unused images: ${result.totalUnused}`);
    
    if (result.totalSize > 0) {
      const humanSize = this.formatBytes(result.totalSize);
      console.log(`Total size of unused images: ${humanSize}`);
    }
    
    if (this.dryRun) {
      console.log('DRY RUN: No files were deleted');
      return;
    }
    
    // Interactive confirmation would go here
    // For now, just list what would be deleted
    console.log('\nUnused images found across all files.');
  }
  
  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: ./extract-and-cleanup-images.ts <pattern> [--dry-run]');
    console.log('');
    console.log('Analyze markdown files for unused images and optionally clean them up.');
    console.log('');
    console.log('Arguments:');
    console.log('  <pattern>     Glob pattern for markdown files (e.g., "src/content/posts/**/*.md")');
    console.log('  --dry-run     Show what would be deleted without actually deleting');
    console.log('  --help, -h    Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  ./extract-and-cleanup-images.ts "src/content/posts/**/*.md" --dry-run');
    console.log('  ./extract-and-cleanup-images.ts "src/content/posts/2023-*/*.md"');
    process.exit(0);
  }
  
  if (args.length === 0) {
    console.log('Usage: ./extract-and-cleanup-images.ts <pattern> [--dry-run]');
    console.log('Example: ./extract-and-cleanup-images.ts "src/content/posts/**/*.md" --dry-run');
    console.log('Use --help for more information.');
    process.exit(1);
  }
  
  const pattern = args[0];
  const dryRun = args.includes('--dry-run');
  
  try {
    const analyzer = new ImageCleanupAnalyzer(dryRun);
    const result = await analyzer.analyzeFiles(pattern);
    await analyzer.cleanup(result);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Check if this is the main module (ESM equivalent)
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  main();
}