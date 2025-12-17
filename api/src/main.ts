import { hostname } from 'os';
import { Hono, Context } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { PrismaClient, Prisma, User } from '@prisma/client';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { rateLimit } from './middleware';

// Type definitions
type AppContext = Context<{ Variables: { user?: User } }>;

interface UploadedFile {
  arrayBuffer?: () => Promise<ArrayBuffer>;
  buffer?: ArrayBuffer;
  type?: string;
  name?: string;
}

interface SelectedMaterial {
  id: string;
  name: string;
  price: number;
}

// Load .env from project root
function findProjectRoot(startPath: string): string {
  let currentPath = startPath;
  while (currentPath !== path.dirname(currentPath)) {
    if (fs.existsSync(path.join(currentPath, '.env')) || 
        fs.existsSync(path.join(currentPath, 'infra', 'prisma', 'schema.prisma'))) {
      return currentPath;
    }
    currentPath = path.dirname(currentPath);
  }
  return startPath;
}

const projectRoot = findProjectRoot(process.cwd());
const envPath = path.join(projectRoot, '.env');

// Force set DATABASE_URL to correct absolute path based on project root
const dbPath = path.join(projectRoot, 'infra', 'prisma', 'dev.db');
process.env.DATABASE_URL = `file:${dbPath}`;

// Load other env vars from .env file
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && match[1] !== 'DATABASE_URL') {
      // Override all except DATABASE_URL (already set above)
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  });
}

console.log('🔧 ANH THỢ XÂY API Starting...');
console.log('📁 Project root:', projectRoot);
console.log('🗄️ DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient();
const app = new Hono<{ Variables: { user?: User } }>();

// CORS
app.use('*', cors({ 
  origin: ['http://localhost:4200', 'http://localhost:4201'], 
  allowMethods: ['GET','POST','PUT','DELETE','OPTIONS'], 
  credentials: true 
}));

// Health check
app.get('/health', (c) => c.json({ ok: true, service: 'ath-api', host: hostname() }));

app.get('/', (c) => c.json({
  ok: true,
  message: 'Anh Thợ Xây API',
  endpoints: ['/health', '/auth/login', '/pages/:slug', '/service-categories', '/materials', '/leads'],
}));

// ========== AUTH HELPERS ==========
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (storedHash.startsWith('$2')) {
    return await bcrypt.compare(password, storedHash);
  }
  if (storedHash.length === 64 && /^[a-f0-9]+$/i.test(storedHash)) {
    const sha256Hash = crypto.createHash('sha256').update(password).digest('hex');
    return storedHash === sha256Hash;
  }
  return false;
}

// Attach user to context
app.use('*', async (c, next) => {
  const token = getCookie(c, 'session');
  if (token) {
    const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
    if (session && session.expiresAt > new Date()) {
      c.set('user', session.user);
    }
  }
  await next();
});

// Rate limiting (relaxed for development)
app.use('/auth/login', rateLimit({ windowMs: 1 * 60 * 1000, max: 20 })); // 20 attempts per minute
app.use('/leads', rateLimit({ windowMs: 60 * 1000, max: 30 }));
app.use('*', rateLimit({ windowMs: 60 * 1000, max: 200 }));

// ========== AUTH ROUTES ==========
app.post('/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json<{ email: string; password: string }>();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    // Auto-upgrade hash
    if (!user.passwordHash.startsWith('$2')) {
      await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(password) } });
    }
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.session.create({ data: { userId: user.id, token, expiresAt } });
    setCookie(c, 'session', token, { httpOnly: true, sameSite: 'Lax', secure: false, path: '/', expires: expiresAt });
    return c.json({ ok: true, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/auth/logout', async (c) => {
  const token = getCookie(c, 'session');
  if (token) await prisma.session.deleteMany({ where: { token } });
  deleteCookie(c, 'session', { path: '/' });
  return c.json({ ok: true });
});

