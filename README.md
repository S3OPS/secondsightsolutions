# Second Sight Solutions Website

Professional website for Second Sight Solutions - a veteran-owned drone services company serving Central Texas.

## Overview

This website showcases our comprehensive drone services including:
- Real Estate Aerial Photography
- Construction Progress Documentation
- Aerial Inspections
- Land & Ranch Imaging
- Drone Mapping & Orthomosaics
- Event Aerial Coverage

## Tech Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (vanilla)
- **Fonts**: Google Fonts (Orbitron, Inter)
- **Form Processing**: Formspree
- **Hosting**: Static site (can be deployed to GitHub Pages, Netlify, Vercel, etc.)

## Project Structure

```
secondsightsolutions/
├── index.html              # Homepage
├── contact.html            # Contact page
├── services/               # Service-specific pages
│   ├── real-estate.html
│   ├── construction.html
│   ├── inspections.html
│   ├── mapping.html
│   ├── ranch-farm.html
│   └── events.html
├── assets/
│   ├── css/
│   │   ├── global.css      # Global styles
│   │   └── styles.css      # Legacy/page-specific styles
│   └── img/                # Images
├── images/                 # Service images
├── includes/               # Reusable HTML fragments
│   └── nav.html
└── package.json            # Build tooling
```

## Getting Started

### Prerequisites

- Node.js 18+ (for build tools)
- Python 3 (for local development server) or any static file server

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start local development server on port 8000
npm start

# Visit http://localhost:8000 in your browser
```

### Build

```bash
# Optimize images and minify CSS
npm run build

# Validate HTML and CSS
npm run validate

# Generate AI-optimized service page images
npm run generate-images

# Update service pages with generated images
npm run update-page-images
```

### AI Image Generation

This project includes AI-powered image generation for service pages. See [AI_IMAGE_GENERATION.md](./AI_IMAGE_GENERATION.md) for details.

```bash
# Generate placeholder images and AI prompts
npm run generate-images

# Export AI prompts for professional generation
npm run export-prompts
```

## Deployment

This is a static website and can be deployed to any static hosting service:

### GitHub Pages
```bash
# Push to main/master branch
# Enable GitHub Pages in repository settings
```

### Netlify
```bash
# Connect repository to Netlify
# Build command: npm run build
# Publish directory: .
```

### Vercel
```bash
# Import project to Vercel
# Framework: Other
# No build command needed for static site
```

## Features

### Accessibility
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ Skip-to-content links
- ✅ Semantic HTML5
- ✅ ARIA labels where needed
- ✅ Reduced motion support
- ✅ Alt text on all images

### SEO
- ✅ Schema.org structured data (LocalBusiness, VideoObject)
- ✅ Open Graph meta tags
- ✅ Twitter Card metadata
- ✅ Semantic HTML structure
- ✅ Proper heading hierarchy
- ✅ Mobile-responsive design

### Performance
- ✅ Lazy loading images
- ✅ Minified CSS
- ✅ WebP image format support
- ✅ Async font loading
- ✅ Minimal external dependencies

### Browser Support
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Updating Colors

Edit the CSS variables in `/assets/css/global.css`:

```css
:root {
  --primary-red: #ff0033;
  --dark-red: #8b0000;
  /* ... other variables */
}
```

### Adding New Pages

1. Create a new HTML file in the root or `/services/` directory
2. Include the global CSS: `<link rel="stylesheet" href="/assets/css/global.css">`
3. Add navigation link to `/includes/nav.html`
4. Update sitemap if using one

### Updating Contact Form

The contact form uses Formspree. To change the endpoint:
1. Sign up at https://formspree.io
2. Get your form endpoint
3. Update the `action` attribute in `contact.html`

## License

Copyright © 2024-2026 Second Sight Solutions. All rights reserved.

## Documentation

This repository includes comprehensive documentation:

- **THE_ONE_RING.md** - Master strategic roadmap and comprehensive status
- **CHANGELOG.md** - Detailed version history and notable changes  
- **DEPLOYMENT.md** - Step-by-step deployment guides for multiple platforms
- **OPTIMIZATION.md** - Technical optimization details and best practices
- **SECURITY.md** - Security audit results and security best practices
- **AI_IMAGE_GENERATION.md** - AI-powered image generation tools and workflow
- **docs/archive/** - Historical documentation from completed enhancement tasks

## Contact

For questions about this website or our services, visit the contact page on the deployed website.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.
