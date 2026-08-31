import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SEED_ARTISTS, SeedArtist } from './seedArtists.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  year?: number;
  genre?: string;
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

const CATALOG_DATA_PATH = path.resolve(__dirname, '../src/data/melodex-catalog.json');
const CATALOG_PUBLIC_PATH = path.resolve(__dirname, '../public/melodex-catalog.json');

fs.mkdirSync(path.dirname(CATALOG_DATA_PATH), { recursive: true });
fs.mkdirSync(path.dirname(CATALOG_PUBLIC_PATH), { recursive: true });

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

function cleanSongTitleForDeduplication(rawTitle: string): string {
  let title = rawTitle;
  title = title.replace(/\s*(\(|\[)(feat\.|ft\.|with|featuring).*?(\)|\])/gi, '');
  title = title.replace(/\s*(\(|\[).*?(remaster|deluxe|anniversary|expanded|edition|clean|explicit|bonus track|radio edit|album version|single version).*?(\)|\])/gi, '');
  title = title.replace(/\s*-\s*(remastered|deluxe|anniversary|bonus track|single|clean|explicit|radio edit).*/gi, '');
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
  if (normSong.includes(normTarget) || normTarget.includes(normSong)) {
    const tokens = normSong.split(/\s+(?:and|&|feat|ft|with|featuring|x|\+)\s+/);
    if (tokens.some(t => t.trim() === normTarget || t.includes(normTarget))) {
      return true;
    }
    if (normSong.startsWith(normTarget + ' ') || normSong.endsWith(' ' + normTarget)) {
      return true;
    }
  }
  return false;
}

async function verifyAudio(url: string): Promise<boolean> {
  if (!url || !url.startsWith('http')) return false;
  if (!url.includes('.m4a') && !url.includes('.mp3') && !url.includes('apple.com')) return false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

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

function isBogusTrack(track: ITunesRawTrack, targetArtist: string): boolean {
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
  ];

  for (const kw of bogusKeywords) {
    if (artist.includes(kw) || trackName.includes(kw) || collection.includes(kw)) {
      return true;
    }
  }

  if (!isArtistMatch(track.artistName, targetArtist)) {
    return true;
  }

  return false;
}

async function fetchArtistTracks(artistName: string, searchQuery?: string, limit = 50): Promise<ITunesRawTrack[]> {
  const term = searchQuery || artistName;
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=${limit}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status === 429) {
          await new Promise(r => setTimeout(r, 1200 * (attempt + 1)));
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

function transformTrack(raw: ITunesRawTrack, defaultGenre?: string): Song | null {
  if (!raw.trackId || !raw.trackName || !raw.artistName || !raw.previewUrl) {
    return null;
  }

  let year: number | undefined = undefined;
  if (raw.releaseDate) {
    const parsedDate = new Date(raw.releaseDate);
    if (!isNaN(parsedDate.getFullYear())) {
      year = parsedDate.getFullYear();
    }
  }

  if (!year) {
    return null;
  }

  let artwork = raw.artworkUrl100;
  if (artwork && artwork.includes('100x100bb')) {
    artwork = artwork.replace('100x100bb', '600x600bb');
  }

  return {
    id: String(raw.trackId),
    title: raw.trackName.trim(),
    artist: raw.artistName.trim(),
    album: raw.collectionName?.trim(),
    year,
    genre: raw.primaryGenreName?.trim() || defaultGenre || 'Pop',
    artworkUrl: artwork,
    previewUrl: raw.previewUrl,
    previewStart: 0,
  };
}

async function run() {
  console.log('=== Melodex Music Catalog Builder ===');

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

  const BATCH_SIZE = 25;
  const batches: SeedArtist[][] = [];
  for (let i = 0; i < SEED_ARTISTS.length; i += BATCH_SIZE) {
    batches.push(SEED_ARTISTS.slice(i, i + BATCH_SIZE));
  }

  console.log(`Processing ${SEED_ARTISTS.length} artists in ${batches.length} batches...\n`);

  for (let bIndex = 0; bIndex < batches.length; bIndex++) {
    const batch = batches[bIndex];
    let artistsExpanded = 0;
    let newArtistsAdded = 0;
    let newPlayableSongs = 0;
    let duplicates = 0;
    let audioFailures = 0;

    const CHUNK_SIZE = 5;
    for (let c = 0; c < batch.length; c += CHUNK_SIZE) {
      const chunk = batch.slice(c, c + CHUNK_SIZE);

      await Promise.all(chunk.map(async (seed) => {
        try {
          const currentCount = getArtistSongCount(seed.name);
          const target = seed.targetCount;

          if (currentCount >= target) {
            return;
          }

          const isNew = currentCount === 0;
          const needed = target - currentCount;

          const queryLimit = Math.min(50, Math.max(25, target * 2));
          const rawTracks = await fetchArtistTracks(seed.name, seed.searchQuery, queryLimit);

          let addedForArtist = 0;

          for (const raw of rawTracks) {
            if (addedForArtist >= needed) break;

            if (isBogusTrack(raw, seed.name)) {
              continue;
            }

            const song = transformTrack(raw, seed.primaryGenre);
            if (!song) {
              continue;
            }

            const sig = createSignature(song.artist, song.title);

            if (catalogMap.has(song.id) || signatureMap.has(sig)) {
              duplicates++;
              continue;
            }

            const isAudioPlayable = await verifyAudio(song.previewUrl);
            if (!isAudioPlayable) {
              audioFailures++;
              continue;
            }

            catalogMap.set(song.id, song);
            signatureMap.set(sig, song.id);
            newPlayableSongs++;
            addedForArtist++;
          }

          if (addedForArtist > 0) {
            if (isNew) {
              newArtistsAdded++;
            } else {
              artistsExpanded++;
            }
          }
        } catch {
          // Gracefully continue next artist
        }
      }));

      await new Promise(r => setTimeout(r, 100));
    }

    // Persist after each batch
    try {
      const catalogArray = Array.from(catalogMap.values());
      fs.writeFileSync(CATALOG_DATA_PATH, JSON.stringify(catalogArray, null, 2), 'utf-8');
      fs.writeFileSync(CATALOG_PUBLIC_PATH, JSON.stringify(catalogArray, null, 2), 'utf-8');

      console.log(`Batch ${bIndex + 1}/${batches.length} completed\n`);
      console.log(`Artists processed: ${batch.length}`);
      console.log(`Existing artists expanded: ${artistsExpanded}`);
      console.log(`New artists added: ${newArtistsAdded}`);
      console.log(`New playable songs: ${newPlayableSongs}`);
      console.log(`Duplicates: ${duplicates}`);
      console.log(`Audio failures: ${audioFailures}`);
      console.log(`\nTotal Melodex catalog: ${catalogArray.length} songs\n---`);
    } catch (writeErr) {
      console.error('Error writing catalog files:', writeErr);
    }
  }

  console.log('🎉 Melodex catalog expansion completed successfully!');
  console.log(`Final catalog size: ${catalogMap.size} songs across all eras and genres.`);
}

run().catch((err) => {
  console.error('Builder completed with error:', err);
});
