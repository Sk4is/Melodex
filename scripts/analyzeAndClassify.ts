import fs from 'fs';
import { Song } from '../src/types/song';

const catalog: Song[] = JSON.parse(fs.readFileSync('public/melodex-catalog.json', 'utf8'));

// Let's identify all tracks by urban/latin artists or having latin in normalizedGenres or genre
const latinTracks = catalog.filter((t) => (t.normalizedGenres || []).includes('latin'));
console.log(`Analyzing ${latinTracks.length} tracks currently in Latin...`);

// Let's inspect tracks by key artists to understand every track's true nature
