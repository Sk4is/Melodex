import fs from 'fs';
import path from 'path';
import { Song } from '../src/types/song';
import { DecadeFilter, GenreFilter } from '../src/types/game';
import { normalizeText, squashSymbols } from '../src/utils/normalizeText';

const CATALOG_DATA = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'src/data/melodexCatalog.json'), 'utf8')) as Song[];

export function fisherYatesShuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function extractPrimaryArtist(artist: string): string {
  if (!artist) return '';
  // Split on featuring, with, &, etc.
  const parts = artist.split(/(?:feat\.|ft\.|featuring|with|&|\band\b|x|\+|\/|,)/i);
  return parts[0].trim();
}

export function normalizeArtistKey(artist: string): string {
  const primary = extractPrimaryArtist(artist);
  return normalizeText(primary);
}

// Let's test the balanced selection engine
class SimulatedEngine {
  private recentTrackIds: string[] = [];
  private recentArtistKeys: string[] = [];
  private maxRecentTracks = 40;
  private maxRecentArtists = 10;

  public resetMemory() {
    this.recentTrackIds = [];
    this.recentArtistKeys = [];
  }

  public getVerifiedYear(song: Song): number | null {
    if (typeof song.verifiedOriginalYear === 'number' && !isNaN(song.verifiedOriginalYear)) {
      return song.verifiedOriginalYear;
    }
    if (typeof song.year === 'number' && !isNaN(song.year)) {
      return song.year;
    }
    return null;
  }

  public matchesDecade(song: Song, decade: DecadeFilter): boolean {
    const verifiedYear = this.getVerifiedYear(song);
    if (verifiedYear === null) return false;
    if (decade === 'all') return true;
    if (decade === 'pre2000') return verifiedYear < 2000;
    if (decade === '2000s') return verifiedYear >= 2000 && verifiedYear <= 2009;
    if (decade === '2010s') return verifiedYear >= 2010 && verifiedYear <= 2019;
    if (decade === '2020s') return verifiedYear >= 2020 && verifiedYear <= 2029;
    return false;
  }

  public matchesGenre(song: Song, genre: GenreFilter): boolean {
    if (genre === 'all') return true;
    const g = (song.genre || '').toLowerCase();
    const a = (song.artist || '').toLowerCase();
    if (genre === 'hiphop') {
      return g.includes('hip-hop') || g.includes('rap') || g.includes('trap') || g.includes('drill');
    }
    return true;
  }

  public selectRoundSong(decade: DecadeFilter, genre: GenreFilter): Song | null {
    // 1. Filter eligible pool strictly by decade and genre
    const pool = CATALOG_DATA.filter(s => this.matchesDecade(s, decade) && this.matchesGenre(s, genre));
    if (pool.length === 0) return null;

    // 2. Group candidate songs by primary artist key
    const artistMap = new Map<string, Song[]>();
    for (const song of pool) {
      const aKey = normalizeArtistKey(song.artist);
      const list = artistMap.get(aKey) || [];
      list.push(song);
      artistMap.set(aKey, list);
    }

    const allArtistKeys = Array.from(artistMap.keys());
    if (allArtistKeys.length === 0) return null;

    // 3. Filter out recent artists (Recent Artist Memory)
    let availableArtistKeys = allArtistKeys.filter(k => !this.recentArtistKeys.includes(k));
    if (availableArtistKeys.length === 0) {
      // Fall back if artist pool is exhausted
      availableArtistKeys = allArtistKeys;
    }

    // 4. Balanced Artist Selection using Fisher-Yates shuffle
    const shuffledArtists = fisherYatesShuffle(availableArtistKeys);
    const chosenArtistKey = shuffledArtists[0];
    const artistSongs = artistMap.get(chosenArtistKey) || [];

    // 5. Song selection within artist (avoiding recently played songs)
    let availableSongs = artistSongs.filter(s => !this.recentTrackIds.includes(s.id));
    if (availableSongs.length === 0) {
      availableSongs = artistSongs;
    }

    // 6. Soft recognition weighting among this artist's tracks
    let chosenSong: Song;
    if (availableSongs.length === 1) {
      chosenSong = availableSongs[0];
    } else {
      const weights = availableSongs.map(s => {
        const score = typeof s.recognitionScore === 'number' ? s.recognitionScore : 75;
        return Math.pow(Math.max(20, score) / 100, 1.2);
      });
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      let rand = Math.random() * totalWeight;
      chosenSong = availableSongs[0];
      for (let i = 0; i < availableSongs.length; i++) {
        rand -= weights[i];
        if (rand <= 0) {
          chosenSong = availableSongs[i];
          break;
        }
      }
    }

    // 7. Update recent memories
    this.recentTrackIds.push(chosenSong.id);
    if (this.recentTrackIds.length > this.maxRecentTracks) {
      this.recentTrackIds.shift();
    }

    this.recentArtistKeys.push(chosenArtistKey);
    if (this.recentArtistKeys.length > this.maxRecentArtists) {
      this.recentArtistKeys.shift();
    }

    return chosenSong;
  }
}

