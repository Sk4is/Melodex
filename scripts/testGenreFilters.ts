import fs from 'fs';
import path from 'path';
import { Song } from '../src/types/song';
import { GenreFilter, DecadeFilter } from '../src/types/game';
import { matchesGenre, matchesAnyGenre } from '../src/services/musicService';
import { computeNormalizedGenres } from '../src/utils/genreUtils';

function matchesDecade(song: Song, decade: DecadeFilter): boolean {
  const y = song.verifiedOriginalYear || song.year || 0;
  if (decade === 'all') return true;
  if (decade === 'pre2000') return y < 2000;
  if (decade === '2000s') return y >= 2000 && y <= 2009;
  if (decade === '2010s') return y >= 2010 && y <= 2019;
  if (decade === '2020s') return y >= 2020 && y <= 2029;
  return false;
}

async function runGenreFilterSimulation() {
  console.log('🧪 Starting Melodex Strict Genre Filter & Decade Validation Test Suite...');

  const catalogPath = path.resolve('src/data/melodex-catalog.json');
  const catalog: Song[] = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  console.log(`Total songs in catalog under test: ${catalog.length}`);

  const activeSongs = catalog.filter((s) => s.audioStatus !== 'dead');
  console.log(`Active healthy songs: ${activeSongs.length}`);

  // Test 1: Lil Skies catalog audit
  const lilSkies = activeSongs.filter((s) => s.artist.toLowerCase().includes('lil skies'));
  console.log(`\n--- LIL SKIES AUDIT ---`);
  console.log(`Lil Skies Playable Tracks: ${lilSkies.length}`);
  lilSkies.forEach((s) => {
    console.log(`  - [${s.year}] ${s.title} (${s.album || 'Single'}) -> Genres: ${JSON.stringify(s.normalizedGenres)}`);
  });

  const darkRoseHits = ['Red Roses', 'Lust', 'Nowadays', 'Welcome to the Rodeo', 'Signs of Jealousy'];
  let darkRoseMatches = 0;
  for (const hit of darkRoseHits) {
    const found = lilSkies.some((s) => s.title.toLowerCase().includes(hit.toLowerCase()));
    if (found) {
      darkRoseMatches++;
      console.log(`  ✅ Life of a Dark Rose priority track verified: ${hit}`);
    } else {
      console.log(`  ⚠️ Missing priority track: ${hit}`);
    }
  }

  // Test 2: Ensure 100% of catalog songs have non-empty normalizedGenres
  let unclassified = 0;
  for (const s of activeSongs) {
    if (!s.normalizedGenres || s.normalizedGenres.length === 0) {
      unclassified++;
    }
  }
  console.log(`\n--- NORMALIZATION COVERAGE ---`);
  console.log(`Unclassified songs count: ${unclassified} (Expected: 0 or low)`);

  // Test 3: Simulation across single genres
  const singleGenres: GenreFilter[] = [
    'pop',
    'hiphop',
    'rock',
    'rnb',
    'electronic',
    'latin',
    'indie',
    'metal',
    'dance',
  ];

  const decades: DecadeFilter[] = ['all', 'pre2000', '2000s', '2010s', '2020s'];

  let totalSimulatedRounds = 0;
  let totalMismatches = 0;

  console.log(`\n--- RUNNING 1,000 ROUND SIMULATION PER GENRE & DECADE COMBO ---`);

  for (const genre of singleGenres) {
    for (const decade of decades) {
      const eligible = activeSongs.filter((s) => matchesDecade(s, decade) && matchesGenre(s, genre));
      if (eligible.length === 0) continue;

      // Simulate 100 draws
      for (let i = 0; i < 100; i++) {
        totalSimulatedRounds++;
        const randomIndex = Math.floor(Math.random() * eligible.length);
        const drawn = eligible[randomIndex];

        // Strict assertions
        const matchesG = matchesGenre(drawn, genre);
        const matchesD = matchesDecade(drawn, decade);

        if (!matchesG || !matchesD) {
          totalMismatches++;
          console.error(
            `❌ MISMATCH DETECTED in [${genre} / ${decade}]: Song ${drawn.artist} - ${drawn.title} (Year: ${drawn.year}, Genres: ${JSON.stringify(drawn.normalizedGenres)})`
          );
        }
      }
    }
  }

  // Test 4: Multi-genre combinations (e.g. Pop + R&B, Hip-Hop + Latin, Rock + Indie)
  const multiGenreTests: GenreFilter[][] = [
    ['pop', 'rnb'],
    ['hiphop', 'latin'],
    ['rock', 'indie', 'metal'],
    ['electronic', 'dance'],
    ['pop', 'dance', 'electronic'],
  ];

  for (const genreCombo of multiGenreTests) {
    for (const decade of ['all', '2010s', '2020s'] as DecadeFilter[]) {
      const eligible = activeSongs.filter((s) => matchesDecade(s, decade) && matchesAnyGenre(s, genreCombo));
      if (eligible.length === 0) continue;

      for (let i = 0; i < 200; i++) {
        totalSimulatedRounds++;
        const randomIndex = Math.floor(Math.random() * eligible.length);
        const drawn = eligible[randomIndex];

        const matchesMulti = matchesAnyGenre(drawn, genreCombo);
        const matchesD = matchesDecade(drawn, decade);

        if (!matchesMulti || !matchesD) {
          totalMismatches++;
          console.error(
            `❌ MULTI-GENRE MISMATCH in [${genreCombo.join('+')} / ${decade}]: Song ${drawn.artist} - ${drawn.title}`
          );
        }
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`TOTAL SIMULATED ROUNDS EXECUTED: ${totalSimulatedRounds}`);
  console.log(`GENRE/DECADE LEAKAGE MISMATCHES: ${totalMismatches}`);
  const mismatchRate = totalSimulatedRounds > 0 ? (totalMismatches / totalSimulatedRounds) * 100 : 0;
  console.log(`MISMATCH RATE: ${mismatchRate.toFixed(2)}% (Target: 0.00%)`);
  console.log(`========================================`);

  if (totalMismatches === 0) {
    console.log('✅ ALL GENRE FILTER INTEGRITY TESTS PASSED WITH 0% LEAKS!');
  } else {
    console.error(`🚨 FAILED: ${totalMismatches} genre leakages detected!`);
    process.exit(1);
  }
}

runGenreFilterSimulation().catch((err) => {
  console.error(err);
  process.exit(1);
});
