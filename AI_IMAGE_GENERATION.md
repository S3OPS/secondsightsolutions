# AI Image Generation for Service Pages

This directory contains tools for generating AI-optimized images for Second Sight Solutions service pages.

## Overview

As a deep search web analyst with 15 years of experience, this system provides:

1. **AI Prompt Generation**: Detailed, professional prompts for each service image
2. **Placeholder Images**: Branded placeholder images while you generate AI images
3. **Automated Integration**: Scripts to seamlessly update service pages

## Features

### Service Coverage
- ✅ Real Estate (6 images)
- ✅ Construction (6 images)
- ✅ Inspections (6 images)
- ✅ Mapping (6 images)
- ✅ Ranch & Farm (6 images)
- ✅ Events (6 images)

**Total**: 36 unique AI-generated images

### Image Specifications

Each image is designed with:
- **Dimensions**: 1200×800px (optimized for web)
- **Format**: JPEG (high quality, 90%)
- **Purpose**: Service-specific aerial drone photography
- **Context**: Central Texas location
- **Style**: Professional marketing photography

## Quick Start - All-in-One Command (Recommended)

The easiest way to set up all AI images is with the all-in-one command:

```bash
npm run setup-ai-images
```

This single command will:
1. ✅ **Configure your API key** - Prompts if not already set, saves to `.env` file
2. ✅ **Generate all 36 images** - Uses DALL-E 3 to create professional images
3. ✅ **Update service pages** - Automatically updates HTML to use new images

### Options

```bash
# Interactive setup (prompts for API key if needed)
npm run setup-ai-images

# Provide API key directly
npm run setup-ai-images -- --api-key sk-your-key

# Preview what would happen without making changes
npm run setup-ai-images -- --dry-run

# Only generate images, don't update pages
npm run setup-ai-images -- --skip-update

# Show detailed output
npm run setup-ai-images -- --verbose
```

---

## Alternative: Step-by-Step Setup

If you prefer more control, you can use the individual scripts:

### 1. Generate Placeholder Images

```bash
# Generate placeholder images and export AI prompts
npm run generate-images

# Or run directly
node scripts/generate-service-images.js
```

This creates:
- `images/generated/` - Placeholder images for all services
- `ai-image-prompts.json` - AI prompts for professional image generation

### 2. Update Service Pages

```bash
# Update all service pages to use generated images
node scripts/update-service-page-images.js
```

This updates all 6 service pages to reference the generated images.

### 3. Automatic AI Image Generation

Use the automated script to generate images using OpenAI's DALL-E API:

> ⚠️ **IMPORTANT**: Do NOT modify the script file to add your API key. Always set it as an environment variable in your terminal before running the script. The script reads the key from `process.env.OPENAI_API_KEY`.

```bash
# Set your OpenAI API key as an environment variable
# (Replace sk-your-api-key with your actual OpenAI API key)

# On macOS/Linux:
export OPENAI_API_KEY=sk-your-api-key

# On Windows Command Prompt:
set OPENAI_API_KEY=sk-your-api-key

# On Windows PowerShell:
$env:OPENAI_API_KEY="sk-your-api-key"

# Generate all images automatically
npm run generate-ai-images

# Or generate images for a specific service
node scripts/generate-ai-images.js --service real-estate

# Preview what would be generated (dry run)
node scripts/generate-ai-images.js --dry-run
```

**Options:**
- `--service, -s <name>` - Generate images for a specific service only
- `--dry-run, -n` - Show what would be generated without making API calls
- `--verbose, -v` - Show detailed output including prompts
- `--help, -h` - Show help message

**Environment Variables:**
- `OPENAI_API_KEY` - Required. Your OpenAI API key (set as environment variable, NOT in code)
- `AI_IMAGE_MODEL` - Optional. Model to use (default: dall-e-3)
- `AI_IMAGE_QUALITY` - Optional. Quality setting: standard or hd (default: standard)

### 4. (Alternative) Manual AI Generation