app.get('/auth/me', async (c) => {
  const me = c.get('user');
  if (!me) return c.json({ error: 'Not authenticated' }, 401);
  return c.json({ id: me.id, email: me.email, role: me.role, name: me.name });
});

function requireRole(c: AppContext, roles: Array<'ADMIN' | 'MANAGER'>) {
  const me = c.get('user');
  if (!me) return { allowed: false, response: c.json({ error: 'Unauthorized' }, 401) } as const;
  // User.role is string from Prisma, check if it matches allowed roles
  if (!roles.includes(me.role as 'ADMIN' | 'MANAGER')) return { allowed: false, response: c.json({ error: 'Forbidden' }, 403) } as const;
  return { allowed: true, user: me } as const;
}

// ========== MEDIA ==========
const mediaDir = path.resolve(process.cwd(), process.env.MEDIA_DIR || '.media');
if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });

// Helper to normalize media URL - extract just the /media/xxx part
function normalizeMediaUrl(url: string | null): string | null {
  if (!url) return null;
  // Extract /media/xxx.webp from full URL or relative URL
  const match = url.match(/\/media\/[^"'\s?#]+/);
  return match ? match[0] : null;
}

// Get media usage - track where images are used (MUST be before /media/:filename)
app.get('/media/usage', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  
  try {
    // Get all media
    const allMedia = await prisma.mediaAsset.findMany();
    
    // Get materials with images - normalize URLs
    const materials = await prisma.material.findMany({
      where: { imageUrl: { not: null } },
      select: { imageUrl: true },
    });
    const materialUrls = new Set(
      materials.map(m => normalizeMediaUrl(m.imageUrl)).filter(Boolean) as string[]
    );
    
    // Get blog posts with featured images - normalize URLs
    const blogPosts = await prisma.blogPost.findMany({
      where: { featuredImage: { not: null } },
      select: { featuredImage: true },
    });
    const blogUrls = new Set(
      blogPosts.map(b => normalizeMediaUrl(b.featuredImage)).filter(Boolean) as string[]
    );
    
    // Get sections with images in data
    const sections = await prisma.section.findMany();
    const sectionUrls = new Set<string>();
    sections.forEach(s => {
      const data = s.data;
      // Search for image URLs in section data
      const urlMatches = data.match(/\/media\/[^"'\s?#]+/g) || [];
      urlMatches.forEach(url => sectionUrls.add(url));
    });
    
    // Categorize media
    const usage: Record<string, { usedIn: string[]; count: number }> = {};
    
    allMedia.forEach(media => {
      const normalizedUrl = normalizeMediaUrl(media.url);
      const usedIn: string[] = [];
      
      // Check if URL is used in materials
      if (normalizedUrl && materialUrls.has(normalizedUrl)) {
        usedIn.push('materials');
      }
      
      // Check if URL is used in blog
      if (normalizedUrl && blogUrls.has(normalizedUrl)) {
        usedIn.push('blog');
      }
      
      // Check if URL is used in sections
      if (normalizedUrl && sectionUrls.has(normalizedUrl)) {
        usedIn.push('sections');
      }
      
      usage[media.id] = { usedIn, count: usedIn.length };
    });
    
    return c.json({
      usage,
      summary: {
        total: allMedia.length,
        materials: allMedia.filter(m => usage[m.id]?.usedIn.includes('materials')).length,
        blog: allMedia.filter(m => usage[m.id]?.usedIn.includes('blog')).length,
        sections: allMedia.filter(m => usage[m.id]?.usedIn.includes('sections')).length,
        unused: allMedia.filter(m => usage[m.id]?.count === 0).length,
      },
    });
  } catch (error) {
    console.error('Media usage error:', error);
    return c.json({ error: 'Failed to get media usage' }, 500);
  }
});

app.get('/media/:filename', async (c) => {
  const filename = c.req.param('filename');
  const filePath = path.join(mediaDir, filename);
  if (!fs.existsSync(filePath)) return c.notFound();
  const buf = fs.readFileSync(filePath);
  const ext = (filename.split('.').pop() || '').toLowerCase();
  const type = ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'application/octet-stream';
  return new Response(buf, { headers: { 'Content-Type': type } });
});

app.post('/media', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  try {
    const body = await c.req.parseBody();
    const file = body.file as UploadedFile | undefined;
    if (!file) return c.json({ error: 'file missing' }, 400);
    
    let buffer: Buffer;
    if (file.arrayBuffer) buffer = Buffer.from(await file.arrayBuffer());
    else if (Buffer.isBuffer(file)) buffer = file;
    else if (file.buffer) buffer = Buffer.from(file.buffer);
    else return c.json({ error: 'Unsupported file format' }, 400);
    
    const id = crypto.randomUUID();
    const mimeType = file.type || 'application/octet-stream';
    
    if (mimeType.startsWith('image/')) {
      const optimized = await sharp(buffer).webp({ quality: 85 }).toBuffer();
      const metadata = await sharp(buffer).metadata();
      const filename = `${id}.webp`;
      fs.writeFileSync(path.join(mediaDir, filename), optimized);
      const asset = await prisma.mediaAsset.create({
        data: { id, url: `/media/${filename}`, mimeType: 'image/webp', width: metadata.width, height: metadata.height },
      });
      return c.json(asset, 201);
    }
    
    const ext = (file.name?.split('.').pop() || 'bin').toLowerCase();
    const filename = `${id}.${ext}`;
    fs.writeFileSync(path.join(mediaDir, filename), buffer);
    const asset = await prisma.mediaAsset.create({ data: { id, url: `/media/${filename}`, mimeType } });
    return c.json(asset, 201);
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Upload failed' }, 500);
  }
});

app.get('/media', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const media = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } });
  return c.json(media);
});

