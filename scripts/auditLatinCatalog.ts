import fs from 'fs';
import { Song } from '../src/types/song';

const catalog: Song[] = JSON.parse(fs.readFileSync('public/melodex-catalog.json', 'utf8'));
const latinTracks = catalog.filter((t) => (t.normalizedGenres || []).includes('latin'));

console.log('Total Latin tracks:', latinTracks.length);

const lines = latinTracks.map(
  (t) =>
    `${t.id}\t${t.artist}\t${t.title}\t${t.genre || ''}\t${t.year || ''}\t${JSON.stringify(
      t.normalizedGenres
    )}`
);

fs.writeFileSync('scripts/latin_tracks.tsv', lines.join('\n'));
console.log('Saved scripts/latin_tracks.tsv with', lines.length, 'lines');
