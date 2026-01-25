# Deployment Guide - Second Sight Solutions

This guide provides step-by-step instructions for deploying the Second Sight Solutions website to various hosting platforms.

## Pre-Deployment Checklist

Before deploying, ensure you've completed the following:

- [ ] Update all `yourdomain.com` placeholders with your actual domain
- [ ] Update Formspree form endpoint in `contact.html` (if changing)
- [ ] Test all pages locally with `npm start`
- [ ] Run validation: `npm run validate`
- [ ] Optimize images: `npm run optimize-images` (optional)
- [ ] Minify CSS: `npm run minify` (optional)
- [ ] Review and test contact form
- [ ] Add Google Analytics tracking ID (if using)
- [ ] Test on multiple browsers and devices

## Update Domain Placeholders

Search and replace all instances of `yourdomain.com` with your actual domain:

```bash
# macOS/Linux
find . -type f -name "*.html" -exec sed -i '' 's/yourdomain.com/youractualdomain.com/g' {} +

# Linux (Ubuntu/Debian)
find . -type f -name "*.html" -exec sed -i 's/yourdomain.com/youractualdomain.com/g' {} +
```

Also update:
- `sitemap.xml` - replace domain
- `robots.txt` - verify sitemap URL
- `site.webmanifest` - add your domain if needed

## Deployment Options

### Option 1: GitHub Pages (Free)

Perfect for static sites. Automatically serves from your repository.

**Steps:**

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` (or `master`)
   - Folder: `/ (root)`
   - Click Save

3. **Configure Custom Domain (Optional)**
   - Add `CNAME` file to root with your domain
   - Configure DNS with your domain registrar:
     ```
     Type: A Records
     Host: @
     Value: 185.199.108.153
            185.199.109.153
            185.199.110.153
            185.199.111.153
     ```
   - Add CNAME record:
     ```
     Type: CNAME
     Host: www
     Value: yourusername.github.io
     ```

4. **Wait for deployment** (typically 1-3 minutes)
   - Your site will be live at: `https://yourusername.github.io/repositoryname`

**Pros:** Free, automatic deployments, HTTPS included
**Cons:** Limited to static content, no server-side processing

---

### Option 2: Netlify (Recommended)

Excellent for static sites with great performance and features.

**Steps:**

1. **Sign up** at https://netlify.com (free plan available)

2. **Connect Repository**
   - Click "New site from Git"
   - Choose GitHub
   - Select your repository
   - Build settings:
     - Build command: `npm run build` (optional)
     - Publish directory: `.` (root)

3. **Configure Domain**
   - Go to Domain settings
   - Add custom domain
   - Update DNS with your registrar:
     ```
     Type: A Record
     Host: @
     Value: 75.2.60.5
     ```
   - Netlify provides automatic HTTPS

4. **Add Security Headers**
   - The `_headers` file is automatically recognized
   - Headers will be applied on deployment

5. **Deploy**
   - Click "Deploy site"
   - Every push to `main` branch auto-deploys

**Pros:** Free tier generous, CDN included, auto HTTPS, preview deployments
**Cons:** None for this use case

**Netlify Configuration (Optional):**
Create `netlify.toml` in root:
```toml
[build]
  publish = "."
  command = "npm run build"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
```

---

### Option 3: Vercel

Similar to Netlify with excellent performance.

**Steps:**

1. **Sign up** at https://vercel.com

2. **Import Project**
   - Click "New Project"
   - Import from GitHub
   - Select repository

3. **Configure**
   - Framework Preset: Other
   - Root Directory: `./`
   - Build Command: (leave empty for static)
   - Output Directory: `./`

4. **Deploy**
   - Click "Deploy"
   - Configure custom domain in settings

**Pros:** Great performance, auto HTTPS, serverless functions available
**Cons:** None for this use case

---

### Option 4: Traditional Web Hosting

Use any traditional web host (Bluehost, HostGator, SiteGround, etc.)

**Steps:**

