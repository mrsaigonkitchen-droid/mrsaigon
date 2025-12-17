const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Set DATABASE_URL with absolute path
const dbPath = path.join(__dirname, '..', 'infra', 'prisma', 'dev.db');
process.env.DATABASE_URL = `file:${dbPath}`;

const prisma = new PrismaClient();

async function checkOffers() {
  console.log('🔍 Checking Special Offers in database...\n');
  
  const now = new Date();
  console.log('📅 Current time:', now.toISOString());
  console.log('');
  
  // Get all offers
  const allOffers = await prisma.specialOffer.findMany({
    orderBy: { createdAt: 'desc' },
  });
  
  console.log(`📊 Total offers in database: ${allOffers.length}\n`);
  
  if (allOffers.length === 0) {
    console.log('❌ No offers found in database!');
    console.log('💡 Run: node scripts/seed-special-offers.js');
    return;
  }
  
  // Check each offer
  allOffers.forEach((offer, index) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Offer ${index + 1}: ${offer.title}`);
    console.log(`${'='.repeat(60)}`);
    console.log('ID:', offer.id);
    console.log('Description:', offer.description.substring(0, 50) + '...');
    console.log('Discount:', offer.discount ? `${offer.discount}%` : 'N/A');
    console.log('');
    console.log('📅 Valid From:', offer.validFrom.toISOString());
    console.log('📅 Valid Until:', offer.validUntil.toISOString());
    console.log('');
    
    // Check validity
    const isStarted = offer.validFrom <= now;
    const isNotExpired = offer.validUntil >= now;
    const isActive = offer.isActive;
    
    console.log('✅ Is Active:', isActive ? 'YES' : 'NO');
    console.log('✅ Has Started:', isStarted ? 'YES' : `NO (starts in ${Math.ceil((offer.validFrom - now) / (1000 * 60 * 60 * 24))} days)`);
    console.log('✅ Not Expired:', isNotExpired ? 'YES' : `NO (expired ${Math.ceil((now - offer.validUntil) / (1000 * 60 * 60 * 24))} days ago)`);
    console.log('');
    
    // Overall status
    const willShow = isActive && isStarted && isNotExpired;
    if (willShow) {
      console.log('🎉 STATUS: WILL SHOW ON LANDING PAGE');
    } else {
      console.log('❌ STATUS: WILL NOT SHOW');
      console.log('   Reasons:');
      if (!isActive) console.log('   - Not active');
      if (!isStarted) console.log('   - Not started yet');
      if (!isNotExpired) console.log('   - Already expired');
    }
  });
  
  // Summary
  console.log(`\n\n${'='.repeat(60)}`);
  console.log('📊 SUMMARY');
  console.log(`${'='.repeat(60)}`);
  
  const activeOffers = allOffers.filter(o => 
    o.isActive && 
    o.validFrom <= now && 
    o.validUntil >= now
  );
  
  console.log(`Total offers: ${allOffers.length}`);
  console.log(`Active & valid offers: ${activeOffers.length}`);
  console.log('');
  
  if (activeOffers.length === 0) {
    console.log('❌ NO OFFERS WILL SHOW ON LANDING PAGE!');
    console.log('');
    console.log('💡 Solutions:');
    console.log('   1. Update validFrom/validUntil dates to include today');
    console.log('   2. Set isActive = true');
    console.log('   3. Run: node scripts/seed-special-offers.js (to create new ones)');
  } else {
    console.log('✅ These offers will show on Landing page:');
    activeOffers.forEach(o => {
      console.log(`   - ${o.title} (${o.discount}% off)`);
    });
  }
  
  await prisma.$disconnect();
}

checkOffers().catch(console.error);