app.delete('/media/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return c.notFound();
  const filename = asset.url.split('/').pop() as string;
  const filePath = path.join(mediaDir, filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  await prisma.mediaAsset.delete({ where: { id } });
  return c.json({ ok: true });
});

// ========== PAGES & SECTIONS ==========
app.get('/pages', async (c) => {
  const pages = await prisma.page.findMany({ orderBy: { slug: 'asc' }, include: { _count: { select: { sections: true } } } });
  return c.json(pages);
});

app.get('/pages/:slug', async (c) => {
  const slug = c.req.param('slug');
  const page = await prisma.page.findUnique({ where: { slug }, include: { sections: { orderBy: { order: 'asc' } } } });
  if (!page) return c.notFound();
  return c.json({ ...page, sections: page.sections.map(s => ({ ...s, data: JSON.parse(s.data) })) });
});

app.post('/pages', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const { slug, title } = await c.req.json<{ slug: string; title: string }>();
  const page = await prisma.page.create({ data: { slug, title } });
  return c.json(page, 201);
});

app.put('/pages/:slug', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const slug = c.req.param('slug');
  const body = await c.req.json<{ title?: string; headerConfig?: string; footerConfig?: string }>();
  const page = await prisma.page.update({ where: { slug }, data: body });
  return c.json(page);
});

app.delete('/pages/:slug', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const slug = c.req.param('slug');
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return c.notFound();
  await prisma.section.deleteMany({ where: { pageId: page.id } });
  await prisma.page.delete({ where: { slug } });
  return c.json({ ok: true });
});

app.post('/pages/:slug/sections', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const slug = c.req.param('slug');
  const { kind, data, order } = await c.req.json<{ kind: string; data: Prisma.JsonValue; order?: number }>();
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return c.notFound();
  const max = await prisma.section.aggregate({ _max: { order: true }, where: { pageId: page.id } });
  const nextOrder = order ?? ((max._max.order ?? 0) + 1);
  const section = await prisma.section.create({ data: { pageId: page.id, kind, data: JSON.stringify(data), order: nextOrder } });
  return c.json({ ...section, data: JSON.parse(section.data) }, 201);
});

