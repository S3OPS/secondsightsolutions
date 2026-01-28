#!/usr/bin/env node
/**
 * AI Image Setup Script - All-in-One Command
 * 
 * This script provides a unified command to:
 * 1. Configure your OpenAI API key (interactive prompt or environment variable)
 * 2. Generate AI images for all service placeholders
 * 3. Automatically update service pages to use the generated images
 * 
 * Usage:
 *   npm run setup-ai-images
 *   node scripts/setup-ai-images.js
 *   node scripts/setup-ai-images.js --api-key sk-your-key
 *   node scripts/setup-ai-images.js --dry-run
 * 
 * The script will:
 *   - Check for existing API key in environment or .env file
 *   - Prompt for API key if not found (interactive mode)
 *   - Save API key to .env file for future use
 *   - Generate all 36 images across 6 services
 *   - Update all service pages to reference generated images
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Configuration
const CONFIG = {
  envFile: path.join(ROOT_DIR, '.env'),
  promptsFile: path.join(ROOT_DIR, 'ai-image-prompts.json'),
  outputDir: path.join(ROOT_DIR, 'images/generated'),
  servicesDir: path.join(ROOT_DIR, 'services'),
  model: process.env.AI_IMAGE_MODEL || 'dall-e-3',
  quality: process.env.AI_IMAGE_QUALITY || 'standard',
  size: '1792x1024', // Closest DALL-E 3 size to 1200x800
  rateLimitDelay: 2000, // ms between API calls
};

// Service page to image mapping
const SERVICE_IMAGE_MAPPING = {
  'real-estate.html': {
    images: ['real-estate-1.jpg', 'real-estate-2.jpg', 'real-estate-3.jpg', 'real-estate-4.jpg', 'real-estate-5.jpg', 'real-estate-6.jpg']
  },
  'construction.html': {
    images: ['construction-1.jpg', 'construction-2.jpg', 'construction-3.jpg', 'construction-4.jpg', 'construction-5.jpg', 'construction-6.jpg']
  },
  'inspections.html': {
    images: ['inspections-1.jpg', 'inspections-2.jpg', 'inspections-3.jpg', 'inspections-4.jpg', 'inspections-5.jpg', 'inspections-6.jpg']
  },
  'mapping.html': {
    images: ['mapping-1.jpg', 'mapping-2.jpg', 'mapping-3.jpg', 'mapping-4.jpg', 'mapping-5.jpg', 'mapping-6.jpg']
  },
  'ranch-farm.html': {
    images: ['ranch-farm-1.jpg', 'ranch-farm-2.jpg', 'ranch-farm-3.jpg', 'ranch-farm-4.jpg', 'ranch-farm-5.jpg', 'ranch-farm-6.jpg']
  },
  'events.html': {
    images: ['events-1.jpg', 'events-2.jpg', 'events-3.jpg', 'events-4.jpg', 'events-5.jpg', 'events-6.jpg']
  }
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    apiKey: null,
    help: false,
    skipUpdate: false,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--dry-run':
      case '-n':
        options.dryRun = true;
        break;
      case '--api-key':
      case '-k':
        if (i + 1 >= args.length || args[i + 1].startsWith('-')) {
          console.error('Error: --api-key requires a value');
          process.exit(1);
        }
        options.apiKey = args[++i];
        break;
      case '--skip-update':
        options.skipUpdate = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
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
🚀 AI Image Setup - All-in-One Command
=======================================

This script configures your OpenAI API, generates images for all service
placeholders, and automatically updates service pages.

Usage:
  npm run setup-ai-images [options]
  node scripts/setup-ai-images.js [options]

Options:
  --api-key, -k <key>   Provide OpenAI API key directly
  --dry-run, -n         Preview what would be done without making changes
  --skip-update         Only generate images, don't update service pages
  --verbose, -v         Show detailed output
  --help, -h            Show this help message

Examples:
  # Interactive setup (will prompt for API key)
  npm run setup-ai-images

  # Provide API key directly
  npm run setup-ai-images -- --api-key sk-your-key

  # Preview without making changes
  npm run setup-ai-images -- --dry-run

Environment Variables:
  OPENAI_API_KEY        Your OpenAI API key (can also be in .env file)
  AI_IMAGE_MODEL        Model to use (default: dall-e-3)
  AI_IMAGE_QUALITY      Quality: standard or hd (default: standard)

What This Script Does:
  1. ✅ Checks for OpenAI API key (env, .env file, or prompts)
  2. ✅ Saves API key to .env file for future use
  3. ✅ Generates 36 AI images (6 per service × 6 services)
  4. ✅ Updates all service pages to use generated images

Services Covered:
  - Real Estate (6 images)
  - Construction (6 images)
  - Inspections (6 images)
  - Mapping (6 images)
  - Ranch & Farm (6 images)
  - Events (6 images)
`);
}

/**
 * Prompt user for input
 */
