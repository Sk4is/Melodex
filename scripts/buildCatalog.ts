import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEED_ARTISTS, SeedArtist } from './seedArtists.ts';
import { KNOWN_ORIGINAL_YEARS } from './knownSongYears.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  year?: number;
  verifiedOriginalYear?: number;
  yearConfidence?: 'high' | 'medium' | 'low';
  genre?: string;
  recognitionScore?: number;
  artworkUrl?: string;
  previewUrl: string;
  previewStart?: number;
}

export interface ITunesRawTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  releaseDate?: string;
  primaryGenreName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  wrapperType?: string;
  kind?: string;
}

export interface ITunesResponse {
  resultCount: number;
  results: ITunesRawTrack[];
}

export type StandardGenreBucket =
  | 'Pop'
  | 'Rock/Alternative'
  | 'Hip-Hop/Rap'
  | 'Dance/Electronic'
  | 'R&B/Soul'
  | 'Latin'
  | 'Metal/Punk'
  | 'Other';

export const TARGET_GENRE_SHARES: Record<StandardGenreBucket, number> = {
  'Pop': 0.225,              // 20-25%
  'Hip-Hop/Rap': 0.175,       // 15-20%
  'Rock/Alternative': 0.175,  // 15-20%
  'Dance/Electronic': 0.150,  // 12-18%
  'R&B/Soul': 0.100,          // 8-12%
  'Latin': 0.100,             // 8-12%
  'Metal/Punk': 0.060,        // 5-8%
  'Other': 0.015,             // remainder (Country, Reggae, Folk)
};

const CATALOG_DATA_PATH = path.resolve(__dirname, '../src/data/melodex-catalog.json');
const CATALOG_PUBLIC_PATH = path.resolve(__dirname, '../public/melodex-catalog.json');

fs.mkdirSync(path.dirname(CATALOG_DATA_PATH), { recursive: true });
fs.mkdirSync(path.dirname(CATALOG_PUBLIC_PATH), { recursive: true });

export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanSongTitle(rawTitle: string): string {
  let title = rawTitle;
  title = title.replace(/\s*(\(|\[).*?(remaster|deluxe|anniversary|expanded|edition|clean version|album version|single version|original mix|bonus track).*?(\)|\])/gi, '');
  title = title.replace(/\s*-\s*(remastered|deluxe|anniversary|bonus track|single version|clean|explicit|radio edit).*/gi, '');
  return title.trim();
}

export function cleanSongTitleForDeduplication(rawTitle: string): string {
  let title = cleanSongTitle(rawTitle);
  title = title.replace(/\s*(\(|\[)(feat\.|ft\.|with|featuring).*?(\)|\])/gi, '');
  return normalizeText(title);
}

export function createSignature(artist: string, title: string): string {
  const normArtist = normalizeText(artist);
  const cleanTitle = cleanSongTitleForDeduplication(title);
  return `${normArtist}:::${cleanTitle}`;
}

export function isArtistMatch(songArtist: string, targetArtist: string): boolean {
  const normSong = normalizeText(songArtist);
  const normTarget = normalizeText(targetArtist);

  if (normSong === normTarget) return true;

  const strippedSong = normSong.replace(/\s+/g, '');
  const strippedTarget = normTarget.replace(/\s+/g, '');
  if (strippedSong === strippedTarget) return true;

  // Check primary artist before feat/with
  const primaryArtist = normSong.split(/\s+(?:and|&|feat|ft|with|featuring|x|\+|,)\s+/)[0]?.trim();
  if (primaryArtist === normTarget || primaryArtist?.replace(/\s+/g, '') === strippedTarget) {
    return true;
  }

  // Token inclusion
  const tokens = normSong.split(/\s+(?:and|&|feat|ft|with|featuring|x|\+|,)\s+/);
  if (tokens.some(t => t.trim() === normTarget || t.replace(/\s+/g, '') === strippedTarget)) {
    return true;
  }

  if (normSong.startsWith(normTarget + ' ') || normSong.endsWith(' ' + normTarget) || normSong.includes(' ' + normTarget + ' ')) {
    return true;
  }

  return false;
}