app.put('/sections/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  const body = await c.req.json<{ data?: Prisma.JsonValue; order?: number; syncAll?: boolean }>();
  
  // Update the current section
  const section = await prisma.section.update({ 
    where: { id }, 
    data: { 
      data: body.data ? JSON.stringify(body.data) : undefined, 
      order: body.order 
    } 
  });
  
  // If syncAll is true, update all sections with the same kind
  if (body.syncAll && body.data) {
    await prisma.section.updateMany({
      where: { 
        kind: section.kind,
        id: { not: id } // Exclude the current section (already updated)
      },
      data: { data: JSON.stringify(body.data) }
    });
  }
  
  return c.json({ ...section, data: JSON.parse(section.data) });
});

app.delete('/sections/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  await prisma.section.delete({ where: { id: c.req.param('id') } });
  return c.json({ ok: true });
});

// Get section by kind (for shared sections like QUOTE_FORM)
app.get('/sections/by-kind/:kind', async (c) => {
  const kind = c.req.param('kind');
  // Find the first section with this kind (most recently updated)
  const section = await prisma.section.findFirst({
    where: { kind },
    orderBy: { updatedAt: 'desc' },
  });
  if (!section) {
    return c.json({ error: 'Section not found' }, 404);
  }
  return c.json({ ...section, data: JSON.parse(section.data) });
});

// ========== ATH: SERVICE CATEGORIES ==========
app.get('/service-categories', async (c) => {
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: { 
      formula: true,
      materialCategories: { include: { materialCategory: true } },
    },
  });
  // Transform to include materialCategoryIds array
  const result = categories.map(cat => ({
    ...cat,
    materialCategoryIds: cat.materialCategories.map(mc => mc.materialCategoryId),
    allowMaterials: cat.materialCategories.length > 0,
  }));
  return c.json(result);
});

app.get('/service-categories/:id', async (c) => {
  const category = await prisma.serviceCategory.findUnique({
    where: { id: c.req.param('id') },
    include: { 
      formula: true,
      materialCategories: { include: { materialCategory: true } },
    },
  });
  if (!category) return c.notFound();
  return c.json({
    ...category,
    materialCategoryIds: category.materialCategories.map(mc => mc.materialCategoryId),
    allowMaterials: category.materialCategories.length > 0,
  });
});

app.post('/service-categories', async (c) => {
  const guard = requireRole(c, ['ADMIN']);
  if (!guard.allowed) return guard.response;
  const body = await c.req.json<{ name: string; description?: string; icon?: string; coefficient?: number; formulaId?: string; order?: number; isActive?: boolean; materialCategoryIds?: string[] }>();
  const { materialCategoryIds, ...categoryData } = body;
  const slug = body.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const category = await prisma.serviceCategory.create({ 
    data: { ...categoryData, slug },
    include: { formula: true },
  });
  
  // Create material category relations
  if (materialCategoryIds && materialCategoryIds.length > 0) {
    await prisma.serviceCategoryMaterialCategory.createMany({
      data: materialCategoryIds.map(mcId => ({
        serviceCategoryId: category.id,
        materialCategoryId: mcId,
      })),
    });
  }
  
  return c.json({ ...category, materialCategoryIds: materialCategoryIds || [], allowMaterials: (materialCategoryIds?.length || 0) > 0 }, 201);
});

app.put('/service-categories/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  const body = await c.req.json<{ name?: string; description?: string; icon?: string; coefficient?: number; formulaId?: string; order?: number; isActive?: boolean; materialCategoryIds?: string[] }>();
  const { materialCategoryIds, ...categoryData } = body;
  
  // Update slug if name changed
  if (categoryData.name) {
    (categoryData as Record<string, unknown>).slug = categoryData.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  
  const category = await prisma.serviceCategory.update({ 
    where: { id }, 
    data: categoryData,
    include: { formula: true },
  });
  
  // Update material category relations if provided
  if (materialCategoryIds !== undefined) {
    // Delete existing relations
    await prisma.serviceCategoryMaterialCategory.deleteMany({ where: { serviceCategoryId: id } });
    // Create new relations
    if (materialCategoryIds.length > 0) {
      await prisma.serviceCategoryMaterialCategory.createMany({
        data: materialCategoryIds.map(mcId => ({
          serviceCategoryId: id,
          materialCategoryId: mcId,
        })),
      });
    }
  }
  
  return c.json({ ...category, materialCategoryIds: materialCategoryIds || [], allowMaterials: (materialCategoryIds?.length || 0) > 0 });
});