function prompt(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Load existing .env file
 */
async function loadEnvFile() {
  try {
    const content = await fs.readFile(CONFIG.envFile, 'utf8');
    const env = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key) {
          env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    }
    return env;
  } catch (error) {
    return {};
  }
}

/**
 * Save API key to .env file
 */
async function saveApiKeyToEnv(apiKey) {
  const existingEnv = await loadEnvFile();
  existingEnv.OPENAI_API_KEY = apiKey;

  const content = Object.entries(existingEnv)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  await fs.writeFile(CONFIG.envFile, content + '\n', 'utf8');
}

/**
 * Get or configure API key
 */
async function getApiKey(options) {
  // Priority: CLI argument > environment variable > .env file > prompt

  // 1. CLI argument
  if (options.apiKey) {
    console.log('📋 Using API key from command line argument');
    return options.apiKey;
  }

  // 2. Environment variable
  if (process.env.OPENAI_API_KEY) {
    console.log('📋 Using API key from OPENAI_API_KEY environment variable');
    return process.env.OPENAI_API_KEY;
  }

  // 3. .env file
  const envVars = await loadEnvFile();
  if (envVars.OPENAI_API_KEY) {
    console.log('📋 Using API key from .env file');
    return envVars.OPENAI_API_KEY;
  }

  // 4. Prompt user (skip in dry-run mode)
  if (options.dryRun) {
    console.log('📋 No API key found (dry-run mode, will skip actual generation)');
    return null;
  }

  console.log('\n🔑 OpenAI API Key Configuration');
  console.log('================================');
  console.log('No API key found. Please enter your OpenAI API key.');
  console.log('You can get one from: https://platform.openai.com/api-keys\n');

  const apiKey = await prompt('Enter your OpenAI API key: ');

  if (!apiKey) {
    throw new Error('API key is required to generate images');
  }

  // Validate key format (supports both sk- and sk-proj- prefixes)
  if (!apiKey.startsWith('sk-')) {
    console.log('\n⚠️  Warning: OpenAI API keys typically start with "sk-" or "sk-proj-"');
    const confirm = await prompt('Continue anyway? (y/n): ');
    if (confirm.toLowerCase() !== 'y') {
      throw new Error('Aborted by user');
    }
  }

  // Ask to save
  const saveChoice = await prompt('Save API key to .env file for future use? (y/n): ');
  if (saveChoice.toLowerCase() === 'y') {
    await saveApiKeyToEnv(apiKey);
    console.log('✅ API key saved to .env file\n');
  }

  return apiKey;
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
async function generateImage(prompt, apiKey) {
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
  
  // Try to use sharp for resizing, fallback to raw save with warning
  try {
    const sharp = (await import('sharp')).default;
    
    await sharp(buffer)
      .resize(1200, 800, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toFile(outputPath);
  } catch (error) {
    // If sharp is not available, save the raw image with a warning
    console.log('       ⚠️  sharp not available, saving raw 1792x1024 image');
    await fs.writeFile(outputPath, buffer);
  }
}

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate all images
 */
async function generateAllImages(prompts, apiKey, options) {
  console.log('\n🎨 Step 2: Generating AI Images');
  console.log('================================\n');

  // Ensure output directory exists
  await fs.mkdir(CONFIG.outputDir, { recursive: true });

  const services = Object.entries(prompts);
  let totalGenerated = 0;
  let totalErrors = 0;

  for (const [serviceKey, serviceData] of services) {
    console.log(`\n📸 ${serviceData.serviceName} Service:`);
    
    for (let i = 0; i < serviceData.images.length; i++) {
      const image = serviceData.images[i];
      const outputPath = path.join(CONFIG.outputDir, image.filename);
      
      console.log(`   [${i + 1}/${serviceData.images.length}] ${image.filename} - ${image.title}`);

      if (options.dryRun) {
        console.log(`       ⏭️  Skipped (dry run)`);
        continue;
      }

      try {
        const imageUrl = await generateImage(image.aiPrompt, apiKey);
        await downloadImage(imageUrl, outputPath);
        console.log(`       ✅ Generated and saved`);
        totalGenerated++;

        // Rate limit delay (except for last image of last service)
        if (i < serviceData.images.length - 1 || serviceKey !== services[services.length - 1][0]) {
          await sleep(CONFIG.rateLimitDelay);
        }
      } catch (error) {
        console.error(`       ❌ Error: ${error.message}`);
        totalErrors++;
      }
    }
  }

  return { totalGenerated, totalErrors };
}

/**
 * Update a single service page to use generated images
 */
async function updateServicePage(filename) {
  const filePath = path.join(CONFIG.servicesDir, filename);
  
  // Check if file exists
  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`Service file not found: ${filePath}`);
  }
  
  let content = await fs.readFile(filePath, 'utf8');
  
  const imageList = SERVICE_IMAGE_MAPPING[filename].images;
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
  return imageIndex;
}

