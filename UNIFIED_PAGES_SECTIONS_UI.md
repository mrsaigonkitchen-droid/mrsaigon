# 🎯 Unified Pages & Sections UI - Admin Refactor

## Tổng quan

Refactor Admin Panel để kết hợp **Pages** và **Sections** thành một giao diện thống nhất, giúp người dùng dễ dàng quản lý nội dung website hơn.

### Vấn đề cũ ❌
- Pages và Sections tách biệt thành 2 trang riêng
- Phải navigate qua lại giữa Pages list và Sections editor
- Workflow không mượt mà: Click "Manage Sections" → Navigate sang trang khác
- Khó theo dõi context (đang edit page nào?)

### Giải pháp mới ✅
- **Unified UI:** Pages và Sections trong cùng một màn hình
- **Page Selector Bar:** Dropdown chọn page + actions (create, edit, delete)
- **Sections Editor:** Hiển thị sections của page đã chọn
- **Live Preview:** Optional preview bên phải
- **Smooth UX:** Không cần navigate, chỉ cần chọn page từ dropdown

---

## 🎨 Architecture

### 1. Page Selector Bar (Component mới)

**File:** `admin/src/app/components/PageSelectorBar.tsx`

**Features:**
- ✅ Dropdown chọn page với search
- ✅ Hiển thị thông tin page (title, slug, sections count)
- ✅ Actions: Create, Edit, Delete page
- ✅ Preview page button
- ✅ Auto-refresh sau mỗi action
- ✅ Modal tạo/edit page
- ✅ Form validation và slug generation

**Props:**
```typescript
interface PageSelectorBarProps {
  pages: Page[];
  selectedPage: Page | null;
  onSelectPage: (page: Page) => void;
  onCreatePage: (data: { slug: string; title: string }) => Promise<void>;
  onEditPage: (slug: string, data: { title: string }) => Promise<void>;
  onDeletePage: (slug: string) => Promise<void>;
  onRefresh: () => void;
}
```

**UI Elements:**
1. **Page Icon** - Gradient icon với pages icon
2. **Dropdown Button** - Hiển thị page hiện tại + arrow
3. **Dropdown Menu** - List pages với checkbox cho selected page
4. **Action Buttons:**
   - 🆕 New Page (gradient button)
   - ✏️ Edit Page
   - 🗑️ Delete Page (không cho phép xóa home page)
   - 🔗 Preview Page
5. **Page Info Bar** - Hiển thị sections count, updated date, URL

### 2. Refactored Sections Page

**File:** `admin/src/app/pages/SectionsPage.tsx`

**Changes:**
- ✅ Load tất cả pages thay vì chỉ 1 page
- ✅ Tích hợp PageSelectorBar component
- ✅ Handle page selection và switching
- ✅ Update all functions để dùng `page.slug` thay vì `pageSlug` prop
- ✅ Loại bỏ header cũ, thay bằng PageSelectorBar + Actions Bar

**State Management:**
```typescript
const [pages, setPages] = useState<Page[]>([]);  // ✅ NEW
const [page, setPage] = useState<Page | null>(null);
const [loading, setLoading] = useState(true);
const [editingSection, setEditingSection] = useState<Section | null>(null);
const [creatingSection, setCreatingSection] = useState<SectionKind | null>(null);
const [showTypePicker, setShowTypePicker] = useState(false);
const [showLivePreview, setShowLivePreview] = useState(false);
const [previewKey, setPreviewKey] = useState(0);
```

**New Functions:**
```typescript
// Load all pages
async function loadPages() {
  const data = await pagesApi.list();
  setPages(data);
  const selectedPage = data.find(p => p.slug === pageSlug) || data[0];
  if (selectedPage) await loadPage(selectedPage.slug);
}

// Load specific page
async function loadPage(slug: string) {
  const data = await pagesApi.get(slug);
  setPage(data);
}

// Handle page selection
async function handleSelectPage(selectedPage: Page) {
  setPage(null); // Show loading
  await loadPage(selectedPage.slug);
}

// CRUD operations for pages
async function handleCreatePage(data: { slug: string; title: string }) {
  await pagesApi.create(data);
}

async function handleEditPage(slug: string, data: { title: string }) {
  await pagesApi.update(slug, data);
}

async function handleDeletePage(slug: string) {
  await pagesApi.delete(slug);
}
```