app.delete('/service-categories/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  // Delete relations first
  await prisma.serviceCategoryMaterialCategory.deleteMany({ where: { serviceCategoryId: id } });
  await prisma.serviceCategory.delete({ where: { id } });
  return c.json({ ok: true });
});

// ========== ATH: UNIT PRICES ==========
app.get('/unit-prices', async (c) => {
  const prices = await prisma.unitPrice.findMany({ where: { isActive: true }, orderBy: { category: 'asc' } });
  return c.json(prices);
});

app.post('/unit-prices', async (c) => {
  const guard = requireRole(c, ['ADMIN']);
  if (!guard.allowed) return guard.response;
  const body = await c.req.json();
  const price = await prisma.unitPrice.create({ data: body });
  return c.json(price, 201);
});

app.put('/unit-prices/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN']);
  if (!guard.allowed) return guard.response;
  const body = await c.req.json();
  const price = await prisma.unitPrice.update({ where: { id: c.req.param('id') }, data: body });
  return c.json(price);
});

app.delete('/unit-prices/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN']);
  if (!guard.allowed) return guard.response;
  await prisma.unitPrice.delete({ where: { id: c.req.param('id') } });
  return c.json({ ok: true });
});

// ========== ATH: MATERIAL CATEGORIES ==========
app.get('/material-categories', async (c) => {
  const categories = await prisma.materialCategory.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: { _count: { select: { materials: true } } },
  });
  return c.json(categories);
});

app.get('/material-categories/:id', async (c) => {
  const category = await prisma.materialCategory.findUnique({
    where: { id: c.req.param('id') },
    include: { materials: true },
  });
  if (!category) return c.notFound();
  return c.json(category);
});

app.post('/material-categories', async (c) => {
  const guard = requireRole(c, ['ADMIN']);
  if (!guard.allowed) return guard.response;
  const body = await c.req.json<{ name: string; description?: string; icon?: string; order?: number }>();
  const slug = body.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const category = await prisma.materialCategory.create({ data: { ...body, slug } });
  return c.json(category, 201);
});

app.put('/material-categories/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN']);
  if (!guard.allowed) return guard.response;
  const body = await c.req.json<{ name?: string; description?: string; icon?: string; order?: number; isActive?: boolean }>();
  const updateData: Record<string, unknown> = { ...body };
  if (body.name) {
    updateData.slug = body.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  const category = await prisma.materialCategory.update({ where: { id: c.req.param('id') }, data: updateData });
  return c.json(category);
});

app.delete('/material-categories/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN']);
  if (!guard.allowed) return guard.response;
  // Check if category has materials
  const count = await prisma.material.count({ where: { categoryId: c.req.param('id') } });
  if (count > 0) {
    return c.json({ error: 'Không thể xóa danh mục đang có vật dụng' }, 400);
  }
  await prisma.materialCategory.delete({ where: { id: c.req.param('id') } });
  return c.json({ ok: true });
});

// ========== ATH: MATERIALS ==========
app.get('/materials', async (c) => {
  const categoryId = c.req.query('categoryId');
  const materials = await prisma.material.findMany({
    where: { isActive: true, ...(categoryId ? { categoryId } : {}) },
    orderBy: [{ order: 'asc' }],
    include: { category: true },
  });
  return c.json(materials);
});

app.post('/materials', async (c) => {
  const guard = requireRole(c, ['ADMIN']);
  if (!guard.allowed) return guard.response;
  const body = await c.req.json();
  const material = await prisma.material.create({ data: body, include: { category: true } });
  return c.json(material, 201);
});

