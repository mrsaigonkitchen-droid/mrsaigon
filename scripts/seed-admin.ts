/**
 * Seed Admin User Script
 * Run: npx tsx scripts/seed-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@mrsaigon.vn';
  const password = '151194Vy@';
  const name = 'Admin MrSaiGon';

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User ${email} already exists. Updating password...`);
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email },
      data: { passwordHash, role: 'ADMIN' },
    });
    console.log('✅ Password updated successfully!');
  } else {
    // Create new admin user
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: 'ADMIN',
      },
    });
    console.log(`✅ Admin user created: ${email}`);
  }

  console.log('\n📋 Login credentials:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
