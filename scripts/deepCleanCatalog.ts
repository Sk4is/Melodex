import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Song, normalizeGenre } from './balanceAndExpandCatalog.ts';
import { KNOWN_ORIGINAL_YEARS } from './knownSongYears.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATALOG_DATA_PATH = path.resolve(__dirname, '../src/data/melodex-catalog.json');
const CATALOG_PUBLIC_PATH = path.resolve(__dirname, '../public/melodex-catalog.json');

const catalog: Song[] = JSON.parse(fs.readFileSync(CATALOG_DATA_PATH, 'utf-8'));
console.log(`Deep cleaning ${catalog.length} catalog songs...`);

function fixEncoding(str: string): string {
  if (!str) return '';
  return str
    .replace(/JAÅ¸-Z/g, 'JAY-Z')
    .replace(/BeyoncÃ©/g, 'Beyoncé')
    .replace(/MÃºsica/g, 'Música')
    .replace(/GATTÃœSO/g, 'GATTÜSO')
    .replace(/Ã©/g, 'é')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã±/g, 'ñ');
}

// Check if artist and title combination is bogus (e.g., matching artist search keyword in song title)
function isBogusTrackDeep(artist: string, title: string, album = ''): boolean {
  const a = artist.toLowerCase();
  const t = title.toLowerCase();
  const alb = album.toLowerCase();

  // Search keyword in title mismatches:
  if (a === 'the streets' && t.includes('migos')) return true;
  if (a === 'diljit dosanjh' && t.includes('future')) return true;
  if (a === 'ballpoint' && t.includes('ice cube')) return true;
  if (a === 'j monty' && t.includes('21 savage')) return true;
  if (a === 'ddg' && t === 'lil baby') return true;
  if (a.includes('jim johnston') && t.includes('the game')) return true;
  if (a.includes('milky chance') && t.includes('the game')) return true;
  if (a === 'montana of 300' && t === '2pac') return true;
  if (a === 'young thug' && t.toLowerCase() === 'lil baby') return true;
  if (a === 'trippie redd' && t.toLowerCase() === 'lil wayne') return true;

  // Instrumental / karaoke / tribute junk
  if (t.includes('instrumental') && !a.includes('metro boomin')) return true;
  if (alb.includes('tribute') || t.includes('tribute') || a.includes('tribute')) return true;
  if (alb.includes('karaoke') || t.includes('karaoke')) return true;

  return false;
}

// Resolve true original year for live albums and classic hits
function resolveTrueOriginalYear(song: Song): { year: number; confidence: 'high' | 'medium' | 'low' } | null {
  const a = song.artist.toLowerCase();
  const t = song.title.toLowerCase();
  const alb = (song.album || '').toLowerCase();
  const currentYear = song.year || 0;

  // Known special cases
  if (t.includes('deja vu') && a.includes('beyonc')) {
    return { year: 2006, confidence: 'high' };
  }
  if (t.includes('crazy in love') && a.includes('beyonc')) {
    return { year: 2003, confidence: 'high' };
  }
  if (t.includes('halo') && a.includes('beyonc')) {
    return { year: 2008, confidence: 'high' };
  }
  if (t.includes('single ladies') && a.includes('beyonc')) {
    return { year: 2008, confidence: 'high' };
  }
  if (t.includes('it was a good day') && a.includes('ice cube')) {
    return { year: 1992, confidence: 'high' };
  }
  if (t.includes('shook ones') && a.includes('mobb deep')) {
    return { year: 1995, confidence: 'high' };
  }
  if (t.includes('you aint a killer') && a.includes('big pun')) {
    return { year: 1998, confidence: 'high' };
  }
  if (t.includes('whats my name, pt. 2') && a.includes('snoop dogg')) {
    return { year: 2000, confidence: 'high' };
  }
  if (t.includes('outta control') && a.includes('50 cent')) {
    return { year: 2005, confidence: 'high' };
  }
  if (t.includes('best friend') && a.includes('50 cent')) {
    return { year: 2005, confidence: 'high' };
  }
  if (t.includes('love story') && a.includes('taylor swift')) {
    return { year: 2008, confidence: 'high' };
  }
  if (t.includes('you belong with me') && a.includes('taylor swift')) {
    return { year: 2008, confidence: 'high' };
  }
  if (t.includes('teardrops on my guitar') && a.includes('taylor swift')) {
    return { year: 2006, confidence: 'high' };
  }
  if (t.includes('our song') && a.includes('taylor swift')) {
    return { year: 2006, confidence: 'high' };
  }
  if (t.includes('i write sins not tragedies') && a.includes('panic!')) {
    return { year: 2005, confidence: 'high' };
  }
  if (t.includes('uprising') && a.includes('muse')) {
    return { year: 2009, confidence: 'high' };
  }
  if (t.includes('505') && a.includes('arctic monkeys')) {
    return { year: 2007, confidence: 'high' };
  }
  if (t.includes('empire state of mind') && a.includes('jay')) {
    return { year: 2009, confidence: 'high' };
  }
  if (t.includes('run this town') && a.includes('jay')) {
    return { year: 2009, confidence: 'high' };
  }
  if (t.includes('fiesta') && a.includes('kelly')) {
    return { year: 2000, confidence: 'high' };
  }
  if (t.includes('no letting go') && a.includes('wayne wonder')) {
    return { year: 2002, confidence: 'high' };
  }

  // Check dictionary
  const sig = `${a}:::${t}`.replace(/[^\w\s:]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const [knownSig, yr] of Object.entries(KNOWN_ORIGINAL_YEARS)) {
    if (sig.includes(knownSig) || knownSig.includes(sig)) {
      return { year: yr, confidence: 'high' };
    }
  }

  if (currentYear > 0) {
    return { year: currentYear, confidence: 'high' };
  }

  return null;
}

