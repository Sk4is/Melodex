import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { KNOWN_ORIGINAL_YEARS } from './knownSongYears.ts';
import { CURATED_2010S_HITS, CuratedTrackRequest } from './curated2010sTracks.ts';

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

const CATALOG_DATA_PATH = path.resolve(__dirname, '../src/data/melodex-catalog.json');
const CATALOG_PUBLIC_PATH = path.resolve(__dirname, '../public/melodex-catalog.json');

function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanSongTitle(rawTitle: string): string {
  let title = rawTitle;
  title = title.replace(/\s*(\(|\[).*?(remaster|deluxe|anniversary|expanded|edition|clean version|album version|single version|original mix|bonus track).*?(\)|\])/gi, '');
  title = title.replace(/\s*-\s*(remastered|deluxe|anniversary|bonus track|single version|clean|explicit|radio edit).*/gi, '');
  return title.trim();
}

function cleanSongTitleForDeduplication(rawTitle: string): string {
  let title = cleanSongTitle(rawTitle);
  title = title.replace(/\s*(\(|\[)(feat\.|ft\.|with|featuring).*?(\)|\])/gi, '');
  return normalizeText(title);
}

function createSignature(artist: string, title: string): string {
  const normArtist = normalizeText(artist);
  const cleanTitle = cleanSongTitleForDeduplication(title);
  return `${normArtist}:::${cleanTitle}`;
}

function isArtistMatch(songArtist: string, targetArtist: string): boolean {
  const normSong = normalizeText(songArtist);
  const normTarget = normalizeText(targetArtist);

  if (normSong === normTarget) return true;

  const strippedSong = normSong.replace(/\s+/g, '');
  const strippedTarget = normTarget.replace(/\s+/g, '');
  if (strippedSong === strippedTarget) return true;

  const primaryArtist = normSong.split(/\s+(?:and|&|feat|ft|with|featuring|x|\+|,)\s+/)[0]?.trim();
  if (primaryArtist === normTarget || primaryArtist?.replace(/\s+/g, '') === strippedTarget) {
    return true;
  }

  const tokens = normSong.split(/\s+(?:and|&|feat|ft|with|featuring|x|\+|,)\s+/);
  if (tokens.some(t => t.trim() === normTarget || t.replace(/\s+/g, '') === strippedTarget)) {
    return true;
  }

  if (normSong.startsWith(normTarget + ' ') || normSong.endsWith(' ' + normTarget) || normSong.includes(' ' + normTarget + ' ')) {
    return true;
  }

  return false;
}

function isBogusTrack(title: string, artist: string, album?: string): boolean {
  const normTitle = (title || '').toLowerCase();
  const normArtist = (artist || '').toLowerCase();
  const normAlbum = (album || '').toLowerCase();

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
    if (normArtist.includes(kw) || normTitle.includes(kw) || normAlbum.includes(kw)) {
      return true;
    }
  }

  // Search match mismatches from past scripts
  if (normArtist === 'ballpoint' && normTitle === 'ice cube') return true;
  if (normArtist === 'j monty' && normTitle.includes('21 savage')) return true;
  if (normArtist === 'ddg' && normTitle === 'lil baby') return true;
  if (normArtist.includes('jim johnston') && normTitle.includes('the game')) return true;
  if (normArtist.includes('milky chance') && normTitle.includes('the game')) return true;

  return false;
}

