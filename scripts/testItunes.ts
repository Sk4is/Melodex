async function testItunes(term: string, entity: string = 'song') {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=${entity}&limit=10&media=music`;
  console.log('Testing URL:', url);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      }
    });
    console.log('Status:', res.status, res.statusText);
    if (!res.ok) {
      const text = await res.text();
      console.log('Body:', text.slice(0, 100));
      return;
    }
    const data = await res.json();
    console.log('Result count:', data.resultCount);
    if (data.results && data.results.length > 0) {
      for (const t of data.results.slice(0, 5)) {
        console.log('  ->', t.artistName, '—', t.trackName, `(${t.releaseDate?.slice(0, 4)})`, 'Preview:', !!t.previewUrl);
      }
    }
  } catch (err) {
    console.error('Error fetching:', err);
  }
}

async function run() {
  console.log('=== Test 1: Pitbull ===');
  await testItunes('Pitbull');
  await new Promise(r => setTimeout(r, 1200));

  console.log('=== Test 2: Sia ===');
  await testItunes('Sia');
  await new Promise(r => setTimeout(r, 1200));

  console.log('=== Test 3: Maroon 5 ===');
  await testItunes('Maroon 5');
  await new Promise(r => setTimeout(r, 1200));

  console.log('=== Test 4: Lady Gaga ===');
  await testItunes('Lady Gaga');
  await new Promise(r => setTimeout(r, 1200));

  console.log('=== Test 5: Imagine Dragons ===');
  await testItunes('Imagine Dragons');
}

run();