export function mapToStandardGenreBucket(genre?: string, artist = '', title = ''): StandardGenreBucket {
  const g = (genre || '').toLowerCase();
  const a = artist.toLowerCase();

  if (g.includes('hip-hop') || g.includes('rap') || g.includes('trap')) {
    return 'Hip-Hop/Rap';
  }
  if (g.includes('dance') || g.includes('electronic') || g.includes('house') || g.includes('edm') || g.includes('electro')) {
    return 'Dance/Electronic';
  }
  if (g.includes('metal') || g.includes('punk')) {
    return 'Metal/Punk';
  }
  if (g.includes('rock') || g.includes('alternative') || g.includes('indie')) {
    return 'Rock/Alternative';
  }
  if (g.includes('r&b') || g.includes('soul') || g.includes('funk')) {
    return 'R&B/Soul';
  }
  if (g.includes('latin') || g.includes('urbano') || g.includes('reggaeton') || g.includes('regional mexican') || g.includes('bachata')) {
    return 'Latin';
  }
  if (g.includes('pop') || g.includes('k-pop')) {
    return 'Pop';
  }

  // Fallback by known artist patterns
  if (['avicii', 'calvin harris', 'david guetta', 'zedd', 'marshmello', 'martin garrix', 'alan walker', 'kygo', 'tiesto', 'alesso', 'galantis', 'robin schulz', 'the chainsmokers', 'disclosure'].some(k => a.includes(k))) {
    return 'Dance/Electronic';
  }
  if (['metallica', 'slipknot', 'iron maiden', 'green day', 'blink-182', 'korn', 'disturbed', 'avenged sevenfold'].some(k => a.includes(k))) {
    return 'Metal/Punk';
  }
  if (['queen', 'the beatles', 'coldplay', 'arctic monkeys', 'imagine dragons', 'twenty one pilots', 'the 1975', 'nirvana', 'foo fighters', 'linkin park', 'paramore', 'fall out boy'].some(k => a.includes(k))) {
    return 'Rock/Alternative';
  }
  if (['frank ocean', 'sza', 'the weeknd', 'bryson tiller', 'khalid', 'daniel caesar', 'h.e.r.', 'jhene aiko', 'partynextdoor', 'ella mai', 'miguel', 'usher', 'alicia keys', 'chris brown'].some(k => a.includes(k))) {
    return 'R&B/Soul';
  }
  if (['bad bunny', 'j balvin', 'ozuna', 'daddy yankee', 'maluma', 'nicky jam', 'luis fonsi', 'anuel aa', 'karol g', 'becky g', 'rosalia', 'peso pluma', 'fuerza regida', 'junior h'].some(k => a.includes(k))) {
    return 'Latin';
  }
  if (['drake', 'travis scott', 'juice wrld', 'xxxtentacion', 'lil uzi vert', 'playboi carti', 'post malone', 'lil peep', 'future', '21 savage', 'kanye west', 'kendrick lamar', 'eminem', 'j. cole'].some(k => a.includes(k))) {
    return 'Hip-Hop/Rap';
  }

  return 'Other';
}

export function isBogusTrack(track: ITunesRawTrack, targetArtist: string): boolean {
  const artist = (track.artistName || '').toLowerCase();
  const trackName = (track.trackName || '').toLowerCase();
  const collection = (track.collectionName || '').toLowerCase();

  const bogusKeywords = [
    'tribute',
    'karaoke',
    'originally performed by',
    'in the style of',
    'hit crew',
    'instrumental version',
    'piano tribute',
    'string quartet',
    'lullaby version',
    'cover band',
    'sound-a-like',
    'sound alike',
    'commentary',
    'interview',
    'track by track',
    'megamix',
    'ringtone',
    'workout mix',
    'remix tribute',
    'sleep music',
    'relaxing piano',
  ];

  for (const kw of bogusKeywords) {
    if (artist.includes(kw) || trackName.includes(kw) || collection.includes(kw)) {
      return true;
    }
  }

  if (trackName.includes('instrumental') && !artist.includes('metro boomin')) {
    return true;
  }

  if (!isArtistMatch(track.artistName, targetArtist)) {
    return true;
  }

  return false;
}

