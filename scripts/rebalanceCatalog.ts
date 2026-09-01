import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { KNOWN_ORIGINAL_YEARS } from './knownSongYears.ts';
import { CURATED_MUST_HAVE } from '../src/data/curatedMustHaves.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Song {
  id: string;
  title: string;
  artist: string;
  normalizedArtist?: string;
  album?: string;
  year?: number;
  verifiedOriginalYear?: number;
  yearConfidence?: 'high' | 'medium' | 'low';
  genre?: string;
  recognitionScore?: number;
  artworkUrl?: string;
  previewUrl: string;
  previewStart?: number;
  provider?: string;
}

export interface CuratedSongTarget {
  artist: string;
  query: string;
  genre: string;
  expectedYear: number;
  recognitionScore: number;
}

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

export function isBogusTrack(title: string, artist: string, album?: string): boolean {
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
    'nature sounds',
    'meditation',
  ];

  for (const kw of bogusKeywords) {
    if (normArtist.includes(kw) || normTitle.includes(kw) || normAlbum.includes(kw)) {
      return true;
    }
  }

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
    lowerG.includes('metal') ||
    lowerG.includes('hard rock')
  ) {
    return 'Metal';
  }
  if (
    lowerG.includes('rock') ||
    lowerG.includes('punk') ||
    lowerG.includes('alternative') ||
    lowerG.includes('indie')
  ) {
    return 'Rock';
  }
  if (lowerG.includes('r&b') || lowerG.includes('soul') || lowerG.includes('funk')) {
    return 'R&B/Soul';
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
  if (lowerG.includes('country')) {
    return 'Country';
  }
  if (lowerG.includes('pop') || lowerG.includes('k-pop')) {
    return 'Pop';
  }

  if (['avicii', 'calvin harris', 'david guetta', 'zedd', 'marshmello', 'martin garrix', 'alan walker', 'kygo', 'tiesto', 'alesso', 'galantis', 'robin schulz', 'the chainsmokers', 'disclosure'].some(a => lowerA.includes(a))) {
    return 'Electronic/Dance';
  }
  if (['arctic monkeys', 'coldplay', 'imagine dragons', 'tame impala', 'twenty one pilots', 'the 1975', 'the neighbourhood', 'foster the people', 'cage the elephant', 'paramore', 'fall out boy', 'muse', 'bastille', 'lumineers', 'vance joy', 'hozier'].some(a => lowerA.includes(a))) {
    return 'Alternative';
  }
  if (['frank ocean', 'sza', 'the weeknd', 'bryson tiller', 'khalid', 'daniel caesar', 'h.e.r.', 'jhene aiko', 'partynextdoor', 'ella mai', 'miguel'].some(a => lowerA.includes(a))) {
    return 'R&B/Soul';
  }
  if (['bad bunny', 'j balvin', 'ozuna', 'daddy yankee', 'maluma', 'nicky jam', 'luis fonsi', 'anuel aa', 'karol g', 'becky g', 'rosalia', 'cnco', 'farruko'].some(a => lowerA.includes(a))) {
    return 'Latin';
  }
  if (['drake', 'travis scott', 'juice wrld', 'xxxtentacion', 'lil uzi vert', 'playboi carti', 'post malone', 'lil peep', 'lil skies', 'future', '21 savage', 'migos', 'trippie redd', 'kanye west', 'kendrick lamar', 'young thug', 'gunna'].some(a => lowerA.includes(a))) {
    return 'Hip-Hop/Rap';
  }

  return g || 'Pop';
}

export async function testAudioPlayability(previewUrl: string): Promise<boolean> {
  if (!previewUrl || !previewUrl.startsWith('http')) return false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(previewUrl, {
      method: 'GET',
      headers: {
        Range: 'bytes=0-1024',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok || res.status === 206) {
      const buffer = await res.arrayBuffer();
      return buffer.byteLength > 50;
    }
    return false;
  } catch {
    return false;
  }
}
