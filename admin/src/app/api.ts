// API Client for Admin Dashboard - ANH THỢ XÂY
import type { 
  Page, 
  Section, 
  MediaAsset, 
  BlogCategory, 
  BlogPost,
  CustomerLead,
  ServiceCategory,
  UnitPrice,
  Material,
  Formula,
} from './types';

const API_BASE = 'http://localhost:4202';

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

interface ValidationDetail {
  field: string;
  message: string;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config: RequestInit = {
    headers,
    credentials: 'include', // Important for cookies
    method: options.method,
    cache: options.cache,
    mode: options.mode,
    redirect: options.redirect,
    referrer: options.referrer,
    referrerPolicy: options.referrerPolicy,
    signal: options.signal,
  };

  if (options.body && typeof options.body !== 'string') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    
    // Format validation errors if present
    let errorMessage = error.error || error.message || `HTTP ${response.status}: ${response.statusText}`;
    if (error.details && Array.isArray(error.details)) {
      const validationErrors = (error.details as ValidationDetail[])
        .map((detail) => `${detail.field}: ${detail.message}`)
        .join('\n');
      errorMessage = `${errorMessage}\n\nValidation Errors:\n${validationErrors}`;
    }
    
    console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, {
      status: response.status,
      statusText: response.statusText,
      error: error,
      url: url,
    });
    throw new Error(errorMessage);
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ ok: boolean; user: { id: string; email: string; role: string } }>(
      '/auth/login',
      { method: 'POST', body: { email, password } }
    ),

  logout: () =>
    apiFetch<{ ok: boolean }>('/auth/logout', { method: 'POST' }),

  me: () =>
    apiFetch<{ id: string; email: string; role: string }>('/auth/me'),
};

// Pages API
export const pagesApi = {
  list: () =>
    apiFetch<Page[]>('/pages'),

  get: (slug: string) =>
    apiFetch<Page>(`/pages/${slug}`),

  create: (data: { slug: string; title: string }) =>
    apiFetch<Page>('/pages', { method: 'POST', body: data }),

  update: (slug: string, data: { title?: string; headerConfig?: string; footerConfig?: string }) =>
    apiFetch<Page>(`/pages/${slug}`, { method: 'PUT', body: data }),

  delete: (slug: string) =>
    apiFetch<{ ok: boolean }>(`/pages/${slug}`, { method: 'DELETE' }),
};

// Sections API
export const sectionsApi = {
  create: (pageSlug: string, data: { kind: string; data: unknown; order?: number }) =>
    apiFetch<Section>(`/pages/${pageSlug}/sections`, { method: 'POST', body: data }),

  update: (id: string, data: { data?: unknown; order?: number; syncAll?: boolean }) =>
    apiFetch<Section>(`/sections/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/sections/${id}`, { method: 'DELETE' }),

  reorder: async (sections: Array<{ id: string; order: number }>) => {
    // Update each section's order
    await Promise.all(
      sections.map((section) =>
        apiFetch<Section>(`/sections/${section.id}`, {
          method: 'PUT',
          body: { order: section.order },
        })
      )
    );
    return { ok: true };
  },
};

