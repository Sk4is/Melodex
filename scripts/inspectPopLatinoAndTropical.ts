import fs from 'fs';

const catalog = JSON.parse(fs.readFileSync('public/melodex-catalog.json', 'utf8'));
const popLatino = catalog.filter((t: any) => (t.genre || '') === 'Pop Latino');
const tropical = catalog.filter((t: any) => (t.genre || '') === 'Música tropical');

console.log('Pop Latino count:', popLatino.length);
popLatino.forEach((t: any, i: number) => {
  console.log(`PL ${i+1}. [${t.id}] ${t.artist} - ${t.title} (${t.year}) [norm: ${JSON.stringify(t.normalizedGenres)}]`);
});

console.log('\nMúsica tropical count:', tropical.length);
tropical.forEach((t: any, i: number) => {
  console.log(`TR ${i+1}. [${t.id}] ${t.artist} - ${t.title} (${t.year}) [norm: ${JSON.stringify(t.normalizedGenres)}]`);
});
