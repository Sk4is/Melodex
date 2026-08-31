import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalogPath = path.resolve(__dirname, '../src/data/melodex-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

console.log(`Auditing ${catalog.length} songs...`);

const suspicious: any[] = [];

for (const s of catalog) {
  const alb = (s.album || '').toLowerCase();
  const tit = (s.title || '').toLowerCase();
  const y = s.year;

  const isCompilationOrRemaster =
    alb.includes('greatest hits') ||
    alb.includes('best of') ||
    alb.includes('remaster') ||
    alb.includes('anniversary') ||
    alb.includes('collection') ||
    alb.includes('platinum') ||
    alb.includes('the essential') ||
    alb.includes('anthology') ||
    alb.includes('gold') ||
    tit.includes('remaster');

  if (y >= 2000 && isCompilationOrRemaster) {
    suspicious.push({
      id: s.id,
      artist: s.artist,
      title: s.title,
      storedYear: y,
      album: s.album,
      genre: s.genre,
    });
  }
}

console.log(`Found ${suspicious.length} suspicious compilation/remaster tracks stored with year >= 2000:`);
suspicious.forEach((s) => {
  console.log(`[ID: ${s.id}] Stored: ${s.storedYear} | ${s.artist} - ${s.title} | Album: ${s.album}`);
});
