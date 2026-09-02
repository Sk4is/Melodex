import * as fs from 'fs';
import * as path from 'path';
import { Song } from '../src/types/song';

const catalogPath = path.resolve(process.cwd(), 'src/data/melodexCatalog.json');
const catalog: Song[] = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

console.log(`Total catalog tracks: ${catalog.length}`);

// Find all tracks mentioning "skies" or "lil skies"
const skiesTracks = catalog.filter(s => s.artist.toLowerCase().includes('skies') || s.title.toLowerCase().includes('skies'));
console.log(`Found ${skiesTracks.length} tracks mentioning skies:`);
for (const t of skiesTracks) {
  console.log(`- [${t.id}] "${t.title}" by "${t.artist}" (Year: ${t.year}, VerifiedYear: ${t.verifiedOriginalYear})`);
}
