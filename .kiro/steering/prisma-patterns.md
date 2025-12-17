---
inclusion: fileMatch
fileMatchPattern: "infra/prisma/**"
---

# 🗄️ Prisma Schema Patterns

## Schema Change Workflow
```bash
# 1. Sửa schema.prisma
# 2. Generate client
pnpm db:generate

# 3. Push to database (dev)
pnpm db:push

# 4. Seed data (nếu cần)
pnpm db:seed
```

## Model Naming Convention
- Model name: PascalCase, singular (User, BlogPost)
- Field name: camelCase (createdAt, categoryId)
- Relation field: camelCase (category, author)

## Required Fields Pattern
```prisma
model Item {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Optional Fields
```prisma
model Item {
  description String?  // Nullable
  imageUrl    String?
}
```

## Relations

### One-to-Many
```prisma
model Category {
  id    String @id @default(cuid())
  name  String
  items Item[] // One category has many items
}

model Item {
  id         String   @id @default(cuid())
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id])
}
```

### Many-to-Many (implicit)
```prisma
model Post {
  id   String @id @default(cuid())
  tags Tag[]
}

model Tag {
  id    String @id @default(cuid())
  posts Post[]
}
```

## Enums (SQLite không hỗ trợ - dùng String)
```prisma
// ❌ SQLite không hỗ trợ enum
// enum Status { PENDING APPROVED }

// ✅ Dùng String với comment
model Lead {
  status String @default("PENDING") // PENDING, CONTACTED, CONVERTED, CANCELLED
}
```

## Index cho Performance
```prisma
model Item {
  id         String @id @default(cuid())
  categoryId String
  name       String
  
  @@index([categoryId])
  @@index([name])
}
```

## Unique Constraints
```prisma
model User {
  email String @unique
}

model Category {
  name String @unique
  slug String @unique
}
```