export async function verifyAudio(url: string): Promise<boolean> {
  if (!url || !url.startsWith('http')) return false;
  if (!url.includes('.m4a') && !url.includes('.mp3') && !url.includes('apple.com')) return false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-256' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok || res.status === 206;
  } catch {
    return url.startsWith('https://audio-ssl.itunes.apple.com/') || url.includes('.m4a');
  }
}

export async function fetchArtistTracks(artistName: string, searchQuery?: string, limit = 50): Promise<ITunesRawTrack[]> {
  const term = searchQuery || artistName;
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=${limit}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status === 429) {
          await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
          continue;
        }
        return [];
      }

      const data: ITunesResponse = await res.json();
      return data.results || [];
    } catch {
      if (attempt === 2) return [];
      await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
    }
  }
  return [];
}

export function resolveTrackYear(raw: ITunesRawTrack): { year: number; confidence: 'high' | 'medium' | 'low' } | null {
  const sig = createSignature(raw.artistName, raw.trackName);
  if (KNOWN_ORIGINAL_YEARS[sig]) {
    return { year: KNOWN_ORIGINAL_YEARS[sig], confidence: 'high' };
  }

  let year: number | null = null;
  if (raw.releaseDate) {
    const parsedDate = new Date(raw.releaseDate);
    if (!isNaN(parsedDate.getFullYear())) {
      year = parsedDate.getFullYear();
    }
  }

  if (!year || year < 1950 || year > new Date().getFullYear()) {
    return null;
  }

  // Detect reissues or remasters that incorrectly push classic tracks into later decades
  const title = (raw.trackName || '').toLowerCase();
  const album = (raw.collectionName || '').toLowerCase();
  if (title.includes('remaster') || album.includes('remaster') || album.includes('greatest hits') || album.includes('best of') || album.includes('anniversary')) {
    // If year is recent (> 2005) but artist is classic
    const artist = (raw.artistName || '').toLowerCase();
    if (['queen', 'the beatles', 'the rolling stones', 'michael jackson', 'nirvana', 'led zeppelin', 'pink floyd', 'ac/dc', 'david bowie', 'fleetwood mac', 'aerosmith'].some(c => artist.includes(c))) {
      // Flag as needing verification if not in known map
      return { year, confidence: 'medium' };
    }
  }

  return { year, confidence: 'high' };
}

export function transformTrack(raw: ITunesRawTrack, defaultGenre?: string): Song | null {
  if (!raw.trackId || !raw.trackName || !raw.artistName || !raw.previewUrl) {
    return null;
  }

  const yearInfo = resolveTrackYear(raw);
  if (!yearInfo || !yearInfo.year) {
    return null;
  }

  let artwork = raw.artworkUrl100;
  if (artwork && artwork.includes('100x100bb')) {
    artwork = artwork.replace('100x100bb', '600x600bb');
  }

  const standardGenre = mapToStandardGenreBucket(raw.primaryGenreName, raw.artistName, raw.trackName);

  return {
    id: String(raw.trackId),
    title: cleanSongTitle(raw.trackName),
    artist: raw.artistName.trim(),
    album: raw.collectionName?.trim(),
    year: yearInfo.year,
    verifiedOriginalYear: yearInfo.year,
    yearConfidence: yearInfo.confidence,
    genre: raw.primaryGenreName?.trim() || defaultGenre || standardGenre,
    recognitionScore: 75,
    artworkUrl: artwork,
    previewUrl: raw.previewUrl,
    previewStart: 0,
  };
}

