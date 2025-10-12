# ⚡ QUICK REFERENCE CARD

**Last Updated**: Oct 11, 2025  
**One-page summary for developers**

---

## 🚀 START SERVICES (3 Commands)

```bash
# Terminal 1 - API
npm run dev:api     # → http://localhost:4202

# Terminal 2 - Landing
npm run dev:landing # → http://localhost:4200

# Terminal 3 - Admin
npm run dev:admin   # → http://localhost:4201
```

**Default Login**: `admin@example.com` / `admin123`

---

## 📁 PROJECT STRUCTURE

```
ai-sales-agents-platform/
├── 📱 landing/          → Customer website (React)
├── 🎛️  admin/           → Admin CMS (React)
├── 🔧 api/              → Backend (Hono)
├── 📚 packages/
│   ├── shared/         → Design tokens
│   └── ui/             → Shared components
└── 🗄️  infra/prisma/    → Database schema
```

---

## 🎨 KEY TECH STACK

| Layer | Tech |
|-------|------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Animations** | Framer Motion |
| **Backend** | Hono + Prisma ORM |
| **Database** | SQLite (dev), PostgreSQL (prod) |
| **Monorepo** | Nx 21.6.3 |
| **Image** | Sharp optimization |

---

## 📊 HEALTH CHECK

### ✅ **GOOD** (Working Well):
- ✅ Linting: **NO ERRORS**
- ✅ Code Architecture: **Excellent**
- ✅ Performance: **Optimized**
- ✅ Design System: **Consistent**

### ⚠️ **NEEDS ATTENTION**:
- 🔴 Testing: **0% coverage**
- 🔴 Security: **Weak password hashing**
- 🟠 Rate Limiting: **Missing**
- 🟠 Validation: **No library**

---

## 🔥 CRITICAL FIXES (Do First)

### **1. Password Security** (1 hour)
```bash
npm install bcrypt @types/bcrypt
```
```typescript
// api/src/main.ts - Replace lines 58-60
import bcrypt from 'bcrypt';
async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12);
}
```

### **2. Rate Limiting** (2 hours)
```bash
npm install hono-rate-limiter
```
```typescript
// api/src/main.ts - Add after line 45
app.use('/auth/*', rateLimiter({ max: 5 }));
```

### **3. Environment Setup** (5 min)
```bash
cp .env.example .env
# Edit .env file
```

---

## 📦 PACKAGE COMMANDS

```bash
# Install
npm install

# Build all
npm run build

# Test (need to setup first)
npm test

# Database
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to DB
npm run db:migrate     # Create migration
npm run db:seed        # Seed data

# Nx commands
npx nx graph           # View dependency graph
npx nx reset           # Reset cache (fix daemon error)
```

---

## 🗄️ DATABASE MODELS (13 Tables)

| Model | Purpose |
|-------|---------|
| **User** | Admin users |
| **Session** | Auth sessions |
| **Page** | Website pages |
| **Section** | Page sections (20 types) |
| **MediaAsset** | Uploaded files |
| **MenuCategory** | Menu categories |
| **MenuItem** | Menu items |
| **BlogCategory** | Blog categories |
| **BlogPost** | Blog posts |
| **BlogComment** | Post comments |
| **Reservation** | Table bookings |
| **SpecialOffer** | Promotional offers |
| **Settings** | Global settings |

---

## 🎯 API ENDPOINTS (60+)

### **Auth** (3):
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

### **Pages** (5):
- `GET/POST /pages`
- `GET/PUT/DELETE /pages/:slug`

### **Sections** (3):
- `POST /pages/:slug/sections`
- `PUT/DELETE /sections/:id`

### **Media** (6):
- `POST /media` (upload)
- `GET /media` (list)
- `GET /media/:filename`
- `PUT /media/:id`
- `DELETE /media/:id`
- `GET /gallery`

### **Menu** (6):
- `GET/POST /menu`
- `GET/PUT/DELETE /menu/:id`
- `PUT /menu-bulk/reorder`

### **Blog** (12):
- Categories: GET/POST/PUT/DELETE
- Posts: GET/POST/PUT/DELETE
- Comments: POST/PUT/DELETE

### **Reservations** (5):
- `GET/POST/PUT/DELETE /reservations`
- `GET /reservations/:id`

### **Special Offers** (5):
- `GET/POST/PUT/DELETE /special-offers`

### **Settings** (3):
- `GET/PUT /settings/:key`
- `GET /settings`

---

## 🎨 DESIGN TOKENS

```typescript
// packages/shared/src/tokens.ts
tokens = {
  color: {
    primary: '#F5D393',      // Gold
    background: '#0B0B0C',   // Dark
    text: '#F4F4F5',         // White
  },
  spacing: {
    md: '16px',
    lg: '24px',
  },
  radius: {
    md: '12px',
    xl: '24px',
  },
}
```

