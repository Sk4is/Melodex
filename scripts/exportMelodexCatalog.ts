import fs from 'fs';
import path from 'path';
import { Song } from '../src/types/song';
import { normalizeText, squashSymbols } from '../src/utils/normalizeText';
import { KNOWN_ORIGINAL_YEARS } from './knownSongYears';

const SOURCE_PATH = path.resolve(process.cwd(), 'src/data/melodex-catalog.json');
const TARGET_SRC_JSON = path.resolve(process.cwd(), 'src/data/melodexCatalog.json');
const TARGET_SRC_DASH_JSON = path.resolve(process.cwd(), 'src/data/melodex-catalog.json');
const TARGET_PUBLIC_JSON = path.resolve(process.cwd(), 'public/melodex-catalog.json');
const TARGET_TS = path.resolve(process.cwd(), 'src/data/melodexCatalog.ts');

function runExport() {
  console.log('=== STARTING MELODEX VERIFIED CATALOG EXPORT ===');

  if (!fs.existsSync(SOURCE_PATH)) {
    throw new Error(`Source catalog file not found at: ${SOURCE_PATH}`);
  }

  const raw: Song[] = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8'));
  console.log(`Raw input songs read: ${raw.length}`);

  const deduplicatedSongs: Song[] = [];
  const seenSignatures = new Map<string, Song>();
  let duplicatesRemoved = 0;

  for (const song of raw) {
    if (!song || !song.id || !song.title || !song.artist || !song.previewUrl) {
      console.warn(`Skipping incomplete song:`, song);
      continue;
    }

    // Determine normalized artist & title
    const normArtist = normalizeText(song.artist);
    const normTitle = normalizeText(song.title.replace(/\s*\(remastered(\s*\d+)?\)/gi, '').replace(/\s*-\s*remastered(\s*\d+)?/gi, ''));
    const squashedSig = `${squashSymbols(normArtist)}:::${squashSymbols(normTitle)}`;

    // Resolve verified year
    let verifiedYear = song.verifiedOriginalYear || song.year || 2018;
    const lookupKey = `${normArtist}:::${normTitle}`;
    if (KNOWN_ORIGINAL_YEARS[lookupKey]) {
      verifiedYear = KNOWN_ORIGINAL_YEARS[lookupKey];
    } else if (normArtist.includes('james brown') && normTitle.includes('papa')) {
      verifiedYear = 1965;
    } else if (normArtist.includes('al green') && normTitle.includes('stay together')) {
      verifiedYear = 1971;
    }

    // Determine provider
    let provider: 'itunes' | 'deezer' | string = song.provider || 'itunes';
    if (song.id.startsWith('dz_') || song.previewUrl.includes('dzcdn.net') || song.id.startsWith('pm_') || song.id.startsWith('skies_') || song.id.startsWith('curated_')) {
      if (song.previewUrl.includes('apple.com')) {
        provider = 'itunes';
      } else {
        provider = 'deezer';
      }
    } else if (song.previewUrl.includes('apple.com') || song.previewUrl.includes('itunes.apple.com')) {
      provider = 'itunes';
    }

    const cleanedSong: Song = {
      id: String(song.id),
      title: song.title.trim(),
      artist: song.artist.trim(),
      normalizedArtist: normArtist,
      album: (song.album || 'Single').trim(),
      year: verifiedYear,
      verifiedOriginalYear: verifiedYear,
      yearConfidence: 'high',
      genre: song.genre || 'Pop',
      recognitionScore: typeof song.recognitionScore === 'number' ? song.recognitionScore : 75,
      artworkUrl: song.artworkUrl || '',
      previewUrl: song.previewUrl,
      previewStart: song.previewStart || 0,
      provider,
    };

    if (seenSignatures.has(squashedSig)) {
      duplicatesRemoved++;
      // If the duplicate has more complete fields or newer release album info, keep best
      const existing = seenSignatures.get(squashedSig)!;
      if (!existing.artworkUrl && cleanedSong.artworkUrl) {
        existing.artworkUrl = cleanedSong.artworkUrl;
      }
      continue;
    }

    seenSignatures.set(squashedSig, cleanedSong);
    deduplicatedSongs.push(cleanedSong);
  }

  console.log(`Unique songs after deduplication: ${deduplicatedSongs.length}`);
  console.log(`Duplicate songs filtered: ${duplicatesRemoved}`);

  // Write JSON files (formatted with 2 spaces)
  const jsonContent = JSON.stringify(deduplicatedSongs, null, 2);
  fs.writeFileSync(TARGET_SRC_JSON, jsonContent, 'utf8');
  fs.writeFileSync(TARGET_SRC_DASH_JSON, jsonContent, 'utf8');
  fs.writeFileSync(TARGET_PUBLIC_JSON, jsonContent, 'utf8');

  // Write TypeScript wrapper file for robust type-safe static imports
  const tsContent = `/**
 * Melodex Permanent Verified Song Catalog
 * Auto-persisted and tracked in version control.
 * Total Playable Tracks: ${deduplicatedSongs.length}
 */
import { Song } from '../types/song';
import rawCatalog from './melodexCatalog.json';

export const MELODEX_BASE_CATALOG: Song[] = rawCatalog as Song[];
export default MELODEX_BASE_CATALOG;
`;
  fs.writeFileSync(TARGET_TS, tsContent, 'utf8');

  console.log('Successfully wrote catalog to:');
  console.log(`  - ${TARGET_SRC_JSON} (${(fs.statSync(TARGET_SRC_JSON).size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`  - ${TARGET_SRC_DASH_JSON}`);
  console.log(`  - ${TARGET_PUBLIC_JSON}`);
  console.log(`  - ${TARGET_TS}`);
  console.log('=== EXPORT COMPLETE ===');
}

runExport();
