/**
 * Seed Special Offers
 * Creates sample special offers for testing
 */

const API_BASE = 'http://localhost:4202';

async function login() {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'admin123',
    }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  // Extract session cookie
  const setCookie = response.headers.get('set-cookie');
  if (!setCookie) {
    throw new Error('No session cookie received');
  }

  // Parse cookie
  const sessionMatch = setCookie.match(/session=([^;]+)/);
  if (!sessionMatch) {
    throw new Error('Could not parse session cookie');
  }

  return sessionMatch[1];
}

async function createOffer(sessionToken, offer) {
  const response = await fetch(`${API_BASE}/special-offers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `session=${sessionToken}`,
    },
    body: JSON.stringify(offer),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create offer: ${response.status} - ${error}`);
  }

  return response.json();
}

async function main() {
  console.log('🔐 Logging in...');
  const sessionToken = await login();
  console.log('✅ Logged in successfully');

  // Sample offers
  const offers = [
    {
      title: 'Giảm 20% Món Khai Vị',
      description: 'Áp dụng cho tất cả các món khai vị từ thứ 2 đến thứ 6. Không áp dụng vào ngày lễ.',
      discount: 20,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      isActive: true,
    },
    {
      title: 'Happy Hour - Giảm 30%',
      description: 'Giảm 30% tất cả đồ uống từ 15:00 - 17:00 hàng ngày',
      discount: 30,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
      isActive: true,
    },
    {
      title: 'Set Lunch Đặc Biệt',
      description: 'Combo trưa 2 người chỉ 299.000đ - Bao gồm khai vị, món chính, tráng miệng và nước uống',
      discount: 25,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      isActive: true,
    },
  ];

  console.log(`\n📝 Creating ${offers.length} special offers...\n`);

  for (const offer of offers) {
    try {
      const created = await createOffer(sessionToken, offer);
      console.log(`✅ Created: ${created.title}`);
      console.log(`   - Discount: ${created.discount}%`);
      console.log(`   - Valid until: ${new Date(created.validUntil).toLocaleDateString('vi-VN')}\n`);
    } catch (error) {
      console.error(`❌ Failed to create "${offer.title}":`, error.message);
    }
  }

  console.log('🎉 Done! Special offers created successfully.');
  console.log('\n💡 Visit http://localhost:4200 to see them on the landing page');
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

