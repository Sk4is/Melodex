import { musicService, getNormalizedGenre } from '../src/services/musicService.ts';

async function runSimulation() {
  console.log('=== Testing Catalog Selection Simulation ===');

  await musicService.loadInitialCatalog();
  const catalog = musicService.getCatalog();
  console.log(`Loaded catalog size: ${catalog.length} verified songs.`);

  // Test 1: 2010s Genre Distribution over 1,000 random picks
  const counts2010s: Record<string, number> = {};
  let yearErrors2010s = 0;

  for (let i = 0; i < 1000; i++) {
    const song = musicService.getRandomSong([], '2010s');
    if (!song) {
      console.error('Failed to get song for 2010s!');
      continue;
    }
    const year = musicService.getVerifiedYear(song);
    if (year === null || year < 2010 || year > 2019) {
      yearErrors2010s++;
      console.error(`Year Error in 2010s: ${song.artist} - ${song.title} has year ${year}`);
    }

    const g = getNormalizedGenre(song.genre, song.artist, song.title);
    counts2010s[g] = (counts2010s[g] || 0) + 1;
  }

  console.log('\n--- 2010s Simulation (1,000 rounds) ---');
  console.log(`Year validation errors: ${yearErrors2010s} (Target: 0)`);
  console.log('Genre selection breakdown:');
  for (const [genre, count] of Object.entries(counts2010s)) {
    const pct = ((count / 1000) * 100).toFixed(1);
    console.log(`  ${genre.padEnd(24)}: ${count} (${pct}%)`);
  }

  // Test 2: Verify pre2000
  let yearErrorsPre2000 = 0;
  for (let i = 0; i < 200; i++) {
    const song = musicService.getRandomSong([], 'pre2000');
    if (song) {
      const y = musicService.getVerifiedYear(song);
      if (y === null || y >= 2000) {
        yearErrorsPre2000++;
        console.error(`Year Error in pre2000: ${song.artist} - ${song.title} has year ${y}`);
      }
    }
  }
  console.log(`\n--- pre2000 Simulation (200 rounds) ---`);
  console.log(`Year validation errors: ${yearErrorsPre2000} (Target: 0)`);

  // Test 3: Verify 2000s
  let yearErrors2000s = 0;
  for (let i = 0; i < 200; i++) {
    const song = musicService.getRandomSong([], '2000s');
    if (song) {
      const y = musicService.getVerifiedYear(song);
      if (y === null || y < 2000 || y > 2009) {
        yearErrors2000s++;
        console.error(`Year Error in 2000s: ${song.artist} - ${song.title} has year ${y}`);
      }
    }
  }
  console.log(`\n--- 2000s Simulation (200 rounds) ---`);
  console.log(`Year validation errors: ${yearErrors2000s} (Target: 0)`);

  // Test 4: Sample 15 consecutive 2010s songs to display session variety
  console.log('\n--- Sample 15 Consecutive 2010s Songs ---');
  const played: string[] = [];
  for (let i = 0; i < 15; i++) {
    const song = musicService.getRandomSong(played, '2010s');
    if (song) {
      played.push(song.id);
      const g = getNormalizedGenre(song.genre, song.artist, song.title);
      console.log(`  #${i + 1} [${g.padEnd(20)}] [${song.verifiedOriginalYear}] ${song.artist} - ${song.title} (Score: ${song.recognitionScore ?? 'N/A'})`);
    }
  }
}

runSimulation().catch(console.error);
