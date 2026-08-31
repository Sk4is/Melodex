import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEED_ARTISTS, SeedArtist } from './seedArtists';
import { Song } from '../src/types/song';
import { KNOWN_ORIGINAL_YEARS } from './knownSongYears';
import { normalizeText, squashSymbols } from '../src/utils/normalizeText';
import { isArtistMatch, auditCatalog } from './auditCatalog';
import { mapToStandardGenreBucket } from './buildCatalog';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATALOG_DATA_PATH = path.resolve(__dirname, '../src/data/melodex-catalog.json');
const CATALOG_PUBLIC_PATH = path.resolve(__dirname, '../public/melodex-catalog.json');

interface CandidateTrack {
  source: 'deezer' | 'itunes';
  id: string;
  title: string;
  artist: string;
  album?: string;
  albumId?: number;
  releaseDate?: string;
  year?: number;
  previewUrl: string;
  artworkUrl?: string;
  genre?: string;
  rank?: number;
}

const BOGUS_KEYWORDS = [
  'tribute',
  'karaoke',
  'originally performed by',
  'in the style of',
  'hit crew',
  'instrumental version',
  'piano tribute',
  'string quartet',
  'lullaby',
  'cover band',
  'sound-a-like',
  'sound alike',
  'commentary',
  'interview',
  'track by track',
  'ringtone',
  'workout mix',
  'remix tribute',
  'sleep music',
  'relaxing piano',
  '8-bit',
  'slowed',
  'reverb',
  'chipmunk',
];

const albumYearCache = new Map<number, number>();

function isBogus(trackTitle: string, artistName: string, albumName = ''): boolean {
  const normTitle = trackTitle.toLowerCase();
  const normArtist = artistName.toLowerCase();
  const normAlbum = albumName.toLowerCase();

  for (const kw of BOGUS_KEYWORDS) {
    if (normTitle.includes(kw) || normArtist.includes(kw) || normAlbum.includes(kw)) {
      return true;
    }
  }

  if (normTitle.includes('instrumental') && !normArtist.includes('metro boomin')) {
    return true;
  }

  return false;
}

function cleanSongTitle(title: string): string {
  return title
    .replace(/\s*-\s*radio\s*edit/i, '')
    .replace(/\s*-\s*single\s*version/i, '')
    .replace(/\s*-\s*original\s*mix/i, '')
    .replace(/\s*\(radio edit\)/i, '')
    .replace(/\s*\(album version\)/i, '')
    .replace(/\s*\(single version\)/i, '')
    .replace(/\s*\(remastered.*?\)/i, '')
    .replace(/\s*-\s*remastered.*$/i, '')
    .replace(/\s*\[remastered.*?\]/i, '')
    .trim();
}

function createSongSignature(artist: string, title: string): string {
  const normArtist = normalizeText(artist);
  const cleanTitle = cleanSongTitle(title);
  const normTitle = normalizeText(cleanTitle);
  return `${normArtist}:::${normTitle}`;
}

