import fs from 'fs';
import { Song } from '../src/types/song';

const catalog: Song[] = JSON.parse(fs.readFileSync('public/melodex-catalog.json', 'utf8'));

console.log('Total catalog tracks:', catalog.length);

// Count how many tracks currently have 'latin' in normalizedGenres
const currentLatin = catalog.filter((t) => (t.normalizedGenres || []).includes('latin' as any));
console.log('Current Latin count in catalog:', currentLatin.length);

// Let's inspect tracks that might be reggaeton, latin trap, or latin pop
const candidates = catalog.filter((t) => {
  const g = (t.genre || '').toLowerCase();
  const a = (t.artist || '').toLowerCase();
  const norm = (t.normalizedGenres || []).map((x) => String(x).toLowerCase());

  if (norm.includes('latin')) return true;
  if (g.includes('urbano') || g.includes('latin') || g.includes('reggaeton')) return true;
  return false;
});

console.log('Total candidate tracks to inspect:', candidates.length);
