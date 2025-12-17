// Test normalize function
function normalizeMediaUrl(url) {
  if (!url) return null;
  const match = url.match(/\/media\/[^"'\s?#]+/);
  return match ? match[0] : null;
}

const materialUrl = 'http://localhost:4202/media/24cf67a3-9121-41c3-923d-fedfe772e18d.webp';
const mediaUrl = '/media/24cf67a3-9121-41c3-923d-fedfe772e18d.webp';

console.log('Material URL normalized:', normalizeMediaUrl(materialUrl));
console.log('Media URL normalized:', normalizeMediaUrl(mediaUrl));
console.log('Are they equal?', normalizeMediaUrl(materialUrl) === normalizeMediaUrl(mediaUrl));
