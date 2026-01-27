#!/usr/bin/env node
/**
 * Image Optimization Script
 * Converts JPG/PNG images to WebP format with responsive srcset sizes
 * Generates 400w, 800w, 1200w versions for mobile optimization
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IMAGE_DIRS = ['images', '.'];
const EXCLUDE_FILES = ['logo.png', 'favicon.ico'];
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];

// Responsive image sizes for srcset
const RESPONSIVE_SIZES = [400, 800, 1200];

/**
 * Generate responsive image sizes for srcset support
 * @param {string} inputPath - Path to the original image
 * @param {string} outputDir - Output directory for generated images
 */
async function generateResponsiveSizes(inputPath, outputDir) {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    const baseName = path.basename(inputPath, ext);
    
    // Skip excluded files
    if (EXCLUDE_FILES.includes(path.basename(inputPath))) {
      console.log(`⏭️  Skipping: ${inputPath}`);
      return;
    }

    // Skip if not an image
    if (!IMAGE_EXTENSIONS.includes(ext)) {
      return;
    }

    // Get original image metadata
    const metadata = await sharp(inputPath).metadata();
    const originalWidth = metadata.width;

    // Generate responsive sizes
    for (const width of RESPONSIVE_SIZES) {
      // Skip if requested size is larger than original
      if (width > originalWidth) {
        console.log(`⏭️  Skipping ${width}w for ${inputPath} (original is ${originalWidth}w)`);
        continue;
      }

      const webpPath = path.join(outputDir, `${baseName}-${width}w.webp`);
      
      await sharp(inputPath)
        .resize(width, null, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .webp({ quality: 85 })
        .toFile(webpPath);
      
      const webpSize = (await fs.stat(webpPath)).size;
      console.log(`✅ ${baseName}-${width}w.webp (${(webpSize / 1024).toFixed(1)}KB)`);
    }

    // Also create a default WebP version at original size
    const defaultWebpPath = path.join(outputDir, `${baseName}.webp`);
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(defaultWebpPath);
    
    const originalSize = (await fs.stat(inputPath)).size;
    const webpSize = (await fs.stat(defaultWebpPath)).size;
    const savings = ((1 - webpSize / originalSize) * 100).toFixed(1);
    
    console.log(`✅ ${baseName}.webp (${savings}% smaller than original)`);
  } catch (error) {
    console.error(`❌ Error optimizing ${inputPath}:`, error.message);
  }
}

/**
 * Simple WebP conversion for images (backward compatible)
 * @param {string} inputPath - Path to the original image  
 * @param {string} outputPath - Path for the output image
 */
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

async function processDirectory(dirPath, generateSrcset = false) {
  try {
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) {
        // Process subdirectories (like images/generated)
        await processDirectory(filePath, generateSrcset);
        continue;
      }
      
      if (stat.isFile()) {
        if (generateSrcset) {
          await generateResponsiveSizes(filePath, dirPath);
        } else {
          await optimizeImage(filePath, filePath);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const generateSrcset = args.includes('--srcset');
  
  if (generateSrcset) {
    console.log('🖼️  Generating responsive image sizes (400w, 800w, 1200w)...\n');
  } else {
    console.log('🖼️  Starting image optimization...\n');
  }
  
  for (const dir of IMAGE_DIRS) {
    const fullPath = path.resolve(__dirname, '..', dir);
    console.log(`📁 Processing ${dir}/`);
    await processDirectory(fullPath, generateSrcset);
  }
  
  console.log('\n✨ Image optimization complete!');
  
  if (generateSrcset) {
    console.log('\n📝 Usage in HTML:');
    console.log(`<img 
  src="image.jpg"
  srcset="
    image-400w.webp 400w,
    image-800w.webp 800w,
    image-1200w.webp 1200w
  "
  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 800px"
  alt="Description"
  loading="lazy"
>`);
  }
}

main().catch(console.error);
