# AI Sales Agents Platform - Restaurant CMS

A modern, full-stack restaurant management system with Admin Dashboard and Landing Page builder.

## 🚀 Features

### Admin Dashboard (Port 4201)
- **Live Preview** - See your Landing Page changes in real-time with device preview (mobile/tablet/desktop)
- **Section Editor** - Visual editor with live preview for all section types
- **Drag & Drop** - Reorder sections easily
- **Media Library** - Upload and manage images
- **Reservations** - View and manage table bookings
- **Pages Management** - Create and edit multiple pages

### Landing Page (Port 4200)
- **Dynamic Sections** - Hero, Featured Menu, Testimonials, Stats, Gallery, CTA, and more
- **Responsive Design** - Mobile-first, looks great on all devices
- **Online Reservations** - Built-in booking form
- **SEO Optimized** - Fast loading, semantic HTML

### API Server (Port 4202)
- **RESTful API** - Clean, documented endpoints
- **PostgreSQL Database** - Reliable data storage
- **Authentication** - JWT-based auth system
- **File Upload** - Image upload with validation

## 📦 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Framer Motion** - Smooth animations
- **Vite** - Lightning fast builds
- **CSS-in-JS** - Component-scoped styling

### Backend
- **NestJS** - Enterprise Node.js framework
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Production database
- **JWT** - Secure authentication

### Monorepo
- **Nx** - Smart monorepo tools
- **Shared Libraries** - Design tokens, utilities
- **Hot Reload** - Fast development workflow

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database

### Installation

```bash
# Install dependencies
cd ai-sales-agents-platform
npm install

# Setup database
cd api
npx prisma migrate dev
npx prisma db seed

# Return to root
cd ..
```

### Running the Stack

**Option 1: Run all services at once**
```bash
npm run dev:all
```

**Option 2: Run services individually**

Terminal 1 - API Server:
```bash
npm run dev:api
# Runs on http://localhost:4202
```

Terminal 2 - Landing Page:
```bash
npm run dev:landing
# Runs on http://localhost:4200
```

Terminal 3 - Admin Dashboard:
```bash
npm run dev:admin
# Runs on http://localhost:4201
```

### Default Admin Login
```
Email: admin@example.com
Password: admin123
```

## 📁 Project Structure

```
ai-sales-agents-platform/
├── admin/              # Admin Dashboard (React + Vite)
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── pages/       # Page components
│   │   │   ├── api.ts       # API client
│   │   │   ├── store.ts     # State management
│   │   │   └── types.ts     # TypeScript types
│   │   └── main.tsx
│   └── vite.config.ts
│
├── landing/            # Landing Page (React + Vite)
│   ├── src/
│   │   ├── app/
│   │   │   ├── sections/    # Section components
│   │   │   └── app.tsx
│   │   └── main.tsx
│   └── vite.config.ts
│
├── api/                # Backend API (NestJS)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/        # Authentication
│   │   │   ├── pages/       # Pages CRUD
│   │   │   ├── sections/    # Sections CRUD
│   │   │   ├── media/       # File upload
│   │   │   └── reservations/# Booking management
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── main.ts
│   └── nest-cli.json
│
└── shared/             # Shared code (Design tokens, utilities)
    └── src/
        └── tokens.ts   # Design system tokens

```

## 🎨 Section Types

The CMS supports the following section types:

1. **HERO** - Main banner with image, title, subtitle, and CTA
2. **FEATURED_MENU** - Showcase menu items with images and prices
3. **TESTIMONIALS** - Customer reviews carousel or grid
4. **STATS** - Achievement numbers with icons
5. **GALLERY** - Image gallery grid
6. **CTA** - Call-to-action section
7. **SPECIAL_OFFERS** - Promotional offers display
8. **CONTACT_INFO** - Contact details and map
9. **RESERVATION_FORM** - Table booking form
10. **RICH_TEXT** - Custom HTML content
11. **BANNER** - Announcement banner

## 🔧 Configuration

### Database
Configure in `api/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/restaurant_cms"
JWT_SECRET="your-secret-key"
```

### Upload Directory
Media uploads stored in: `api/uploads/`

### CORS
Admin and Landing pages are pre-configured in API CORS settings.

## 📱 Live Preview Feature

The Admin Dashboard includes a powerful **Live Preview** feature:

1. Navigate to "Live Preview" in the sidebar
2. See your Landing Page in an embedded iframe
3. Switch between Desktop/Tablet/Mobile views
4. Changes auto-refresh when you save sections
5. Open in new tab for full testing

## 🎯 Usage Guide

### Creating a New Section

1. Go to **Sections** page
2. Click **Create Section**
3. Choose section type
4. Fill in the form (use Preview toggle to see live preview)
5. Click **Create Section**
6. Drag to reorder if needed

### Managing Reservations

1. Go to **Reservations** page
2. View all bookings with status filters
3. Click on a reservation to view details
4. Change status: Pending → Confirmed/Cancelled
5. Search and filter by date, name, or status

### Uploading Media

1. Go to **Media** page
2. Click **Upload Media** or drag & drop files
3. Images are automatically optimized
4. Copy URL to use in sections
5. Delete unused media to save space

## 🚢 Production Deployment

### Build for Production

```bash
# Build all apps
npm run build

# Or build individually
npm run build:admin
npm run build:landing
npm run build:api
```

### Environment Variables

**API (.env)**:
```env
NODE_ENV=production
DATABASE_URL=your_production_db_url
JWT_SECRET=strong_random_secret
PORT=4202
```

**Admin & Landing**:
Set `VITE_API_URL` in build environment or use proxy.

### Deployment Platforms

- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Backend**: Railway, Render, DigitalOcean
- **Database**: Supabase, Neon, Railway

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port (Windows)
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# Kill process on port (Mac/Linux)
lsof -ti:4200 | xargs kill -9
```

### Database Connection Error
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in `.env`
3. Run migrations: `npx prisma migrate dev`

### CORS Errors
- Check API is running on port 4202
- Verify CORS settings in `api/src/main.ts`

## 📝 License

MIT

## 👥 Support

For issues or questions:
- Check the docs above
- Review code comments
- Create an issue on GitHub

---

**Built with ❤️ for restaurants by AI Sales Agents Platform**
