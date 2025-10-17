#!/usr/bin/env node --experimental-strip-types

import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline';

// ANSI color codes
const colors = {
  red: '\x1b[0;31m',
  green: '\x1b[0;32m',
  yellow: '\x1b[1;33m',
  reset: '\x1b[0m'
} as const;

type ContentType = 'post' | 'log';

function usage(): void {
  console.log('Usage: ./scripts/create-content.ts <type> <title>');
  console.log('  type: "post" or "log"');
  console.log('  title: Title of the content (use quotes if it contains spaces)');
  console.log('');
  console.log('Example: ./scripts/create-content.ts post "My First Blog Post"');
  process.exit(1);
}

function slugify(text: string, maxLength: number = 20): string {
  let slug = text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-');         // Replace multiple hyphens with single hyphen
  
  // Truncate to maxLength
  slug = slug.substring(0, maxLength);
  
  // Remove trailing hyphen if present
  return slug.replace(/-$/, '');
}

function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function promptUser(question: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function main(): Promise<void> {
  // Check arguments
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error(`${colors.red}Error: Missing arguments${colors.reset}`);
    usage();
  }

  const type = args[0] as ContentType;
  const title = args[1];

  // Validate type
  if (type !== 'post' && type !== 'log') {
    console.error(`${colors.red}Error: Type must be 'post' or 'log'${colors.reset}`);
    usage();
  }

  // Get current date
  const date = getCurrentDate();

  // Create slugified title
  const slug = slugify(title, 20);

  // Set base directory based on type
  const baseDir = `src/content/${type}s`;
  const targetDir = join(baseDir, `${date}` + (slug ? `_${slug}` : ''));

  // Check if directory already exists
  if (existsSync(targetDir)) {
    console.log(`${colors.yellow}Warning: Directory ${targetDir} already exists${colors.reset}`);
    const shouldContinue = await promptUser('Do you want to continue? (y/n) ');
    
    if (!shouldContinue) {
      console.log('Aborted.');
      process.exit(1);
    }
  }

  // Create directory structure
  console.log('Creating directory structure...');
  mkdirSync(join(targetDir, 'files'), { recursive: true });

  // Create markdown file from template
  const markdownFile = join(targetDir, `${date}_${slug}.md`);
  const templateFile = 'src/content/templates/{{date}}_{{title}}.md';

  // Check if template exists
  if (!existsSync(templateFile)) {
    console.error(`${colors.red}Error: Template file not found at ${templateFile}${colors.reset}`);
    process.exit(1);
  }

  // Read template and replace placeholders
  console.log('Creating markdown file from template...');
  let templateContent = readFileSync(templateFile, 'utf-8');
  
  templateContent = templateContent
    .replace(/\{\{date\}\}/g, date)
    .replace(/\{\{title\}\}/g, title)
    .replace(/"{ date }"/, `"${date}"`);

  writeFileSync(markdownFile, templateContent);

  // Success message
  console.log(`${colors.green}✓ Successfully created ${type}!${colors.reset}`);
  console.log('');
  console.log(`Directory: ${targetDir}`);
  console.log(`Markdown file: ${markdownFile}`);
  console.log(`Assets folder: ${targetDir}/files/`);
  console.log('');
  console.log(`${colors.yellow}Next steps:${colors.reset}`);
  console.log(`1. Edit ${markdownFile} to add your content`);
  console.log(`2. Add any images or assets to ${targetDir}/files/`);
  console.log(`3. Set 'published: true' in the frontmatter when ready to publish`);
}

main().catch((error) => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});