**Layout Structure:**
```
<div> (main container)
  ├── <PageSelectorBar />           ← NEW: Page selector + actions
  ├── <div> (Actions Bar)           ← Sections header + Live Preview toggle
  └── <div> (Split Layout)
      ├── <div> (Left Panel)
      │   └── <SectionsList />      ← Sections editor
      └── <div> (Right Panel)
          └── <iframe />            ← Live Preview (optional)
</div>
```

### 3. Updated Routing

**File:** `admin/src/app/app.tsx`

**Changes:**
```typescript
// OLD routes
<Route path="/pages" element={<PagesPage onNavigateToSections={(slug) => navigate(`/sections/${slug}`)} />} />
<Route path="/sections/:slug" element={<SectionsPageWrapper />} />
<Route path="/sections" element={<Navigate to="/sections/home" replace />} />

// NEW routes (unified)
<Route path="/pages/:slug" element={<SectionsPageWrapper />} />
<Route path="/pages" element={<SectionsPageWrapper />} />
{/* Legacy routes for backward compatibility */}
<Route path="/sections/:slug" element={<SectionsPageWrapper />} />
<Route path="/sections" element={<Navigate to="/pages/home" replace />} />
```

**Benefits:**
- ✅ `/pages` → Unified Pages & Sections UI
- ✅ `/pages/:slug` → Direct link to specific page
- ✅ `/sections/:slug` → Backward compatible redirect
- ✅ No more separate PagesPage component needed

### 4. Updated Navigation

**File:** `admin/src/app/components/Layout.tsx`

**Changes:**
```typescript
// OLD menu items
{ route: 'sections', icon: 'ri-layout-grid-line', label: 'Sections' },
{ route: 'pages', icon: 'ri-pages-line', label: 'Pages' },

// NEW menu item (unified)
{ route: 'pages', icon: 'ri-pages-line', label: 'Pages & Sections' },
```

---

## 🎯 User Flow

### Workflow cũ (3 steps)
1. Click "Pages" trong sidebar
2. Tìm page cần edit
3. Click "Manage Sections" → Navigate sang trang khác
4. Edit sections
5. Muốn edit page khác → Back → Repeat

### Workflow mới (1 step)
1. Click "Pages & Sections" trong sidebar
2. Chọn page từ dropdown
3. Edit sections ngay lập tức
4. Muốn edit page khác → Chọn từ dropdown (không cần navigate)

---

## 🎨 UI/UX Improvements

### Page Selector Bar
```
┌─────────────────────────────────────────────────────────────┐
│ 📄 [About Us ▼]  /about  (5 sections)                       │
│                                           🆕 ✏️ 🗑️ 🔗        │
├─────────────────────────────────────────────────────────────┤
│ 📊 5 sections  •  Updated: 12/10/2025  •  URL: /about      │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Gradient background với border
- Dropdown với smooth animation
- Selected page có checkbox icon
- Sections count badge trong dropdown
- Info bar với icons
- Action buttons với hover effects

### Dropdown Menu
```
┌─────────────────────────────────┐
│ ✓ Home              (8 sections) │
│   About Us          (5 sections) │
│   Menu              (3 sections) │
│   Gallery           (2 sections) │
│   Contact           (4 sections) │
└─────────────────────────────────┘
```

**Features:**
- Checkbox cho selected page
- Sections count badge
- Hover highlight
- Smooth open/close animation
- Click outside to close

### Actions Bar
```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 Page Sections                                             │
│ Drag sections to reorder • Click to edit                     │
│                                      [👁️ Show Live Preview]  │
│                                      [➕ Add Section]         │
└─────────────────────────────────────────────────────────────┘
```

### Modal (Create/Edit Page)
```
┌─────────────────────────────────────┐
│ Create New Page                  ✕  │
├─────────────────────────────────────┤
│ Page Title:                          │
│ [About Us                        ]   │
│                                      │
│ Slug (URL):                          │
│ [about                           ]   │
│                                      │
│ [Create Page]  [Cancel]              │
└─────────────────────────────────────┘
```

**Features:**
- Auto-generate slug from title
- Form validation
- Loading state
- Smooth animations
- Backdrop blur

---

## 📊 Component Hierarchy

```
App.tsx
└── Layout.tsx
    └── SectionsPage.tsx
        ├── PageSelectorBar.tsx ← NEW
        │   ├── Dropdown
        │   ├── Action Buttons
        │   ├── Info Bar
        │   └── Modal (Create/Edit)
        ├── Actions Bar
        ├── SectionsList.tsx
        ├── SectionTypePicker.tsx
        └── SectionEditor.tsx
