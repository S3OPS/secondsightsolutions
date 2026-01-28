#!/usr/bin/env node
/**
 * Update Service Page Images Script
 * 
 * Updates service page HTML files to reference the generated images
 * instead of generic placeholder images.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVICE_DIR = path.resolve(__dirname, '../services');

// Mapping of service pages to their image configurations
const SERVICE_IMAGE_MAPPING = {
  'real-estate.html': {
    images: [
      'real-estate-1.jpg',
      'real-estate-2.jpg', 
      'real-estate-3.jpg',
      'real-estate-4.jpg',
      'real-estate-5.jpg',
      'real-estate-6.jpg'
    ]
  },
  'construction.html': {
    images: [
      'construction-1.jpg',
      'construction-2.jpg',
      'construction-3.jpg',
      'construction-4.jpg',
      'construction-5.jpg',
      'construction-6.jpg'
    ]
  },
  'inspections.html': {
    images: [
      'inspections-1.jpg',
      'inspections-2.jpg',
      'inspections-3.jpg',
      'inspections-4.jpg',
      'inspections-5.jpg',
      'inspections-6.jpg'
    ]
  },
  'mapping.html': {
    images: [
      'mapping-1.jpg',
      'mapping-2.jpg',
      'mapping-3.jpg',
      'mapping-4.jpg',
      'mapping-5.jpg',
      'mapping-6.jpg'
    ]
  },
  'ranch-farm.html': {
    images: [
      'ranch-farm-1.jpg',
      'ranch-farm-2.jpg',
      'ranch-farm-3.jpg',
      'ranch-farm-4.jpg',
      'ranch-farm-5.jpg',
      'ranch-farm-6.jpg'
    ]
  },
  'events.html': {
    images: [
      'events-1.jpg',
      'events-2.jpg',
      'events-3.jpg',
      'events-4.jpg',
      'events-5.jpg',
      'events-6.jpg'
    ]
  }
};

/**
 * Update a single service page to use generated images
 */
async function updateServicePage(filename) {
  try {
    const filePath = path.join(SERVICE_DIR, filename);
    let content = await fs.readFile(filePath, 'utf8');
    
    const imageList = SERVICE_IMAGE_MAPPING[filename].images;
    
    // Find and update gallery images
    // Pattern matches: <img src="../images/XXX.jpg" or <img src="../imageN.jpg"
    let imageIndex = 0;
    
    // Replace images in gallery items
    content = content.replace(
      /<img src="\.\.\/(?:images\/[^"]+|image\d+\.jpg|assets\/img\/[^"]+)"/g,
      (match) => {
        if (imageIndex < imageList.length) {
          const newImage = imageList[imageIndex];
          imageIndex++;
          return `<img src="../images/generated/${newImage}"`;
        }
        return match;
      }
    );
    
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`✅ Updated ${filename} with ${imageIndex} images`);
    
  } catch (error) {
    console.error(`❌ Error updating ${filename}:`, error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔧 Updating service page images...\n');
  
  for (const filename of Object.keys(SERVICE_IMAGE_MAPPING)) {
    await updateServicePage(filename);
  }
  
  console.log('\n✨ Service pages updated with generated images!');
  console.log('\n💡 Note: Make sure to run the image generation script first:');
  console.log('   node scripts/generate-service-images.js');
}

// Run if called directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(console.error);
}
