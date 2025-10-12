import { hostname } from 'os';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { PrismaClient, User } from '@prisma/client';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Load .env from project root (traverse up to find it)
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
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  });
}

console.log('🔧 API Starting...');
console.log('📁 Working directory:', process.cwd());
console.log('📂 Project root:', projectRoot);
console.log('📄 .env path:', envPath);
console.log('🗄️  DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient();
const app = new Hono<{ Variables: { user?: User } }>();
app.use('*', cors({ origin: ['http://localhost:4200', 'http://localhost:4201', 'http://localhost:4203'], allowMethods: ['GET','POST','PUT','DELETE','OPTIONS'], credentials: true }));

app.get('/health', (c) => c.json({ ok: true, service: 'api', host: hostname() }));
// Helpful root route for manual browser check
app.get('/', (c) =>
  c.json({
    ok: true,
    message: 'Restaurant Platform API',
    endpoints: ['/health', '/auth/login', '/auth/me', '/pages/:slug'],
  })
);

// Secure password hashing with bcrypt
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password against hash (supports both bcrypt and legacy SHA-256 for migration)
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // Check if it's a bcrypt hash (starts with $2a$, $2b$, or $2y$)
  if (storedHash.startsWith('$2')) {
    return await bcrypt.compare(password, storedHash);
  }
  // Legacy SHA-256 support (64 characters hex) - for backward compatibility
  if (storedHash.length === 64 && /^[a-f0-9]+$/i.test(storedHash)) {
    const sha256Hash = crypto.createHash('sha256').update(password).digest('hex');
    return storedHash === sha256Hash;
  }
  return false;
}

// Attach current user to context if session cookie present
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

// Auth endpoints
app.post('/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json<{ email: string; password: string }>();
    if (!email || !password) return c.json({ error: 'Missing credentials' }, 400);
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Auto-upgrade legacy SHA-256 hash to bcrypt on successful login
    if (!user.passwordHash.startsWith('$2')) {
      const newHash = await hashPassword(password);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash }
      });
    }

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
    await prisma.session.create({ data: { userId: user.id, token, expiresAt } });
    setCookie(c, 'session', token, { httpOnly: true, sameSite: 'Lax', secure: false, path: '/', expires: expiresAt });
    return c.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/auth/logout', async (c) => {
  const token = getCookie(c, 'session');
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  deleteCookie(c, 'session', { path: '/' });
  return c.json({ ok: true });
});

app.get('/auth/me', async (c) => {
  const me = c.get('user');
  if (!me) return c.json({ error: 'Not authenticated' }, 401);
  return c.json({ id: me.id, email: me.email, role: me.role });
});

function requireAuth(c: typeof app extends Hono<infer E> ? E['Variables'] extends object ? { get: (k: keyof E['Variables']) => E['Variables'][keyof E['Variables']] } & unknown : any : any) {
  const me = (c as any).get('user') as User | undefined;
  if (!me) {
    return { allowed: false, response: (c as any).json({ error: 'Unauthorized' }, 401) } as const;
  }
  return { allowed: true, user: me } as const;
}

function requireRole(c: any, roles: Array<'ADMIN' | 'MANAGER' | 'VIEWER'>) {
  const me = (c as any).get('user') as User | undefined;
  if (!me) return { allowed: false, response: (c as any).json({ error: 'Unauthorized' }, 401) } as const;
  if (!roles.includes(me.role as any)) return { allowed: false, response: (c as any).json({ error: 'Forbidden' }, 403) } as const;
  return { allowed: true, user: me } as const;
}

// Media endpoints (local disk adapter)
const mediaDir = path.resolve(process.cwd(), process.env.MEDIA_DIR || '.media');
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

// Logo-specific directory
const logoDir = path.join(mediaDir, 'logos');
if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true });
}

