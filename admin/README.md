# 🎛️ Admin Dashboard

> Professional Admin Dashboard for Restaurant Landing Page Management

## ✨ Features

### 🔐 Authentication & Authorization
- Secure login system with session management
- Role-based access control (ADMIN, MANAGER, VIEWER)
- Auto-logout on session expiry

### 📊 Dashboard
- Real-time statistics
- Recent reservations overview
- Quick actions panel
- System status monitoring

### 📄 Pages Management
- Edit page title and metadata
- View page statistics
- Quick navigation to sections

### 🎨 Sections Management
**Supported Section Types:**
- **Hero Section** - Main banner with CTA
- **Featured Menu** - Showcase menu items with images
- **Testimonials** - Customer reviews and ratings
- **Statistics** - Display key numbers and achievements
- **Gallery** - Image gallery with captions
- **Call to Action** - Action buttons
- **Special Offers** - Promotions and deals
- **Contact Info** - Contact details and social links
- **Reservation Form** - Booking form
- **Rich Text** - Custom HTML content
- **Banner** - Notice banners

**Features:**
- ✅ Create, edit, delete sections
- ✅ Drag & drop reordering (coming soon)
- ✅ Live preview
- ✅ Form validation
- ✅ Auto-save

### 🖼️ Media Library
- Upload images
- View all uploaded media
- Copy URL to clipboard
- Delete media files
- Organize by folders (coming soon)

### 📅 Reservations Management
- View all reservations
- Filter by status (Pending, Confirmed, Cancelled)
- Update reservation status
- View customer details
- Delete reservations

### 🎁 Special Offers
- Create promotional offers
- Set validity period
- Attach images
- Toggle active/inactive status
- Track offer performance (coming soon)

## 🚀 Getting Started

### Login Credentials

**Demo Account:**
```
Email: admin@example.com
Password: admin123
```

### Development

```bash
# Start Admin Dashboard
npm run dev:admin

# The dashboard will be available at:
# http://localhost:4201
```

### Prerequisites

Make sure the API server is running:
```bash
npm run dev:api
# API runs on http://localhost:4202
```

## 🎨 Design

### Modern UI/UX
- Dark theme optimized for long sessions
- Responsive design (mobile-friendly)
- Smooth animations with Framer Motion
- Intuitive navigation
- Accessibility-focused

### Color Scheme
- Primary: `#f5d393` (Gold)
- Accent: `#d4a574` (Bronze)
- Background: `#0b0c0f` (Dark)
- Text: `#e4e7ec` (Light Gray)

### Components
- **Layout** - Sidebar navigation with collapsible menu
- **Card** - Reusable card component with variants
- **Button** - Multiple variants (primary, secondary, danger, ghost)
- **Input** - Form inputs with validation
- **TextArea** - Multi-line text input
- **SectionEditor** - Modal editor for sections

## 📁 Project Structure

```
admin/
├── src/
│   ├── app/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Layout.tsx      # Main layout with sidebar
│   │   │   ├── Card.tsx        # Card component
│   │   │   ├── Button.tsx      # Button component
│   │   │   ├── Input.tsx       # Input & TextArea
│   │   │   ├── LoginPage.tsx   # Login screen
│   │   │   └── SectionEditor.tsx # Section editor modal
│   │   │
│   │   ├── pages/              # Main pages
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── PagesPage.tsx
│   │   │   ├── SectionsPage.tsx
│   │   │   ├── MediaPage.tsx
│   │   │   └── ReservationsPage.tsx
│   │   │
│   │   ├── api.ts              # API client
│   │   ├── store.ts            # State management
│   │   ├── types.ts            # TypeScript types
│   │   └── app.tsx             # Main app component
│   │
│   ├── styles.css              # Global styles
│   └── main.tsx                # Entry point
│
├── index.html
└── package.json
```

## 🔌 API Integration

The admin connects to the backend API for:
- Authentication (`/auth/*`)
- Pages management (`/pages/*`)
- Sections CRUD (`/sections/*`)
- Media upload/delete (`/media/*`)
- Reservations management (`/reservations/*`)
- Special offers (`/special-offers/*`)

## 🎯 Roadmap

### Phase 1 (Completed) ✅
- [x] Authentication system
- [x] Dashboard with statistics
- [x] Pages management
- [x] Sections CRUD
- [x] Media library
- [x] Reservations management

### Phase 2 (Coming Soon)
- [ ] Drag & drop section reordering
- [ ] Rich text editor for HTML content
- [ ] Image cropping/editing
- [ ] Bulk operations
- [ ] Export/import data
- [ ] Analytics dashboard
- [ ] Email notifications
- [ ] User management
- [ ] Activity logs
- [ ] Advanced search/filtering

## 🛠️ Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Framer Motion** - Animations
- **Vite** - Build tool
- **@app/shared** - Shared design tokens
- **@app/ui** - Shared UI components

## 📝 License

MIT

## 👨‍💻 Developer Notes

### Adding New Section Types

1. Add type to `types.ts`:
```typescript
export type SectionKind = 
  | 'HERO'
  | 'YOUR_NEW_TYPE';
```

2. Add form fields in `SectionEditor.tsx`:
```typescript
case 'YOUR_NEW_TYPE':
  return <YourForm />;
```

3. Add to section types list in `SectionsPage.tsx`

### State Management

Simple global state using React hooks:
- `useUser()` - Current logged-in user
- `usePage()` - Current page data

### Best Practices

- Always validate user input
- Show loading states
- Handle errors gracefully
- Provide user feedback
- Keep components small and focused
- Use TypeScript types
- Follow accessibility guidelines

---

**Built with ❤️ for Restaurant Management**

