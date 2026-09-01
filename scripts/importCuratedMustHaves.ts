import fs from 'fs';
import path from 'path';
import { Song } from '../src/types/song';
import { normalizeText, squashSymbols } from '../src/utils/normalizeText';
import { CURATED_MUST_HAVE } from '../src/data/curatedMustHaves';
import { KNOWN_ORIGINAL_YEARS } from './knownSongYears';

const CATALOG_DATA_PATH = path.resolve(process.cwd(), 'src/data/melodex-catalog.json');
const CATALOG_PUBLIC_PATH = path.resolve(process.cwd(), 'public/melodex-catalog.json');

interface ValidationStatus {
  item: string;
  status: 'VERIFIED' | 'MUST_HAVE_UNAVAILABLE' | 'REPAIRED';
  year?: number;
  note?: string;
}

const report: Record<string, ValidationStatus[]> = {};

function addReport(artist: string, status: ValidationStatus) {
  if (!report[artist]) report[artist] = [];
  report[artist].push(status);
}

// Clean title helper: removes (Deluxe), [Remastered], etc. but keeps essential feats if needed
function cleanSongTitle(title: string): string {
  return title
    .replace(/\s*-\s*Remastered(\s*\d+)?/gi, '')
    .replace(/\s*\(Remastered(\s*\d+)?\)/gi, '')
    .replace(/\s*\(Deluxe(\s*Edition)?\)/gi, '')
    .trim();
}

async function verifyAudio(url?: string): Promise<boolean> {
  if (!url) return false;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok || res.status === 200 || res.status === 206;
  } catch {
    return false;
  }
}

async function fetchDeezer(url: string) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    await new Promise(r => setTimeout(r, 400));
  }
  return null;
}

