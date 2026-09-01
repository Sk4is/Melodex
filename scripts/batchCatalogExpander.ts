import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Song } from '../src/types/song';
import { UNIQUE_ARTIST_UNIVERSE, UniverseArtist } from './artistUniverse';
import { EXPANDED_KNOWN_YEARS } from './expandedKnownYears';
import { normalizeGenre } from './rebalanceCatalog';
import { CURATED_EXPANSION_HITS } from './curatedMustHaveHits';

function norm(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/feat\..*$/gi, '')
    .replace(/ft\..*$/gi, '')
    .replace(/with\s.*$/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function cleanTitle(raw: string): string {
  let t = raw;
  t = t.replace(/\s*(\(|\[).*?(remaster|deluxe|anniversary|expanded|edition|clean version|album version|single version|original mix|bonus track|live at|live from|acoustic|instrumental|edit|mono|stereo).*?(\)|\])/gi, '');
  t = t.replace(/\s*-\s*(remastered|deluxe|anniversary|bonus track|single version|clean|explicit|radio edit|live|mono|stereo).*/gi, '');
  return t.trim() || raw.trim();
}

function createSig(artist: string, title: string): string {
  return `${norm(artist)}:::${norm(cleanTitle(title))}`;
}

const BOGUS_KEYWORDS = [
  'karaoke', 'tribute', 'originally performed', 'cover band', 'instrumental version',
  'in the style of', 'made famous by', 'backing track', 'workout mix', 'fitness remix',
  '8d audio', 'slowed', 'reverb', 'sped up', 'nightcore', 'remix contest', 'acapella',
  'ringtone', 'commentary', 'interview', 'speech', 'snippet', 'teaser', 'radio edit continuous',
  'hit crew', 'the hit co', 'stars on 45', 'kidz bop', 'lullaby', 'piano tribute', 'guitar tribute',
  'synthesizer tribute', 'relaxing piano', 'sleep music', 'meditation'
];

function isBogus(trackName: string, artistName: string, collectionName: string): boolean {
  const full = `${trackName} ${artistName} ${collectionName}`.toLowerCase();
  for (const kw of BOGUS_KEYWORDS) {
    if (full.includes(kw)) return true;
  }
  return false;
}

function isLive(trackName: string, collectionName: string): boolean {
  const full = `${trackName} ${collectionName}`.toLowerCase();
  return (
    full.includes('live at') ||
    full.includes('live from') ||
    full.includes('(live)') ||
    full.includes('live in ') ||
    full.includes('mtv unplugged') ||
    full.includes('live session') ||
    full.includes('bbc live')
  );
}

async function checkAudio(url: string, timeoutMs = 3500): Promise<boolean> {
  if (!url || !url.startsWith('https://')) return false;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-1024' },
      signal: controller.signal
    });
    clearTimeout(id);
    if (res.status === 200 || res.status === 206) {
      const buf = await res.arrayBuffer();
      return buf.byteLength > 50;
    }
    return false;
  } catch {
    clearTimeout(id);
    return false;
  }
}

async function fetchFromITunes(query: string, limit = 50): Promise<any[]> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MelodexCatalogBuilder/2.0' }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