app.post('/media', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  
  try {
    const body = await c.req.parseBody();
    const file = body.file as any;
    
    if (!file) return c.json({ error: 'file missing' }, 400);
    
    console.log('📤 Upload received:', {
      type: typeof file,
      name: file?.name,
      size: file?.size,
      mimeType: file?.type,
      keys: Object.keys(file || {}),
    });
    
    // Handle different file types (Blob, File, or buffer-like objects)
    let buffer: Buffer;
    
    // Method 1: Try arrayBuffer (works with Blob/File in browser context)
    if (file.arrayBuffer && typeof file.arrayBuffer === 'function') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } catch (e) {
        console.error('arrayBuffer method failed:', e);
        throw new Error('Failed to read file via arrayBuffer');
      }
    } 
    // Method 2: Already a Buffer
    else if (Buffer.isBuffer(file)) {
      buffer = file;
    } 
    // Method 3: Uint8Array
    else if (file instanceof Uint8Array) {
      buffer = Buffer.from(file);
    }
    // Method 4: Has text() method - might be a Hono File wrapper
    else if (file.text && typeof file.text === 'function') {
      try {
        const text = await file.text();
        buffer = Buffer.from(text, 'binary');
      } catch (e) {
        console.error('text() method failed:', e);
        throw new Error('Failed to read file via text()');
      }
    }
    // Method 5: Direct buffer property (some multipart parsers)
    else if (file.buffer) {
      buffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
    }
    // Method 6: Has size and type - might be FormData file
    else if (file.size && file.type) {
      // Try to convert to Buffer directly
      try {
        // Check if it's already array-like
        if (file.length !== undefined) {
          buffer = Buffer.from(file);
        } else {
          throw new Error('Unknown file format - no conversion method available');
        }
      } catch (e) {
        console.error('Direct conversion failed:', e);
        throw new Error('Failed to convert file to buffer');
      }
    }
    else {
      console.error('Unknown file type:', typeof file, Object.keys(file || {}));
      throw new Error('Unsupported file format');
    }
    
    const id = crypto.randomUUID();
    const ext = (file.name?.split('.').pop() || file.type?.split('/')[1] || 'bin').toLowerCase();
    const filename = `${id}.${ext}`;
    const filePath = path.join(mediaDir, filename);
    fs.writeFileSync(filePath, buffer);
    const url = `/media/${filename}`;
    
    const asset = await prisma.mediaAsset.create({
      data: {
        id,
        url,
        alt: null,
        mimeType: file.type || 'application/octet-stream',
        width: null,
        height: null,
      },
    });
    
    return c.json(asset, 201);
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Upload failed', details: error instanceof Error ? error.message : String(error) }, 500);
  }
});

app.delete('/media/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return c.notFound();
  // asset.url is like /media/<filename>
  const filename = asset.url.split('/').pop() as string;
  const filePath = path.join(mediaDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  await prisma.mediaAsset.delete({ where: { id } });
  return c.json({ ok: true });
});

// List all media assets
app.get('/media', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  
  const media = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: 'desc' },
  });
  
  return c.json(media);
});

// Update media metadata (alt text, caption)
app.put('/media/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  const body = await c.req.json<{ 
    alt?: string; 
    caption?: string;
    isGalleryImage?: boolean;
    isFeatured?: boolean;
    displayOrder?: number;
    tags?: string;
  }>();
  
  const asset = await prisma.mediaAsset.update({
    where: { id },
    data: {
      alt: body.alt,
      caption: body.caption,
      isGalleryImage: body.isGalleryImage,
      isFeatured: body.isFeatured,
      displayOrder: body.displayOrder,
      tags: body.tags,
    },
  });
  
  return c.json(asset);
});

// Public Gallery API - returns only gallery images
app.get('/gallery', async (c) => {
  const gallery = await prisma.mediaAsset.findMany({
    where: { isGalleryImage: true },
    orderBy: [
      { isFeatured: 'desc' },
      { displayOrder: 'asc' },
      { createdAt: 'desc' },
    ],
  });
  
  return c.json(gallery);
});

