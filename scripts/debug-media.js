const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get materials with images
  const materials = await prisma.material.findMany({
    where: { imageUrl: { not: null } },
    select: { id: true, name: true, imageUrl: true },
  });
  console.log('=== Materials with images ===');
  materials.forEach(m => console.log(`${m.name}: ${m.imageUrl}`));

  // Get media assets
  const media = await prisma.mediaAsset.findMany({
    select: { id: true, url: true },
    take: 10,
  });
  console.log('\n=== Media Assets ===');
  media.forEach(m => console.log(`${m.id}: ${m.url}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
