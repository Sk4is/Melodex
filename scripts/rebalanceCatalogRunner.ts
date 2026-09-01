import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { KNOWN_ORIGINAL_YEARS } from './knownSongYears.ts';
import { CURATED_POP_EXPANSION } from './curatedPopExpansion.ts';
import { CURATED_2010S_HITS } from './curated2010sTracks.ts';
import { CURATED_MUST_HAVE } from '../src/data/curatedMustHaves.ts';
import {
  Song,
  CuratedSongTarget,
  normalizeText,
  cleanSongTitle,
  cleanSongTitleForDeduplication,
  createSignature,
  isArtistMatch,
  isBogusTrack,
  normalizeGenre,
  testAudioPlayability,
} from './rebalanceCatalog.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATALOG_FILES = [
  path.resolve(__dirname, '../src/data/melodexCatalog.json'),
  path.resolve(__dirname, '../src/data/melodex-catalog.json'),
  path.resolve(__dirname, '../public/melodex-catalog.json'),
  path.resolve(__dirname, '../public/data/melodex-catalog-v2.json'),
];

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface UnifiedTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  releaseDate?: string;
  genre?: string;
  previewUrl: string;
  artworkUrl?: string;
  provider: 'itunes' | 'deezer';
}

async function searchITunes(query: string): Promise<UnifiedTrack[]> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { results?: any[] };
    if (!data.results) return [];

    return data.results.map((r) => ({
      id: `itunes-${r.trackId}`,
      title: r.trackName || '',
      artist: r.artistName || '',
      album: r.collectionName,
      releaseDate: r.releaseDate,
      genre: r.primaryGenreName,
      previewUrl: r.previewUrl,
      artworkUrl: r.artworkUrl100 ? r.artworkUrl100.replace('100x100bb', '600x600bb') : undefined,
      provider: 'itunes',
    }));
  } catch {
    return [];
  }
}