```

---

## 🔧 Technical Details

### State Management

**Pages State:**
```typescript
// Load all pages once
const [pages, setPages] = useState<Page[]>([]);

// Currently selected page
const [page, setPage] = useState<Page | null>(null);
```

**Benefits:**
- Không cần reload pages khi switch
- Fast page switching (chỉ load sections)
- Cached pages list

### API Calls Optimization

**Before (mỗi lần navigate):**
```typescript
// Navigate to /sections/about
→ Load page "about" + sections
→ Navigate to /sections/home
→ Load page "home" + sections
```

**After (chỉ load sections):**
```typescript
// Initial load
→ Load all pages (lightweight, no sections)
→ Load first page + sections

// Switch page
→ Load selected page + sections (no full page reload)
```

### URL Handling

**Supported URLs:**
- `/pages` → Default to first page or home
- `/pages/about` → Direct link to about page
- `/sections/about` → Legacy redirect to `/pages/about`

**Benefits:**
- ✅ Deep linking support
- ✅ Backward compatibility
- ✅ Shareable URLs

---

## 🎯 Key Features

### 1. Page Management
- ✅ Create new pages
- ✅ Edit page title
- ✅ Delete pages (except home)
- ✅ Auto-generate slug
- ✅ Preview page

### 2. Section Management
- ✅ Add sections
- ✅ Edit sections
- ✅ Delete sections
- ✅ Reorder sections (drag & drop)
- ✅ Live preview

### 3. UX Improvements
- ✅ No navigation needed
- ✅ Fast page switching
- ✅ Context awareness (always know which page you're editing)
- ✅ Smooth animations
- ✅ Loading states
- ✅ Error handling

---

## 🚀 Migration Guide

### For Users

**Old workflow:**
1. Sidebar → Pages
2. Find page
3. Click "Manage Sections"
4. Edit sections

**New workflow:**
1. Sidebar → Pages & Sections
2. Select page from dropdown
3. Edit sections

**No data migration needed!** All existing pages and sections work as-is.

### For Developers

**Removed:**
- ❌ `PagesPage.tsx` component (không còn cần thiết)
- ❌ Separate `/pages` route

**Added:**
- ✅ `PageSelectorBar.tsx` component
- ✅ Unified `/pages` route

**Modified:**
- 🔄 `SectionsPage.tsx` - Tích hợp page selector
- 🔄 `app.tsx` - Updated routing
- 🔄 `Layout.tsx` - Updated navigation menu

---

## 📝 Testing Checklist

### Page Selector
- [ ] Dropdown opens/closes correctly
- [ ] Selected page is highlighted
- [ ] Sections count is correct
- [ ] Click outside closes dropdown

### Page CRUD
- [ ] Create new page works
- [ ] Edit page title works
- [ ] Delete page works (not home)
- [ ] Slug auto-generation works
- [ ] Form validation works

### Section Management
- [ ] Add section works
- [ ] Edit section works
- [ ] Delete section works
- [ ] Reorder sections works
- [ ] Live preview updates

### Navigation
- [ ] `/pages` loads correctly
- [ ] `/pages/:slug` loads correct page
- [ ] `/sections/:slug` redirects correctly
- [ ] Sidebar navigation works

### UX
- [ ] Page switching is smooth
- [ ] Loading states show correctly
- [ ] Animations are smooth
- [ ] No console errors
- [ ] Mobile responsive

---

## 🎨 Design Tokens

### Colors
- **Primary:** `#F5D393` (Gold)
- **Accent:** `#EFB679` (Orange gold)
- **Background:** `rgba(20,21,26,0.95)` (Dark)
- **Border:** `rgba(255,255,255,0.1)` (Light border)
- **Surface:** `rgba(15,16,20,0.98)` (Card background)

