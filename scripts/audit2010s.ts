import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalogPath = path.resolve(__dirname, '../src/data/melodex-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

console.log(`Auditing all 2010s songs in catalog (${catalog.length} total songs)...`);

const songs2010s = catalog.filter((s: any) => s.year >= 2010 && s.year <= 2019);
console.log(`Total 2010s songs: ${songs2010s.length}`);

// Group by artist
const artistCounts: Record<string, number> = {};
for (const s of songs2010s) {
  artistCounts[s.artist] = (artistCounts[s.artist] || 0) + 1;
}

const sortedArtists = Object.entries(artistCounts).sort((a, b) => b[1] - a[1]);
console.log('Top artists in 2010s:');
sortedArtists.slice(0, 30).forEach(([artist, count]) => {
  console.log(`  ${artist}: ${count} songs`);
});

// Check all 2019 songs
const songs2019 = catalog.filter((s: any) => s.year === 2019);
console.log(`\n2019 songs list (${songs2019.length} songs):`);
songs2019.forEach((s: any) => {
  console.log(`  [2019] ${s.artist} - ${s.title} (Album: ${s.album}, Genre: ${s.genre})`);
});
