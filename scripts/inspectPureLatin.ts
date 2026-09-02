import fs from 'fs';

const catalog = JSON.parse(fs.readFileSync('public/melodex-catalog.json', 'utf8'));
const latinTracks = catalog.filter((t: any) => (t.genre || '') === 'Latin');

console.log('Total pure Latin tracks:', latinTracks.length);

// Group by artist
const byArtist = new Map<string, any[]>();
latinTracks.forEach((t: any) => {
  const list = byArtist.get(t.artist) || [];
  list.push(t);
  byArtist.set(t.artist, list);
});

// Sort artists by track count descending
const sortedArtists = Array.from(byArtist.entries()).sort((a, b) => b[1].length - a[1].length);

console.log(`Total unique artists in pure Latin: ${sortedArtists.length}`);
sortedArtists.slice(0, 30).forEach(([artist, tracks]) => {
  console.log(`${artist}: ${tracks.length} tracks`);
  tracks.slice(0, 3).forEach((t: any) => {
    console.log(`   - [${t.id}] ${t.title} (${t.year})`);
  });
});
