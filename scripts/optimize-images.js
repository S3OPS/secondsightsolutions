#!/usr/bin/env node
/**
 * Image Optimization Script
 * Converts JPG/PNG images to WebP format and optimizes them
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const IMAGE_DIRS = ['images', '.'];
const EXCLUDE_FILES = ['logo.png', 'favicon.ico'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

async function optimizeImage(inputPath, outputPath) {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    
    // Skip excluded files
    if (EXCLUDE_FILES.includes(path.basename(inputPath))) {
      console.log(`⏭️  Skipping: ${inputPath}`);
      return;
    }

    // Skip if not an image
    if (!IMAGE_EXTENSIONS.includes(ext)) {
      return;
    }

    const webpPath = outputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    // Convert to WebP
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(webpPath);
    
    const originalSize = (await fs.stat(inputPath)).size;
    const webpSize = (await fs.stat(webpPath)).size;
    const savings = ((1 - webpSize / originalSize) * 100).toFixed(1);
    
    console.log(`✅ ${inputPath} → ${webpPath} (${savings}% smaller)`);
  } catch (error) {
    console.error(`❌ Error optimizing ${inputPath}:`, error.message);
  }
}

async function processDirectory(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) {
        continue; // Don't recurse
      }
      
      if (stat.isFile()) {
        await optimizeImage(filePath, filePath);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
}

async function main() {
  console.log('🖼️  Starting image optimization...\n');
  
  for (const dir of IMAGE_DIRS) {
    const fullPath = path.resolve(__dirname, '..', dir);
    console.log(`📁 Processing ${dir}/`);
    await processDirectory(fullPath);
  }
  
  console.log('\n✨ Image optimization complete!');
}

main().catch(console.error);
