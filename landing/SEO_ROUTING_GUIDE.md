# 🚀 SEO-Friendly Routing Migration Guide

## ✨ Những Thay Đổi Chính

### 1. **Hash Routing → BrowserRouter**
```diff
- URL cũ: http://localhost:3000/#/blog/post-slug
+ URL mới: http://localhost:3000/blog/post-slug
```

### 2. **Dynamic Routes cho Blog**
```
/blog              → Danh sách bài viết
/blog/:slug        → Chi tiết bài viết (SEO-friendly)
```

### 3. **Cải Thiện UI/UX**

#### 📖 BlogDetailPage
- ✅ **Glass morphism background** cho content → dễ đọc hơn
- ✅ **Featured image height tối ưu**: 600px → 450px (responsive)
- ✅ **Glass card** padding responsive: `clamp(24px, 5vw, 48px)`

#### 🎨 Styles Updated
```css
/* Content Container - Glass Effect */
background: rgba(12,12,16,0.75)
backdropFilter: blur(20px)
border: 1px solid rgba(255,255,255,0.08)
borderRadius: 24px
padding: clamp(24px, 5vw, 48px)
boxShadow: 0 8px 32px rgba(0,0,0,0.4)

/* Featured Image Heights */
Mobile:   h-64   (256px)
Tablet:   h-80   (320px)
Desktop:  h-96   (384px)
Large:    h-[450px]
```

---

## 🛠️ Cấu Trúc Mới

### Files Created/Modified

```
landing/
├── src/
│   ├── app/
│   │   ├── AppWithRouter.tsx          ← 🆕 Router với BrowserRouter
│   │   ├── Router.tsx                 ← 🆕 Routes definition
│   │   ├── analytics.ts               ← ✏️ Updated for pathname tracking
│   │   └── pages/
│   │       ├── BlogPage.tsx           ← ✏️ useNavigate instead of state
│   │       └── BlogDetailPage.tsx     ← ✏️ Glass background + optimized
│   └── main.tsx                       ← ✏️ Import AppWithRouter
│
└── public/
    ├── _redirects                     ← 🆕 Netlify/Vercel SPA config
    ├── .htaccess                      ← 🆕 Apache rewrite rules
    ├── sitemap.xml                    ← 🆕 SEO sitemap
    └── robots.txt                     ← 🆕 Search engine instructions
```

---

## 📊 SEO Benefits

### ✅ Clean URLs
```
❌ #/blog/the-art-of-grilled-octopus
✅ /blog/the-art-of-grilled-octopus
```

### ✅ Meta Tags (Dynamic per page)
- `<title>` updates per route
- `<meta name="description">` per page
- Open Graph tags
- Twitter Card tags
- Canonical URLs

### ✅ Crawlable Routes
- Search engines có thể index từng trang blog riêng biệt
- Sitemap.xml để Google/Bing crawl
- robots.txt cho crawler policies

---

## 🚀 Development

### Start Dev Server
```bash
cd landing
npm run dev
# hoặc
pnpm dev
```

Server chạy tại: **http://localhost:4200**

### Test Routes
```bash
# Homepage
http://localhost:4200/

# Blog listing
http://localhost:4200/blog

# Blog detail (dynamic)
http://localhost:4200/blog/the-art-of-grilled-octopus

# Other pages
http://localhost:4200/menu
http://localhost:4200/gallery
http://localhost:4200/about
http://localhost:4200/contact
```

---

## 🌐 Production Deployment

### Netlify
File `_redirects` đã được tạo:
```
/*    /index.html   200
```

### Vercel
Vercel tự động detect SPA, không cần config thêm.

### Apache Server
File `.htaccess` đã được tạo với rewrite rules.

### Nginx
Thêm vào nginx.conf:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## 🔍 Analytics Tracking

### Updated in `analytics.ts`
```typescript
// Tracking pathname thay vì hash
const path = window.location.pathname || '/';

// Track SPA navigation
window.history.pushState = function(...args) {
  originalPushState.apply(window.history, args);
  trackPageView();
};
```

---

## 📱 Mobile Navigation

### MobileMenu.tsx Updated
```typescript
// Navigation với useNavigate()
onClick={() => {
  const path = item.route === 'home' ? '/' : `/${item.route}`;
  navigate(path);
  setIsOpen(false);
}}
```

---

## ✨ Best Practices Applied

### 1. **Route-based Code Splitting** (Future)
```typescript
// Có thể implement lazy loading
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
```

### 2. **Scroll to Top on Navigation**
```typescript
// Thêm vào Layout component
useEffect(() => {
  window.scrollTo(0, 0);
}, [location.pathname]);
```

### 3. **404 Handling**
```typescript
<Route path="*" element={<Navigate to="/" replace />} />
```

---

## 🎯 Checklist

- ✅ Thay hash routing bằng BrowserRouter
- ✅ Dynamic routes cho `/blog/:slug`
- ✅ Glass background cho content - dễ đọc
- ✅ Tối ưu featured image size
- ✅ SEO meta tags
- ✅ Sitemap.xml
- ✅ robots.txt
- ✅ Server config files (_redirects, .htaccess)
- ✅ Analytics tracking updated
- ✅ Mobile navigation updated

---

## 📝 Next Steps

### Generate Dynamic Sitemap
Tạo script để auto-generate sitemap từ blog posts:

```typescript
// scripts/generate-sitemap.ts
import fs from 'fs';

async function generateSitemap() {
  const posts = await fetch('http://localhost:4202/blog/posts').then(r => r.json());
  
  const urls = posts.map(post => `
  <url>
    <loc>https://yourwebsite.com/blog/${post.slug}</loc>
    <lastmod>${post.updatedAt}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  `).join('');
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;
  
  fs.writeFileSync('public/sitemap.xml', sitemap);
}

generateSitemap();
```

### Structured Data (JSON-LD)
Thêm structured data cho blog posts:

```typescript
// Trong BlogDetailPage
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "${post.title}",
  "image": "${post.featuredImage}",
  "datePublished": "${post.publishedAt}",
  "author": {
    "@type": "Person",
    "name": "${post.author.name}"
  }
}
</script>
```

---

## 🐛 Troubleshooting

### Issue: 404 on refresh
**Solution**: Đảm bảo server config đúng (_redirects hoặc .htaccess)

### Issue: Analytics không track
**Solution**: Check console log `[analytics] pageview /path`

### Issue: Navigation không hoạt động
**Solution**: 
1. Check `react-router-dom` đã cài: `pnpm list react-router-dom`
2. Verify BrowserRouter wrap toàn bộ app

---

## 📚 Resources

- [React Router Docs](https://reactrouter.com/)
- [SEO for Single Page Apps](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Sitemap Protocol](https://www.sitemaps.org/)

---

**Hoàn tất migration! 🎉**