async function searchDeezer(query: string): Promise<UnifiedTrack[]> {
  try {
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=5`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: any[] };
    if (!data.data) return [];

    return data.data.map((r) => ({
      id: `deezer-${r.id}`,
      title: r.title || '',
      artist: r.artist?.name || '',
      album: r.album?.title,
      releaseDate: undefined,
      genre: undefined,
      previewUrl: r.preview,
      artworkUrl: r.album?.cover_xl || r.album?.cover_big || r.album?.cover_medium,
      provider: 'deezer',
    }));
  } catch {
    return [];
  }
}

async function fetchCandidateTracks(query: string): Promise<UnifiedTrack[]> {
  // Try iTunes first
  let tracks = await searchITunes(query);
  if (tracks.length > 0 && tracks.some((t) => t.previewUrl)) {
    return tracks;
  }
  // Fallback to Deezer
  tracks = await searchDeezer(query);
  return tracks;
}

async function main() {
  console.log('=== STARTING COMPLETE MELODEX CATALOG REBALANCE & EXPANSION ===\n');

  // 1. Read existing pristine catalog
  const rawData = fs.readFileSync(CATALOG_FILES[0], 'utf8');
  const catalog: Song[] = JSON.parse(rawData);

  console.log(`Original catalog size: ${catalog.length} songs`);

  // Compute "Before" Stats
  const beforeTotal = catalog.length;
  let beforePop = 0;
  let beforeRock = 0;
  let beforeHipHop = 0;
  let beforePre2000 = 0;
  let before2000s = 0;
  let before2010s = 0;
  let before2020s = 0;

  for (const s of catalog) {
    const g = (s.genre || '').toLowerCase();
    if (g.includes('pop')) beforePop++;
    else if (g.includes('rock') || g.includes('metal') || g.includes('punk') || g.includes('alternative')) beforeRock++;
    else if (g.includes('hip-hop') || g.includes('rap')) beforeHipHop++;

    const y = s.verifiedOriginalYear || s.year || 0;
    if (y < 2000) beforePre2000++;
    else if (y <= 2009) before2000s++;
    else if (y <= 2019) before2010s++;
    else before2020s++;
  }

  // Curated must-haves map
  const mustHaveMap = new Map<string, string[]>();
  for (const [art, cfg] of Object.entries(CURATED_MUST_HAVE)) {
    const list = [art, ...(cfg.aliases || [])].map((a) => a.toLowerCase().trim());
    for (const a of list) {
      mustHaveMap.set(a, cfg.mustHaveTracks || []);
    }
  }

  function isCuratedMustHave(song: Song): boolean {
    const normArt = (song.artist || '').toLowerCase().trim();
    for (const [curArt, tracks] of mustHaveMap.entries()) {
      if (normArt.includes(curArt) || curArt.includes(normArt)) {
        if (!tracks || tracks.length === 0) return true;
        const normTitle = (song.title || '').toLowerCase();
        if (tracks.some((t) => normTitle.includes(t.toLowerCase()))) return true;
      }
    }
    return false;
  }

  // 2. Prune low-recognition Rock tracks & bogus tracks
  const rockGenres = ['Rock', 'Metal', 'Hard Rock', 'Alternative', 'Punk', 'Blues-Rock'];
  const rockByArtist: Record<string, Song[]> = {};
  const nonRockTracks: Song[] = [];

  for (const song of catalog) {
    if (isBogusTrack(song.title, song.artist, song.album)) {
      continue; // automatically pruned
    }

    if (rockGenres.includes(song.genre || '')) {
      rockByArtist[song.artist] = rockByArtist[song.artist] || [];
      rockByArtist[song.artist].push(song);
    } else {
      nonRockTracks.push(song);
    }
  }

  // Sort each rock artist's tracks by recognition score desc
  const keptRockTracks: Song[] = [];
  let rockTracksRemoved = 0;

  for (const [artist, tracks] of Object.entries(rockByArtist)) {
    tracks.sort((a, b) => (b.recognitionScore || 75) - (a.recognitionScore || 75));

    tracks.forEach((track, index) => {
      // If curated must have, keep always
      if (isCuratedMustHave(track)) {
        keptRockTracks.push(track);
        return;
      }

      const score = track.recognitionScore || 75;

      // If artist has > 10 rock tracks, prune tracks beyond index 9 or if score <= 70
      if (tracks.length > 10 && (index >= 10 || score <= 70)) {
        rockTracksRemoved++;
        return;
      }

      // If score is strictly below 70, prune secondary track
      if (score < 70) {
        rockTracksRemoved++;
        return;
      }

      keptRockTracks.push(track);
    });
  }

  console.log(`Pruned ${rockTracksRemoved} low-recognition Rock tracks. Kept ${keptRockTracks.length} iconic Rock tracks.`);

  // Combined pruned working catalog
  let workingCatalog: Song[] = [...nonRockTracks, ...keptRockTracks];

  // Map existing signatures for deduplication
  const existingSignatures = new Set<string>();
  const existingIds = new Set<string>();

  for (const s of workingCatalog) {
    existingIds.add(s.id);
    const sig = createSignature(s.artist, s.title);
    existingSignatures.add(sig);
  }

  // 3. Build deduplicated list of targets
  const rawTargets = [...CURATED_POP_EXPANSION, ...CURATED_2010S_HITS];
  const targetMap = new Map<string, CuratedSongTarget>();

  for (const t of rawTargets) {
    const key = `${normalizeText(t.artist)}:::${normalizeText(t.query)}`;
    if (!targetMap.has(key)) {
      targetMap.set(key, t);
    }
  }

  const targets = Array.from(targetMap.values());
  console.log(`Prepared ${targets.length} curated Pop expansion targets to verify.`);

  let verifiedPopAdded = 0;
  let rejectedUnavailable = 0;
  let rejectedInvalidYear = 0;
  let duplicatesPrevented = 0;
  const newlyAddedSample: Array<{ artist: string; title: string; year: number; genre: string }> = [];

  // Paced processing to avoid rate limits
  const CONCURRENCY = 6;
  const totalChunks = Math.ceil(targets.length / CONCURRENCY);

  for (let c = 0; c < totalChunks; c++) {
    const chunk = targets.slice(c * CONCURRENCY, (c + 1) * CONCURRENCY);

    await Promise.all(
      chunk.map(async (target) => {
        const results = await fetchCandidateTracks(target.query);
        if (!results || results.length === 0) {
          rejectedUnavailable++;
          return;
        }

        // Find best match
        let selectedTrack: UnifiedTrack | null = null;
        for (const candidate of results) {
          if (!candidate.previewUrl) continue;
          if (isBogusTrack(candidate.title, candidate.artist, candidate.album)) continue;
          if (!isArtistMatch(candidate.artist, target.artist)) continue;

          selectedTrack = candidate;
          break;
        }

        if (!selectedTrack || !selectedTrack.previewUrl) {
          rejectedUnavailable++;
          return;
        }

        const cleanedTitle = cleanSongTitle(selectedTrack.title);
        const sig = createSignature(target.artist, cleanedTitle);

        if (existingSignatures.has(sig) || existingIds.has(selectedTrack.id)) {
          duplicatesPrevented++;
          return;
        }

        // Resolve verified year strictly
        let finalYear = target.expectedYear;
        const sigLookup = `${normalizeText(target.artist)}:::${cleanSongTitleForDeduplication(cleanedTitle)}`;
        if (KNOWN_ORIGINAL_YEARS[sigLookup]) {
          finalYear = KNOWN_ORIGINAL_YEARS[sigLookup];
        } else if (selectedTrack.releaseDate) {
          const itunesYear = new Date(selectedTrack.releaseDate).getUTCFullYear();
          if (!isNaN(itunesYear)) {
            if (target.expectedYear < 2000 && itunesYear >= 2000) {
              finalYear = target.expectedYear;
            } else if (Math.abs(itunesYear - target.expectedYear) <= 3) {
              finalYear = target.expectedYear || itunesYear;
            } else {
              finalYear = target.expectedYear || itunesYear;
            }
          }
        }

        if (!finalYear || isNaN(finalYear) || finalYear < 1950 || finalYear > 2026) {
          rejectedInvalidYear++;
          return;
        }

        // Test audio playability
        const playable = await testAudioPlayability(selectedTrack.previewUrl);
        if (!playable) {
          rejectedUnavailable++;
          return;
        }

        const normalizedGenreStr = normalizeGenre(target.genre || selectedTrack.genre, target.artist, cleanedTitle);

        const newSong: Song = {
          id: selectedTrack.id,
          title: cleanedTitle,
          artist: target.artist || selectedTrack.artist,
          album: selectedTrack.album || '',
          year: finalYear,
          verifiedOriginalYear: finalYear,
          yearConfidence: 'high',
          genre: normalizedGenreStr,
          recognitionScore: target.recognitionScore || 90,
          artworkUrl: selectedTrack.artworkUrl,
          previewUrl: selectedTrack.previewUrl,
          provider: selectedTrack.provider,
        };

        existingSignatures.add(sig);
        existingIds.add(newSong.id);
        workingCatalog.push(newSong);
        verifiedPopAdded++;

        if (newlyAddedSample.length < 60) {
          newlyAddedSample.push({
            artist: newSong.artist,
            title: newSong.title,
            year: newSong.year || 0,
            genre: newSong.genre || '',
          });
        }
      })
    );

    if (c % 15 === 0 || c === totalChunks - 1) {
      console.log(`Progress: Chunk ${c + 1}/${totalChunks} | Pop Added: ${verifiedPopAdded} | Duplicates: ${duplicatesPrevented} | Unavailable: ${rejectedUnavailable}`);
    }

    await sleep(250);
  }

  console.log('\n=== REBALANCE & EXPANSION COMPLETE ===\n');

  // Compute "After" Stats
  const afterTotal = workingCatalog.length;
  let afterPop = 0;
  let afterRock = 0;
  let afterHipHop = 0;
  let afterPre2000 = 0;
  let after2000s = 0;
  let after2010s = 0;
  let after2020s = 0;

  const artistCounts: Record<string, number> = {};

  for (const s of workingCatalog) {
    const g = (s.genre || '').toLowerCase();
    if (g.includes('pop')) afterPop++;
    else if (g.includes('rock') || g.includes('metal') || g.includes('punk') || g.includes('alternative')) afterRock++;
    else if (g.includes('hip-hop') || g.includes('rap')) afterHipHop++;

    const y = s.verifiedOriginalYear || s.year || 0;
    if (y < 2000) afterPre2000++;
    else if (y <= 2009) after2000s++;
    else if (y <= 2019) after2010s++;
    else after2020s++;

    const art = s.artist || 'Unknown';
    artistCounts[art] = (artistCounts[art] || 0) + 1;
  }

  // Top 25 artists
  const top25Artists = Object.entries(artistCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25);

  // Write updated catalog to all 4 files
  const serialized = JSON.stringify(workingCatalog, null, 2);
  for (const filePath of CATALOG_FILES) {
    fs.writeFileSync(filePath, serialized, 'utf8');
    console.log(`Successfully updated ${filePath}`);
  }

  // Update src/data/melodexCatalog.ts with new count and export
  const tsContent = `// Auto-generated Melodex verified base catalog (${workingCatalog.length} tracks)
import { Song } from '../types/song';
import rawCatalog from './melodexCatalog.json';

export const MELODEX_BASE_CATALOG: Song[] = rawCatalog as Song[];
`;
  fs.writeFileSync(path.resolve(__dirname, '../src/data/melodexCatalog.ts'), tsContent, 'utf8');

  // Print Complete Report
  console.log('\n======================================================');
  console.log('           MELODEX CATALOG DEVELOPMENT REPORT         ');
  console.log('======================================================\n');
  console.log(`Total songs before: ${beforeTotal}`);
  console.log(`Total songs after: ${afterTotal}`);
  console.log(`Pop before: ${beforePop}`);
  console.log(`Pop after: ${afterPop}`);
  console.log(`Rock before: ${beforeRock}`);
  console.log(`Rock after: ${afterRock}`);
  console.log(`Hip-Hop before: ${beforeHipHop}`);
  console.log(`Hip-Hop after: ${afterHipHop}`);
  console.log(`Pre-2000 total: ${afterPre2000}`);
  console.log(`2000s total: ${after2000s}`);
  console.log(`2010s total: ${after2010s}`);
  console.log(`2020s total: ${after2020s}`);
  console.log(`Rock tracks removed: ${rockTracksRemoved}`);
  console.log(`Verified Pop tracks added: ${verifiedPopAdded}`);
  console.log(`Rejected unavailable tracks: ${rejectedUnavailable}`);
  console.log(`Rejected invalid-year tracks: ${rejectedInvalidYear}`);
  console.log(`Duplicates prevented: ${duplicatesPrevented}`);

  console.log('\nTop 25 artists by song count:');
  top25Artists.forEach(([artist, count], i) => {
    console.log(`  ${i + 1}. ${artist}: ${count} songs`);
  });

  console.log('\n50 Major Pop Songs/Artists Successfully Added & Verified:');
  newlyAddedSample.slice(0, 50).forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.artist} - "${s.title}" (${s.year}, ${s.genre})`);
  });

  console.log('\n======================================================\n');
}

main().catch((err) => {
  console.error('Fatal error during catalog rebalancing:', err);
  process.exit(1);
});
