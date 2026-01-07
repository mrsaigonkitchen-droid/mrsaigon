/**
 * Create Admin User Script
 * Run this before seeding if no admin user exists
 * 
 * Usage:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=SecurePass123 pnpm tsx infra/prisma/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Creating admin user...');

  // Read from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@noithatnhanh.vn';
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    console.error('❌ ADMIN_PASSWORD environment variable is required');
    console.log('   Usage: ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=SecurePass123 pnpm tsx infra/prisma/create-admin.ts');
    process.exit(1);
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists:', existingAdmin.email);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      name: 'Admin',
      role: 'ADMIN',
      phone: '0900000000',
    },
  });

  console.log('✅ Admin user created:', admin.email);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
