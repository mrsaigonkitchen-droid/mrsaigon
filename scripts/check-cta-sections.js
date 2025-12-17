const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./infra/prisma/dev.db'
    }
  }
});

async function checkCTASections() {
  try {
    console.log('🔍 Checking CALL_TO_ACTION sections...\n');
    
    // Find all CALL_TO_ACTION sections
    const ctaSections = await prisma.section.findMany({
      where: {
        kind: 'CALL_TO_ACTION'
      },
      include: {
        page: true
      }
    });
    
    console.log(`📊 Total CALL_TO_ACTION sections: ${ctaSections.length}\n`);
    
    if (ctaSections.length === 0) {
      console.log('❌ No CALL_TO_ACTION sections found in database');
      console.log('\n💡 Suggestion: CALL_TO_ACTION might not exist. Check if CTA sections exist instead:\n');
      
      const regularCTA = await prisma.section.findMany({
        where: {
          kind: 'CTA'
        },
        include: {
          page: true
        }
      });
      
      console.log(`📊 Total CTA sections: ${regularCTA.length}\n`);
      
      if (regularCTA.length > 0) {
        regularCTA.forEach((section, idx) => {
          console.log(`${idx + 1}. CTA Section`);
          console.log(`   ID: ${section.id}`);
          console.log(`   Page: ${section.page.slug} (${section.page.title})`);
          console.log(`   Order: ${section.order}`);
          console.log(`   Data:`, JSON.stringify(section.data, null, 2));
          console.log('');
        });
      }
    } else {
      ctaSections.forEach((section, idx) => {
        console.log(`${idx + 1}. CALL_TO_ACTION Section`);
        console.log(`   ID: ${section.id}`);
        console.log(`   Page: ${section.page.slug} (${section.page.title})`);
        console.log(`   Order: ${section.order}`);
        console.log(`   Data:`, JSON.stringify(section.data, null, 2));
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCTASections();

