import { musicService } from '../src/services/musicService';
import { extractPrimaryArtist } from '../src/utils/normalizeText';

async function runComprehensiveTests() {
  await musicService.loadInitialCatalog();

  console.log('=== TEST 1: 20 Page Refreshes (2010s Hip-Hop) ===');
  const refreshResults: string[] = [];
  for (let i = 0; i < 20; i++) {
    musicService.clearRecentHistory(); // Fresh session
    const song = musicService.getRandomSong([], '2010s', ['hiphop']);
    if (song) {
      refreshResults.push(`${song.artist} - ${song.title} (${song.verifiedOriginalYear || song.year})`);
    }
  }
  refreshResults.forEach((r, i) => console.log(`Refresh ${i + 1}: ${r}`));

  console.log('\n=== TEST 2: 1,000 Continuous Rounds Simulation (2010s Hip-Hop) ===');
  musicService.clearRecentHistory();
  const hiphopArtistCounts: Record<string, number> = {};
  const playedSongs: string[] = [];

  for (let i = 0; i < 1000; i++) {
    const song = musicService.getRandomSong(playedSongs.slice(-30), '2010s', ['hiphop']);
    if (song) {
      const a = extractPrimaryArtist(song.artist);
      hiphopArtistCounts[a] = (hiphopArtistCounts[a] || 0) + 1;
      playedSongs.push(song.id);
    }
  }

  const sortedHiphopArtists = Object.entries(hiphopArtistCounts).sort((a, b) => b[1] - a[1]);
  console.log(`Unique 2010s Hip-Hop Artists Appeared: ${sortedHiphopArtists.length}`);

  console.log('\nTop 15 Most Frequent Artists (2010s Hip-Hop):');
  sortedHiphopArtists.slice(0, 15).forEach(([name, count], i) => {
    console.log(`  ${i + 1}. ${name}: ${count} (${(count / 10).toFixed(1)}%)`);
  });

  console.log('\nBottom 15 Eligible Artists (2010s Hip-Hop):');
  sortedHiphopArtists.slice(-15).forEach(([name, count], i) => {
    console.log(`  ${name}: ${count} (${(count / 10).toFixed(1)}%)`);
  });

  const curatedArtists = [
    'Lil Skies',
    'Lil Mosey',
    'Yung Pinch',
    'Trippie Redd',
    'Lil Pump',
    'Lil Peep',
    'Famous Dex',
    'Fetty Wap',
    'YoungBoy Never Broke Again',
    'Post Malone',
    'Lil Tecca',
    'Juice WRLD',
    'Drake',
    'J. Cole',
    'Kanye West',
    'Chief Keef'
  ];

  console.log('\nCurated Artists Exposure in 1,000 Rounds (2010s Hip-Hop):');
  for (const c of curatedArtists) {
    const count = hiphopArtistCounts[c] || Object.entries(hiphopArtistCounts).find(([k]) => k.toLowerCase().includes(c.toLowerCase()))?.[1] || 0;
    console.log(`  ${c}: ${count} rounds (${(count / 10).toFixed(1)}%)`);
  }

  console.log('\n=== TEST 3: 1,000 Continuous Rounds Simulation (2010s All Genres) ===');
  musicService.clearRecentHistory();
  const allGenresCounts: Record<string, number> = {};
  const allGenrePlayedSongs: string[] = [];

  for (let i = 0; i < 1000; i++) {
    const song = musicService.getRandomSong(allGenrePlayedSongs.slice(-30), '2010s', ['all']);
    if (song) {
      const a = extractPrimaryArtist(song.artist);
      allGenresCounts[a] = (allGenresCounts[a] || 0) + 1;
      allGenrePlayedSongs.push(song.id);
    }
  }

  const sortedAllArtists = Object.entries(allGenresCounts).sort((a, b) => b[1] - a[1]);
  console.log(`Unique 2010s All-Genres Artists Appeared: ${sortedAllArtists.length}`);

  console.log('\nTop 15 Most Frequent Artists (2010s All Genres):');
  sortedAllArtists.slice(0, 15).forEach(([name, count], i) => {
    console.log(`  ${i + 1}. ${name}: ${count} (${(count / 10).toFixed(1)}%)`);
  });

  console.log('\nCurated Artists Exposure in 1,000 Rounds (2010s All Genres):');
  for (const c of curatedArtists) {
    const count = allGenresCounts[c] || Object.entries(allGenresCounts).find(([k]) => k.toLowerCase().includes(c.toLowerCase()))?.[1] || 0;
    console.log(`  ${c}: ${count} rounds (${(count / 10).toFixed(1)}%)`);
  }
}

runComprehensiveTests();
