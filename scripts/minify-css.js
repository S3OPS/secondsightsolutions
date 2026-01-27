#!/usr/bin/env node
/**
 * CSS Minification Script
 * Minifies CSS files using cssnano
 */

import postcss from 'postcss';
import cssnano from 'cssnano';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSS_DIR = path.resolve(__dirname, '../assets/css');

async function minifyCSS(inputPath) {
  try {
    const css = await fs.readFile(inputPath, 'utf8');
    const result = await postcss([cssnano({ preset: 'default' })]).process(css, {
      from: inputPath,
      to: inputPath
    });
    
    const outputPath = inputPath.replace('.css', '.min.css');
    await fs.writeFile(outputPath, result.css);
    
    const originalSize = (await fs.stat(inputPath)).size;
    const minifiedSize = (await fs.stat(outputPath)).size;
    const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
    
    console.log(`✅ ${path.basename(inputPath)} → ${path.basename(outputPath)} (${savings}% smaller)`);
  } catch (error) {
    console.error(`❌ Error minifying ${inputPath}:`, error.message);
  }
}

async function main() {
  console.log('🎨 Starting CSS minification...\n');
  
  try {
    const files = await fs.readdir(CSS_DIR);
    
    for (const file of files) {
      if (file.endsWith('.css') && !file.endsWith('.min.css')) {
        const filePath = path.join(CSS_DIR, file);
        await minifyCSS(filePath);
      }
    }
    
    console.log('\n✨ CSS minification complete!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().catch(console.error);