export function normalizeGenre(rawGenre?: string, artist = '', title = ''): string {
  const g = (rawGenre || '').trim();
  const lowerG = g.toLowerCase();
  const lowerA = artist.toLowerCase();

  if (lowerG.includes('hip-hop') || lowerG.includes('rap') || lowerG.includes('trap')) {
    return 'Hip-Hop/Rap';
  }
  if (
    lowerG.includes('dance') ||
    lowerG.includes('electronic') ||
    lowerG.includes('house') ||
    lowerG.includes('edm') ||
    lowerG.includes('electro')
  ) {
    return 'Electronic/Dance';
  }
  if (
    lowerG.includes('rock') ||
    lowerG.includes('metal') ||
    lowerG.includes('punk') ||
    lowerG.includes('alternative') ||
    lowerG.includes('indie')
  ) {
    return 'Rock/Alternative/Indie';
  }
  if (lowerG.includes('r&b') || lowerG.includes('soul') || lowerG.includes('funk')) {
    return 'R&B';
  }
  if (
    lowerG.includes('latin') ||
    lowerG.includes('urbano') ||
    lowerG.includes('reggaeton') ||
    lowerG.includes('tropical') ||
    lowerG.includes('bachata')
  ) {
    return 'Latin';
  }
  if (lowerG.includes('pop') || lowerG.includes('k-pop')) {
    return 'Pop';
  }

  // Fallbacks by known artist
  if (['avicii', 'calvin harris', 'david guetta', 'zedd', 'marshmello', 'martin garrix', 'alan walker', 'kygo', 'tiesto', 'alesso', 'galantis', 'robin schulz', 'the chainsmokers', 'disclosure'].some(a => lowerA.includes(a))) {
    return 'Electronic/Dance';
  }
  if (['arctic monkeys', 'coldplay', 'imagine dragons', 'tame impala', 'twenty one pilots', 'the 1975', 'the neighbourhood', 'foster the people', 'cage the elephant', 'paramore', 'fall out boy', 'muse', 'bastille', 'bastille', 'lumineers', 'vance joy', 'hozier'].some(a => lowerA.includes(a))) {
    return 'Rock/Alternative/Indie';
  }
  if (['frank ocean', 'sza', 'the weeknd', 'bryson tiller', 'khalid', 'daniel caesar', 'h.e.r.', 'jhene aiko', 'partynextdoor', 'ella mai', 'miguel'].some(a => lowerA.includes(a))) {
    return 'R&B';
  }
  if (['bad bunny', 'j balvin', 'ozuna', 'daddy yankee', 'maluma', 'nicky jam', 'luis fonsi', 'anuel aa', 'karol g', 'becky g', 'rosalia', 'cnco', 'farruko'].some(a => lowerA.includes(a))) {
    return 'Latin';
  }
  if (['drake', 'travis scott', 'juice wrld', 'xxxtentacion', 'lil uzi vert', 'playboi carti', 'post malone', 'lil peep', 'lil skies', 'future', '21 savage', 'migos', 'trippie redd', 'kanye west', 'kendrick lamar', 'young thug', 'gunna'].some(a => lowerA.includes(a))) {
    return 'Hip-Hop/Rap';
  }

  return g || 'Pop';
}