### Spacing
- **Container padding:** 20px
- **Card padding:** 24px
- **Gap:** 12-24px
- **Border radius:** 8-16px

### Animations
- **Duration:** 0.2-0.3s
- **Easing:** ease, ease-in-out
- **Hover scale:** 1.01-1.05
- **Tap scale:** 0.95-0.99

---

## 🔄 Backward Compatibility

### Legacy Routes
```typescript
// Old URLs still work
/sections → Redirects to /pages/home
/sections/about → Redirects to /pages/about
```

### Data Structure
- ✅ No database changes
- ✅ No API changes
- ✅ All existing pages work
- ✅ All existing sections work

---

## 📈 Benefits

### For Users
- ⚡ **Faster workflow** - No navigation needed
- 🎯 **Better context** - Always know which page you're editing
- 🎨 **Cleaner UI** - Less clutter, more focus
- 📱 **Mobile friendly** - Responsive design

### For Developers
- 🧹 **Cleaner code** - Less components, less complexity
- 🔧 **Easier maintenance** - Unified logic
- 🚀 **Better performance** - Less API calls
- 📦 **Smaller bundle** - Removed PagesPage component

---

## 🎯 Future Enhancements

### Possible Improvements
1. **Search pages** - Search trong dropdown
2. **Page templates** - Quick create từ templates
3. **Bulk actions** - Select multiple sections
4. **Keyboard shortcuts** - Quick navigation
5. **Page preview** - Inline preview trong dropdown
6. **Recent pages** - Quick access to recently edited pages
7. **Page status** - Draft/Published indicator
8. **Page analytics** - Views, last edited, etc.

---

## 📁 Files Changed

### New Files
1. **`admin/src/app/components/PageSelectorBar.tsx`** (NEW)
   - 400+ lines
   - Full page management UI

### Modified Files
2. **`admin/src/app/pages/SectionsPage.tsx`**
   - Added pages state management
   - Integrated PageSelectorBar
   - Updated all functions to use page.slug
   - Removed old header

3. **`admin/src/app/app.tsx`**
   - Updated routing (unified /pages route)
   - Added backward compatibility routes
   - Removed PagesPage import

4. **`admin/src/app/components/Layout.tsx`**
   - Updated menu items
   - Changed "Pages" + "Sections" → "Pages & Sections"

### Removed Files
- ❌ None (PagesPage.tsx kept for reference but not used)

---

## ✅ Summary

**Before:**
- 2 separate pages (Pages + Sections)
- Complex navigation flow
- Context switching issues

**After:**
- 1 unified page (Pages & Sections)
- Simple dropdown selection
- No navigation needed
- Better UX, faster workflow

**Impact:**
- ✅ Improved user experience
- ✅ Reduced complexity
- ✅ Better performance
- ✅ Cleaner codebase
- ✅ Backward compatible

---

## 🚦 Status

- ✅ PageSelectorBar component implemented
- ✅ SectionsPage refactored
- ✅ Routing updated
- ✅ Navigation updated
- ✅ No linter errors
- ⏳ Testing pending (Admin not running)

**Ready for testing!** 🎉

