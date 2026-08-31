async function testDeezer(artist: string) {
  const url = `https://api.deezer.com/search?q=${encodeURIComponent(artist)}&limit=10`;
  console.log('Testing Deezer URL:', url);
  try {
    const res = await fetch(url);
    console.log('Status:', res.status, res.statusText);
    const data = await res.json();
    console.log('Deezer data total:', data.total, 'Results:', data.data?.length);
    if (data.data && data.data.length > 0) {
      for (const t of data.data.slice(0, 5)) {
        console.log('  ->', t.artist?.name, '—', t.title, 'Preview:', !!t.preview);
      }
    }
  } catch (err) {
    console.error('Error fetching Deezer:', err);
  }
}

async function run() {
  console.log('=== Test Pitbull Deezer ===');
  await testDeezer('Pitbull');
  console.log('=== Test Sia Deezer ===');
  await testDeezer('Sia');
  console.log('=== Test Maroon 5 Deezer ===');
  await testDeezer('Maroon 5');
}

run();
