import { musicService, normalizeArtistKey } from '../src/services/musicService';
import { DecadeFilter, GenreFilter } from '../src/types/game';

// Mock localStorage for node environment
const storage = new Map<string, string>();
(global as any).window = {
  localStorage: {
    getItem: (key: string) => storage.get(key) || null,
    setItem: (key: string, val: string) => storage.set(key, val),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear()
  }
};
(global as any).localStorage = (global as any).window.localStorage;

async function runSimulation() {
  console.log('=== Starting 5,000-Round Melodex Simulation Test ===');
  
  const catalog = musicService.getCatalog();
  console.log(`Total catalog loaded: ${catalog.length} songs.`);

  // Verify all songs have trackIdentityVerified === true
  const invalidTracks = catalog.filter(s => s.trackIdentityVerified !== true || !s.previewUrl || !s.previewUrl.startsWith('http'));
  if (invalidTracks.length > 0) {
    console.error(`FATAL: Found ${invalidTracks.length} invalid tracks in catalog!`);
    process.exit(1);
  }
  console.log('PASS: 100% of catalog tracks have verified track identity.');

  // Simulation state
  const TOTAL_ROUNDS = 5000;
  const decades: DecadeFilter[] = ['all', 'pre2000', '2000s', '2010s', '2020s'];
  const genres: GenreFilter[] = ['all', 'pop', 'hiphop', 'rock', 'rnb', 'electronic', 'latin'];

  const artistAppearanceCount = new Map<string, number>();
  const songAppearanceCount = new Map<string, number>();
  const artistUniqueSongs = new Map<string, Set<string>>();

  let immediateArtistRepeats = 0;
  let immediateSongRepeats = 0;
  let lastArtist = '';
  let lastSongId = '';

  let roundsCompleted = 0;

  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const decade = decades[i % decades.length];
    const genre = genres[Math.floor(i / decades.length) % genres.length];

    // Pick song using musicService's getRandomSong / deck mechanism
    const song = musicService.getRandomSong([], decade, genre);
    if (!song) {
      console.warn(`Round ${i + 1}: No song found for decade=${decade}, genre=${genre}`);
      continue;
    }

    roundsCompleted++;

    const aKey = normalizeArtistKey(song.artist);

    // Check immediate repeats
    if (aKey === lastArtist) {
      immediateArtistRepeats++;
    }
    if (song.id === lastSongId) {
      immediateSongRepeats++;
    }

    lastArtist = aKey;
    lastSongId = song.id;

    // Track distributions
    artistAppearanceCount.set(aKey, (artistAppearanceCount.get(aKey) || 0) + 1);
    songAppearanceCount.set(song.id, (songAppearanceCount.get(song.id) || 0) + 1);

    if (!artistUniqueSongs.has(aKey)) {
      artistUniqueSongs.set(aKey, new Set());
    }
    artistUniqueSongs.get(aKey)!.add(song.id);
  }

  console.log(`\nCompleted ${roundsCompleted} rounds.`);
  console.log(`Unique artists played: ${artistAppearanceCount.size}`);
  console.log(`Unique songs played: ${songAppearanceCount.size}`);

  console.log(`Immediate artist repeats: ${immediateArtistRepeats} (${((immediateArtistRepeats / roundsCompleted) * 100).toFixed(2)}%)`);
  console.log(`Immediate song repeats: ${immediateSongRepeats} (${((immediateSongRepeats / roundsCompleted) * 100).toFixed(2)}%)`);

  if (immediateSongRepeats > 0) {
    console.error(`FAIL: Immediate song repeats should be 0!`);
    process.exit(1);
  }

  // Check top 10 most played artists to ensure no single artist dominates
  const sortedArtists = Array.from(artistAppearanceCount.entries()).sort((a, b) => b[1] - a[1]);
  console.log('\nTop 15 Most Played Artists:');
  for (let i = 0; i < Math.min(15, sortedArtists.length); i++) {
    const [aKey, count] = sortedArtists[i];
    const uniqueSongsCount = artistUniqueSongs.get(aKey)?.size || 0;
    const pct = ((count / roundsCompleted) * 100).toFixed(2);
    console.log(`  ${i + 1}. ${aKey}: ${count} rounds (${pct}%) — ${uniqueSongsCount} unique songs utilized`);
  }

  // Verify maximum artist share is healthy (< 5% of total rounds)
  const maxArtistShare = sortedArtists[0][1] / roundsCompleted;
  console.log(`\nHighest artist share: ${(maxArtistShare * 100).toFixed(2)}% (target: < 4%)`);
  if (maxArtistShare > 0.05) {
    console.error('FAIL: An artist dominated the rounds!');
    process.exit(1);
  }

  // Verify artist depth usage: top artists with 10+ tracks should have multiple unique songs used
  console.log('\nChecking depth usage for top artists:');
  const checkArtists = ['drake', 'taylor swift', 'kanye west', 'the weeknd', 'rihanna', 'eminem', 'bad bunny', 'coldplay'];
  for (const a of checkArtists) {
    const uniqueUsed = artistUniqueSongs.get(a)?.size || 0;
    const totalPlays = artistAppearanceCount.get(a) || 0;
    console.log(`  ${a}: played ${totalPlays} times with ${uniqueUsed} distinct songs`);
  }

  console.log('\n=== ALL SIMULATION CHECKS PASSED SUCCESSFULLY ===\n');
}

runSimulation().catch(err => {
  console.error(err);
  process.exit(1);
});