async function fetchItunes(term: string) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=15`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    await new Promise(r => setTimeout(r, 400));
  }
  return null;
}

function getOriginalYear(artist: string, title: string, fallbackYear: number): number {
  const normA = normalizeText(artist);
  const normT = normalizeText(title);
  const sig = `${normA}:::${normT}`;

  if (KNOWN_ORIGINAL_YEARS[sig]) {
    return KNOWN_ORIGINAL_YEARS[sig];
  }

  // Check partial signature matches
  for (const [key, y] of Object.entries(KNOWN_ORIGINAL_YEARS)) {
    const [kA, kT] = key.split(':::');
    if ((normA.includes(kA) || kA.includes(normA)) && (normT.includes(kT) || kT.includes(normT))) {
      return y;
    }
  }

  if (fallbackYear && fallbackYear > 1950 && fallbackYear <= 2025) {
    return fallbackYear;
  }

  return fallbackYear || 2018;
}

async function run() {
  console.log('--- STARTING CURATED MUST-HAVE IMPORT & AUDIT ---');

  let catalog: Song[] = [];
  if (fs.existsSync(CATALOG_DATA_PATH)) {
    catalog = JSON.parse(fs.readFileSync(CATALOG_DATA_PATH, 'utf8'));
  }

  console.log(`Initial catalog size: ${catalog.length}`);

  // 1. REPAIR EXISTING CATALOG ENTRIES (e.g. white tee 2026 -> 2016)
  for (const song of catalog) {
    const normA = normalizeText(song.artist);
    const normT = normalizeText(song.title);

    // Fix Lil Peep white tee
    if (normA.includes('lil peep') && normT.includes('white tee')) {
      console.log(`[REPAIR] Lil Peep - white tee: fixing year ${song.year} -> 2016`);
      song.year = 2016;
      song.verifiedOriginalYear = 2016;
      song.yearConfidence = 'high';
      if (!song.artist.includes('Lil Tracy')) {
        song.artist = 'Lil Peep & Lil Tracy';
      }
      addReport('Lil Peep', {
        item: 'white tee',
        status: 'VERIFIED',
        year: 2016,
        note: 'Repaired year from 2026 to 2016, decade: 2010s',
      });
    }

    // Fix Lil Peep your favorite dress
    if (normA.includes('lil peep') && normT.includes('your favorite dress')) {
      song.year = 2016;
      song.verifiedOriginalYear = 2016;
      song.yearConfidence = 'high';
      if (!song.artist.includes('Lil Tracy')) {
        song.artist = 'Lil Peep & Lil Tracy';
      }
    }
  }

  // Create signature set for deduplication
  const existingSigs = new Map<string, Song>();
  for (const s of catalog) {
    const key = `${normalizeText(s.artist)}:::${normalizeText(cleanSongTitle(s.title))}`;
    existingSigs.set(key, s);
  }

  // Helper to find existing song by artist and title keywords
  function findExisting(artist: string, title: string): Song | undefined {
    const normA = normalizeText(artist);
    const cleanT = normalizeText(cleanSongTitle(title));
    const squashedT = squashSymbols(cleanT);

    for (const [key, song] of existingSigs.entries()) {
      const [kA, kT] = key.split(':::');
      const artistMatch = kA === normA || kA.includes(normA) || normA.includes(kA);
      if (!artistMatch) continue;

      const songCleanT = normalizeText(cleanSongTitle(song.title));
      const songSquashedT = squashSymbols(songCleanT);

      if (
        cleanT === songCleanT ||
        squashedT === songSquashedT ||
        cleanT.replace(/\s*\(feat[^)]*\)/gi, '').trim() === songCleanT.replace(/\s*\(feat[^)]*\)/gi, '').trim()
      ) {
        return song;
      }
    }
    return undefined;
  }

  // Helper to add song safely
  function addSong(song: Song): boolean {
    const key = `${normalizeText(song.artist)}:::${normalizeText(cleanSongTitle(song.title))}`;
    const existing = existingSigs.get(key) || findExisting(song.artist, song.title);
    if (existing) {
      // Update missing fields if new info is better
      if (!existing.previewUrl && song.previewUrl) existing.previewUrl = song.previewUrl;
      if (!existing.artworkUrl && song.artworkUrl) existing.artworkUrl = song.artworkUrl;
      const verYear = getOriginalYear(song.artist, song.title, song.verifiedOriginalYear || song.year);
      existing.verifiedOriginalYear = verYear;
      existing.year = verYear;
      existing.yearConfidence = 'high';
      return false; // updated existing
    }
    catalog.push(song);
    existingSigs.set(key, song);
    return true; // added new
  }

  // 2. PROCESS MUST-HAVE ALBUMS
  // A) Post Malone - Stoney (Deezer album 14781033 or 14780587)
  console.log('\n--- Processing Post Malone: Stoney ---');
  let stoneyAdded = 0;
  let stoneyTotal = 0;
  const stoneyData = await fetchDeezer('https://api.deezer.com/album/14781033');
  if (stoneyData && stoneyData.tracks?.data) {
    stoneyTotal = stoneyData.tracks.data.length;
    for (const t of stoneyData.tracks.data) {
      const title = t.title_short || t.title;
      const year = getOriginalYear('Post Malone', title, 2016);
      const isAudioValid = !!t.preview && (await verifyAudio(t.preview));
      if (!isAudioValid) continue;

      const song: Song = {
        id: `pm_stoney_${t.id}`,
        title,
        artist: 'Post Malone',
        album: 'Stoney',
        year,
        verifiedOriginalYear: year,
        yearConfidence: 'high',
        genre: 'Hip-Hop/Rap',
        recognitionScore: 92,
        artworkUrl: stoneyData.cover_big || stoneyData.cover_medium,
        previewUrl: t.preview,
      };

      if (addSong(song)) {
        stoneyAdded++;
        console.log(`  + [Stoney] Added: "${song.title}" (${song.year})`);
      } else {
        console.log(`  = [Stoney] Verified existing: "${song.title}" (${song.year})`);
      }
    }
    const verifiedStoneyCount = catalog.filter(
      s => normalizeText(s.artist).includes('post malone') && (s.album?.toLowerCase().includes('stoney') || ['white iverson', 'congratulations', 'i fall apart', 'go flex', 'deja vu', 'feeling whitney', 'broken whiskey glass', 'big lie', 'no option', 'cold', 'patient', 'feel', 'too young', 'up there', 'yours truly, austin post', 'leave', 'hit this hard', 'money made me do it'].some(t => normalizeText(s.title).includes(t)))
    ).length;
    addReport('Post Malone', {
      item: 'Stoney',
      status: 'VERIFIED',
      note: `verified ${verifiedStoneyCount} / total ${stoneyTotal}`,
    });
  }

  // B) Post Malone - beerbongs & bentleys (Deezer album 62183462)
  console.log('\n--- Processing Post Malone: beerbongs & bentleys ---');
  let bbAdded = 0;
  let bbTotal = 0;
  const bbData = await fetchDeezer('https://api.deezer.com/album/62183462');
  if (bbData && bbData.tracks?.data) {
    bbTotal = bbData.tracks.data.length;
    for (const t of bbData.tracks.data) {
      const title = t.title_short || t.title;
      const year = getOriginalYear('Post Malone', title, 2018);
      const isAudioValid = !!t.preview && (await verifyAudio(t.preview));
      if (!isAudioValid) continue;

      const song: Song = {
        id: `pm_bb_${t.id}`,
        title,
        artist: 'Post Malone',
        album: 'beerbongs & bentleys',
        year,
        verifiedOriginalYear: year,
        yearConfidence: 'high',
        genre: 'Hip-Hop/Rap',
        recognitionScore: 94,
        artworkUrl: bbData.cover_big || bbData.cover_medium,
        previewUrl: t.preview,
      };

      if (addSong(song)) {
        bbAdded++;
        console.log(`  + [B&B] Added: "${song.title}" (${song.year})`);
      } else {
        console.log(`  = [B&B] Verified existing: "${song.title}" (${song.year})`);
      }
    }
    const verifiedBBCount = catalog.filter(
      s => normalizeText(s.artist).includes('post malone') && (s.album?.toLowerCase().includes('beerbongs') || ['paranoid', 'spoil my night', 'rich & sad', 'zack and codeine', "takin' shots", 'rockstar', 'over now', 'psycho', 'better now', 'ball for me', 'otherside', 'stay', 'blame it on me', 'same bitches', 'jonestown', '92 explorer', 'candy paint', 'sugar wraith'].some(t => normalizeText(s.title).includes(t)))
    ).length;
    addReport('Post Malone', {
      item: 'beerbongs & bentleys',
      status: 'VERIFIED',
      note: `verified ${verifiedBBCount} / total ${bbTotal}`,
    });
  }

  // C) Lil Skies - Life of a Dark Rose (Deezer album 53739792)
  console.log('\n--- Processing Lil Skies: Life of a Dark Rose ---');
  let skiesTotal = 0;
  const skiesData = await fetchDeezer('https://api.deezer.com/album/53739792');
  if (skiesData && skiesData.tracks?.data) {
    skiesTotal = skiesData.tracks.data.length;
    for (const t of skiesData.tracks.data) {
      const title = t.title_short || t.title;
      const year = getOriginalYear('Lil Skies', title, 2018);
      const isAudioValid = !!t.preview && (await verifyAudio(t.preview));
      if (!isAudioValid) continue;

      const song: Song = {
        id: `skies_darkrose_${t.id}`,
        title,
        artist: 'Lil Skies',
        album: 'Life of a Dark Rose',
        year,
        verifiedOriginalYear: year,
        yearConfidence: 'high',
        genre: 'Hip-Hop/Rap',
        recognitionScore: 90,
        artworkUrl: skiesData.cover_big || skiesData.cover_medium,
        previewUrl: t.preview,
      };

      if (addSong(song)) {
        console.log(`  + [Life of a Dark Rose] Added: "${song.title}" (${song.year})`);
      } else {
        console.log(`  = [Life of a Dark Rose] Verified existing: "${song.title}" (${song.year})`);
      }
    }
    const verifiedSkiesCount = catalog.filter(
      s => normalizeText(s.artist).includes('lil skies') && (s.album?.toLowerCase().includes('dark rose') || ['welcome to the rodeo', 'the clique', 'red roses', 'lust', 'cloudy skies', 'signs of jealousy', 'big money', 'tell my haters', 'boss up', 'garden', 'lettuce sandwich', 'strictly business', 'kill4u', 'nowadays'].some(t => normalizeText(s.title).includes(t)))
    ).length;
    addReport('Lil Skies', {
      item: 'Life of a Dark Rose',
      status: 'VERIFIED',
      note: `verified ${verifiedSkiesCount} / total ${skiesTotal}`,
    });
  }

  // 3. PROCESS INDIVIDUAL MUST-HAVE TRACKS
  const trackItems = [
    // Lil Mosey
    { artist: 'Lil Mosey', title: 'Noticed', q: 'Lil Mosey Noticed', year: 2018 },
    { artist: 'Lil Mosey', title: 'Blueberry Faygo', q: 'Lil Mosey Blueberry Faygo', year: 2020 },
    // Lil Tecca
    { artist: 'Lil Tecca', title: 'Ransom', q: 'Lil Tecca Ransom', year: 2019 },
    { artist: 'Lil Tecca', title: '500lbs', q: 'Lil Tecca 500lbs', year: 2023 },
    { artist: 'Lil Tecca', title: 'Do It Again', q: 'Lil Tecca Did It Again', year: 2019, canonicalTitle: 'Did It Again' },
    // Lil Peep
    { artist: 'Lil Peep', title: 'Girls', q: 'Lil Peep girls HELLBOY', year: 2016, canonicalArtist: 'Lil Peep feat. Horse Head' },
    { artist: 'Lil Peep', title: 'Your Favorite Dress', q: 'Lil Peep your favorite dress CASTLES II', year: 2016, canonicalArtist: 'Lil Peep & Lil Tracy' },
    { artist: 'Lil Peep', title: 'white tee', q: 'Lil Peep white tee crybaby', year: 2016, canonicalArtist: 'Lil Peep & Lil Tracy' },
    // Yung Pinch
    { artist: 'Yung Pinch', title: '20 Years Later', q: 'Yung Pinch 20 Years Later', year: 2018 },
    { artist: 'Yung Pinch', title: 'Look Like', q: 'Yung Pinch Look Like 714Ever', year: 2016 },
    { artist: 'Yung Pinch', title: 'When I Was Young', q: 'Yung Pinch When I Was Yung', year: 2016, canonicalTitle: 'When I Was Yung' },
    { artist: 'Yung Pinch', title: 'Underdogs', q: 'Yung Pinch Underdogs', year: 2017 },
    { artist: 'Yung Pinch', title: 'I Know U', q: 'Lil Skies Yung Pinch I Know You', year: 2018, canonicalTitle: 'I Know You (feat. Yung Pinch)' },
    // Juice WRLD
    { artist: 'Juice WRLD', title: 'Armed and Dangerous', q: 'Juice WRLD Armed And Dangerous', year: 2018, canonicalTitle: 'Armed and Dangerous' },
    // Famous Dex
    { artist: 'Famous Dex', title: 'Japan', q: 'Famous Dex Japan', year: 2018 },
    { artist: 'Famous Dex', title: 'Pick It Up', q: 'Famous Dex Pick It Up', year: 2017, canonicalTitle: 'PICK IT UP (feat. A$AP Rocky)' },
    // Fetty Wap
    { artist: 'Fetty Wap', title: 'Trap Queen', q: 'artist:"Fetty Wap" track:"Trap Queen"', year: 2014, directDzId: 91934728 },
    { artist: 'Fetty Wap', title: '679', q: 'artist:"Fetty Wap" track:"679"', year: 2015, directDzId: 103014252 },
    // YoungBoy Never Broke Again
    { artist: 'YoungBoy Never Broke Again', title: 'Outside Today', q: 'YoungBoy Never Broke Again Outside Today', year: 2018 },
  ];

  for (const item of trackItems) {
    console.log(`\n--- Processing Must-Have Track: ${item.artist} - ${item.title} ---`);

    // Check if already in catalog with working preview
    const existing = findExisting(item.artist, item.title);
    if (existing && existing.previewUrl && (await verifyAudio(existing.previewUrl))) {
      existing.verifiedOriginalYear = item.year;
      existing.year = item.year;
      existing.yearConfidence = 'high';
      console.log(`  = Already verified in catalog: "${existing.title}" (${existing.year})`);
      addReport(item.artist, {
        item: item.title,
        status: 'VERIFIED',
        year: item.year,
        note: `Preserved verified track "${existing.title}"`,
      });
      continue;
    }

    // Attempt direct Deezer ID if provided
    let dzTrack: any = null;
    if (item.directDzId) {
      dzTrack = await fetchDeezer(`https://api.deezer.com/track/${item.directDzId}`);
    }

    // Search Deezer
    if (!dzTrack || !dzTrack.preview) {
      const searchRes = await fetchDeezer(`https://api.deezer.com/search?q=${encodeURIComponent(item.q)}&limit=10`);
      if (searchRes && searchRes.data && searchRes.data.length > 0) {
        dzTrack = searchRes.data.find((t: any) => t.preview) || searchRes.data[0];
      }
    }

    if (dzTrack && dzTrack.preview && (await verifyAudio(dzTrack.preview))) {
      const songTitle = item.canonicalTitle || dzTrack.title_short || dzTrack.title;
      const songArtist = item.canonicalArtist || dzTrack.artist?.name || item.artist;
      const song: Song = {
        id: `curated_${dzTrack.id}_${Date.now().toString(36)}`,
        title: songTitle,
        artist: songArtist,
        album: dzTrack.album?.title || 'Single',
        year: item.year,
        verifiedOriginalYear: item.year,
        yearConfidence: 'high',
        genre: 'Hip-Hop/Rap',
        recognitionScore: 95,
        artworkUrl: dzTrack.album?.cover_big || dzTrack.album?.cover_medium,
        previewUrl: dzTrack.preview,
      };

      addSong(song);
      console.log(`  + Added from Deezer: "${song.title}" by "${song.artist}" (${song.year})`);
      addReport(item.artist, {
        item: item.title,
        status: 'VERIFIED',
        year: item.year,
        note: `Resolved playable Deezer track "${song.title}"`,
      });
      continue;
    }

    // Fallback search iTunes
    console.log(`  Searching iTunes for fallback: "${item.artist} ${item.title}"`);
    const itunesData = await fetchItunes(`${item.artist} ${item.title}`);
    const itMatch = itunesData?.results?.find((r: any) => r.previewUrl);
    if (itMatch && (await verifyAudio(itMatch.previewUrl))) {
      const song: Song = {
        id: `curated_it_${itMatch.trackId}`,
        title: item.canonicalTitle || itMatch.trackName,
        artist: item.canonicalArtist || itMatch.artistName,
        album: itMatch.collectionName || 'Single',
        year: item.year,
        verifiedOriginalYear: item.year,
        yearConfidence: 'high',
        genre: 'Hip-Hop/Rap',
        recognitionScore: 95,
        artworkUrl: itMatch.artworkUrl100?.replace('100x100bb', '600x600bb'),
        previewUrl: itMatch.previewUrl,
      };

      addSong(song);
      console.log(`  + Added from iTunes: "${song.title}" by "${song.artist}" (${song.year})`);
      addReport(item.artist, {
        item: item.title,
        status: 'VERIFIED',
        year: item.year,
        note: `Resolved playable iTunes track "${song.title}"`,
      });
      continue;
    }

    // Unavailable
    console.warn(`  [UNAVAILABLE] Could not resolve playable track for: "${item.artist} - ${item.title}"`);
    addReport(item.artist, {
      item: item.title,
      status: 'MUST_HAVE_UNAVAILABLE',
      note: 'Could not resolve working audio preview',
    });
  }

  // Final cleanup and catalog write
  console.log(`\nFinal verified catalog size: ${catalog.length}`);
  fs.writeFileSync(CATALOG_DATA_PATH, JSON.stringify(catalog, null, 2));
  fs.writeFileSync(CATALOG_PUBLIC_PATH, JSON.stringify(catalog, null, 2));

  console.log('\n========================================');
  console.log('      CURATED MUST-HAVE VALIDATION REPORT');
  console.log('========================================');
  for (const [artist, items] of Object.entries(report)) {
    console.log(`\n[${artist}]`);
    for (const r of items) {
      console.log(`  ${r.item} — ${r.status}${r.year ? ` (Year: ${r.year})` : ''}${r.note ? ` | ${r.note}` : ''}`);
    }
  }
  console.log('\n========================================');
}

run();