/**
 * Update all service pages
 */
async function updateAllServicePages(options) {
  console.log('\n🔧 Step 3: Updating Service Pages');
  console.log('==================================\n');

  if (options.skipUpdate) {
    console.log('   ⏭️  Skipped (--skip-update flag)');
    return;
  }

  let totalUpdated = 0;

  for (const filename of Object.keys(SERVICE_IMAGE_MAPPING)) {
    if (options.dryRun) {
      console.log(`   📄 ${filename} - would update ${SERVICE_IMAGE_MAPPING[filename].images.length} images`);
    } else {
      try {
        const count = await updateServicePage(filename);
        console.log(`   ✅ ${filename} - updated ${count} images`);
        totalUpdated += count;
      } catch (error) {
        console.error(`   ❌ ${filename} - ${error.message}`);
      }
    }
  }

  return totalUpdated;
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

  console.log('');
  console.log('🚀 AI Image Setup - All-in-One Command');
  console.log('=======================================');
  
  if (options.dryRun) {
    console.log('📋 Mode: DRY RUN (no changes will be made)\n');
  }

  // Step 1: Configure API key
  console.log('\n🔑 Step 1: API Key Configuration');
  console.log('=================================');
  
  const apiKey = await getApiKey(options);

  // Load prompts
  let prompts;
  try {
    prompts = await loadPrompts();
    const totalImages = Object.values(prompts).reduce((sum, s) => sum + s.images.length, 0);
    console.log(`\n📊 Found ${Object.keys(prompts).length} services with ${totalImages} total images to generate`);
  } catch (error) {
    console.error(`❌ Error loading prompts from ${CONFIG.promptsFile}`);
    console.error(`   ${error.message}`);
    console.error(`\n💡 Make sure ai-image-prompts.json exists in the project root.`);
    console.error(`   Run 'npm run generate-images' to create it.`);
    process.exit(1);
  }

  // Step 2: Generate images
  const { totalGenerated, totalErrors } = await generateAllImages(prompts, apiKey, options);

  // Step 3: Update service pages
  await updateAllServicePages(options);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('✨ Setup Complete!');
  console.log('='.repeat(50));
  
  if (options.dryRun) {
    console.log('\n📋 Dry run complete. Run without --dry-run to execute.');
  } else {
    console.log(`\n📊 Summary:`);
    console.log(`   Images generated: ${totalGenerated}`);
    if (totalErrors > 0) {
      console.log(`   Errors: ${totalErrors}`);
    }
    console.log(`   Service pages updated: ${Object.keys(SERVICE_IMAGE_MAPPING).length}`);
    
    console.log('\n💡 Next steps:');
    console.log('   1. Review generated images in: images/generated/');
    console.log('   2. Start local server: npm start');
    console.log('   3. Open http://localhost:8000 to preview');
  }
}

// Run if called directly
main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
