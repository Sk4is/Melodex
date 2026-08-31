import { auditCatalog } from './auditCatalog';

const targetArtists = [
  'Pitbull',
  'Sia',
  'Lady Gaga',
  'Ed Sheeran',
  'Maroon 5',
  'Imagine Dragons',
  'Black Eyed Peas',
  'Shakira',
  'Avicii',
  'Calvin Harris',
];

const audit = auditCatalog();
console.log('=== INITIAL STATUS OF KEY SEED ARTISTS ===');
for (const name of targetArtists) {
  const item = audit.auditResults.find(a => a.artist.toLowerCase() === name.toLowerCase());
  if (item) {
    console.log(`- ${item.artist.padEnd(20)}: ${item.verifiedPlayable} / ${item.targetCount} (Tier ${item.tier}) [Status: ${item.importStatus}, Autocomplete: ${item.autocompleteTracks}]`);
    if (item.sampleTracks && item.sampleTracks.length > 0) {
      console.log(`    Sample: ${item.sampleTracks.join(', ')}`);
    }
  } else {
    console.log(`- ${name.padEnd(20)}: NOT FOUND IN SEED_ARTISTS`);
  }
}
