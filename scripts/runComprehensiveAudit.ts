import fs from 'fs';
import path from 'path';
import { Song } from '../src/types/song';
import { matchesGenre, musicService, normalizeArtistKey } from '../src/services/musicService';

export function runComprehensiveAudit() {
  const filePath = path.resolve('src/data/melodex-catalog.json');
  const catalog: any[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  console.log('\n========================================');
  console.log('🎵 MELODEX COMPREHENSIVE CATALOG AUDIT');
  console.log('========================================');
  console.log(`Total songs in primary catalog: ${catalog.length}`);

  let valid = 0;
  let invalid = 0;
  const invalidReasons: string[] = [];

  for (const s of catalog) {
    if (musicService.isValidCatalogItem(s)) {
      valid++;
    } else {
      invalid++;
      invalidReasons.push(`${(s as any)?.artist || 'Unknown'} - ${(s as any)?.title || 'Unknown'}: missing required fields or confidence`);
    }
  }

  console.log(`✅ Valid Playable Songs: ${valid}`);
  console.log(`❌ Invalid Songs: ${invalid}`);
  if (invalid > 0) {
    console.error('Invalid samples:', invalidReasons.slice(0, 10));
  }

  // Genre Breakdown
  const genres = ['pop', 'hiphop', 'rock', 'rnb', 'electronic', 'latin', 'indie', 'metal', 'dance'] as const;
  console.log('\n--- GENRE BREAKDOWN ---');
  for (const g of genres) {
    const count = catalog.filter((s) => matchesGenre(s, g)).length;
    const pct = ((count / catalog.length) * 100).toFixed(1);
    console.log(`  ${g.toUpperCase().padEnd(12)}: ${count.toString().padStart(5)} tracks (${pct}%)`);
  }

  // Decade Breakdown
  const decades = ['pre2000', '2000s', '2010s', '2020s'] as const;
  console.log('\n--- DECADE BREAKDOWN ---');
  for (const d of decades) {
    const count = catalog.filter((s) => musicService.matchesDecade(s, d)).length;
    const pct = ((count / catalog.length) * 100).toFixed(1);
    console.log(`  ${d.padEnd(12)}: ${count.toString().padStart(5)} tracks (${pct}%)`);
  }

  // Focus Artists
  console.log('\n--- FOCUS ARTIST DEPTH ---');
  const postMalone = catalog.filter((s) => normalizeArtistKey(s.artist).includes('post malone'));
  console.log(`  Post Malone: ${postMalone.length} verified tracks`);
  const lilSkies = catalog.filter((s) => normalizeArtistKey(s.artist).includes('lil skies'));
  console.log(`  Lil Skies  : ${lilSkies.length} verified tracks`);

  // Synchronize all destinations
  const primaryJson = JSON.stringify(catalog, null, 2);
  fs.writeFileSync(path.resolve('src/data/melodexCatalog.json'), primaryJson, 'utf8');
  fs.writeFileSync(path.resolve('public/melodex-catalog.json'), primaryJson, 'utf8');
  fs.writeFileSync(path.resolve('public/data/melodex-catalog-v2.json'), primaryJson, 'utf8');

  console.log('\n✅ All catalog destinations synchronized successfully:');
  console.log('  - src/data/melodex-catalog.json');
  console.log('  - src/data/melodexCatalog.json');
  console.log('  - public/melodex-catalog.json');
  console.log('  - public/data/melodex-catalog-v2.json');
  console.log('========================================\n');
}

runComprehensiveAudit();