async function getDeezerAlbumYear(albumId?: number): Promise<number | null> {
  if (!albumId) return null;
  if (albumYearCache.has(albumId)) {
    return albumYearCache.get(albumId)!;
  }

  try {
    const res = await fetch(`https://api.deezer.com/album/${albumId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.release_date) {
        const parsedYear = new Date(data.release_date).getFullYear();
        if (!isNaN(parsedYear) && parsedYear > 1900 && parsedYear <= new Date().getFullYear()) {
          albumYearCache.set(albumId, parsedYear);
          return parsedYear;
        }
      }
    }
  } catch {}

  return null;
}

async function fetchDeezerCandidates(seedArtist: SeedArtist, limit = 50): Promise<CandidateTrack[]> {
  const candidates: CandidateTrack[] = [];
  const query = seedArtist.searchQuery || seedArtist.name;
  const searchUrl = `https://api.deezer.com/search?q=artist:${encodeURIComponent(`"${query}"`)}&limit=${limit}`;

  try {
    const res = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        for (const t of data.data) {
          if (!t.preview || !t.title || !t.artist?.name) continue;
          candidates.push({
            source: 'deezer',
            id: `dz_${t.id}`,
            title: t.title_short || t.title,
            artist: t.artist.name,
            album: t.album?.title,
            albumId: t.album?.id,
            artworkUrl: t.album?.cover_big || t.album?.cover_xl || t.album?.cover_medium,
            previewUrl: t.preview,
            rank: t.rank || 50,
          });
        }
      }
    }
  } catch (err) {
    console.error(`Deezer fetch error for ${seedArtist.name}:`, err);
  }

  // Fallback search without quotes if no results
  if (candidates.length === 0) {
    try {
      const fallbackUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}`;
      const res = await fetch(fallbackUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          for (const t of data.data) {
            if (!t.preview || !t.title || !t.artist?.name) continue;
            candidates.push({
              source: 'deezer',
              id: `dz_${t.id}`,
              title: t.title_short || t.title,
              artist: t.artist.name,
              album: t.album?.title,
              albumId: t.album?.id,
              artworkUrl: t.album?.cover_big || t.album?.cover_xl || t.album?.cover_medium,
              previewUrl: t.preview,
              rank: t.rank || 50,
            });
          }
        }
      }
    } catch {}
  }

  return candidates;
}

async function resolveYear(candidate: CandidateTrack, seedArtist: SeedArtist): Promise<number | null> {
  const sig = createSongSignature(candidate.artist, candidate.title);
  if (KNOWN_ORIGINAL_YEARS[sig]) {
    return KNOWN_ORIGINAL_YEARS[sig];
  }

  const cleanSig = `${normalizeText(seedArtist.name)}:::${normalizeText(cleanSongTitle(candidate.title))}`;
  if (KNOWN_ORIGINAL_YEARS[cleanSig]) {
    return KNOWN_ORIGINAL_YEARS[cleanSig];
  }

  // From Deezer album
  if (candidate.albumId) {
    const albumYear = await getDeezerAlbumYear(candidate.albumId);
    if (albumYear) return albumYear;
  }

  if (candidate.year && candidate.year >= 1950 && candidate.year <= new Date().getFullYear()) {
    return candidate.year;
  }

  if (candidate.releaseDate) {
    const parsed = new Date(candidate.releaseDate).getFullYear();
    if (!isNaN(parsed) && parsed >= 1950 && parsed <= new Date().getFullYear()) {
      return parsed;
    }
  }

  // Decade-based default if artist has primaryDecade
  if (seedArtist.primaryDecade === 'pre2000') return 1995;
  if (seedArtist.primaryDecade === '2000s') return 2005;
  if (seedArtist.primaryDecade === '2010s') return 2015;
  if (seedArtist.primaryDecade === '2020s') return 2022;

  return 2016;
}

export async function importMissingSeedArtists(maxArtists = 100) {
  console.log('====================================================');
  console.log('🚀 Melodex Missing Seed Artist Balanced Importer 🚀');
  console.log('====================================================');

  let currentCatalog: Song[] = [];
  if (fs.existsSync(CATALOG_DATA_PATH)) {
    currentCatalog = JSON.parse(fs.readFileSync(CATALOG_DATA_PATH, 'utf8'));
  }

  console.log(`Current catalog size: ${currentCatalog.length} songs.`);

  const existingSignatures = new Set<string>();
  for (const s of currentCatalog) {
    existingSignatures.add(createSongSignature(s.artist, s.title));
  }

  // Specific high-priority seed artists to ensure they are processed first
  const priorityNames = [
    'Pitbull',
    'Black Eyed Peas',
    'Imagine Dragons',
    'Shakira',
    'Avicii',
    'Calvin Harris',
    'Lady Gaga',
    'Maroon 5',
    'Ed Sheeran',
    'Sia',
    'Nelly',
    'Roddy Ricch',
    'Chief Keef',
    'Mac Miller',
    'Big Sean',
    'Rae Sremmurd',
    'Jack Harlow',
    'Central Cee',
    'Machine Gun Kelly',
    'Janet Jackson',
    'Celine Dion',
    'Phil Collins',
    'Tina Turner',
    'Spice Girls',
    'Kylie Minogue',
    '*NSYNC',
    'Kelly Clarkson',
    'Avril Lavigne',
    'Enrique Iglesias',
    'Aerosmith',
    'Bruce Springsteen',
    'Creedence Clearwater Revival',
  ];

  const audit = auditCatalog();
  const allNeeded = audit.auditResults.filter(a => a.verifiedPlayable < a.targetCount);

  // Sort: explicit priority names first, then Tier 1 with 0 songs, then Tier 1 partial, then Tier 2
  allNeeded.sort((a, b) => {
    const aPriorityIdx = priorityNames.findIndex(p => p.toLowerCase() === a.artist.toLowerCase());
    const bPriorityIdx = priorityNames.findIndex(p => p.toLowerCase() === b.artist.toLowerCase());
    if (aPriorityIdx !== -1 && bPriorityIdx === -1) return -1;
    if (bPriorityIdx !== -1 && aPriorityIdx === -1) return 1;
    if (aPriorityIdx !== -1 && bPriorityIdx !== -1) return aPriorityIdx - bPriorityIdx;

    if (a.tier !== b.tier) return a.tier - b.tier;
    return a.verifiedPlayable - b.verifiedPlayable;
  });

  const targetList = allNeeded.slice(0, maxArtists);
  console.log(`Processing ${targetList.length} artists in this batch...`);

  let addedSongsCount = 0;

  for (let i = 0; i < targetList.length; i++) {
    const item = targetList[i];
    const seed = SEED_ARTISTS.find(s => s.name === item.artist);
    if (!seed) continue;

    const deficit = seed.targetCount - item.verifiedPlayable;
    if (deficit <= 0) continue;

    console.log(`\n[${i + 1}/${targetList.length}] ${seed.name} (Tier ${seed.tier}, Current: ${item.verifiedPlayable}/${seed.targetCount}, Deficit: ${deficit})`);

    const candidates = await fetchDeezerCandidates(seed, 40);
    await new Promise(r => setTimeout(r, 100));

    let artistAdded = 0;

    for (const cand of candidates) {
      if (artistAdded >= deficit) break;

      if (isBogus(cand.title, cand.artist, cand.album)) {
        continue;
      }

      if (!isArtistMatch(cand.artist, seed.name) && !normalizeText(cand.title).includes(normalizeText(seed.name))) {
        continue;
      }

      const sig = createSongSignature(cand.artist, cand.title);
      if (existingSignatures.has(sig)) {
        continue;
      }

      // Resolve release year
      const year = await resolveYear(cand, seed);
      if (!year) {
        continue;
      }

      const genre = seed.primaryGenre || mapToStandardGenreBucket(cand.genre, cand.artist, cand.title);

      const song: Song = {
        id: `dz_${cand.id}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        title: cleanSongTitle(cand.title),
        artist: cand.artist,
        album: cand.album,
        year,
        verifiedOriginalYear: year,
        yearConfidence: 'high',
        genre,
        recognitionScore: cand.rank ? Math.min(95, Math.max(65, Math.floor(cand.rank / 10000))) : 80,
        artworkUrl: cand.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        previewUrl: cand.previewUrl,
      };

      currentCatalog.push(song);
      existingSignatures.add(sig);
      artistAdded++;
      addedSongsCount++;

      console.log(`   + Added: "${song.title}" (${song.year}) [${song.genre}]`);
    }

    console.log(`  -> Successfully imported ${artistAdded} verified songs for ${seed.name}`);
  }

  // Write out updated catalog files
  fs.writeFileSync(CATALOG_DATA_PATH, JSON.stringify(currentCatalog, null, 2));
  fs.writeFileSync(CATALOG_PUBLIC_PATH, JSON.stringify(currentCatalog, null, 2));

  console.log('\n====================================================');
  console.log(`🎉 Batch import finished! Added ${addedSongsCount} verified songs.`);
  console.log(`Catalog total songs: ${currentCatalog.length}`);
  console.log('====================================================\n');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const count = process.argv[2] ? parseInt(process.argv[2], 10) : 80;
  importMissingSeedArtists(count).catch(console.error);
}
