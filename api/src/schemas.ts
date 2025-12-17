import { z } from 'zod';

// ========== AUTH SCHEMAS ==========
export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

// ========== PAGE SCHEMAS ==========
export const createPageSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang').min(1).max(100),
  title: z.string().min(1, 'Tiêu đề không được trống').max(200),
});

export const updatePageSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  headerConfig: z.string().optional(),
  footerConfig: z.string().optional(),
});

// ========== SECTION SCHEMAS ==========
export const createSectionSchema = z.object({
  kind: z.enum([
    'HERO', 'HERO_SIMPLE', 'TESTIMONIALS', 'CTA', 'RICH_TEXT', 'BANNER', 
    'STATS', 'CONTACT_INFO', 'FEATURED_BLOG_POSTS', 'SOCIAL_MEDIA', 
    'FEATURES', 'MISSION_VISION', 'FAB_ACTIONS', 'FOOTER_SOCIAL', 
    'QUICK_CONTACT', 'CORE_VALUES', 'SERVICES', 'QUOTE_FORM', 'ABOUT'
  ]),
  data: z.record(z.string(), z.any()),
  order: z.number().int().min(0).optional(),
});

export const updateSectionSchema = z.object({
  data: z.record(z.string(), z.any()).optional(),
  order: z.number().int().min(0).optional(),
});

// ========== ATH: SERVICE CATEGORY SCHEMAS ==========
export const createServiceCategorySchema = z.object({
  name: z.string().min(1, 'Tên hạng mục không được trống').max(100),
  description: z.string().max(500).optional(),
  coefficient: z.number().positive('Hệ số phải lớn hơn 0').default(1.0),
  allowMaterials: z.boolean().default(false),
  formulaId: z.string().optional(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateServiceCategorySchema = createServiceCategorySchema.partial();

// ========== ATH: UNIT PRICE SCHEMAS ==========
export const createUnitPriceSchema = z.object({
  category: z.string().min(1, 'Thể loại không được trống').max(50),
  name: z.string().min(1, 'Tên đơn giá không được trống').max(100),
  price: z.number().nonnegative('Giá không được âm'),
  tag: z.string().regex(/^[A-Z0-9_]+$/, 'Tag chỉ chứa chữ in hoa, số và dấu gạch dưới').max(50),
  unit: z.string().min(1).max(20),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
});

export const updateUnitPriceSchema = createUnitPriceSchema.partial();

// ========== ATH: MATERIAL SCHEMAS ==========
export const createMaterialSchema = z.object({
  name: z.string().min(1, 'Tên vật dụng không được trống').max(100),
  category: z.string().min(1, 'Danh mục không được trống').max(50),
  imageUrl: z.string().url('URL hình ảnh không hợp lệ').optional().or(z.literal('')),
  price: z.number().nonnegative('Giá không được âm'),
  description: z.string().max(500).optional(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateMaterialSchema = createMaterialSchema.partial();

// ========== ATH: FORMULA SCHEMAS ==========
export const createFormulaSchema = z.object({
  name: z.string().min(1, 'Tên công thức không được trống').max(100),
  expression: z.string().min(1, 'Biểu thức không được trống').max(500),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
});

export const updateFormulaSchema = createFormulaSchema.partial();

// ========== ATH: CUSTOMER LEAD SCHEMAS ==========
export const createLeadSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(100),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ').min(10),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  content: z.string().min(10, 'Nội dung tối thiểu 10 ký tự').max(2000),
  source: z.enum(['QUOTE_FORM', 'CONTACT_FORM']).default('CONTACT_FORM'),
  quoteData: z.string().optional(), // JSON string of quote calculation
});

export const updateLeadSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'CONVERTED', 'CANCELLED']).optional(),
  notes: z.string().max(2000).optional(),
});

// ========== ATH: QUOTE CALCULATION SCHEMA ==========
export const calculateQuoteSchema = z.object({
  categoryId: z.string().min(1, 'Chọn hạng mục'),
  area: z.number().positive('Diện tích phải lớn hơn 0'),
  materialIds: z.array(z.string()).optional(),
});

// ========== BLOG SCHEMAS ==========
export const createBlogCategorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được trống').max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Mã màu không hợp lệ').optional(),
});

export const createBlogPostSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được trống').max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, 'Nội dung không được trống'),
  featuredImage: z.string().url('URL hình ảnh không hợp lệ').optional().or(z.literal('')),
  categoryId: z.string().min(1, 'Chọn danh mục'),
  tags: z.string().max(200).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
});

export const createBlogCommentSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(100),
  email: z.string().email('Email không hợp lệ'),
  content: z.string().min(10, 'Bình luận tối thiểu 10 ký tự').max(1000),
});

// ========== MEDIA SCHEMAS ==========
export const updateMediaSchema = z.object({
  alt: z.string().max(200).optional(),
  caption: z.string().max(500).optional(),
  tags: z.string().max(200).optional(),
});

// ========== SETTINGS SCHEMAS ==========
export const updateSettingsSchema = z.object({
  value: z.any(),
});

// ========== TYPE EXPORTS ==========
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type CreateServiceCategoryInput = z.infer<typeof createServiceCategorySchema>;
export type CreateUnitPriceInput = z.infer<typeof createUnitPriceSchema>;
export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type CreateFormulaInput = z.infer<typeof createFormulaSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type CalculateQuoteInput = z.infer<typeof calculateQuoteSchema>;
export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
