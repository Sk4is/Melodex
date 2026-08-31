import fs from 'fs';
import path from 'path';
import { SEED_ARTISTS } from './seedArtists';
import { Song } from '../src/types/song';
import { normalizeText } from '../src/utils/normalizeText';
import { isArtistMatch } from './auditCatalog';

const CATALOG_DATA_PATH = path.resolve(process.cwd(), 'src/data/melodex-catalog.json');
const CATALOG_PUBLIC_PATH = path.resolve(process.cwd(), 'public/melodex-catalog.json');

async function importSingleArtist(artistName: string) {
  const seed = SEED_ARTISTS.find(s => s.name.toLowerCase() === artistName.toLowerCase());
  if (!seed) {
    console.log(`Artist ${artistName} not found in SEED_ARTISTS`);
    return;
  }

  let catalog: Song[] = [];
  if (fs.existsSync(CATALOG_DATA_PATH)) {
    catalog = JSON.parse(fs.readFileSync(CATALOG_DATA_PATH, 'utf8'));
  }

  const existingSigs = new Set(catalog.map(s => `${normalizeText(s.artist)}:::${normalizeText(s.title)}`));
  const currentMatching = catalog.filter(s => isArtistMatch(s.artist, seed.name) || normalizeText(s.artist).includes(normalizeText(seed.name)));
  console.log(`=== ${seed.name} (Current: ${currentMatching.length}/${seed.targetCount}) ===`);

  // Fetch Deezer with retry
  let json: any = {};
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const searchUrl = `https://api.deezer.com/search?q=artist:${encodeURIComponent(`"${seed.name}"`)}&limit=50`;
      const res = await fetch(searchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (res.ok) {
        json = await res.json();
        if (json.data) break;
      }
    } catch {}
    await new Promise(r => setTimeout(r, 600));
  }
  console.log(`Deezer returned ${json.data?.length} tracks.`);

  let added = 0;
  for (const t of json.data || []) {
    if (!t.preview || !t.title || !t.artist?.name) continue;
    
    // Check if artist matches or featured
    const artistMatches = isArtistMatch(t.artist.name, seed.name) || normalizeText(t.artist.name).includes(normalizeText(seed.name)) || normalizeText(t.title).includes(normalizeText(seed.name));
    if (!artistMatches) {
      console.log(`  [Skip artist mismatch] "${t.title}" by "${t.artist.name}"`);
      continue;
    }

    const cleanTitle = t.title_short || t.title;
    const sig = `${normalizeText(t.artist.name)}:::${normalizeText(cleanTitle)}`;
    if (existingSigs.has(sig)) {
      console.log(`  [Skip duplicate] "${cleanTitle}" by "${t.artist.name}"`);
      continue;
    }

    // Get year
    let year = 2012;
    if (t.album?.id) {
      try {
        const aRes = await fetch(`https://api.deezer.com/album/${t.album.id}`);
        const aData = await aRes.json();
        if (aData.release_date) {
          const y = new Date(aData.release_date).getFullYear();
          if (!isNaN(y) && y > 1950) year = y;
        }
      } catch {}
    }

    const song: Song = {
      id: `dz_${t.id}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      title: cleanTitle,
      artist: t.artist.name,
      album: t.album?.title,
      year,
      verifiedOriginalYear: year,
      yearConfidence: 'high',
      genre: seed.primaryGenre || 'Pop',
      recognitionScore: t.rank ? Math.min(95, Math.max(65, Math.floor(t.rank / 10000))) : 85,
      artworkUrl: t.album?.cover_big || t.album?.cover_medium,
      previewUrl: t.preview,
    };

    catalog.push(song);
    existingSigs.add(sig);
    added++;
    console.log(`  + Added: "${song.title}" (${song.year}) by "${song.artist}"`);

    if (currentMatching.length + added >= seed.targetCount) {
      break;
    }
  }

  console.log(`Successfully added ${added} songs for ${seed.name}.`);
  fs.writeFileSync(CATALOG_DATA_PATH, JSON.stringify(catalog, null, 2));
  fs.writeFileSync(CATALOG_PUBLIC_PATH, JSON.stringify(catalog, null, 2));
}

async function run() {
  const priority = [
    'Pitbull',
    'Black Eyed Peas',
    'Imagine Dragons',
    'Shakira',
    'Avicii',
    'Calvin Harris',
    'Lady Gaga',
    'Maroon 5',
    'Ed Sheeran',
    'Sia',
  ];

  for (const p of priority) {
    await importSingleArtist(p);
  }
}

run();