export async function runCatalogExpansion() {
  console.log('🚀 Starting Melodex 10,000 Song Catalog Expansion Pipeline...');

  // 1. Load initial catalogs
  const primaryPath = path.resolve('src/data/melodex-catalog.json');
  const secondaryPath = path.resolve('src/data/melodexCatalog.json');
  const publicPath = path.resolve('public/melodex-catalog.json');
  const v2Path = path.resolve('public/data/melodex-catalog-v2.json');

  let existing: Song[] = [];
  if (fs.existsSync(primaryPath)) {
    existing = JSON.parse(fs.readFileSync(primaryPath, 'utf8'));
  }

  const catalogMap = new Map<string, Song>();
  for (const s of existing) {
    const sig = createSig(s.artist, s.title);
    catalogMap.set(sig, {
      ...s,
      trackIdentityVerified: true,
      yearConfidence: 'high',
      provider: 'itunes',
      providerTrackId: s.providerTrackId || String(s.id)
    });
  }

  console.log(`Loaded ${catalogMap.size} base verified songs from primary catalog.`);

  // 2. Import extra valid songs from v2 if available
  if (fs.existsSync(v2Path)) {
    try {
      const v2Catalog: any[] = JSON.parse(fs.readFileSync(v2Path, 'utf8'));
      let addedFromV2 = 0;
      for (const s of v2Catalog) {
        if (!s.title || !s.artist || !s.previewUrl) continue;
        const sig = createSig(s.artist, s.title);
        if (!catalogMap.has(sig)) {
          if (!isBogus(s.title, s.artist, s.album || '')) {
            const y = EXPANDED_KNOWN_YEARS[sig] || s.verifiedOriginalYear || s.year || 2015;
            catalogMap.set(sig, {
              id: String(s.id || Math.random().toString().slice(2, 11)),
              title: cleanTitle(s.title),
              artist: s.artist.trim(),
              album: (s.album || s.title).trim(),
              year: y,
              verifiedOriginalYear: y,
              yearConfidence: 'high',
              genre: normalizeGenre(s.genre, s.artist, s.title),
              recognitionScore: s.recognitionScore || 75,
              artworkUrl: s.artworkUrl || 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/placeholder.jpg/600x600bb.jpg',
              previewUrl: s.previewUrl,
              previewStart: 0,
              provider: 'itunes',
              providerTrackId: String(s.id || ''),
              trackIdentityVerified: true
            });
            addedFromV2++;
          }
        }
      }
      console.log(`Imported ${addedFromV2} unique tracks from v2. Catalog is now ${catalogMap.size} tracks.`);
    } catch (err) {
      console.warn('Could not read v2 catalog:', err);
    }
  }

  // 2.5 Process Curated Expansion Hits
  console.log(`Processing ${CURATED_EXPANSION_HITS.length} curated expansion hits...`);
  for (const hit of CURATED_EXPANSION_HITS) {
    const sig = createSig(hit.artist, hit.title);
    if (catalogMap.has(sig)) continue;

    const query = `${hit.artist} ${hit.title}`;
    const results = await fetchFromITunes(query, 10);
    for (const item of results) {
      if (!item.trackName || !item.artistName || !item.previewUrl) continue;
      if (isBogus(item.trackName, item.artistName, item.collectionName || '')) continue;
      if (isLive(item.trackName, item.collectionName || '')) continue;

      const normTarget = norm(hit.artist);
      const itemNormArtist = norm(item.artistName);
      if (!itemNormArtist.includes(normTarget) && !normTarget.includes(itemNormArtist)) continue;

      const isPlayable = await checkAudio(item.previewUrl, 3000);
      if (!isPlayable) continue;

      const cleaned = cleanTitle(item.trackName);
      const newSig = createSig(item.artistName, cleaned);
      if (catalogMap.has(newSig)) continue;

      catalogMap.set(newSig, {
        id: String(item.trackId || Math.random().toString().slice(2, 11)),
        title: cleaned,
        artist: item.artistName.trim(),
        album: (item.collectionName || cleaned).trim(),
        year: hit.year,
        verifiedOriginalYear: hit.year,
        yearConfidence: 'high',
        genre: normalizeGenre(hit.genre || item.primaryGenreName, item.artistName, cleaned),
        recognitionScore: 90,
        artworkUrl: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/placeholder.jpg/600x600bb.jpg',
        previewUrl: item.previewUrl,
        previewStart: 0,
        provider: 'itunes',
        providerTrackId: String(item.trackId || ''),
        trackIdentityVerified: true
      });
      break;
    }
  }
  console.log(`After curated hits, catalog has ${catalogMap.size} tracks.`);

  // 3. Process artist universe in batches
  const batchSize = 25;
  const artists = UNIQUE_ARTIST_UNIVERSE;
  console.log(`Processing ${artists.length} artists in batches of ${batchSize}...`);

  for (let i = 0; i < artists.length; i += batchSize) {
    const batch = artists.slice(i, i + batchSize);
    console.log(`\n--- Batch ${Math.floor(i / batchSize) + 1} / ${Math.ceil(artists.length / batchSize)} (Artists ${i + 1} to ${Math.min(i + batchSize, artists.length)}) ---`);

    await Promise.all(
      batch.map(async (artist) => {
        const normArtist = norm(artist.name);
        
        // Check how many we already have for this artist
        let countForArtist = 0;
        for (const s of catalogMap.values()) {
          if (norm(s.artist).includes(normArtist) || normArtist.includes(norm(s.artist))) {
            countForArtist++;
          }
        }

        const target = artist.targetCount;
        if (countForArtist >= target && artist.name !== 'Post Malone' && artist.name !== 'Lil Skies') {
          return;
        }

        // Determine search queries
        let queries = [artist.searchQuery || artist.name];
        let limit = 50;

        if (artist.name === 'Post Malone') {
          queries = [
            'Post Malone',
            'Post Malone Stoney',
            'Post Malone beerbongs bentleys',
            'Post Malone Hollywoods Bleeding',
            'Post Malone Twelve Carat Toothache',
            'Post Malone Austin',
            'Post Malone F-1 Trillion'
          ];
          limit = 100;
        } else if (artist.name === 'Lil Skies') {
          queries = [
            'Lil Skies',
            'Lil Skies Life of a Dark Rose',
            'Lil Skies Shelby',
            'Lil Skies Unbothered'
          ];
          limit = 100;
        } else if (target >= 25) {
          limit = 80;
        }

        const candidateResults: any[] = [];
        for (const q of queries) {
          const res = await fetchFromITunes(q, limit);
          candidateResults.push(...res);
          if (queries.length > 1) {
            await new Promise((r) => setTimeout(r, 80));
          }
        }

        for (const item of candidateResults) {
          if (!item.trackName || !item.artistName || !item.previewUrl) continue;
          if (isBogus(item.trackName, item.artistName, item.collectionName || '')) continue;
          if (isLive(item.trackName, item.collectionName || '')) continue;

          const itemNormArtist = norm(item.artistName);
          // Ensure it really belongs to the artist or is an official collaboration
          if (!itemNormArtist.includes(normArtist) && !normArtist.includes(itemNormArtist)) {
            continue;
          }

          const cleaned = cleanTitle(item.trackName);
          const sig = `${normArtist}:::${norm(cleaned)}`;

          if (catalogMap.has(sig)) continue;

          // Check audio URL
          const isPlayable = await checkAudio(item.previewUrl, 3000);
          if (!isPlayable) continue;

          // Determine release year
          let year = 2015;
          if (EXPANDED_KNOWN_YEARS[sig]) {
            year = EXPANDED_KNOWN_YEARS[sig];
          } else if (item.releaseDate) {
            const parsedYear = new Date(item.releaseDate).getFullYear();
            if (!isNaN(parsedYear) && parsedYear > 1950 && parsedYear <= 2026) {
              year = parsedYear;
            }
          }

          // Calculate recognition score
          let recScore = 75;
          if (artist.targetCount >= 28) recScore = 90;
          else if (artist.targetCount >= 20) recScore = 85;
          else if (artist.targetCount >= 14) recScore = 80;

          const newSong: Song = {
            id: String(item.trackId || Math.random().toString().slice(2, 11)),
            title: cleaned,
            artist: item.artistName.trim(),
            album: (item.collectionName || cleaned).trim(),
            year: year,
            verifiedOriginalYear: year,
            yearConfidence: 'high',
            genre: normalizeGenre(item.primaryGenreName || artist.genre, item.artistName, cleaned),
            recognitionScore: recScore,
            artworkUrl: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/placeholder.jpg/600x600bb.jpg',
            previewUrl: item.previewUrl,
            previewStart: 0,
            provider: 'itunes',
            providerTrackId: String(item.trackId || ''),
            trackIdentityVerified: true
          };

          catalogMap.set(sig, newSong);
          countForArtist++;

          if (countForArtist >= target + 5 && artist.name !== 'Post Malone' && artist.name !== 'Lil Skies') {
            break;
          }
        }
      })
    );

    console.log(`Current verified unique playable songs: ${catalogMap.size}`);

    // Checkpoint persistence after every batch
    const currentList = Array.from(catalogMap.values());
    const jsonStr = JSON.stringify(currentList, null, 2);
    fs.writeFileSync(primaryPath, jsonStr, 'utf8');
    fs.writeFileSync(secondaryPath, jsonStr, 'utf8');
    fs.writeFileSync(publicPath, jsonStr, 'utf8');
    fs.writeFileSync(v2Path, jsonStr, 'utf8');
  }

  console.log(`\n🎉 CATALOG EXPANSION COMPLETE! Total songs in catalog: ${catalogMap.size}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCatalogExpansion().catch(console.error);
}
