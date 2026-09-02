import fs from 'fs';

const catalog = JSON.parse(fs.readFileSync('public/melodex-catalog.json', 'utf8'));

const urbanKeywords = [
  'bad bunny', 'daddy yankee', 'j balvin', 'karol g', 'rauw alejandro', 'don omar',
  'wisin', 'yandel', 'plan b', 'j alvarez', 'anuel aa', 'nicky jam', 'farruko',
  'arcángel', 'arcangel', 'de la ghetto', 'myke towers', 'lunay', 'sech', 'el alfa',
  'chencho corleone', 'zion & lennox', 'zion y lennox', 'natti natasha', 'manuel turizo',
  'maluma', 'feid', 'tainy', 'bizarrap', 'duki'
];

const found = catalog.filter((t: any) => {
  const a = (t.artist || '').toLowerCase();
  return urbanKeywords.some((kw) => a.includes(kw));
});

console.log('Total tracks by urban artists in entire catalog:', found.length);
const inLatin = found.filter((t: any) => (t.normalizedGenres || []).includes('latin'));
const notInLatin = found.filter((t: any) => !(t.normalizedGenres || []).includes('latin'));
console.log('In Latin:', inLatin.length);
console.log('Not in Latin:', notInLatin.length);

console.log('\nTracks NOT in Latin:');
notInLatin.forEach((t: any) => {
  console.log(`- [${t.id}] ${t.artist} - ${t.title} (${t.year}) [genre: ${t.genre}] [norm: ${JSON.stringify(t.normalizedGenres)}]`);
});