app.put('/materials/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN']);
  if (!guard.allowed) return guard.response;
  const body = await c.req.json();
  const material = await prisma.material.update({ where: { id: c.req.param('id') }, data: body, include: { category: true } });
  return c.json(material);
});

app.delete('/materials/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN']);
  if (!guard.allowed) return guard.response;
  await prisma.material.delete({ where: { id: c.req.param('id') } });
  return c.json({ ok: true });
});

// ========== ATH: FORMULAS ==========
app.get('/formulas', async (c) => {
  const guard = requireRole(c, ['ADMIN']);
  if (!guard.allowed) return guard.response;
  const formulas = await prisma.formula.findMany({ where: { isActive: true } });
  return c.json(formulas);
});

app.post('/formulas', async (c) => {
  const guard = requireRole(c, ['ADMIN']);
  if (!guard.allowed) return guard.response;
  const body = await c.req.json();
  const formula = await prisma.formula.create({ data: body });
  return c.json(formula, 201);
});

app.put('/formulas/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN']);
  if (!guard.allowed) return guard.response;
  const body = await c.req.json();
  const formula = await prisma.formula.update({ where: { id: c.req.param('id') }, data: body });
  return c.json(formula);
});

// ========== ATH: CUSTOMER LEADS ==========
app.get('/leads', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const leads = await prisma.customerLead.findMany({ orderBy: { createdAt: 'desc' } });
  return c.json(leads);
});

app.post('/leads', async (c) => {
  // Public endpoint - anyone can submit
  try {
    const body = await c.req.json<{ name: string; phone: string; email?: string; content: string; source?: string; quoteData?: string }>();
    const lead = await prisma.customerLead.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        content: body.content,
        source: body.source || 'CONTACT_FORM',
        quoteData: body.quoteData,
      },
    });
    return c.json(lead, 201);
  } catch (error) {
    console.error('Lead creation error:', error);
    return c.json({ error: 'Failed to create lead' }, 500);
  }
});

app.put('/leads/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const body = await c.req.json<{ status?: string; notes?: string }>();
  const lead = await prisma.customerLead.update({ where: { id: c.req.param('id') }, data: body });
  return c.json(lead);
});

app.delete('/leads/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  await prisma.customerLead.delete({ where: { id: c.req.param('id') } });
  return c.json({ ok: true });
});


// ========== BLOG ==========
app.get('/blog/categories', async (c) => {
  const categories = await prisma.blogCategory.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { posts: true } } } });
  return c.json(categories);
});

app.post('/blog/categories', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const body = await c.req.json();
  const category = await prisma.blogCategory.create({ data: body });
  return c.json(category, 201);
});

app.put('/blog/categories/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const body = await c.req.json();
  const category = await prisma.blogCategory.update({ where: { id: c.req.param('id') }, data: body });
  return c.json(category);
});

app.delete('/blog/categories/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  await prisma.blogCategory.delete({ where: { id: c.req.param('id') } });
  return c.json({ ok: true });
});

app.get('/blog/posts', async (c) => {
  const status = c.req.query('status');
  const categoryId = c.req.query('categoryId');
  const where: Prisma.BlogPostWhereInput = {};
  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;
  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { category: true, author: { select: { name: true } }, _count: { select: { comments: true } } },
  });
  return c.json(posts);
});

app.get('/blog/posts/:slug', async (c) => {
  const slug = c.req.param('slug');
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { 
      category: true, 
      author: { select: { name: true, email: true } }, 
      comments: { where: { status: 'APPROVED' } },
      _count: { select: { comments: true } },
    },
  });
  if (!post) return c.notFound();
  return c.json(post);
});

app.post('/blog/posts', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const body = await c.req.json();
  const post = await prisma.blogPost.create({ data: { ...body, authorId: guard.user.id } });
  return c.json(post, 201);
});

app.put('/blog/posts/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const body = await c.req.json();
  const post = await prisma.blogPost.update({ where: { id: c.req.param('id') }, data: body });
  return c.json(post);
});