// Serve media files
app.get('/media/:filename', async (c) => {
  const filename = c.req.param('filename');
  const filePath = path.join(mediaDir, filename);
  if (!fs.existsSync(filePath)) return c.notFound();
  const buf = fs.readFileSync(filePath);
  // naive content-type by extension
  const ext = (filename.split('.').pop() || '').toLowerCase();
  const type = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : 'application/octet-stream';
  return new Response(buf, { headers: { 'Content-Type': type } });
});

// Serve logo files
app.get('/media/logos/:filename', async (c) => {
  const filename = c.req.param('filename');
  const filePath = path.join(logoDir, filename);
  if (!fs.existsSync(filePath)) return c.notFound();
  const buf = fs.readFileSync(filePath);
  const ext = (filename.split('.').pop() || '').toLowerCase();
  const type = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'application/octet-stream';
  return new Response(buf, { headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000' } });
});

// Upload logo with automatic resize and optimization
app.post('/media/logo', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  
  try {
    const body = await c.req.parseBody();
    const file = body.file as any;
    
    if (!file) return c.json({ error: 'file missing' }, 400);
    
    // Validate it's an image
    const mimeType = file.type || '';
    if (!mimeType.startsWith('image/')) {
      return c.json({ error: 'Only image files are allowed for logo' }, 400);
    }
    
    // Get buffer
    let buffer: Buffer;
    if (file.arrayBuffer && typeof file.arrayBuffer === 'function') {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else if (Buffer.isBuffer(file)) {
      buffer = file;
    } else if (file.buffer) {
      buffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
    } else {
      return c.json({ error: 'Could not read file buffer' }, 400);
    }
    
    // Process with sharp - create multiple sizes for different use cases
    const id = crypto.randomUUID();
    
    // Original optimized version (max 800px wide for header)
    const originalBuffer = await sharp(buffer)
      .resize(800, null, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .webp({ quality: 90 })
      .toBuffer();
      
    // Thumbnail version (200px for admin preview)
    const thumbnailBuffer = await sharp(buffer)
      .resize(200, 200, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .webp({ quality: 80 })
      .toBuffer();
    
    // Favicon version (64px square)
    const faviconBuffer = await sharp(buffer)
      .resize(64, 64, { 
        fit: 'cover' 
      })
      .webp({ quality: 80 })
      .toBuffer();
    
    // Save all versions
    const originalFilename = `${id}.webp`;
    const thumbnailFilename = `${id}-thumb.webp`;
    const faviconFilename = `${id}-favicon.webp`;
    
    fs.writeFileSync(path.join(logoDir, originalFilename), originalBuffer);
    fs.writeFileSync(path.join(logoDir, thumbnailFilename), thumbnailBuffer);
    fs.writeFileSync(path.join(logoDir, faviconFilename), faviconBuffer);
    
    // Get image dimensions
    const metadata = await sharp(buffer).metadata();
    
    const asset = await prisma.mediaAsset.create({
      data: {
        id,
        url: `/media/logos/${originalFilename}`,
        alt: 'Brand Logo',
        mimeType: 'image/webp',
        width: metadata.width || null,
        height: metadata.height || null,
      },
    });
    
    return c.json({
      ...asset,
      thumbnailUrl: `/media/logos/${thumbnailFilename}`,
      faviconUrl: `/media/logos/${faviconFilename}`,
    }, 201);
    
  } catch (error) {
    console.error('Logo upload error:', error);
    return c.json({ 
      error: 'Logo upload failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});

// Delete logo (removes all versions)
app.delete('/media/logo/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return c.notFound();
  
  // Delete all logo versions
  const baseFilename = asset.url.split('/').pop()?.replace('.webp', '') || id;
  ['.webp', '-thumb.webp', '-favicon.webp'].forEach(suffix => {
    const filePath = path.join(logoDir, `${baseFilename}${suffix}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
  
  await prisma.mediaAsset.delete({ where: { id } });
  return c.json({ ok: true });
});

// GET /pages - List all pages
app.get('/pages', async (c) => {
	const pages = await prisma.page.findMany({
		orderBy: { slug: 'asc' },
		include: { _count: { select: { sections: true } } }
	});
	return c.json(pages);
});

// GET /pages/:slug
app.get('/pages/:slug', async (c) => {
	const slug = c.req.param('slug');
	const page = await prisma.page.findUnique({
		where: { slug },
		include: { sections: { orderBy: { order: 'asc' } } },
	});
	if (!page) return c.notFound();
	// Parse JSON strings to objects
	const parsedPage = {
		...page,
		sections: page.sections.map(s => ({
			...s,
			data: typeof s.data === 'string' ? JSON.parse(s.data) : s.data
		}))
	};
	return c.json(parsedPage);
});

// POST /pages - Create new page
app.post('/pages', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
	const body = await c.req.json<{ slug: string; title: string }>();
	const page = await prisma.page.create({ data: { slug: body.slug, title: body.title } });
	return c.json(page, 201);
});

// PUT /pages/:slug { title?, headerConfig?, footerConfig? }
app.put('/pages/:slug', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
	const slug = c.req.param('slug');
	const body = await c.req.json<{ title?: string; headerConfig?: string; footerConfig?: string }>();
	const page = await prisma.page.update({ 
		where: { slug }, 
		data: { 
			title: body.title ?? undefined,
			headerConfig: body.headerConfig ?? undefined,
			footerConfig: body.footerConfig ?? undefined,
		} 
	});
	return c.json(page);
});

// DELETE /pages/:slug
app.delete('/pages/:slug', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
	const slug = c.req.param('slug');
	// Delete all sections first
	const page = await prisma.page.findUnique({ where: { slug } });
	if (!page) return c.notFound();
	await prisma.section.deleteMany({ where: { pageId: page.id } });
	await prisma.page.delete({ where: { slug } });
	return c.json({ ok: true });
});

// POST /pages/:slug/sections { kind, data, order? }
app.post('/pages/:slug/sections', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
	const slug = c.req.param('slug');
	const { kind, data, order } = await c.req.json<{ kind: string; data: unknown; order?: number }>();
	const page = await prisma.page.findUnique({ where: { slug } });
	if (!page) return c.notFound();
	// Compute order if not provided
	const max = await prisma.section.aggregate({ _max: { order: true }, where: { pageId: page.id } });
	const nextOrder = order ?? ((max._max.order ?? 0) + 1);
	const section = await prisma.section.create({
		data: { pageId: page.id, kind: kind as any, data: JSON.stringify(data) as any, order: nextOrder },
	});
	// Parse data back to object for response
	return c.json({ ...section, data: JSON.parse(section.data as string) }, 201);
});

// PUT /sections/:id { data?, order? }
app.put('/sections/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
	const id = c.req.param('id');
	const body = await c.req.json<{ data?: unknown; order?: number }>();
	const section = await prisma.section.update({ 
		where: { id }, 
		data: { 
			data: body.data ? JSON.stringify(body.data) as any : undefined, 
			order: body.order 
		} 
	});
	// Parse data back to object for response
	return c.json({ ...section, data: typeof section.data === 'string' ? JSON.parse(section.data) : section.data });
});

// DELETE /sections/:id
app.delete('/sections/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
	const id = c.req.param('id');
	await prisma.section.delete({ where: { id } });
	return c.json({ ok: true });
});

// DEV helper: create a sample section quickly from browser (disabled in production)
app.get('/dev/add-sample', async (c) => {
  if (process.env.NODE_ENV === 'production') return c.notFound();
  const page = await prisma.page.upsert({
    where: { slug: 'home' },
    update: {},
    create: { slug: 'home', title: 'Home' },
  });
  const max = await prisma.section.aggregate({ _max: { order: true }, where: { pageId: page.id } });
  const nextOrder = (max._max.order ?? 0) + 1;
  const section = await prisma.section.create({
    data: {
      pageId: page.id,
      kind: 'RICH_TEXT' as any,
      order: nextOrder,
      data: JSON.stringify({ html: '<p>Xin chào!</p>' }) as any,
    },
  });
  return c.json({ ok: true, section: { ...section, data: JSON.parse(section.data as string) } });
});

// Reservation endpoints
app.post('/reservations', async (c) => {
  try {
    const body = await c.req.json<{
      name: string;
      email: string;
      phone: string;
      date: string;
      time: string;
      partySize: number;
      specialRequest?: string;
    }>();

    const reservation = await prisma.reservation.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        date: new Date(body.date),
        time: body.time,
        partySize: body.partySize,
        specialRequest: body.specialRequest,
        status: 'PENDING' as any,
      },
    });

    return c.json(reservation, 201);
  } catch (error) {
    return c.json({ error: 'Invalid reservation data' }, 400);
  }
});

app.get('/reservations', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const reservations = await prisma.reservation.findMany({ orderBy: { createdAt: 'desc' } });
  return c.json(reservations);
});

app.get('/reservations/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) return c.notFound();
  return c.json(reservation);
});

app.put('/reservations/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  const body = await c.req.json<{ status?: string }>();
  const reservation = await prisma.reservation.update({
    where: { id },
    data: { status: body.status as any },
  });
  return c.json(reservation);
});

app.delete('/reservations/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  await prisma.reservation.delete({ where: { id } });
  return c.json({ ok: true });
});

// Menu Categories endpoints
app.get('/menu-categories', async (c) => {
  const categories = await prisma.menuCategory.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { items: true },
      },
    },
  });
  return c.json(categories);
});

app.post('/menu-categories', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const body = await c.req.json<{
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    order?: number;
  }>();
  
  const category = await prisma.menuCategory.create({
    data: body,
  });
  return c.json(category, 201);
});

app.put('/menu-categories/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  const body = await c.req.json();
  const category = await prisma.menuCategory.update({
    where: { id },
    data: body,
  });
  return c.json(category);
});

app.delete('/menu-categories/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  await prisma.menuCategory.delete({ where: { id } });
  return c.json({ ok: true });
});

// Menu endpoints
app.get('/menu', async (c) => {
  const menuItems = await prisma.menuItem.findMany({
    orderBy: { order: 'asc' },
    include: {
      category: true,
    },
  });
  return c.json(menuItems);
});

app.get('/menu/:id', async (c) => {
  const id = c.req.param('id');
  const item = await prisma.menuItem.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
  if (!item) return c.json({ error: 'Menu item not found' }, 404);
  return c.json(item);
});

app.post('/menu', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const body = await c.req.json<{
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    categoryId?: string;
    tags?: string[];
    isVegetarian?: boolean;
    isSpicy?: boolean;
    popular?: boolean;
    available?: boolean;
    order?: number;
  }>();
  
  // Auto-assign order if not provided
  const maxOrderItem = await prisma.menuItem.findFirst({
    orderBy: { order: 'desc' },
    select: { order: true },
  });
  const nextOrder = (maxOrderItem?.order || 0) + 1;
  
  const item = await prisma.menuItem.create({
    data: {
      name: body.name,
      description: body.description,
      price: body.price,
      imageUrl: body.imageUrl,
      categoryId: body.categoryId,
      tags: body.tags?.join(','),
      isVegetarian: body.isVegetarian || false,
      isSpicy: body.isSpicy || false,
      popular: body.popular || false,
      available: body.available !== undefined ? body.available : true,
      order: body.order || nextOrder,
    },
    include: {
      category: true,
    },
  });
  return c.json(item, 201);
});

app.put('/menu/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  const body = await c.req.json();
  const item = await prisma.menuItem.update({
    where: { id },
    data: body,
  });
  return c.json(item);
});

app.delete('/menu/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  await prisma.menuItem.delete({ where: { id } });
  return c.json({ ok: true });
});

// Bulk update menu order
app.put('/menu-bulk/reorder', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const { items } = await c.req.json<{ items: Array<{ id: string; order: number }> }>();
  
  await prisma.$transaction(
    items.map((item) =>
      prisma.menuItem.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
  );
  
  return c.json({ ok: true });
});

// Special Offers endpoints
app.get('/special-offers', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) {
    // Public endpoint - only show active offers
    const now = new Date();
    const offers = await prisma.specialOffer.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    });
    return c.json(offers);
  }
  // Admin/Manager - show all offers
  const offers = await prisma.specialOffer.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return c.json(offers);
});

app.get('/special-offers/:id', async (c) => {
  const id = c.req.param('id');
  const offer = await prisma.specialOffer.findUnique({
    where: { id },
  });
  if (!offer) return c.json({ error: 'Offer not found' }, 404);
  return c.json(offer);
});

app.post('/special-offers', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const body = await c.req.json<{
    title: string;
    description: string;
    discount?: number;
    validFrom: string;
    validUntil: string;
    imageId?: string;
    isActive?: boolean;
  }>();
  const offer = await prisma.specialOffer.create({
    data: {
      title: body.title,
      description: body.description,
      discount: body.discount,
      validFrom: new Date(body.validFrom),
      validUntil: new Date(body.validUntil),
      imageId: body.imageId,
      isActive: body.isActive !== undefined ? body.isActive : true,
    },
  });
  return c.json(offer, 201);
});

app.put('/special-offers/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  const body = await c.req.json<{
    title?: string;
    description?: string;
    discount?: number | null;
    validFrom?: string;
    validUntil?: string;
    imageId?: string | null;
    isActive?: boolean;
  }>();
  
  const updateData: any = {};
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.discount !== undefined) updateData.discount = body.discount;
  if (body.validFrom !== undefined) updateData.validFrom = new Date(body.validFrom);
  if (body.validUntil !== undefined) updateData.validUntil = new Date(body.validUntil);
  if (body.imageId !== undefined) updateData.imageId = body.imageId;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;
  
  const offer = await prisma.specialOffer.update({
    where: { id },
    data: updateData,
  });
  return c.json(offer);
});

app.delete('/special-offers/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  await prisma.specialOffer.delete({ where: { id } });
  return c.json({ ok: true });
});

// ========== SETTINGS ENDPOINTS ==========

// GET /settings/:key - Fetch settings by key (e.g., "restaurant", "theme", "social")
app.get('/settings/:key', async (c) => {
  const key = c.req.param('key');
  const setting = await prisma.settings.findUnique({ where: { key } });
  
  if (!setting) {
    // Return default values if not found
    return c.json({ key, value: null });
  }
  
  // Parse JSON value and return
  try {
    const parsedValue = JSON.parse(setting.value);
    return c.json({ key, value: parsedValue });
  } catch {
    return c.json({ key, value: setting.value });
  }
});

// PUT /settings/:key - Update or create settings
app.put('/settings/:key', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  
  const key = c.req.param('key');
  const body = await c.req.json<{ value: any }>();
  
  // Convert value to JSON string
  const valueString = typeof body.value === 'string' 
    ? body.value 
    : JSON.stringify(body.value);
  
  // Upsert (update or insert)
  const setting = await prisma.settings.upsert({
    where: { key },
    update: { value: valueString },
    create: { key, value: valueString },
  });
  
  return c.json({ 
    key, 
    value: JSON.parse(setting.value),
    updatedAt: setting.updatedAt,
  });
});

// GET /settings - Get all settings (admin only)
app.get('/settings', async (c) => {
  const guard = requireRole(c, ['ADMIN']);
  if (!guard.allowed) return guard.response;
  
  const settings = await prisma.settings.findMany({
    orderBy: { key: 'asc' },
  });
  
  // Parse all JSON values
  const parsed = settings.map(s => ({
    key: s.key,
    value: (() => {
      try { return JSON.parse(s.value); }
      catch { return s.value; }
    })(),
    updatedAt: s.updatedAt,
  }));
  
  return c.json(parsed);
});

// ========== BLOG ENDPOINTS ==========

// Blog Categories
app.get('/blog/categories', async (c) => {
  const categories = await prisma.blogCategory.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: 'asc' },
  });
  return c.json(categories);
});

app.get('/blog/categories/:slug', async (c) => {
  const slug = c.req.param('slug');
  const category = await prisma.blogCategory.findUnique({
    where: { slug },
    include: { 
      posts: { 
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        include: { author: { select: { name: true, email: true } } }
      }
    },
  });
  if (!category) return c.notFound();
  return c.json(category);
});

app.post('/blog/categories', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const body = await c.req.json<{
    name: string;
    slug: string;
    description?: string;
    color?: string;
  }>();
  const category = await prisma.blogCategory.create({ data: body });
  return c.json(category, 201);
});

app.put('/blog/categories/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  const body = await c.req.json();
  const category = await prisma.blogCategory.update({ where: { id }, data: body });
  return c.json(category);
});

app.delete('/blog/categories/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  await prisma.blogCategory.delete({ where: { id } });
  return c.json({ ok: true });
});

// Blog Posts
app.get('/blog/posts', async (c) => {
  const status = c.req.query('status');
  const categoryId = c.req.query('categoryId');
  const search = c.req.query('search');
  
  const where: any = {};
  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
      { content: { contains: search } },
    ];
  }

  // Public: only show published posts
  const user = c.get('user');
  if (!user) {
    where.status = 'PUBLISHED';
  }

  const posts = await prisma.blogPost.findMany({
    where,
    include: {
      category: true,
      author: { select: { name: true, email: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: 'desc' },
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
      _count: { select: { comments: true } },
      comments: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!post) return c.notFound();
  
  // Only show published posts to public
  const user = c.get('user');
  if (!user && post.status !== 'PUBLISHED') {
    return c.json({ error: 'Not found' }, 404);
  }
  
  return c.json(post);
});

app.post('/blog/posts', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const body = await c.req.json<{
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    featuredImage?: string;
    categoryId: string;
    tags?: string;
    status?: string;
  }>();
  
  const post = await prisma.blogPost.create({
    data: {
      ...body,
      authorId: guard.user.id,
      publishedAt: body.status === 'PUBLISHED' ? new Date() : null,
    },
    include: {
      category: true,
      author: { select: { name: true, email: true } },
    },
  });
  return c.json(post, 201);
});

app.put('/blog/posts/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  const body = await c.req.json();
  
  // Auto-set publishedAt when changing from DRAFT to PUBLISHED
  const currentPost = await prisma.blogPost.findUnique({ where: { id } });
  if (currentPost?.status !== 'PUBLISHED' && body.status === 'PUBLISHED' && !currentPost?.publishedAt) {
    body.publishedAt = new Date();
  }
  
  const post = await prisma.blogPost.update({
    where: { id },
    data: body,
    include: {
      category: true,
      author: { select: { name: true, email: true } },
    },
  });
  return c.json(post);
});

app.delete('/blog/posts/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  await prisma.blogPost.delete({ where: { id } });
  return c.json({ ok: true });
});

// Blog Comments (public can post, admin manages)
app.post('/blog/posts/:postId/comments', async (c) => {
  const postId = c.req.param('postId');
  const body = await c.req.json<{
    name: string;
    email: string;
    content: string;
  }>();
  
  const comment = await prisma.blogComment.create({
    data: {
      postId,
      name: body.name,
      email: body.email,
      content: body.content,
      status: 'PENDING',
    },
  });
  return c.json(comment, 201);
});

app.put('/blog/comments/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  const body = await c.req.json<{ status: string }>();
  const comment = await prisma.blogComment.update({
    where: { id },
    data: { status: body.status },
  });
  return c.json(comment);
});

app.delete('/blog/comments/:id', async (c) => {
  const guard = requireRole(c, ['ADMIN', 'MANAGER']);
  if (!guard.allowed) return guard.response;
  const id = c.req.param('id');
  await prisma.blogComment.delete({ where: { id } });
  return c.json({ ok: true });
});

const port = Number(process.env.PORT) || 4202;
serve({ fetch: app.fetch, port });
console.log(`API server listening on http://localhost:${port}`);
