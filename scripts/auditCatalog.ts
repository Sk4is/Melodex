import fs from 'fs';
import path from 'path';
import { SEED_ARTISTS, SeedArtist } from './seedArtists';
import { Song } from '../src/types/song';
import { normalizeText, fuzzyMatchSong } from '../src/utils/normalizeText';

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

export interface ArtistAuditResult {
  artist: string;
  tier: number;
  targetCount: number;
  importStatus: 'IMPORTED' | 'PARTIAL' | 'NO_PLAYABLE_TRACKS' | 'NEEDS_RETRY' | 'FAILED';
  candidatesFound: number;
  verifiedPlayable: number;
  rejectedAudio: number;
  rejectedYear: number;
  rejectedMetadata: number;
  duplicatesRejected: number;
  autocompleteTracks: number;
  sampleTracks?: string[];
}

export interface CatalogAuditSummary {
  totalSeedArtists: number;
  artistsWithPlayableSongs: number;
  artistsWithZeroPlayableSongs: number;
  underrepresentedArtists: number;
  missingSeedArtists: ArtistAuditResult[];
  underrepresentedList: ArtistAuditResult[];
  auditResults: ArtistAuditResult[];
}

/**
 * Checks if a song belongs or credits a seed artist
 */
export function songMatchesSeedArtist(song: Song, seedArtist: SeedArtist): boolean {
  const normTarget = normalizeText(seedArtist.name);
  const normArtist = normalizeText(song.artist);
  const normTitle = normalizeText(song.title);

  if (isArtistMatch(song.artist, seedArtist.name)) {
    return true;
  }

  // Also check if artist is in parentheses e.g. "feat. Pitbull"
  if (normArtist.includes(normTarget) || normTitle.includes(normTarget)) {
    return true;
  }

  return false;
}

/**
 * Audit all seed artists against currently stored Melodex catalog
 */
export function auditCatalog(): CatalogAuditSummary {
  const catalogPath = path.join(process.cwd(), 'src/data/melodex-catalog.json');
  let songs: Song[] = [];
  if (fs.existsSync(catalogPath)) {
    songs = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  }

  // Pre-normalize all songs once
  const songRecords = songs.map(s => {
    const normArtist = normalizeText(s.artist);
    const normTitle = normalizeText(s.title);
    const normCombined = `${normTitle} ${normArtist}`;
    return {
      song: s,
      normArtist,
      normTitle,
      normCombined,
    };
  });

  const results: ArtistAuditResult[] = [];

  for (const seed of SEED_ARTISTS) {
    const normTarget = normalizeText(seed.name);
    const targetTokens = normTarget.split(' ').filter(Boolean);

    // 1. Direct matches
    const matchingSongs: Song[] = [];
    for (const item of songRecords) {
      if (
        item.normArtist === normTarget ||
        item.normArtist.includes(normTarget) ||
        item.normTitle.includes(normTarget) ||
        isArtistMatch(item.song.artist, seed.name)
      ) {
        matchingSongs.push(item.song);
      }
    }
    const verifiedPlayable = matchingSongs.length;

    // 2. Autocomplete simulation (tokens must all be in combined)
    let autocompleteTracks = 0;
    if (targetTokens.length > 0) {
      for (const item of songRecords) {
        if (targetTokens.every(token => item.normCombined.includes(token))) {
          autocompleteTracks++;
        }
      }
    }

    // Determine import status
    let importStatus: ArtistAuditResult['importStatus'];
    if (verifiedPlayable >= seed.targetCount) {
      importStatus = 'IMPORTED';
    } else if (verifiedPlayable > 0) {
      importStatus = 'PARTIAL';
    } else {
      importStatus = 'NO_PLAYABLE_TRACKS';
    }

    results.push({
      artist: seed.name,
      tier: seed.tier,
      targetCount: seed.targetCount,
      importStatus,
      candidatesFound: verifiedPlayable,
      verifiedPlayable,
      rejectedAudio: 0,
      rejectedYear: 0,
      rejectedMetadata: 0,
      duplicatesRejected: 0,
      autocompleteTracks,
      sampleTracks: matchingSongs.slice(0, 3).map(s => `${s.title} (${s.year})`),
    });
  }

  const missingSeedArtists = results.filter(r => r.verifiedPlayable === 0);
  const underrepresentedList = results.filter(r => r.verifiedPlayable > 0 && r.verifiedPlayable < r.targetCount);

  return {
    totalSeedArtists: SEED_ARTISTS.length,
    artistsWithPlayableSongs: results.filter(r => r.verifiedPlayable > 0).length,
    artistsWithZeroPlayableSongs: missingSeedArtists.length,
    underrepresentedArtists: underrepresentedList.length,
    missingSeedArtists,
    underrepresentedList,
    auditResults: results,
  };
}

export function getMissingSeedArtists(): ArtistAuditResult[] {
  return auditCatalog().missingSeedArtists;
}

export function getUnderrepresentedSeedArtists(): ArtistAuditResult[] {
  return auditCatalog().underrepresentedList;
}

if (process.argv[1]?.includes('auditCatalog.ts')) {
  const audit = auditCatalog();
  console.log('=== SEED ARTIST CATALOG AUDIT ===');
  console.log(`Seed artists total: ${audit.totalSeedArtists}`);
  console.log(`Artists with playable songs: ${audit.artistsWithPlayableSongs}`);
  console.log(`Artists with zero playable songs: ${audit.artistsWithZeroPlayableSongs}`);
  console.log(`Underrepresented artists: ${audit.underrepresentedArtists}`);
  console.log('\n--- Missing Tier 1 & 2 Artists Sample ---');
  for (const m of audit.missingSeedArtists.filter(a => a.tier <= 2).slice(0, 20)) {
    console.log(`MISSING: ${m.artist} (Tier ${m.tier}) — 0 / ${m.targetCount} [Autocomplete: ${m.autocompleteTracks}]`);
  }
  console.log('\n--- Underrepresented Tier 1 Sample ---');
  for (const u of audit.underrepresentedList.filter(a => a.tier === 1).slice(0, 20)) {
    console.log(`UNDERREPRESENTED: ${u.artist} — ${u.verifiedPlayable} / ${u.targetCount} [Autocomplete: ${u.autocompleteTracks}]`);
  }
}