app.delete('/blog/posts/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  await prisma.blogComment.deleteMany({ where: { postId: c.req.param('id') } });
  await prisma.blogPost.delete({ where: { id: c.req.param('id') } });
  return c.json({ ok: true });
});

// ========== SETTINGS ==========
app.get('/settings', async (c) => {
  const settings = await prisma.settings.findMany();
  const result: Record<string, Prisma.JsonValue> = {};
  settings.forEach(s => { result[s.key] = JSON.parse(s.value) as Prisma.JsonValue; });
  return c.json(result);
});

app.get('/settings/:key', async (c) => {
  const setting = await prisma.settings.findUnique({ where: { key: c.req.param('key') } });
  if (!setting) return c.notFound();
  return c.json(JSON.parse(setting.value));
});

app.put('/settings/:key', async (c) => {
  const guard = requireRole(c, ['ADMIN']);
  if (!guard.allowed) return guard.response;
  const key = c.req.param('key');
  const body = await c.req.json();
  const setting = await prisma.settings.upsert({
    where: { key },
    update: { value: JSON.stringify(body) },
    create: { key, value: JSON.stringify(body) },
  });
  return c.json(JSON.parse(setting.value));
});

// ========== QUOTE CALCULATION ==========
app.post('/calculate-quote', async (c) => {
  try {
    const { categoryId, area, materialIds } = await c.req.json<{ categoryId: string; area: number; materialIds?: string[] }>();
    
    // Get category with formula
    const category = await prisma.serviceCategory.findUnique({
      where: { id: categoryId },
      include: { formula: true, materialCategories: true },
    });
    if (!category) return c.json({ error: 'Category not found' }, 404);
    const allowMaterials = category.materialCategories.length > 0;
    
    // Get unit prices
    const unitPrices = await prisma.unitPrice.findMany({ where: { isActive: true } });
    const priceMap: Record<string, number> = {};
    unitPrices.forEach(p => { priceMap[p.tag] = p.price; });
    priceMap['DIEN_TICH'] = area;
    
    // Calculate base price from formula
    let basePrice = 0;
    if (category.formula) {
      // Simple expression evaluation (e.g., "DIEN_TICH * DON_GIA_SON")
      const expr = category.formula.expression;
      const tokens = expr.split(/\s*([+\-*/])\s*/);
      let result = 0;
      let operator = '+';
      for (const token of tokens) {
        if (['+', '-', '*', '/'].includes(token)) {
          operator = token;
        } else {
          const value = priceMap[token] || parseFloat(token) || 0;
          switch (operator) {
            case '+': result += value; break;
            case '-': result -= value; break;
            case '*': result *= value; break;
            case '/': result = value !== 0 ? result / value : result; break;
          }
        }
      }
      basePrice = result;
    }
    
    // Apply coefficient
    const priceWithCoefficient = basePrice * category.coefficient;
    
    // Add materials
    let materialsTotal = 0;
    const selectedMaterials: SelectedMaterial[] = [];
    if (materialIds && materialIds.length > 0 && allowMaterials) {
      const materials = await prisma.material.findMany({ where: { id: { in: materialIds } } });
      materials.forEach(m => {
        materialsTotal += m.price;
        selectedMaterials.push({ id: m.id, name: m.name, price: m.price });
      });
    }
    
    const total = priceWithCoefficient + materialsTotal;
    
    return c.json({
      category: { id: category.id, name: category.name, coefficient: category.coefficient },
      area,
      basePrice,
      priceWithCoefficient,
      materials: selectedMaterials,
      materialsTotal,
      total,
    });
  } catch (error) {
    console.error('Quote calculation error:', error);
    return c.json({ error: 'Calculation failed' }, 500);
  }
});

// ========== START SERVER ==========
const port = parseInt(process.env.PORT || '4202', 10);
console.log(`🚀 Starting server on port ${port}...`);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`✅ ANH THỢ XÂY API running at http://localhost:${info.port}`);
});

export default app;
