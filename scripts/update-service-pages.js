#!/usr/bin/env node
/**
 * Update Service Pages Script
 * Updates all service pages to use global.css and adds modern features
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVICE_DIR = path.resolve(__dirname, '../services');
const SERVICES = [
  'real-estate.html',
  'construction.html',
  'inspections.html',
  'mapping.html',
  'ranch-farm.html',
  'events.html'
];

async function updateServicePage(filename) {
  try {
    const filePath = path.join(SERVICE_DIR, filename);
    let content = await fs.readFile(filePath, 'utf8');
    
    // Check if already updated
    if (content.includes('assets/css/global.css')) {
      console.log(`⏭️  ${filename} already updated`);
      return;
    }
    
    // Update Google Fonts to async loading
    content = content.replace(
      /<link href="https:\/\/fonts\.googleapis\.com[^>]+>/,
      `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
  <noscript><link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet"></noscript>

  <!-- Global Styles -->
  <link rel="stylesheet" href="../assets/css/global.css">

  <!-- Page-specific Styles -->`
    );
    
    // Remove redundant base styles that are now in global.css
    content = content.replace(
      /html \{ scroll-behavior:smooth; \}\s*body \{ margin:0;font-family:'Inter',sans-serif;background:#0a0a0a;color:#e6e6e6;line-height:1\.6; \}\s*/,
      ''
    );
    
    // Add skip-to-content link after <body>
    if (!content.includes('skip-to-main')) {
      content = content.replace(
        /<body>/,
        `<body>

  <a href="#main-content" class="skip-to-main">Skip to main content</a>
`
      );
    }
    
    // Add main landmark
    if (!content.includes('<main')) {
      content = content.replace(
        /(<\/nav>\s*\n\s*)<section/,
        '$1<main id="main-content">\n  <section'
      );
      
      content = content.replace(
        /<\/section>\s*\n\s*<footer/,
        `</section>
</main>

<footer`
      );
    }
    
    // Add JavaScript before </body>
    if (!content.includes('assets/js/main.js')) {
      content = content.replace(
        /<\/body>/,
        `  <!-- Main JavaScript -->
  <script src="../assets/js/main.js"></script>

</body>`
      );
    }
    
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`✅ Updated ${filename}`);
    
  } catch (error) {
    console.error(`❌ Error updating ${filename}:`, error.message);
  }
}

async function main() {
  console.log('🔧 Updating service pages...\n');
  
  for (const service of SERVICES) {
    await updateServicePage(service);
  }
  
  console.log('\n✨ Service pages updated!');
}

// Run if called directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(console.error);
}
