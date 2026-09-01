import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Song } from '../src/types/song';
import { KNOWN_ORIGINAL_YEARS } from './knownSongYears';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ArtistTarget {
  name: string;
  searchQuery?: string;
  primaryGenre: string;
  primaryDecade?: 'pre2000' | '2000s' | '2010s' | '2020s';
  targetCount: number; // 25-35 for superstars, 15-20 for major, 8-12 for mid, 1-4 for one-hit
  tier: 1 | 2 | 3 | 4;
}

export function norm(s: string): string {
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

export function cleanTitle(raw: string): string {
  let t = raw;
  t = t.replace(/\s*(\(|\[).*?(remaster|deluxe|anniversary|expanded|edition|clean version|album version|single version|original mix|bonus track|live at|live from|acoustic|instrumental|edit|mono|stereo).*?(\)|\])/gi, '');
  t = t.replace(/\s*-\s*(remastered|deluxe|anniversary|bonus track|single version|clean|explicit|radio edit|live|mono|stereo).*/gi, '');
  return t.trim() || raw.trim();
}

export function createSig(artist: string, title: string): string {
  return `${norm(artist)}:::${norm(cleanTitle(title))}`;
}

export async function checkAudioUrl(url: string, timeoutMs = 3500): Promise<boolean> {
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
