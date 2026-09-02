import fs from 'fs';

const catalog = JSON.parse(fs.readFileSync('public/melodex-catalog.json', 'utf8'));
const urbano = catalog.filter((t: any) => (t.genre || '').toLowerCase().includes('urbano'));
console.log('Total Urbano tracks:', urbano.length);
urbano.forEach((t: any, i: number) => {
  console.log(
    (i + 1) + '. [' + t.id + '] ' + t.artist + ' - ' + t.title + ' (' + t.year + ') [current: ' + JSON.stringify(t.normalizedGenres) + ']'
  );
});
