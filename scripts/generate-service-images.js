#!/usr/bin/env node
/**
 * AI Image Generation Script for Service Pages
 * 
 * This script generates AI image prompts and creates placeholder images
 * for each service page gallery. As a deep search web analyst, this tool
 * provides structured image specifications for AI generation tools.
 * 
 * Usage:
 *   node scripts/generate-service-images.js
 *   node scripts/generate-service-images.js --export-prompts
 */

import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Service-specific image configurations
const SERVICE_IMAGE_SPECS = {
  'real-estate': {
    serviceName: 'Real Estate',
    imageCount: 6,
    dimensions: { width: 1200, height: 800 },
    images: [
      {
        filename: 'real-estate-1.jpg',
        title: 'Luxury Property Overview',
        aiPrompt: 'Professional aerial drone photograph of a luxury residential property in Central Texas, showcasing modern home with pool, landscaped yard, and surrounding neighborhood, golden hour lighting, 4K quality, real estate marketing style',
        description: 'Luxury home aerial view showcasing property and landscaping',
        primaryColor: '#3a7a5c',
        accentColor: '#f4a460'
      },
      {
        filename: 'real-estate-2.jpg',
        title: 'Neighborhood Context Shot',
        aiPrompt: 'Aerial drone view of residential neighborhood in Central Texas, modern suburban homes with streets and community features, midday lighting, professional real estate photography, high resolution',
        description: 'Residential property with surrounding neighborhood context',
        primaryColor: '#5a8a6a',
        accentColor: '#e8e8e8'
      },
      {
        filename: 'real-estate-3.jpg',
        title: 'Estate Aerial View',
        aiPrompt: 'Wide aerial photograph of estate property with expansive land, showing main house, outbuildings, pastures, and tree lines, Central Texas landscape, professional drone photography for real estate marketing',
        description: 'Estate property showcasing land and outdoor features',
        primaryColor: '#6b8e23',
        accentColor: '#d2b48c'
      },
      {
        filename: 'real-estate-4.jpg',
        title: 'Commercial Property',
        aiPrompt: 'Professional aerial drone photograph of commercial real estate building with parking lot, landscaping, and surrounding area, modern architecture, Central Texas, commercial real estate marketing photography',
        description: 'Commercial real estate aerial perspective',
        primaryColor: '#4a6580',
        accentColor: '#c0c0c0'
      },
      {
        filename: 'real-estate-5.jpg',
        title: 'Twilight Property Shot',
        aiPrompt: 'Stunning twilight aerial photograph of luxury home with interior and exterior lights glowing, dramatic blue hour sky, pool and landscape illuminated, professional real estate drone photography, high-end marketing image',
        description: 'Property at twilight with dramatic lighting',
        primaryColor: '#1e3a5f',
        accentColor: '#ffd700'
      },
      {
        filename: 'real-estate-6.jpg',
        title: 'Property Layout View',
        aiPrompt: 'Aerial drone photograph showing complete property layout from above, property boundaries, structures, driveways, landscaping features, Central Texas real estate, professional site documentation style',
        description: 'Wide angle property and land overview',
        primaryColor: '#556b2f',
        accentColor: '#deb887'
      }
    ]
  },
  'construction': {
    serviceName: 'Construction',
    imageCount: 6,
    dimensions: { width: 1200, height: 800 },
    images: [
      {
        filename: 'construction-1.jpg',
        title: 'Construction Site Overview',
        aiPrompt: 'Professional aerial drone photograph of active construction site in Central Texas, showing building progress, equipment, materials staging areas, and site layout, industrial construction documentation style, high detail',
        description: 'Aerial view of construction site showing progress and layout',
        primaryColor: '#8b6914',
        accentColor: '#ff6600'
      },
      {
        filename: 'construction-2.jpg',
        title: 'Wide-Angle Site View',
        aiPrompt: 'Wide aerial view of large construction project site, showing multiple buildings under construction, equipment staging, access roads, and surrounding area, Central Texas construction site, professional documentation photography',
        description: 'Wide-angle construction site overview with staging areas',
        primaryColor: '#5a4a2a',
        accentColor: '#ffa500'
      },
      {
        filename: 'construction-3.jpg',
        title: 'Construction Milestone',
        aiPrompt: 'Aerial drone photograph of construction milestone moment, building structure at key completion phase, workers and equipment visible, Central Texas commercial construction, progress documentation style',
        description: 'Construction milestone documentation from aerial perspective',
        primaryColor: '#6e5a3e',
        accentColor: '#ffcc00'
      },
      {
        filename: 'construction-4.jpg',
        title: 'Building Progress',
        aiPrompt: 'Professional aerial photograph showing building structure progress with steel framework or concrete work in progress, construction equipment operating, site activity, Central Texas construction project documentation',
        description: 'Building structure progress with surrounding area',
        primaryColor: '#4a4a4a',
        accentColor: '#ff8c00'
      },
      {
        filename: 'construction-5.jpg',
        title: 'Site Comparison',
        aiPrompt: 'Aerial drone photograph ideal for before/after construction comparison, showing developed site with progress visible, construction phases documented, professional site monitoring photography',
        description: 'Construction site before and after comparison',
        primaryColor: '#654321',
        accentColor: '#daa520'
      },
      {
        filename: 'construction-6.jpg',
        title: 'Construction Showcase',
        aiPrompt: 'Professional showcase aerial photograph of construction excellence, modern commercial building under construction, clean site management, safety protocols visible, Central Texas construction marketing image',
        description: 'Professional construction site aerial photography showcase',
        primaryColor: '#5f4d3a',
        accentColor: '#ff9933'
      }
    ]
  },
  'inspections': {
    serviceName: 'Inspections',
    imageCount: 6,
    dimensions: { width: 1200, height: 800 },
    images: [
      {
        filename: 'inspections-1.jpg',
        title: 'Roof Inspection Detail',
        aiPrompt: 'Close-up aerial drone photograph of commercial building roof inspection, showing roof condition, HVAC units, details of roofing materials, professional inspection documentation, high resolution detail',
        description: 'Close-up aerial roof inspection showing detail and condition',
        primaryColor: '#4a5568',
        accentColor: '#e53e3e'
      },
      {
        filename: 'inspections-2.jpg',
        title: 'Tower Structure',
        aiPrompt: 'Aerial drone photograph of telecommunications tower or industrial structure inspection, showing structural details, equipment, and condition assessment perspective, professional infrastructure inspection image',
        description: 'Tower structure inspection from aerial drone perspective',
        primaryColor: '#2d3748',
        accentColor: '#4299e1'
      },
      {
        filename: 'inspections-3.jpg',
        title: 'Building Facade',
        aiPrompt: 'Professional aerial drone photograph inspecting building facade, showing wall condition, windows, architectural details, commercial building exterior inspection documentation',
        description: 'Building facade inspection aerial documentation',
        primaryColor: '#5a6878',
        accentColor: '#48bb78'
      },
      {
        filename: 'inspections-4.jpg',
        title: 'Infrastructure Inspection',
        aiPrompt: 'Aerial drone photograph of infrastructure inspection - bridge, power lines, or industrial facility, detailed inspection perspective, safety documentation style, professional engineering photography',
        description: 'Infrastructure inspection with detailed aerial imaging',
        primaryColor: '#3a4a5a',
        accentColor: '#f6ad55'
      },
      {
        filename: 'inspections-5.jpg',
        title: 'Rooftop Equipment',
        aiPrompt: 'Aerial photograph of commercial building rooftop showing HVAC equipment, solar panels, and mechanical systems, inspection documentation perspective, detailed equipment condition assessment',
        description: 'Commercial building rooftop equipment inspection',
        primaryColor: '#2c3e50',
        accentColor: '#9f7aea'
      },
      {
        filename: 'inspections-6.jpg',
        title: 'Professional Inspection',
        aiPrompt: 'Professional aerial inspection photograph showcasing drone inspection capabilities, detailed view of building or structure requiring assessment, Central Texas inspection services marketing image',
        description: 'Professional inspection aerial photography for documentation',
        primaryColor: '#34495e',
        accentColor: '#ed8936'
      }
    ]
  },
  'mapping': {
    serviceName: 'Mapping',
    imageCount: 6,
    dimensions: { width: 1200, height: 800 },
    images: [
      {
        filename: 'mapping-1.jpg',
        title: 'Orthomosaic Map',
        aiPrompt: 'Professional aerial orthomosaic map of large property or development site, showing detailed layout, features, and measurements, GIS-style mapping visualization, Central Texas topography, survey-grade imagery',
        description: 'Aerial orthomosaic map showing detailed site layout and features',
        primaryColor: '#5f7a4f',
        accentColor: '#4a90e2'
      },
      {
        filename: 'mapping-2.jpg',
        title: 'Large Property Survey',
        aiPrompt: 'Aerial drone mapping photograph of large property with survey grid overlay visible, showing land features, boundaries, and topography, professional land surveying style, Central Texas landscape',
        description: 'Large property aerial mapping survey with grid overlay',
        primaryColor: '#6a8a5a',
        accentColor: '#ff6b6b'
      },
      {
        filename: 'mapping-3.jpg',
        title: 'Construction Progress Map',
        aiPrompt: 'Aerial mapping photograph for construction site progress tracking, orthomosaic view showing site changes over time, measurement data visible, professional construction monitoring imagery',
        description: 'Construction site progress tracking with aerial mapping',
        primaryColor: '#8b7355',
        accentColor: '#50c878'
      },
      {
        filename: 'mapping-4.jpg',
        title: 'Land Development Plan',
        aiPrompt: 'Detailed aerial mapping imagery for land development planning, showing terrain, existing features, and potential development areas, Central Texas land, professional planning and engineering visualization',
        description: 'Land development planning with detailed aerial imagery',
        primaryColor: '#7a9d6f',
        accentColor: '#ffd700'
      },
      {
        filename: 'mapping-5.jpg',
        title: 'Topographic Mapping',
        aiPrompt: 'Professional topographic aerial mapping photograph showing elevation contours, terrain features, and land analysis data, survey-grade topographic visualization for Central Texas property',
        description: 'Topographic aerial mapping for land analysis',
        primaryColor: '#6b8e5f',
        accentColor: '#ff8c42'
      },
      {
        filename: 'mapping-6.jpg',
        title: 'Mapping Services Showcase',
        aiPrompt: 'Professional aerial mapping services showcase image, demonstrating precision mapping capabilities, detailed orthomosaic or 3D terrain model, Central Texas aerial surveying and mapping marketing photography',
        description: 'Professional aerial mapping services showcase',
        primaryColor: '#5a7d4a',
        accentColor: '#4ecdc4'
      }
    ]
  },
  'ranch-farm': {
    serviceName: 'Ranch & Farm',
    imageCount: 6,
    dimensions: { width: 1200, height: 800 },
    images: [
      {
        filename: 'ranch-farm-1.jpg',
        title: 'Ranch Property Overview',
        aiPrompt: 'Aerial drone photograph of ranch property in Central Texas showing land features, fencing, structures, pastures, and improvements, professional rural real estate photography, expansive landscape view',
        description: 'Aerial view of ranch property showing land features and improvements',
        primaryColor: '#8b7355',
        accentColor: '#87ceeb'
      },
      {
        filename: 'ranch-farm-2.jpg',
        title: 'Farm Acreage',
        aiPrompt: 'Aerial photograph of farm acreage showing crop fields, access roads, agricultural patterns, and farming operations, Central Texas farmland, professional agricultural real estate photography',
        description: 'Farm acreage with crop fields and access roads',
        primaryColor: '#6b8e23',
        accentColor: '#daa520'
      },
      {
        filename: 'ranch-farm-3.jpg',
        title: 'Land Listing',
        aiPrompt: 'Professional aerial photograph for land listing showing property boundaries, acreage overview, natural features, and access points, Central Texas rural property, real estate marketing photography',
        description: 'Land listing aerial photography showing property boundaries',
        primaryColor: '#556b2f',
        accentColor: '#cd853f'
      },
      {
        filename: 'ranch-farm-4.jpg',
        title: 'Ranch Facilities',
        aiPrompt: 'Aerial drone photograph of ranch facilities and structures including barns, corrals, outbuildings, from aerial perspective, showing layout and condition, Central Texas ranch property documentation',
        description: 'Ranch facilities and structures from aerial perspective',
        primaryColor: '#8b6914',
        accentColor: '#bc8f8f'
      },
      {
        filename: 'ranch-farm-5.jpg',
        title: 'Water Features & Pastures',
        aiPrompt: 'Aerial photograph of ranch or farm property showing water features like ponds or creeks, pasture land, grazing areas, and natural landscape, Central Texas agricultural land documentation',
        description: 'Water features and pasture land aerial documentation',
        primaryColor: '#6b8e5a',
        accentColor: '#4682b4'
      },
      {
        filename: 'ranch-farm-6.jpg',
        title: 'Ranch Marketing',
        aiPrompt: 'Professional aerial marketing photograph for ranch and farm properties, showcasing expansive Central Texas agricultural land, beautiful landscape, and property features, luxury rural real estate photography',
        description: 'Professional ranch and farm aerial photography for marketing',
        primaryColor: '#8fbc8f',
        accentColor: '#f0e68c'
      }
    ]
  },
  'events': {
    serviceName: 'Events',
    imageCount: 6,
    dimensions: { width: 1200, height: 800 },
    images: [
      {
        filename: 'events-1.jpg',
        title: 'Event Venue Aerial',
        aiPrompt: 'Professional aerial drone photograph of outdoor event showing crowd and venue layout, festival or concert setting, Central Texas outdoor venue, dynamic event photography perspective',
        description: 'Aerial view of outdoor event showing crowd and venue layout',
        primaryColor: '#9370db',
        accentColor: '#ffd700'
      },
      {
        filename: 'events-2.jpg',
        title: 'Crowd Scale',
        aiPrompt: 'Aerial photograph showing event crowd scale and atmosphere, large gathering from above, showing scope and energy of event, professional event documentation photography',
        description: 'Crowd scale and event atmosphere from aerial perspective',
        primaryColor: '#8a6fb4',
        accentColor: '#ff69b4'
      },
      {
        filename: 'events-3.jpg',
        title: 'Cinematic Event Shot',
        aiPrompt: 'Cinematic aerial shot of event in progress, dramatic perspective of outdoor festival or concert, stage and audience visible, Central Texas event, professional event videography style photography',
        description: 'Cinematic aerial shot of event in progress',
        primaryColor: '#7b68ee',
        accentColor: '#ff6347'
      },
      {
        filename: 'events-4.jpg',
        title: 'Event Staging',
        aiPrompt: 'Aerial documentation of event staging and layout, showing setup of outdoor event including stage, seating areas, vendor areas, and logistics, professional event planning photography',
        description: 'Event staging and layout aerial documentation',
        primaryColor: '#6a5acd',
        accentColor: '#32cd32'
      },
      {
        filename: 'events-5.jpg',
        title: 'Night Event',
        aiPrompt: 'Aerial photograph of night event coverage with lighting display, outdoor concert or festival at twilight or night, dramatic lighting effects visible from above, professional event photography',
        description: 'Night event coverage with lighting display',
        primaryColor: '#191970',
        accentColor: '#ff1493'
      },
      {
        filename: 'events-6.jpg',
        title: 'Event Marketing',
        aiPrompt: 'Professional aerial photograph for event marketing, showcasing successful outdoor event in Central Texas, energetic atmosphere, professional event coverage and promotion photography',
        description: 'Professional event aerial photography for marketing',
        primaryColor: '#8b5a9e',
        accentColor: '#00ced1'
      }
    ]
  }
};