// Media API
export const mediaApi = {
  list: () =>
    apiFetch<MediaAsset[]>('/media'),

  upload: async (formDataOrFile: FormData | File) => {
    const formData = formDataOrFile instanceof FormData ? formDataOrFile : (() => {
      const fd = new FormData();
      fd.append('file', formDataOrFile);
      return fd;
    })();

    const response = await fetch(`${API_BASE}/media`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(errorData.error || errorData.details || 'Upload failed');
    }

    return response.json() as Promise<MediaAsset>;
  },

  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/media/${id}`, { method: 'DELETE' }),
};

// ========== ATH: CUSTOMER LEADS ==========
export const leadsApi = {
  list: () =>
    apiFetch<CustomerLead[]>('/leads'),

  update: (id: string, data: { status?: string; notes?: string }) =>
    apiFetch<CustomerLead>(`/leads/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/leads/${id}`, { method: 'DELETE' }),
};

// ========== ATH: SERVICE CATEGORIES ==========
interface ServiceCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  coefficient?: number;
  allowMaterials?: boolean;
  formulaId?: string | null;
  order?: number;
  isActive?: boolean;
}

export const serviceCategoriesApi = {
  list: () =>
    apiFetch<ServiceCategory[]>('/service-categories'),

  get: (id: string) =>
    apiFetch<ServiceCategory>(`/service-categories/${id}`),

  create: (data: ServiceCategoryInput) =>
    apiFetch<ServiceCategory>('/service-categories', { method: 'POST', body: data }),

  update: (id: string, data: Partial<ServiceCategoryInput>) =>
    apiFetch<ServiceCategory>(`/service-categories/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/service-categories/${id}`, { method: 'DELETE' }),
};

// ========== ATH: UNIT PRICES ==========
interface UnitPriceInput {
  category: string;
  name: string;
  price: number;
  tag: string;
  unit: string;
  description?: string;
  isActive?: boolean;
}

export const unitPricesApi = {
  list: () =>
    apiFetch<UnitPrice[]>('/unit-prices'),

  create: (data: UnitPriceInput) =>
    apiFetch<UnitPrice>('/unit-prices', { method: 'POST', body: data }),

  update: (id: string, data: Partial<UnitPriceInput>) =>
    apiFetch<UnitPrice>(`/unit-prices/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/unit-prices/${id}`, { method: 'DELETE' }),
};

// ========== ATH: MATERIALS ==========
interface MaterialInput {
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
  description?: string;
  isActive?: boolean;
}

export const materialsApi = {
  list: () =>
    apiFetch<Material[]>('/materials'),

  create: (data: MaterialInput) =>
    apiFetch<Material>('/materials', { method: 'POST', body: data }),

  update: (id: string, data: Partial<MaterialInput>) =>
    apiFetch<Material>(`/materials/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/materials/${id}`, { method: 'DELETE' }),
};

// ========== ATH: FORMULAS ==========
interface FormulaInput {
  name: string;
  expression: string;
  description?: string;
  isActive?: boolean;
}

export const formulasApi = {
  list: () =>
    apiFetch<Formula[]>('/formulas'),

  create: (data: FormulaInput) =>
    apiFetch<Formula>('/formulas', { method: 'POST', body: data }),

  update: (id: string, data: Partial<FormulaInput>) =>
    apiFetch<Formula>(`/formulas/${id}`, { method: 'PUT', body: data }),
};

// ========== SETTINGS ==========
export const settingsApi = {
  get: (key: string) =>
    apiFetch<Record<string, unknown>>(`/settings/${key}`),

  update: (key: string, data: Record<string, unknown>) =>
    apiFetch<Record<string, unknown>>(`/settings/${key}`, { method: 'PUT', body: data }),
};

// Blog Categories API
interface BlogCategoryInput {
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export const blogCategoriesApi = {
  list: () =>
    apiFetch<BlogCategory[]>('/blog/categories'),

  get: (slug: string) =>
    apiFetch<BlogCategory>(`/blog/categories/${slug}`),

  create: (data: BlogCategoryInput) =>
    apiFetch<BlogCategory>('/blog/categories', { method: 'POST', body: data }),

  update: (id: string, data: Partial<BlogCategoryInput>) =>
    apiFetch<BlogCategory>(`/blog/categories/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/blog/categories/${id}`, { method: 'DELETE' }),
};

// Blog Posts API
interface BlogPostInput {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  categoryId: string;
  tags?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isFeatured?: boolean;
}

export const blogPostsApi = {
  list: (params?: { status?: string; categoryId?: string; search?: string }) => {
    const query = params ? new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
    ).toString() : '';
    return apiFetch<BlogPost[]>(`/blog/posts${query ? '?' + query : ''}`);
  },

  get: (slug: string) =>
    apiFetch<BlogPost>(`/blog/posts/${slug}`),

  create: (data: BlogPostInput) =>
    apiFetch<BlogPost>('/blog/posts', { method: 'POST', body: data }),

  update: (id: string, data: Partial<BlogPostInput>) =>
    apiFetch<BlogPost>(`/blog/posts/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/blog/posts/${id}`, { method: 'DELETE' }),
};

// Blog Comments API
interface BlogComment {
  id: string;
  postId: string;
  name: string;
  email: string;
  content: string;
  status: string;
  createdAt: string;
}

export const blogCommentsApi = {
  create: (postId: string, data: { name: string; email: string; content: string }) =>
    apiFetch<BlogComment>(`/blog/posts/${postId}/comments`, { method: 'POST', body: data }),

  update: (id: string, data: { status: string }) =>
    apiFetch<BlogComment>(`/blog/comments/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    apiFetch<{ ok: boolean }>(`/blog/comments/${id}`, { method: 'DELETE' }),
};