function runSimulation() {
  console.log('=== RUNNING SELECTION SIMULATIONS ===');

  // Test 1: Page Refresh Test (20 refreshes)
  console.log('\n--- TEST 1: Page Refresh Test (20 initial rounds for 2010s Hip-Hop) ---');
  const firstArtists: string[] = [];
  for (let i = 0; i < 20; i++) {
    const engine = new SimulatedEngine(); // Fresh session
    const song = engine.selectRoundSong('2010s', 'hiphop');
    if (song) {
      firstArtists.push(`${song.artist} - ${song.title}`);
    }
  }
  firstArtists.forEach((a, i) => console.log(`Refresh ${i + 1}: ${a}`));

  // Test 2: 1,000 Simulated 2010s Hip-Hop Rounds
  console.log('\n--- TEST 2: 1,000 Simulated Continuous Rounds (2010s Hip-Hop) ---');
  const continuousEngine = new SimulatedEngine();
  const artistCounts: Record<string, number> = {};
  const songCounts: Record<string, number> = {};

  for (let i = 0; i < 1000; i++) {
    const song = continuousEngine.selectRoundSong('2010s', 'hiphop');
    if (song) {
      const a = extractPrimaryArtist(song.artist);
      artistCounts[a] = (artistCounts[a] || 0) + 1;
      songCounts[song.title] = (songCounts[song.title] || 0) + 1;
    }
  }

  const sortedArtists = Object.entries(artistCounts).sort((a, b) => b[1] - a[1]);
  console.log('Total unique artists appeared in 1000 rounds:', sortedArtists.length);
  console.log('\nTop 15 Most Frequent Artists:');
  sortedArtists.slice(0, 15).forEach(([name, count], i) => {
    console.log(`  ${i + 1}. ${name}: ${count} appearances (${(count / 10).toFixed(1)}%)`);
  });

  console.log('\nBottom 15 Eligible Artists:');
  sortedArtists.slice(-15).forEach(([name, count], i) => {
    console.log(`  ${name}: ${count} appearances (${(count / 10).toFixed(1)}%)`);
  });

  // Check specific curated artists in the 1000 simulation
  const curatedToCheck = [
    'Lil Skies', 'Lil Mosey', 'Yung Pinch', 'Trippie Redd', 'Lil Pump',
    'Lil Peep', 'Famous Dex', 'Fetty Wap', 'YoungBoy Never Broke Again', 'Post Malone', 'Drake', 'J. Cole', 'Kanye West'
  ];

  console.log('\nCurated Artists Appearance Summary (out of 1000 rounds):');
  for (const c of curatedToCheck) {
    const count = artistCounts[c] || Object.entries(artistCounts).find(([k]) => k.toLowerCase().includes(c.toLowerCase()))?.[1] || 0;
    console.log(`  ${c}: ${count} appearances (${(count / 10).toFixed(1)}%)`);
  }
}

runSimulation();