/**
 * Escape XML/HTML entities for safe SVG embedding
 */
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate a styled placeholder image with service information
 */
async function generatePlaceholderImage(spec, imageConfig) {
  const { width, height } = spec.dimensions;
  
  // Escape text for XML safety
  const safeTitle = escapeXml(imageConfig.title);
  const safeServiceName = escapeXml(spec.serviceName);
  
  // Create SVG with service information
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Gradient Background -->
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${imageConfig.primaryColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${imageConfig.accentColor};stop-opacity:0.7" />
        </linearGradient>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
          <feColorMatrix type="saturate" values="0" />
          <feBlend mode="multiply" in="SourceGraphic" />
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#grad)" filter="url(#noise)" opacity="0.8"/>
      
      <!-- Overlay pattern for drone/aerial effect -->
      <g opacity="0.15">
        <line x1="0" y1="${height * 0.3}" x2="${width}" y2="${height * 0.3}" stroke="white" stroke-width="1" stroke-dasharray="10,5"/>
        <line x1="0" y1="${height * 0.7}" x2="${width}" y2="${height * 0.7}" stroke="white" stroke-width="1" stroke-dasharray="10,5"/>
        <line x1="${width * 0.3}" y1="0" x2="${width * 0.3}" y2="${height}" stroke="white" stroke-width="1" stroke-dasharray="10,5"/>
        <line x1="${width * 0.7}" y1="0" x2="${width * 0.7}" y2="${height}" stroke="white" stroke-width="1" stroke-dasharray="10,5"/>
      </g>
      
      <!-- Center content -->
      <g transform="translate(${width / 2}, ${height / 2})">
        <!-- Drone icon -->
        <g transform="translate(0, -80)" opacity="0.6">
          <circle cx="0" cy="0" r="30" fill="none" stroke="white" stroke-width="2"/>
          <circle cx="-25" cy="-25" r="8" fill="white" opacity="0.7"/>
          <circle cx="25" cy="-25" r="8" fill="white" opacity="0.7"/>
          <circle cx="-25" cy="25" r="8" fill="white" opacity="0.7"/>
          <circle cx="25" cy="25" r="8" fill="white" opacity="0.7"/>
          <circle cx="0" cy="0" r="8" fill="white"/>
        </g>
        
        <!-- Title -->
        <text x="0" y="0" font-family="Arial, sans-serif" font-size="32" font-weight="bold" 
              fill="white" text-anchor="middle" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
          ${safeTitle}
        </text>
        
        <!-- Service name -->
        <text x="0" y="40" font-family="Arial, sans-serif" font-size="20" 
              fill="white" text-anchor="middle" opacity="0.8" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
          ${safeServiceName} Service
        </text>
        
        <!-- Watermark -->
        <text x="0" y="80" font-family="Arial, sans-serif" font-size="16" 
              fill="white" text-anchor="middle" opacity="0.5">
          Second Sight Solutions
        </text>
        
        <!-- AI Prompt indicator -->
        <text x="0" y="110" font-family="Arial, sans-serif" font-size="14" 
              fill="white" text-anchor="middle" opacity="0.4">
          AI-Generated Image Placeholder
        </text>
      </g>
      
      <!-- Corner info -->
      <text x="20" y="${height - 20}" font-family="monospace" font-size="12" 
            fill="white" opacity="0.6">
        ${width}×${height}
      </text>
    </svg>
  `;

  return Buffer.from(svg);
}

/**
 * Export AI prompts to a JSON file for use with AI image generation tools
 */
async function exportPrompts() {
  const prompts = {};
  
  for (const [serviceKey, spec] of Object.entries(SERVICE_IMAGE_SPECS)) {
    prompts[serviceKey] = {
      serviceName: spec.serviceName,
      dimensions: spec.dimensions,
      images: spec.images.map(img => ({
        filename: img.filename,
        title: img.title,
        aiPrompt: img.aiPrompt,
        description: img.description
      }))
    };
  }
  
  const outputPath = path.join(__dirname, '../ai-image-prompts.json');
  await fs.writeFile(outputPath, JSON.stringify(prompts, null, 2));
  console.log(`✅ Exported AI prompts to: ${outputPath}`);
  console.log('\nThese prompts can be used with AI image generation tools like:');
  console.log('  - DALL-E 3 (OpenAI)');
  console.log('  - Midjourney');
  console.log('  - Stable Diffusion');
  console.log('  - Adobe Firefly');
  console.log('  - Leonardo.AI');
}

/**
 * Generate placeholder images for all services
 */
async function generateImages() {
  const imagesDir = path.join(__dirname, '../images/generated');
  
  // Create directory if it doesn't exist
  try {
    await fs.mkdir(imagesDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
  
  console.log('🎨 Generating service images...\n');
  
  for (const [serviceKey, spec] of Object.entries(SERVICE_IMAGE_SPECS)) {
    console.log(`📸 ${spec.serviceName} Service:`);
    
    for (const imageConfig of spec.images) {
      const svgBuffer = await generatePlaceholderImage(spec, imageConfig);
      const outputPath = path.join(imagesDir, imageConfig.filename);
      
      // Convert SVG to JPEG using Sharp
      await sharp(svgBuffer)
        .jpeg({ quality: 90 })
        .toFile(outputPath);
      
      console.log(`  ✅ ${imageConfig.filename} - ${imageConfig.title}`);
    }
    console.log('');
  }
  
  console.log('✨ All images generated successfully!');
  console.log(`📁 Images saved to: ${imagesDir}`);
  console.log('\n💡 Next steps:');
  console.log('   1. Review generated placeholder images');
  console.log('   2. Use ai-image-prompts.json with AI tools to generate real images');
  console.log('   3. Replace placeholders with AI-generated images');
  console.log('   4. Run: node scripts/update-service-page-images.js');
}

/**
 * Display usage instructions
 */
function displayHelp() {
  console.log(`
🎨 AI Image Generation Script for Service Pages
================================================

This script helps generate images for service page galleries using AI prompts.

Usage:
  node scripts/generate-service-images.js              Generate placeholder images
  node scripts/generate-service-images.js --export     Export AI prompts to JSON
  node scripts/generate-service-images.js --help       Show this help

Features:
  - Generates placeholder images with service branding
  - Exports detailed AI prompts for professional image generation
  - Creates structured image specifications for each service

Services configured:
  ${Object.keys(SERVICE_IMAGE_SPECS).map(s => `- ${s}`).join('\n  ')}

Each service gets ${SERVICE_IMAGE_SPECS['real-estate'].imageCount} uniquely styled images.
`);
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    displayHelp();
    return;
  }
  
  if (args.includes('--export') || args.includes('--export-prompts')) {
    await exportPrompts();
    return;
  }
  
  // Default: generate images
  await generateImages();
  await exportPrompts();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

export { SERVICE_IMAGE_SPECS, generatePlaceholderImage };
