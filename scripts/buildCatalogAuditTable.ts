import fs from 'fs';

const catalog = JSON.parse(fs.readFileSync('public/melodex-catalog.json', 'utf8'));

// Find all tracks that have 'latin' in normalizedGenres or 'urbano' or 'latin' or 'reggaeton' in genre
const latinRelated = catalog.filter((t: any) => {
  const g = (t.genre || '').toLowerCase();
  const a = (t.artist || '').toLowerCase();
  const norm = (t.normalizedGenres || []).map((x: any) => String(x).toLowerCase());
  return norm.includes('latin') || g.includes('urbano') || g.includes('latin') || g.includes('reggaeton');
});

console.log('Latin related count:', latinRelated.length);

// Let's write all tracks to a JSON file so we can analyze them completely
fs.writeFileSync(
  '/tmp/all_latin_related.json',
  JSON.stringify(
    latinRelated.map((t: any) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      year: t.year,
      genre: t.genre,
      normalizedGenres: t.normalizedGenres,
    })),
    null,
    2
  )
);
console.log('Written to /tmp/all_latin_related.json');