Use the prompts in `ai-image-prompts.json` manually with:
- **DALL-E 3** (OpenAI)
- **Midjourney**
- **Stable Diffusion**
- **Adobe Firefly**
- **Leonardo.AI**

Then replace the placeholder images in `images/generated/` with your AI-generated images.

## AI Prompt Structure

Each image prompt includes:

1. **Subject**: Specific service scenario (e.g., "luxury residential property")
2. **Perspective**: Aerial/drone viewpoint
3. **Location**: Central Texas context
4. **Lighting**: Time of day, atmosphere
5. **Quality**: Professional, marketing-grade
6. **Style**: Real estate/construction/inspection photography style

### Example Prompt

```json
{
  "filename": "real-estate-1.jpg",
  "title": "Luxury Property Overview",
  "aiPrompt": "Professional aerial drone photograph of a luxury residential property in Central Texas, showcasing modern home with pool, landscaped yard, and surrounding neighborhood, golden hour lighting, 4K quality, real estate marketing style",
  "description": "Luxury home aerial view showcasing property and landscaping"
}
```

## Image Categories by Service

### Real Estate
1. Luxury Property Overview
2. Neighborhood Context Shot
3. Estate Aerial View
4. Commercial Property
5. Twilight Property Shot
6. Property Layout View

### Construction
1. Construction Site Overview
2. Wide-Angle Site View
3. Construction Milestone
4. Building Progress
5. Site Comparison
6. Construction Showcase

### Inspections
1. Roof Inspection Detail
2. Tower Structure
3. Building Facade
4. Infrastructure Inspection
5. Rooftop Equipment
6. Professional Inspection

### Mapping
1. Orthomosaic Map
2. Large Property Survey
3. Construction Progress Map
4. Land Development Plan
5. Topographic Mapping
6. Mapping Services Showcase

### Ranch & Farm
1. Ranch Property Overview
2. Farm Acreage
3. Land Listing
4. Ranch Facilities
5. Water Features & Pastures
6. Ranch Marketing

### Events
1. Event Venue Aerial
2. Crowd Scale
3. Cinematic Event Shot
4. Event Staging
5. Night Event
6. Event Marketing

## File Structure

```
secondsightsolutions/
├── scripts/
│   ├── generate-service-images.js      # Main generation script
│   └── update-service-page-images.js   # Page update script
├── images/
│   └── generated/                      # Generated/AI images
│       ├── real-estate-1.jpg through real-estate-6.jpg
│       ├── construction-1.jpg through construction-6.jpg
│       ├── inspections-1.jpg through inspections-6.jpg
│       ├── mapping-1.jpg through mapping-6.jpg
│       ├── ranch-farm-1.jpg through ranch-farm-6.jpg
│       └── events-1.jpg through events-6.jpg
├── ai-image-prompts.json              # AI generation prompts
└── services/                          # Service pages (updated automatically)
    ├── real-estate.html
    ├── construction.html
    ├── inspections.html
    ├── mapping.html
    ├── ranch-farm.html
    └── events.html
```

## Script Options

### generate-service-images.js

```bash
# Generate placeholder images (default)
node scripts/generate-service-images.js

# Export AI prompts only
node scripts/generate-service-images.js --export-prompts

# Show help
node scripts/generate-service-images.js --help
```

## Customization

### Adding New Service Images

Edit `scripts/generate-service-images.js` and add to `SERVICE_IMAGE_SPECS`:

```javascript
'new-service': {
  serviceName: 'New Service',
  imageCount: 6,
  dimensions: { width: 1200, height: 800 },
  images: [
    {
      filename: 'new-service-1.jpg',
      title: 'Image Title',
      aiPrompt: 'Detailed AI generation prompt...',
      description: 'Alt text description',
      primaryColor: '#hexcolor',
      accentColor: '#hexcolor'
    },
    // ... more images
  ]
}
```

### Modifying Image Dimensions

Change dimensions in `SERVICE_IMAGE_SPECS` for specific services:

```javascript
dimensions: { width: 1600, height: 900 }
```