const cleaned: Song[] = [];
const seenSigs = new Set<string>();

for (const raw of catalog) {
  if (!raw.id || !raw.title || !raw.artist || !raw.previewUrl) continue;

  const artist = fixEncoding(raw.artist.trim());
  const title = fixEncoding(raw.title.trim());
  const album = fixEncoding(raw.album?.trim() || '');

  if (isBogusTrackDeep(artist, title, album)) {
    console.log(`Purging bogus track: ${artist} - ${title}`);
    continue;
  }

  const resolved = resolveTrueOriginalYear(raw);
  if (!resolved) continue;

  const sig = `${artist.toLowerCase()}:::${title.toLowerCase()}`.replace(/[^\w\s:]/g, ' ').replace(/\s+/g, ' ').trim();
  if (seenSigs.has(sig)) continue;
  seenSigs.add(sig);

  const cleanGenre = normalizeGenre(raw.genre, artist, title);
  const recScore = raw.recognitionScore ?? 80;

  cleaned.push({
    id: raw.id,
    title,
    artist,
    album: album || undefined,
    year: resolved.year,
    verifiedOriginalYear: resolved.year,
    yearConfidence: resolved.confidence,
    genre: cleanGenre,
    recognitionScore: recScore,
    artworkUrl: raw.artworkUrl,
    previewUrl: raw.previewUrl,
    previewStart: 0,
  });
}

console.log(`Cleaned catalog total songs: ${cleaned.length}`);

// Breakdown check
const breakdown = { pre2000: 0, '2000s': 0, '2010s': 0, '2020s': 0 };
const genres2010s: Record<string, number> = {};

for (const s of cleaned) {
  const y = s.verifiedOriginalYear!;
  if (y < 2000) breakdown.pre2000++;
  else if (y <= 2009) breakdown['2000s']++;
  else if (y <= 2019) {
    breakdown['2010s']++;
    genres2010s[s.genre!] = (genres2010s[s.genre!] || 0) + 1;
  } else breakdown['2020s']++;
}

console.log('Cleaned breakdown by decade:', breakdown);
console.log('Cleaned 2010s genres:', genres2010s);

const formatted = JSON.stringify(cleaned, null, 2);
fs.writeFileSync(CATALOG_DATA_PATH, formatted, 'utf-8');
fs.writeFileSync(CATALOG_PUBLIC_PATH, formatted, 'utf-8');
console.log('Saved deep-cleaned catalog to src/data and public!');