1. **Build the site** (optional optimization)
   ```bash
   npm run build
   ```

2. **Upload via FTP/SFTP**
   - Use FileZilla, Cyberduck, or your host's file manager
   - Upload all files to `public_html` or `www` directory
   - Maintain directory structure

3. **Configure .htaccess** (Apache servers)
   Create `.htaccess` in root:
   ```apache
   # Redirect to HTTPS
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   
   # Security Headers
   Header always set X-Frame-Options "DENY"
   Header always set X-Content-Type-Options "nosniff"
   Header always set X-XSS-Protection "1; mode=block"
   ```

4. **Test**
   - Visit your domain
   - Test all pages and forms
   - Check mobile responsiveness

**Pros:** Full control, can add server-side features later
**Cons:** Manual deployments, need to manage server

---

### Option 5: AWS S3 + CloudFront

For high-performance, scalable hosting.

**Steps:**

1. **Create S3 Bucket**
   - Name it with your domain
   - Enable static website hosting
   - Upload all files

2. **Configure Bucket Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Sid": "PublicReadGetObject",
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::yourbucket/*"
     }]
   }
   ```

3. **Create CloudFront Distribution**
   - Point to S3 bucket
   - Configure SSL certificate
   - Add custom domain

4. **Update DNS**
   - Point domain to CloudFront distribution

**Pros:** Ultra-fast, highly scalable, enterprise-grade
**Cons:** More complex setup, costs scale with traffic (but very cheap for small sites)

---

## Post-Deployment Tasks

After deployment:

1. **Test Everything**
   - [ ] All pages load correctly
   - [ ] Forms submit properly
   - [ ] Images display
   - [ ] Navigation works
   - [ ] Mobile responsive
   - [ ] Contact form sends emails

2. **SEO Setup**
   - [ ] Submit sitemap to Google Search Console
   - [ ] Submit sitemap to Bing Webmaster Tools
   - [ ] Verify robots.txt is accessible
   - [ ] Test structured data with Google's Rich Results Test

3. **Performance Testing**
   - [ ] Test with Google PageSpeed Insights
   - [ ] Test with GTmetrix
   - [ ] Test on mobile devices

4. **Analytics Setup** (Optional)
   - [ ] Set up Google Analytics
   - [ ] Or use Plausible/Fathom for privacy-focused analytics
   - [ ] Add tracking code to pages

5. **Security**
   - [ ] Enable HTTPS/SSL
   - [ ] Verify security headers are working
   - [ ] Test with https://securityheaders.com

## Updating the Site

### For Continuous Deployment (Netlify/Vercel/GitHub Pages)

Simply push changes to your repository:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Site will automatically redeploy in 1-3 minutes.

### For Traditional Hosting

1. Make changes locally
2. Test with `npm start`
3. Upload changed files via FTP/SFTP
4. Clear browser cache to see changes

## Troubleshooting

**Problem:** Images not loading
- **Solution:** Check file paths are relative and correct
- Ensure images were uploaded to correct directory

**Problem:** Form not submitting
- **Solution:** Verify Formspree endpoint is correct
- Check browser console for errors
- Ensure form has `action` and `method` attributes

**Problem:** CSS not applying
- **Solution:** Check path to `global.css` is correct
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Verify file uploaded to server

**Problem:** Site not showing on custom domain
- **Solution:** DNS changes can take 24-48 hours to propagate
- Verify DNS records are correct
- Check domain registrar settings

## Support

For hosting-specific issues:
- **GitHub Pages:** https://docs.github.com/en/pages
- **Netlify:** https://docs.netlify.com
- **Vercel:** https://vercel.com/docs

For site issues, refer to the README.md or create an issue in the repository.

## Backup

Always keep backups:
```bash
# Create a backup
tar -czf backup-$(date +%Y%m%d).tar.gz /path/to/site

# Or simply rely on git history
git log --all
```

Your code is version controlled with Git, so you can always revert to any previous state.