## Best Practices

### For AI Image Generation

1. **Use the exact prompts** from `ai-image-prompts.json`
2. **Request 4K/high resolution** output from AI tools
3. **Specify "professional photography"** in additional parameters
4. **Set aspect ratio** to 3:2 (1200×800)
5. **Use "drone aerial photography"** style keywords

### For Image Quality

- Save AI-generated images as **JPEG** with 90% quality
- Ensure images are **exactly 1200×800px**
- Use **sRGB color space**
- Optimize for web (100-250KB file size)

### For Service Pages

- Keep **alt text** descriptive and SEO-friendly
- Use **lazy loading** (already implemented)
- Test images on **mobile devices**
- Verify **accessibility** compliance

## Workflow

### Initial Setup
1. Run `npm install` to install dependencies
2. Run `node scripts/generate-service-images.js`
3. Review generated placeholders

### Using AI Tools (Automated)
1. Set your OpenAI API key:
   - **macOS/Linux:** `export OPENAI_API_KEY=sk-your-key`
   - **Windows Command Prompt:** `set OPENAI_API_KEY=sk-your-key`
   - **Windows PowerShell:** `$env:OPENAI_API_KEY="sk-your-key"`
2. Run `npm run generate-ai-images`
3. Images are automatically saved with correct naming in `images/generated/`

### Using AI Tools (Manual)
1. Copy prompts from `ai-image-prompts.json`
2. Generate images with your preferred AI tool
3. Download images (1200×800px, JPEG)
4. Replace files in `images/generated/`

### Final Integration
1. Verify all images are in place
2. Run `node scripts/update-service-page-images.js`
3. Test service pages locally
4. Deploy to production

## NPM Scripts

Available scripts in `package.json`:

```json
{
  "scripts": {
    "setup-ai-images": "node scripts/setup-ai-images.js",
    "generate-images": "node scripts/generate-service-images.js",
    "generate-ai-images": "node scripts/generate-ai-images.js",
    "update-page-images": "node scripts/update-service-page-images.js",
    "export-prompts": "node scripts/generate-service-images.js --export-prompts"
  }
}
```

| Script | Description |
|--------|-------------|
| `setup-ai-images` | **Recommended** - All-in-one: configure API, generate images, update pages |
| `generate-images` | Generate placeholder images |
| `generate-ai-images` | Generate AI images using DALL-E (requires API key) |
| `update-page-images` | Update service pages to use generated images |
| `export-prompts` | Export AI prompts to JSON file |

## Troubleshooting

### SyntaxError: Invalid or unexpected token

If you see an error like:
```
SyntaxError: Invalid or unexpected token
    at compileSourceTextModule ...
```

This usually means you accidentally modified the script file to hardcode your API key. **Do not modify the script**. Instead:

1. Revert any changes to `scripts/generate-ai-images.js`
2. Set the API key as an environment variable in your terminal:
   ```bash
   # macOS/Linux
   export OPENAI_API_KEY=sk-your-actual-key
   
   # Windows Command Prompt
   set OPENAI_API_KEY=sk-your-actual-key
   
   # Windows PowerShell
   $env:OPENAI_API_KEY="sk-your-actual-key"
   ```
3. Run the script again: `npm run generate-ai-images`

The script automatically reads from `process.env.OPENAI_API_KEY` - you don't need to edit any code.

### Images not showing
- Check file paths in service pages
- Verify files exist in `images/generated/`
- Clear browser cache

### AI prompts not working well
- Try adding "photorealistic" to prompts
- Specify "Central Texas landscape" more explicitly
- Adjust lighting/time of day keywords

### File size too large
- Re-export images at 85-90% JPEG quality
- Use image optimization tools (npm run optimize-images)
- Consider WebP format for modern browsers

## Support

For questions or issues:
1. Check this README
2. Review `scripts/generate-service-images.js` comments
3. Open an issue on GitHub

## License

Copyright © 2024-2026 Second Sight Solutions. All rights reserved.