async function fetchITunesSong(req: CuratedTrackRequest): Promise<Song | null> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(req.query)}&entity=song&limit=4`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      if (!data.results || data.results.length === 0) return null;

      for (const track of data.results) {
        if (!track.trackId || !track.trackName || !track.artistName || !track.previewUrl) {
          continue;
        }
        if (isBogusTrack(track.trackName, track.artistName, track.collectionName)) {
          continue;
        }
        if (!isArtistMatch(track.artistName, req.artist)) {
          continue;
        }

        let artwork = track.artworkUrl100;
        if (artwork && artwork.includes('100x100bb')) {
          artwork = artwork.replace('100x100bb', '600x600bb');
        }

        const songYear = req.expectedYear;

        return {
          id: String(track.trackId),
          title: track.trackName.trim(),
          artist: track.artistName.trim(),
          album: track.collectionName?.trim(),
          year: songYear,
          verifiedOriginalYear: songYear,
          yearConfidence: 'high',
          genre: normalizeGenre(track.primaryGenreName || req.genre, req.artist, track.trackName),
          recognitionScore: req.recognitionScore,
          artworkUrl: artwork,
          previewUrl: track.previewUrl,
          previewStart: 0,
        };
      }
    } catch {
      // Continue to next attempt
    }
  }
  return null;
}

async function run() {
  console.log('=== Melodex Catalog Audit, Balancing & Expansion ===');

  let existingSongs: Song[] = [];
  if (fs.existsSync(CATALOG_DATA_PATH)) {
    try {
      existingSongs = JSON.parse(fs.readFileSync(CATALOG_DATA_PATH, 'utf-8'));
    } catch (e) {
      console.warn('Could not read existing catalog:', e);
    }
  }

  console.log(`Auditing ${existingSongs.length} existing songs...`);

  const songMap = new Map<string, Song>();
  const signatureMap = new Map<string, string>();

  // Process and sanitize existing catalog
  for (const s of existingSongs) {
    if (!s.id || !s.title || !s.artist || !s.previewUrl) continue;
    if (isBogusTrack(s.title, s.artist, s.album)) continue;

    const sig = createSignature(s.artist, s.title);
    if (signatureMap.has(sig)) {
      continue;
    }

    // Year resolution
    let originalYear: number | null = null;
    let confidence: 'high' | 'medium' | 'low' = 'high';

    if (KNOWN_ORIGINAL_YEARS[sig]) {
      originalYear = KNOWN_ORIGINAL_YEARS[sig];
      confidence = 'high';
    } else {
      const alb = (s.album || '').toLowerCase();
      const tit = (s.title || '').toLowerCase();
      const isReissue =
        alb.includes('greatest hits') ||
        alb.includes('best of') ||
        alb.includes('remaster') ||
        alb.includes('anniversary') ||
        alb.includes('collection') ||
        alb.includes('the essential') ||
        alb.includes('anthology') ||
        alb.includes('platinum') ||
        alb.includes('homecoming live') ||
        alb.includes('gold') ||
        tit.includes('remaster');

      if (isReissue && s.year && s.year >= 2000) {
        if (s.artist.toLowerCase().includes('ice cube') && tit.includes('good day')) originalYear = 1992;
        else if (s.artist.toLowerCase().includes('mobb deep') && tit.includes('shook ones')) originalYear = 1995;
        else if (s.artist.toLowerCase().includes('big pun') && tit.includes('killer')) originalYear = 1998;
        else if (s.artist.toLowerCase().includes('beyonce') && tit.includes('deja vu')) originalYear = 2006;
        else if (s.artist.toLowerCase().includes('snoop dogg') && tit.includes('whats my name, pt. 2')) originalYear = 2000;
        else if (s.artist.toLowerCase().includes('50 cent') && tit.includes('outta control')) originalYear = 2005;
        else if (s.artist.toLowerCase().includes('taylor swift') && tit.includes('love story')) originalYear = 2008;
        else if (s.artist.toLowerCase().includes('taylor swift') && tit.includes('you belong with me')) originalYear = 2008;
        else if (s.year) {
          originalYear = s.year;
          confidence = 'high';
        }
      } else if (s.year) {
        originalYear = s.year;
        confidence = 'high';
      }
    }

    if (!originalYear) continue;

    const recScore = s.recognitionScore ?? 75;

    const sanitized: Song = {
      id: s.id,
      title: s.title,
      artist: s.artist,
      album: s.album,
      year: originalYear,
      verifiedOriginalYear: originalYear,
      yearConfidence: confidence,
      genre: normalizeGenre(s.genre, s.artist, s.title),
      recognitionScore: recScore,
      artworkUrl: s.artworkUrl,
      previewUrl: s.previewUrl,
      previewStart: 0,
    };

    songMap.set(sanitized.id, sanitized);
    signatureMap.set(sig, sanitized.id);
  }

  console.log(`Sanitized existing catalog to ${songMap.size} songs.`);

  console.log(`Fetching ${CURATED_2010S_HITS.length} iconic curated 2010s tracks in concurrent batches...`);
  const BATCH_SIZE = 12;
  let addedCount = 0;

  for (let i = 0; i < CURATED_2010S_HITS.length; i += BATCH_SIZE) {
    const batch = CURATED_2010S_HITS.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (req) => {
        const sig = createSignature(req.artist, req.query);
        if (signatureMap.has(sig)) {
          const existingId = signatureMap.get(sig)!;
          const existing = songMap.get(existingId);
          if (existing) {
            existing.verifiedOriginalYear = req.expectedYear;
            existing.year = req.expectedYear;
            existing.yearConfidence = 'high';
            existing.genre = normalizeGenre(req.genre, req.artist, existing.title);
            existing.recognitionScore = req.recognitionScore;
          }
          return null;
        }
        return fetchITunesSong(req);
      })
    );

    for (const fetched of results) {
      if (fetched) {
        const fetchedSig = createSignature(fetched.artist, fetched.title);
        if (!signatureMap.has(fetchedSig) && !songMap.has(fetched.id)) {
          songMap.set(fetched.id, fetched);
          signatureMap.set(fetchedSig, fetched.id);
          addedCount++;
        }
      }
    }

    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`Successfully added ${addedCount} new curated iconic hits.`);
  console.log(`Total catalog now contains: ${songMap.size} songs.`);

  const finalCatalog = Array.from(songMap.values());

  const genreStats: Record<string, number> = {};
  const decadeStats: Record<string, number> = { pre2000: 0, '2000s': 0, '2010s': 0, '2020s': 0 };

  for (const s of finalCatalog) {
    const g = s.genre || 'Other';
    const y = s.verifiedOriginalYear || s.year || 0;

    if (y < 2000) decadeStats.pre2000++;
    else if (y <= 2009) decadeStats['2000s']++;
    else if (y <= 2019) {
      decadeStats['2010s']++;
      genreStats[g] = (genreStats[g] || 0) + 1;
    } else decadeStats['2020s']++;
  }

  console.log('Final Decades breakdown:', decadeStats);
  console.log('Final 2010s Genre breakdown:', genreStats);

  const jsonStr = JSON.stringify(finalCatalog, null, 2);
  fs.writeFileSync(CATALOG_DATA_PATH, jsonStr, 'utf-8');
  fs.writeFileSync(CATALOG_PUBLIC_PATH, jsonStr, 'utf-8');
  console.log('Saved catalog to src/data and public!');
}

run().catch(console.error);
