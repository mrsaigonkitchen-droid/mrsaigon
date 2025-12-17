---
inclusion: fileMatch
fileMatchPattern: "api/**/*.ts"
---

# 🔌 API Development Patterns

## File Structure
```
api/src/
├── main.ts          # Entry point, routes
├── middleware.ts    # Auth, validation middleware
├── schemas.ts       # Zod schemas
└── assets/
```

## Route Naming Convention
```ts
// RESTful endpoints
GET    /items          → List all
GET    /items/:id      → Get one
POST   /items          → Create
PUT    /items/:id      → Update (full)
PATCH  /items/:id      → Update (partial)
DELETE /items/:id      → Delete

// Nested resources
GET    /categories/:id/items
POST   /posts/:id/comments
```

## Response Format
```ts
// Success
{ data: {...}, message?: string }

// List with pagination
{ data: [...], total: number, page: number, limit: number }

// Error
{ error: string, details?: any }
```

## Status Codes
- 200: OK (GET, PUT, PATCH success)
- 201: Created (POST success)
- 204: No Content (DELETE success)
- 400: Bad Request (validation error)
- 401: Unauthorized (not logged in)
- 403: Forbidden (no permission)
- 404: Not Found
- 500: Internal Server Error

## Authentication Pattern
```ts
// Protected route
app.get('/admin/items', authMiddleware, async (c) => {
  const user = c.get('user');
  if (user.role !== 'ADMIN') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  // ...
});
```

## Validation Pattern
```ts
import { z } from 'zod';

const CreateItemSchema = z.object({
  name: z.string().min(1, 'Tên không được trống'),
  price: z.number().positive('Giá phải lớn hơn 0'),
});

app.post('/items', async (c) => {
  const body = await c.req.json();
  const result = CreateItemSchema.safeParse(body);
  
  if (!result.success) {
    return c.json({ error: result.error.flatten() }, 400);
  }
  
  // Use result.data
});
```

## Error Handling
```ts
// Global error handler
app.onError((err, c) => {
  console.error('API Error:', err);
  
  if (err instanceof z.ZodError) {
    return c.json({ error: 'Validation failed', details: err.errors }, 400);
  }
  
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') {
      return c.json({ error: 'Record not found' }, 404);
    }
  }
  
  return c.json({ error: 'Internal server error' }, 500);
});
```
