#!/usr/bin/env node
/**
 * AI Image Generation Script
 * 
 * Automatically generates images for each service using the AI prompts from
 * ai-image-prompts.json and saves them with the correct naming structure
 * for use with update-service-page-images.js
 * 
 * Usage:
 *   OPENAI_API_KEY=your_key node scripts/generate-ai-images.js
 *   node scripts/generate-ai-images.js --service real-estate
 *   node scripts/generate-ai-images.js --dry-run
 * 
 * Environment Variables:
 *   OPENAI_API_KEY - Required. Your OpenAI API key
 *   AI_IMAGE_MODEL - Optional. Model to use (default: dall-e-3)
 *   AI_IMAGE_QUALITY - Optional. Quality setting (default: standard)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  promptsFile: path.join(__dirname, '../ai-image-prompts.json'),
  outputDir: path.join(__dirname, '../images/generated'),
  model: process.env.AI_IMAGE_MODEL || 'dall-e-3',
  quality: process.env.AI_IMAGE_QUALITY || 'standard',
  size: '1792x1024', // Closest DALL-E 3 size to 1200x800 (3:2 aspect ratio)
  rateLimitDelay: 2000, // ms between API calls to avoid rate limiting
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    service: null,
    help: false,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--dry-run':
      case '-n':
        options.dryRun = true;
        break;
      case '--service':
      case '-s':
        options.service = args[++i];
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
    }
  }

  return options;
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
🎨 AI Image Generation Script
==============================

Generates images using OpenAI's DALL-E API based on prompts from ai-image-prompts.json

Usage:
  node scripts/generate-ai-images.js [options]

Options:
  --service, -s <name>  Generate images for a specific service only
  --dry-run, -n         Show what would be generated without making API calls
  --verbose, -v         Show detailed output including prompts
  --help, -h            Show this help message

Environment Variables:
  OPENAI_API_KEY        Required. Your OpenAI API key
  AI_IMAGE_MODEL        Model to use (default: dall-e-3)
  AI_IMAGE_QUALITY      Quality setting: standard or hd (default: standard)

Examples:
  # Generate all images
  OPENAI_API_KEY=sk-xxx node scripts/generate-ai-images.js

  # Generate only real-estate images
  OPENAI_API_KEY=sk-xxx node scripts/generate-ai-images.js --service real-estate

  # Preview what would be generated
  node scripts/generate-ai-images.js --dry-run

Available Services:
  - real-estate
  - construction
  - inspections
  - mapping
  - ranch-farm
  - events
`);
}

/**
 * Load prompts from JSON file
 */
async function loadPrompts() {
  const content = await fs.readFile(CONFIG.promptsFile, 'utf8');
  return JSON.parse(content);
}

/**
 * Generate an image using OpenAI's DALL-E API
 */
async function generateImage(prompt, options) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: CONFIG.model,
      prompt: prompt,
      n: 1,
      size: CONFIG.size,
      quality: CONFIG.quality,
      response_format: 'url',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.status} - ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].url;
}

/**
 * Download an image from a URL and save it to disk
 */
async function downloadImage(url, outputPath) {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  
  // Use sharp to resize to target dimensions and convert to JPEG
  let sharp;
  try {
    const sharpModule = await import('sharp');
    sharp = sharpModule.default;
  } catch (error) {
    // If sharp is not available, save the raw image
    await fs.writeFile(outputPath, buffer);
    return;
  }

  await sharp(buffer)
    .resize(1200, 800, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toFile(outputPath);
}

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate images for a single service
 */
async function generateServiceImages(serviceKey, serviceData, options) {
  console.log(`\n📸 ${serviceData.serviceName} Service:`);
  console.log(`   Images: ${serviceData.images.length}`);
  
  for (let i = 0; i < serviceData.images.length; i++) {
    const image = serviceData.images[i];
    const outputPath = path.join(CONFIG.outputDir, image.filename);
    
    console.log(`   [${i + 1}/${serviceData.images.length}] ${image.filename} - ${image.title}`);
    
    if (options.verbose) {
      console.log(`       Prompt: ${image.aiPrompt.substring(0, 80)}...`);
    }

    if (options.dryRun) {
      console.log(`       ⏭️  Skipped (dry run)`);
      continue;
    }

    try {
      // Generate image
      const imageUrl = await generateImage(image.aiPrompt, options);
      
      // Download and save
      await downloadImage(imageUrl, outputPath);
      console.log(`       ✅ Generated and saved`);
      
      // Rate limit delay (except for last image)
      if (i < serviceData.images.length - 1) {
        await sleep(CONFIG.rateLimitDelay);
      }
    } catch (error) {
      console.error(`       ❌ Error: ${error.message}`);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  console.log('🎨 AI Image Generation Script');
  console.log('============================\n');

  // Check for API key (unless dry run)
  if (!options.dryRun && !process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY environment variable is required');
    console.error('');
    console.error('Set your OpenAI API key:');
    console.error('  export OPENAI_API_KEY=sk-your-api-key');
    console.error('');
    console.error('Or run with --dry-run to preview without generating:');
    console.error('  node scripts/generate-ai-images.js --dry-run');
    process.exit(1);
  }

  // Load prompts
  let prompts;
  try {
    prompts = await loadPrompts();
    console.log(`✅ Loaded prompts from ${CONFIG.promptsFile}`);
  } catch (error) {
    console.error(`❌ Error loading prompts: ${error.message}`);
    process.exit(1);
  }

  // Ensure output directory exists
  try {
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  // Filter services if specified
  const services = options.service 
    ? { [options.service]: prompts[options.service] }
    : prompts;

  // Validate service exists
  if (options.service && !prompts[options.service]) {
    console.error(`❌ Error: Service "${options.service}" not found in prompts`);
    console.error(`Available services: ${Object.keys(prompts).join(', ')}`);
    process.exit(1);
  }

  // Display configuration
  console.log(`\n📋 Configuration:`);
  console.log(`   Model: ${CONFIG.model}`);
  console.log(`   Quality: ${CONFIG.quality}`);
  console.log(`   Size: ${CONFIG.size} (resized to 1200x800)`);
  console.log(`   Output: ${CONFIG.outputDir}`);
  if (options.dryRun) {
    console.log(`   Mode: DRY RUN (no images will be generated)`);
  }

  // Count total images
  const totalImages = Object.values(services).reduce(
    (sum, service) => sum + service.images.length,
    0
  );
  console.log(`\n📊 Services: ${Object.keys(services).length}`);
  console.log(`📷 Total images: ${totalImages}`);

  // Generate images for each service
  for (const [serviceKey, serviceData] of Object.entries(services)) {
    await generateServiceImages(serviceKey, serviceData, options);
  }

  console.log('\n' + '='.repeat(50));
  if (options.dryRun) {
    console.log('✨ Dry run complete! Run without --dry-run to generate images.');
  } else {
    console.log('✨ Image generation complete!');
    console.log('\n💡 Next step: Update service pages with generated images:');
    console.log('   node scripts/update-service-page-images.js');
  }
}

// Run if called directly
main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
