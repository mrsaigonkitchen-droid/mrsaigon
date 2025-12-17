const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Set DATABASE_URL with absolute path
const dbPath = path.join(__dirname, '..', 'infra', 'prisma', 'dev.db');
process.env.DATABASE_URL = `file:${dbPath}`;

const prisma = new PrismaClient();

async function checkHomeSections() {
  console.log('🔍 Checking home page sections...\n');
  
  // Get home page
  const homePage = await prisma.page.findUnique({
    where: { slug: 'home' },
    include: {
      sections: {
        orderBy: { order: 'asc' },
      },
    },
  });
  
  if (!homePage) {
    console.log('❌ Home page not found!');
    return;
  }
  
  console.log(`✅ Home page found: ${homePage.title}`);
  console.log(`📊 Total sections: ${homePage.sections.length}\n`);
  
  // List all sections
  console.log('📋 Sections on home page:\n');
  homePage.sections.forEach((section, index) => {
    console.log(`${index + 1}. ${section.kind} (order: ${section.order})`);
    console.log(`   ID: ${section.id}`);
    
    // Parse data
    let data = {};
    try {
      data = JSON.parse(section.data);
    } catch (e) {
      // ignore
    }
    
    if (data.title) {
      console.log(`   Title: ${data.title}`);
    }
    
    console.log('');
  });
  
  // Check for SPECIAL_OFFERS section
  const specialOffersSection = homePage.sections.find(s => s.kind === 'SPECIAL_OFFERS');
  
  console.log('='.repeat(60));
  if (specialOffersSection) {
    console.log('✅ SPECIAL_OFFERS section EXISTS');
    console.log(`   Order: ${specialOffersSection.order}`);
    
    let data = {};
    try {
      data = JSON.parse(specialOffersSection.data);
    } catch (e) {
      // ignore
    }
    
    console.log(`   Data:`, JSON.stringify(data, null, 2));
  } else {
    console.log('❌ SPECIAL_OFFERS section NOT FOUND');
    console.log('');
    console.log('💡 Solution: Add SPECIAL_OFFERS section via Admin Dashboard');
    console.log('   1. Go to http://localhost:4201');
    console.log('   2. Login as admin');
    console.log('   3. Go to Sections');
    console.log('   4. Click "Create Section"');
    console.log('   5. Select type: "Special Offers"');
    console.log('   6. Fill in title/subtitle');
    console.log('   7. Click "Create"');
  }
  
  await prisma.$disconnect();
}

checkHomeSections().catch(console.error);