---

## 🧩 SECTION TYPES (20)

1. HERO - Hero banner
2. FEATURED_MENU - Menu showcase
3. TESTIMONIALS - Reviews
4. STATS - Statistics
5. GALLERY - Photo grid
6. GALLERY_SLIDESHOW - Slideshow
7. SPECIAL_OFFERS - Promotions
8. RESERVATION_FORM - Booking
9. CONTACT_INFO - Contact + map
10. OPENING_HOURS - Hours
11. FEATURES - Feature list
12. MISSION_VISION - About
13. SOCIAL_MEDIA - Social links
14. FOOTER_SOCIAL - Footer links
15. FEATURED_BLOG_POSTS - Blog highlights
16. FLOATING_ACTIONS - Floating buttons
17. RICH_TEXT - Custom HTML
18. BANNER - Announcements
19. CTA - Call-to-action
20. Media sections

---

## 🐛 COMMON ISSUES

### **1. Nx Daemon Error**
```bash
npx nx reset
```

### **2. Port Already in Use**
```powershell
# Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

### **3. Database Connection**
```bash
# Check DATABASE_URL in .env
# Run migrations
npx prisma db push
```

### **4. Build Fails**
```bash
# Clear cache
npx nx reset
rm -rf dist node_modules
npm install
```

---

## 📈 METRICS

| Metric | Value |
|--------|-------|
| **Apps** | 3 |
| **Packages** | 2 |
| **API Endpoints** | 60+ |
| **Database Models** | 13 |
| **Section Types** | 20+ |
| **Admin Pages** | 11 |
| **Lines of Code** | ~10,000+ |

---

## ⏱️ DEVELOPMENT TIMELINE

### **Setup** (30 min):
- Clone repo
- Install dependencies
- Setup .env
- Run migrations

### **Fix Security** (4 hours):
- Bcrypt password (1h)
- Rate limiting (2h)
- Validation (1h)

### **Add Testing** (1 week):
- Setup Vitest
- Write unit tests
- 70% coverage target

### **Production Ready** (3 weeks):
- Week 1: Security + Validation
- Week 2: Testing + Monitoring
- Week 3: Deployment prep

---

## 🎯 QUICK SCORES

| Category | Score | Status |
|----------|-------|--------|
| **Architecture** | 90/100 | ⭐⭐⭐⭐⭐ |
| **Code Quality** | 85/100 | ⭐⭐⭐⭐ |
| **Testing** | 0/100 | ❌ |
| **Security** | 60/100 | ⚠️ |
| **Performance** | 85/100 | ⭐⭐⭐⭐ |
| **Documentation** | 70/100 | ⭐⭐⭐ |
| **Overall** | 75/100 | ⭐⭐⭐⭐ B+ |

---

## 🚦 PRODUCTION CHECKLIST

```bash
Security:
- [ ] ❌ Bcrypt password hashing
- [ ] ❌ Rate limiting
- [ ] ❌ Input validation
- [ ] ❌ HTTPS/SSL

Testing:
- [ ] ❌ Unit tests (70%)
- [ ] ❌ Integration tests
- [ ] ❌ E2E tests

Monitoring:
- [ ] ❌ Error tracking (Sentry)
- [ ] ❌ Performance monitoring
- [ ] ❌ Uptime monitoring

Documentation:
- [ ] ✅ README
- [ ] ❌ API docs (Swagger)
```

**Progress**: 1/12 (8%)

---

## 📞 QUICK LINKS

| Resource | Location |
|----------|----------|
| **Full Analysis** | `📊_DEEP_CODEBASE_ANALYSIS_REPORT.md` |
| **Error Audit** | `🔧_ERROR_AND_WARNING_AUDIT.md` |
| **Vietnamese** | `🇻🇳_BÁO_CÁO_PHÂN_TÍCH_CHI_TIẾT.md` |
| **README** | `README.md` |

---

## 💡 PRO TIPS

1. **Always run `nx reset` if cache issues**
2. **Use Live Preview in admin for instant feedback**
3. **Lazy load everything for performance**
4. **Design tokens keep styling consistent**
5. **Prisma schema is source of truth**

---

## 🎓 LEARNING RESOURCES

- **Nx Docs**: https://nx.dev
- **Hono Docs**: https://hono.dev
- **Prisma Docs**: https://prisma.io
- **Framer Motion**: https://framer.com/motion
- **React 18**: https://react.dev

---

**Quick Reference Version**: 1.0  
**For**: Developers joining the project  
**Time to Read**: 5 minutes  


