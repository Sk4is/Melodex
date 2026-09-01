import fs from 'fs';
import path from 'path';
import { Song } from '../src/types/song';
import { KNOWN_ORIGINAL_YEARS } from './knownSongYears';

const CATALOG_FILES = [
  path.resolve(process.cwd(), 'src/data/melodexCatalog.json'),
  path.resolve(process.cwd(), 'src/data/melodex-catalog.json'),
  path.resolve(process.cwd(), 'public/melodex-catalog.json'),
];

interface TargetTrack {
  artist: string;
  title: string;
  searchQuery: string;
  verifiedYear: number;
  genre: string;
  recognitionScore: number;
}

const TARGET_IMPORTS: TargetTrack[] = [
  // Lil Pump
  { artist: 'Lil Pump', title: 'Gucci Gang', searchQuery: 'Lil Pump Gucci Gang', verifiedYear: 2017, genre: 'Hip-Hop/Rap', recognitionScore: 92 },
  { artist: 'Lil Pump', title: 'Esskeetit', searchQuery: 'Lil Pump Esskeetit', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 85 },
  { artist: 'Lil Pump', title: 'I Love It', searchQuery: 'Kanye West Lil Pump I Love It', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 88 },
  { artist: 'Lil Pump', title: 'Boss', searchQuery: 'Lil Pump Boss', verifiedYear: 2017, genre: 'Hip-Hop/Rap', recognitionScore: 82 },
  { artist: 'Lil Pump', title: 'D Rose', searchQuery: 'Lil Pump D Rose', verifiedYear: 2017, genre: 'Hip-Hop/Rap', recognitionScore: 80 },
  { artist: 'Lil Pump', title: 'Flex Like Ouu', searchQuery: 'Lil Pump Flex Like Ouu', verifiedYear: 2017, genre: 'Hip-Hop/Rap', recognitionScore: 78 },
  { artist: 'Lil Pump', title: 'Arms Around You', searchQuery: 'XXXTENTACION Lil Pump Arms Around You', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 86 },
  { artist: 'Lil Pump', title: 'Be Like Me', searchQuery: 'Lil Pump Be Like Me', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 75 },
  { artist: 'Lil Pump', title: 'Welcome to the Party', searchQuery: 'Diplo French Montana Lil Pump Welcome to the Party', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 80 },

  // Trippie Redd
  { artist: 'Trippie Redd', title: 'Love Scars', searchQuery: 'Trippie Redd Love Scars', verifiedYear: 2017, genre: 'Hip-Hop/Rap', recognitionScore: 90 },
  { artist: 'Trippie Redd', title: 'Dark Knight Dummo (feat. Travis Scott)', searchQuery: 'Trippie Redd Dark Knight Dummo', verifiedYear: 2017, genre: 'Hip-Hop/Rap', recognitionScore: 92 },
  { artist: 'Trippie Redd', title: 'Topanga', searchQuery: 'Trippie Redd Topanga', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 88 },
  { artist: 'Trippie Redd', title: 'Taking a Walk', searchQuery: 'Trippie Redd Taking a Walk', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 89 },
  { artist: 'Trippie Redd', title: 'Wish', searchQuery: 'Diplo Trippie Redd Wish', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 87 },
  { artist: 'Trippie Redd', title: '1400 / 999 Freestyle (feat. Juice WRLD)', searchQuery: 'Trippie Redd 1400 999 Freestyle', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 86 },
  { artist: 'Trippie Redd', title: 'Poles1469 (feat. 6ix9ine)', searchQuery: 'Trippie Redd Poles1469', verifiedYear: 2017, genre: 'Hip-Hop/Rap', recognitionScore: 84 },
  { artist: 'Trippie Redd', title: 'Who Needs Love', searchQuery: 'Trippie Redd Who Needs Love', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 83 },
  { artist: 'Trippie Redd', title: 'Love Me More', searchQuery: 'Trippie Redd Love Me More', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 82 },
  { artist: 'Trippie Redd', title: 'Death (feat. DaBaby)', searchQuery: 'Trippie Redd Death DaBaby', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 80 },
  { artist: 'Trippie Redd', title: 'Miss The Rage (feat. Playboi Carti)', searchQuery: 'Trippie Redd Miss The Rage', verifiedYear: 2021, genre: 'Hip-Hop/Rap', recognitionScore: 90 },

  // Lil Mosey
  { artist: 'Lil Mosey', title: 'Kamikaze', searchQuery: 'Lil Mosey Kamikaze', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 82 },
  { artist: 'Lil Mosey', title: 'Boof Pack', searchQuery: 'Lil Mosey Boof Pack', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 78 },
  { artist: 'Lil Mosey', title: 'Pull Up', searchQuery: 'Lil Mosey Pull Up', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 80 },
  { artist: 'Lil Mosey', title: 'Greet Her', searchQuery: 'Lil Mosey Greet Her', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 78 },
  { artist: 'Lil Mosey', title: 'Stuck in a Dream (feat. Gunna)', searchQuery: 'Lil Mosey Stuck in a Dream Gunna', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 84 },
  { artist: 'Lil Mosey', title: 'Live This Wild', searchQuery: 'Lil Mosey Live This Wild', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 77 },

  // Yung Pinch
  { artist: 'Yung Pinch', title: 'I Know U (feat. Lil Skies)', searchQuery: 'Lil Skies I Know You Yung Pinch', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 82 },
  { artist: 'Yung Pinch', title: 'Perfect (feat. Rich the Kid)', searchQuery: 'Yung Pinch Perfect', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 76 },
  { artist: 'Yung Pinch', title: 'Points on the Board', searchQuery: 'Yung Pinch Points on the Board', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 74 },
  { artist: 'Yung Pinch', title: 'Cloud 9', searchQuery: 'Yung Pinch Cloud 9', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 73 },
  { artist: 'Yung Pinch', title: 'Sail Away', searchQuery: 'Yung Pinch Sail Away', verifiedYear: 2017, genre: 'Hip-Hop/Rap', recognitionScore: 74 },

  // Famous Dex
  { artist: 'Famous Dex', title: 'Drip from My Walk', searchQuery: 'Famous Dex Drip from My Walk', verifiedYear: 2016, genre: 'Hip-Hop/Rap', recognitionScore: 80 },
  { artist: 'Famous Dex', title: 'Hoes Mad', searchQuery: 'Famous Dex Hoes Mad', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 84 },
  { artist: 'Famous Dex', title: 'With Them', searchQuery: 'Famous Dex Rich The Kid With Them', verifiedYear: 2016, genre: 'Hip-Hop/Rap', recognitionScore: 75 },
  { artist: 'Famous Dex', title: 'Ok Dexter', searchQuery: 'Famous Dex Ok Dexter', verifiedYear: 2016, genre: 'Hip-Hop/Rap', recognitionScore: 74 },

  // Fetty Wap
  { artist: 'Fetty Wap', title: 'My Way (feat. Monty)', searchQuery: 'Fetty Wap My Way', verifiedYear: 2015, genre: 'Hip-Hop/Rap', recognitionScore: 88 },
  { artist: 'Fetty Wap', title: 'Again', searchQuery: 'Fetty Wap Again', verifiedYear: 2015, genre: 'Hip-Hop/Rap', recognitionScore: 85 },
  { artist: 'Fetty Wap', title: 'RGF Island', searchQuery: 'Fetty Wap RGF Island', verifiedYear: 2015, genre: 'Hip-Hop/Rap', recognitionScore: 82 },
  { artist: 'Fetty Wap', title: 'Wake Up', searchQuery: 'Fetty Wap Wake Up', verifiedYear: 2016, genre: 'Hip-Hop/Rap', recognitionScore: 80 },
  { artist: 'Fetty Wap', title: 'Jugg (feat. Monty)', searchQuery: 'Fetty Wap Jugg', verifiedYear: 2015, genre: 'Hip-Hop/Rap', recognitionScore: 78 },

  // YoungBoy Never Broke Again / NBA YoungBoy
  { artist: 'YoungBoy Never Broke Again', title: 'No Smoke', searchQuery: 'YoungBoy Never Broke Again No Smoke', verifiedYear: 2017, genre: 'Hip-Hop/Rap', recognitionScore: 88 },
  { artist: 'YoungBoy Never Broke Again', title: 'Untouchable', searchQuery: 'YoungBoy Never Broke Again Untouchable', verifiedYear: 2017, genre: 'Hip-Hop/Rap', recognitionScore: 87 },
  { artist: 'YoungBoy Never Broke Again', title: 'Valuable Pain', searchQuery: 'YoungBoy Never Broke Again Valuable Pain', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 86 },
  { artist: 'YoungBoy Never Broke Again', title: 'Genie', searchQuery: 'YoungBoy Never Broke Again Genie', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 85 },
  { artist: 'YoungBoy Never Broke Again', title: 'Make No Sense', searchQuery: 'YoungBoy Never Broke Again Make No Sense', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 88 },
  { artist: 'YoungBoy Never Broke Again', title: 'Slime Belief', searchQuery: 'YoungBoy Never Broke Again Slime Belief', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 84 },
  { artist: 'YoungBoy Never Broke Again', title: 'Self Made', searchQuery: 'YoungBoy Never Broke Again Self Made', verifiedYear: 2018, genre: 'Hip-Hop/Rap', recognitionScore: 82 },
  { artist: 'YoungBoy Never Broke Again', title: 'House Arrest Tingz', searchQuery: 'YoungBoy Never Broke Again House Arrest Tingz', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 86 },
  { artist: 'YoungBoy Never Broke Again', title: 'Kacey Talk', searchQuery: 'YoungBoy Never Broke Again Kacey Talk', verifiedYear: 2020, genre: 'Hip-Hop/Rap', recognitionScore: 85 },
  { artist: 'YoungBoy Never Broke Again', title: 'Nevada', searchQuery: 'YoungBoy Never Broke Again Nevada', verifiedYear: 2021, genre: 'Hip-Hop/Rap', recognitionScore: 87 },

  // Lil Tecca
  { artist: 'Lil Tecca', title: 'Love Me', searchQuery: 'Lil Tecca Love Me', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 82 },
  { artist: 'Lil Tecca', title: 'Shots', searchQuery: 'Lil Tecca Shots', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 80 },
  { artist: 'Lil Tecca', title: 'Out of Luck', searchQuery: 'Lil Tecca Out of Luck', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 81 },
  { artist: 'Lil Tecca', title: 'Bossanova', searchQuery: 'Lil Tecca Bossanova', verifiedYear: 2019, genre: 'Hip-Hop/Rap', recognitionScore: 78 }
];

