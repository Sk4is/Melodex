const fs = require('fs');
const catalog = JSON.parse(fs.readFileSync('public/melodex-catalog.json', 'utf8'));
const urbano = catalog.filter((t) => (t.genre || '').toLowerCase().includes('urbano'));
console.log('Total Urbano tracks:', urbano.length);
urbano.forEach((t, i) => {
  console.log(
    (i + 1) + '. [' + t.id + '] ' + t.artist + ' - ' + t.title + ' (' + t.year + ') [current: ' + JSON.stringify(t.normalizedGenres) + ']'
  );
});