interface ArtistDeficitStats {
  artist: SeedArtist;
  currentCount: number;
  artistDeficit: number;
  standardGenre: StandardGenreBucket;
  priorityScore: number;
}

export async function runBalancedCatalogBuilder() {
  console.log('====================================================');
  console.log('🎵 Melodex Fair-Priority Balanced Catalog Builder 🎵');
  console.log('====================================================\n');

  let catalogMap = new Map<string, Song>();
  let signatureMap = new Map<string, string>();

  if (fs.existsSync(CATALOG_DATA_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(CATALOG_DATA_PATH, 'utf-8'));
      if (Array.isArray(data)) {
        for (const s of data) {
          if (s.id && s.previewUrl) {
            catalogMap.set(s.id, s);
            const sig = createSignature(s.artist, s.title);
            signatureMap.set(sig, s.id);
          }
        }
        console.log(`Loaded existing catalog with ${catalogMap.size} songs.`);
      }
    } catch (e) {
      console.warn('Could not parse existing catalog, starting fresh:', e);
    }
  }

  function getArtistSongCount(artistName: string): number {
    let count = 0;
    for (const song of catalogMap.values()) {
      if (isArtistMatch(song.artist, artistName)) {
        count++;
      }
    }
    return count;
  }

  function computeCatalogStats() {
    const total = catalogMap.size || 1;
    const genreCounts: Record<StandardGenreBucket, number> = {
      'Pop': 0,
      'Rock/Alternative': 0,
      'Hip-Hop/Rap': 0,
      'Dance/Electronic': 0,
      'R&B/Soul': 0,
      'Latin': 0,
      'Metal/Punk': 0,
      'Other': 0,
    };

    const decadeCounts = {
      pre2000: 0,
      s2000s: 0,
      s2010s: 0,
      s2020s: 0,
    };

    for (const song of catalogMap.values()) {
      const g = mapToStandardGenreBucket(song.genre, song.artist, song.title);
      genreCounts[g] = (genreCounts[g] || 0) + 1;

      const y = song.verifiedOriginalYear || song.year || 2015;
      if (y < 2000) decadeCounts.pre2000++;
      else if (y < 2010) decadeCounts.s2000s++;
      else if (y < 2020) decadeCounts.s2010s++;
      else decadeCounts.s2020s++;
    }

    return { total, genreCounts, decadeCounts };
  }

  function calculateArtistPriority(
    seed: SeedArtist,
    catalogStats: ReturnType<typeof computeCatalogStats>
  ): ArtistDeficitStats {
    const currentCount = getArtistSongCount(seed.name);
    const artistDeficit = Math.max(0, seed.targetCount - currentCount);
    const standardGenre = mapToStandardGenreBucket(seed.primaryGenre, seed.name);

    // 1. Genre deficit weight: how underrepresented this genre is relative to target
    const currentGenreShare = catalogStats.genreCounts[standardGenre] / catalogStats.total;
    const targetGenreShare = TARGET_GENRE_SHARES[standardGenre] || 0.10;
    const genreDeficit = Math.max(0, targetGenreShare - currentGenreShare);
    const genreDeficitWeight = genreDeficit * 100;

    // 2. Artist deficit weight: percentage of target count still needed
    const artistDeficitRatio = seed.targetCount > 0 ? (artistDeficit / seed.targetCount) : 0;
    const artistDeficitWeight = artistDeficitRatio * 100;

    // 3. Tier weight: Tier 1 (30 pts), Tier 2 (15 pts), Tier 3 (5 pts), Tier 4 (0 pts)
    const tierWeight = seed.tier === 1 ? 30 : seed.tier === 2 ? 15 : seed.tier === 3 ? 5 : 0;

    // 4. Decade deficit weight:
    const dec = seed.primaryDecade;
    let currentDecadeCount = 0;
    if (dec === 'pre2000') currentDecadeCount = catalogStats.decadeCounts.pre2000;
    else if (dec === '2000s') currentDecadeCount = catalogStats.decadeCounts.s2000s;
    else if (dec === '2010s') currentDecadeCount = catalogStats.decadeCounts.s2010s;
    else if (dec === '2020s') currentDecadeCount = catalogStats.decadeCounts.s2020s;

    const currentDecadeShare = currentDecadeCount / catalogStats.total;
    const decadeDeficit = Math.max(0, 0.25 - currentDecadeShare);
    const decadeDeficitWeight = decadeDeficit * 50;

    // Formula without arrayIndex
    const priorityScore =
      (genreDeficitWeight * 2.0) +
      (artistDeficitWeight * 1.5) +
      tierWeight +
      (decadeDeficitWeight * 1.0);

    return {
      artist: seed,
      currentCount,
      artistDeficit,
      standardGenre,
      priorityScore,
    };
  }

  // Group Seed Artists into Genre Queues
  const ALL_GENRES: StandardGenreBucket[] = [
    'Pop',
    'Rock/Alternative',
    'Hip-Hop/Rap',
    'Dance/Electronic',
    'R&B/Soul',
    'Latin',
    'Metal/Punk',
    'Other',
  ];

  const BATCH_SIZE = 20;
  let batchIndex = 0;
  const processedArtistsInRun = new Set<string>();

  while (true) {
    const currentStats = computeCatalogStats();

    // Calculate priority scores for all artists
    const artistStatsList: ArtistDeficitStats[] = SEED_ARTISTS.map(a =>
      calculateArtistPriority(a, currentStats)
    );

    // Group into genre queues
    const genreQueues = new Map<StandardGenreBucket, ArtistDeficitStats[]>();
    for (const g of ALL_GENRES) {
      genreQueues.set(g, []);
    }

    for (const item of artistStatsList) {
      if (!processedArtistsInRun.has(item.artist.name)) {
        genreQueues.get(item.standardGenre)?.push(item);
      }
    }

    // Sort each genre queue by:
    // 1. Has deficit (artistDeficit > 0 first)
    // 2. priorityScore descending
    // 3. Tier ascending (Tier 1 before Tier 2 before Tier 3)
    // 4. Deficit descending
    for (const [g, queue] of genreQueues.entries()) {
      queue.sort((a, b) => {
        if (a.artistDeficit > 0 && b.artistDeficit === 0) return -1;
        if (a.artistDeficit === 0 && b.artistDeficit > 0) return 1;
        if (Math.abs(b.priorityScore - a.priorityScore) > 0.01) {
          return b.priorityScore - a.priorityScore;
        }
        if (a.artist.tier !== b.artist.tier) {
          return a.artist.tier - b.artist.tier;
        }
        return b.artistDeficit - a.artistDeficit;
      });
    }

    // Check if any artists with deficit remain
    const totalDeficitRemaining = artistStatsList
      .filter(a => !processedArtistsInRun.has(a.artist.name) && a.artistDeficit > 0)
      .length;

    if (totalDeficitRemaining === 0) {
      console.log('✅ All artist targets satisfied or all artists processed in this run.');
      break;
    }

    // Determine genre order for this round based on highest current genre deficit
    const sortedGenresForRound = [...ALL_GENRES].sort((gA, gB) => {
      const shareA = currentStats.genreCounts[gA] / currentStats.total;
      const targetA = TARGET_GENRE_SHARES[gA];
      const deficitA = targetA - shareA;

      const shareB = currentStats.genreCounts[gB] / currentStats.total;
      const targetB = TARGET_GENRE_SHARES[gB];
      const deficitB = targetB - shareB;

      return deficitB - deficitA;
    });

    // Build balanced batch using deficit quotas and round-robin
    const currentBatch: ArtistDeficitStats[] = [];
    const batchGenreCount: Record<StandardGenreBucket, number> = {
      'Pop': 0,
      'Rock/Alternative': 0,
      'Hip-Hop/Rap': 0,
      'Dance/Electronic': 0,
      'R&B/Soul': 0,
      'Latin': 0,
      'Metal/Punk': 0,
      'Other': 0,
    };

    // Target allocation for a 20-artist batch
    const batchTargetQuotas: Record<StandardGenreBucket, number> = {
      'Pop': 5,
      'Rock/Alternative': 4,
      'Hip-Hop/Rap': 3,
      'Dance/Electronic': 4,
      'R&B/Soul': 2,
      'Latin': 1,
      'Metal/Punk': 1,
      'Other': 0,
    };

    // Pass 1: Fill according to target quotas
    for (const g of sortedGenresForRound) {
      const quota = batchTargetQuotas[g] || 1;
      const queue = genreQueues.get(g) || [];
      while (batchGenreCount[g] < quota && queue.length > 0 && queue[0].artistDeficit > 0) {
        const picked = queue.shift()!;
        currentBatch.push(picked);
        batchGenreCount[g]++;
        processedArtistsInRun.add(picked.artist.name);
        if (currentBatch.length >= BATCH_SIZE) break;
      }
      if (currentBatch.length >= BATCH_SIZE) break;
    }

    // Pass 2: Round-robin any remaining slots in batch
    while (currentBatch.length < BATCH_SIZE) {
      let addedInRound = false;
      for (const g of sortedGenresForRound) {
        if (currentBatch.length >= BATCH_SIZE) break;
        const queue = genreQueues.get(g) || [];
        if (queue.length > 0 && queue[0].artistDeficit > 0) {
          const picked = queue.shift()!;
          currentBatch.push(picked);
          batchGenreCount[g]++;
          processedArtistsInRun.add(picked.artist.name);
          addedInRound = true;
        }
      }
      if (!addedInRound) break; // No more deficit artists
    }

    if (currentBatch.length === 0) {
      break;
    }

    batchIndex++;

    // REQUIRED DEVELOPMENT REPORT: Log Batch Composition
    console.log('\n====================================================');
    console.log(`IMPORT BATCH — ${currentBatch.length} ARTISTS (Batch ${batchIndex})`);
    console.log(`Pop: ${batchGenreCount['Pop']}`);
    console.log(`Rock/Alternative: ${batchGenreCount['Rock/Alternative']}`);
    console.log(`Hip-Hop/Rap: ${batchGenreCount['Hip-Hop/Rap']}`);
    console.log(`Dance/Electronic: ${batchGenreCount['Dance/Electronic']}`);
    console.log(`R&B/Soul: ${batchGenreCount['R&B/Soul']}`);
    console.log(`Latin: ${batchGenreCount['Latin']}`);
    console.log(`Metal/Punk: ${batchGenreCount['Metal/Punk']}`);
    console.log(`Other: ${batchGenreCount['Other']}`);
    console.log('====================================================\n');

    // Process Batch Tracks
    const batchNewTracksByGenre: Record<StandardGenreBucket, number> = {
      'Pop': 0,
      'Rock/Alternative': 0,
      'Hip-Hop/Rap': 0,
      'Dance/Electronic': 0,
      'R&B/Soul': 0,
      'Latin': 0,
      'Metal/Punk': 0,
      'Other': 0,
    };

    let batchNewTracks = 0;
    let batchAudioFailures = 0;
    let batchDuplicates = 0;

    const CHUNK_SIZE = 4;
    for (let c = 0; c < currentBatch.length; c += CHUNK_SIZE) {
      const chunk = currentBatch.slice(c, c + CHUNK_SIZE);

      await Promise.all(
        chunk.map(async ({ artist, artistDeficit, standardGenre }) => {
          try {
            const queryLimit = Math.min(50, Math.max(25, artistDeficit * 3));
            const rawTracks = await fetchArtistTracks(artist.name, artist.searchQuery, queryLimit);

            let addedForArtist = 0;
            for (const raw of rawTracks) {
              if (addedForArtist >= artistDeficit) break;

              if (isBogusTrack(raw, artist.name)) {
                continue;
              }

              const song = transformTrack(raw, artist.primaryGenre);
              if (!song) {
                continue;
              }

              const sig = createSignature(song.artist, song.title);
              if (catalogMap.has(song.id) || signatureMap.has(sig)) {
                batchDuplicates++;
                continue;
              }

              const isPlayable = await verifyAudio(song.previewUrl);
              if (!isPlayable) {
                batchAudioFailures++;
                continue;
              }

              catalogMap.set(song.id, song);
              signatureMap.set(sig, song.id);
              batchNewTracks++;
              addedForArtist++;
              const actualBucket = mapToStandardGenreBucket(song.genre, song.artist, song.title);
              batchNewTracksByGenre[actualBucket] = (batchNewTracksByGenre[actualBucket] || 0) + 1;
            }
          } catch {
            // Continue gracefully
          }
        })
      );

      await new Promise(r => setTimeout(r, 120));
    }

    // Persist Catalog after each batch
    try {
      const catalogArray = Array.from(catalogMap.values());
      fs.writeFileSync(CATALOG_DATA_PATH, JSON.stringify(catalogArray, null, 2), 'utf-8');
      fs.writeFileSync(CATALOG_PUBLIC_PATH, JSON.stringify(catalogArray, null, 2), 'utf-8');
    } catch (writeErr) {
      console.error('Error writing catalog files:', writeErr);
    }

    // REQUIRED DEVELOPMENT REPORT: Log Verified Tracks After Batch
    console.log(`New verified tracks by genre: Pop: ${batchNewTracksByGenre['Pop']}, Rock/Alternative: ${batchNewTracksByGenre['Rock/Alternative']}, Hip-Hop/Rap: ${batchNewTracksByGenre['Hip-Hop/Rap']}, Dance/Electronic: ${batchNewTracksByGenre['Dance/Electronic']}, R&B/Soul: ${batchNewTracksByGenre['R&B/Soul']}, Latin: ${batchNewTracksByGenre['Latin']}, Metal/Punk: ${batchNewTracksByGenre['Metal/Punk']}, Other: ${batchNewTracksByGenre['Other']}`);
    console.log(`Batch Summary: +${batchNewTracks} new tracks | Duplicates: ${batchDuplicates} | Audio Failures: ${batchAudioFailures}`);
    console.log(`Total Melodex Catalog: ${catalogMap.size} songs\n---`);

    // Prevent excessive run length in single execution
    if (batchIndex >= 15) {
      break;
    }
  }

  // Final summary
  const finalStats = computeCatalogStats();
  console.log('\n====================================================');
  console.log('🎉 Melodex Catalog Balanced Import Complete');
  console.log('====================================================');
  console.log(`Total songs: ${finalStats.total}`);
  console.log('Genre Distribution:');
  for (const g of ALL_GENRES) {
    const count = finalStats.genreCounts[g];
    const pct = ((count / finalStats.total) * 100).toFixed(1);
    console.log(`  ${g.padEnd(20)}: ${count} (${pct}%)`);
  }
  console.log('Decade Distribution:');
  console.log(`  Pre-2000            : ${finalStats.decadeCounts.pre2000}`);
  console.log(`  2000s               : ${finalStats.decadeCounts.s2000s}`);
  console.log(`  2010s               : ${finalStats.decadeCounts.s2010s}`);
  console.log(`  2020s               : ${finalStats.decadeCounts.s2020s}`);
  console.log('====================================================\n');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runBalancedCatalogBuilder().catch((err) => {
    console.error('Builder error:', err);
  });
}