async function fetchItunes(term: string) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=10`);
      if (res.ok) {
        const data = await res.json();
        return data.results || [];
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  return [];
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

async function main() {
  console.log('--- IMPORTING CURATED MUST-HAVE TRACKS ---');
  let catalog: Song[] = JSON.parse(fs.readFileSync(CATALOG_FILES[0], 'utf8'));
  console.log('Existing catalog size:', catalog.length);

  const existingSigs = new Set<string>();
  for (const s of catalog) {
    existingSigs.add(`${s.artist.toLowerCase().trim()}:::${s.title.toLowerCase().trim()}`);
  }

  let added = 0;
  for (const item of TARGET_IMPORTS) {
    const sig = `${item.artist.toLowerCase().trim()}:::${item.title.toLowerCase().trim()}`;
    if (existingSigs.has(sig)) {
      console.log(`[SKIP] Already in catalog: ${item.artist} - ${item.title}`);
      continue;
    }

    const results = await fetchItunes(item.searchQuery);
    if (!results || results.length === 0) {
      console.log(`[NOT FOUND] ${item.artist} - ${item.title} (query: ${item.searchQuery})`);
      continue;
    }

    // Pick best match with previewUrl
    const match = results.find((r: any) => r.previewUrl && (
      r.artistName.toLowerCase().includes(item.artist.toLowerCase()) ||
      item.artist.toLowerCase().includes(r.artistName.toLowerCase()) ||
      r.trackName.toLowerCase().includes(item.title.toLowerCase().split('(')[0].trim())
    )) || results[0];

    if (!match || !match.previewUrl) {
      console.log(`[NO PREVIEW] ${item.artist} - ${item.title}`);
      continue;
    }

    const audioValid = await verifyAudio(match.previewUrl);
    if (!audioValid) {
      console.log(`[AUDIO FAILED] ${item.artist} - ${item.title} (${match.previewUrl})`);
      continue;
    }

    const songId = `itunes-${match.trackId}`;
    const newSong: Song = {
      id: songId,
      title: item.title,
      artist: item.artist,
      previewUrl: match.previewUrl,
      artworkUrl: match.artworkUrl100 ? match.artworkUrl100.replace('100x100bb', '600x600bb') : undefined,
      year: item.verifiedYear,
      verifiedOriginalYear: item.verifiedYear,
      yearConfidence: 'high',
      genre: item.genre,
      recognitionScore: item.recognitionScore
    };

    catalog.push(newSong);
    existingSigs.add(sig);
    added++;
    console.log(`[ADDED] ${newSong.artist} - ${newSong.title} (${newSong.verifiedOriginalYear})`);
  }

  // Also clean up any misdated Trippie Redd tracks that were set to 2026/future in catalog
  for (const s of catalog) {
    if ((s.artist || '').toLowerCase().includes('trippie redd')) {
      const tLower = s.title.toLowerCase();
      if (tLower.includes('love scars')) s.verifiedOriginalYear = 2017;
      if (tLower.includes('dark knight')) s.verifiedOriginalYear = 2017;
      if (tLower.includes('topanga')) s.verifiedOriginalYear = 2018;
      if (tLower.includes('taking a walk')) s.verifiedOriginalYear = 2018;
      if (tLower.includes('wish')) s.verifiedOriginalYear = 2018;
      if (tLower.includes('forever ever')) s.verifiedOriginalYear = 2018;
      if (s.verifiedOriginalYear && s.verifiedOriginalYear > 2024) {
        s.verifiedOriginalYear = 2018; // normalize
      }
      s.year = s.verifiedOriginalYear;
    }
  }

  console.log(`Added ${added} new verified tracks. Total catalog size: ${catalog.length}`);

  for (const p of CATALOG_FILES) {
    fs.writeFileSync(p, JSON.stringify(catalog, null, 2), 'utf8');
    console.log('Saved to', p);
  }
}

main().catch(console.error);
