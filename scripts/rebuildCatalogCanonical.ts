import fs from 'fs';
import path from 'path';
import { Song } from '../src/types/song';
import { fetchCanonicalTracksForArtist } from './canonicalFetcher';

function norm(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/feat\..*$/g, '')
    .replace(/ft\..*$/g, '')
    .replace(/[^a-z0-9]/g, '');
}

async function main() {
  console.log('=== Step 1: Loading 3,429 Pre-Verified iTunes Tracks ===');
  const baseVerified = JSON.parse(
    fs.readFileSync('scripts/audit_verified_itunes.json', 'utf8')
  ) as Song[];

  console.log(`Loaded ${baseVerified.length} base verified iTunes tracks.`);

  // Mark all verified tracks explicitly
  const catalogMap = new Map<string, Song>();
  const songSignatures = new Set<string>();

  for (const s of baseVerified) {
    s.trackIdentityVerified = true;
    s.provider = 'itunes';
    catalogMap.set(s.id, s);
    const sig = `${norm(s.artist)}:::${norm(s.title)}`;
    songSignatures.add(sig);
  }

  // Count current tracks per artist
  const artistCounts = new Map<string, number>();
  for (const s of catalogMap.values()) {
    const k = norm(s.artist);
    artistCounts.set(k, (artistCounts.get(k) || 0) + 1);
  }

  // List of high-priority artists to verify/expand across all genres and decades
  const priorityArtists: { name: string; target: number; genre: string }[] = [
    // 2010s Hip-Hop Priority
    { name: 'Lil Skies', target: 15, genre: 'Hip-Hop/Rap' },
    { name: 'Lil Mosey', target: 15, genre: 'Hip-Hop/Rap' },
    { name: 'Lil Peep', target: 15, genre: 'Hip-Hop/Rap' },
    { name: 'Trippie Redd', target: 15, genre: 'Hip-Hop/Rap' },
    { name: 'Lil Pump', target: 12, genre: 'Hip-Hop/Rap' },
    { name: 'Famous Dex', target: 12, genre: 'Hip-Hop/Rap' },
    { name: 'Fetty Wap', target: 15, genre: 'Hip-Hop/Rap' },
    { name: 'YoungBoy Never Broke Again', target: 16, genre: 'Hip-Hop/Rap' },
    { name: 'Chief Keef', target: 15, genre: 'Hip-Hop/Rap' },
    { name: 'A Boogie wit da Hoodie', target: 15, genre: 'Hip-Hop/Rap' },
    { name: 'Ski Mask the Slump God', target: 12, genre: 'Hip-Hop/Rap' },
    { name: 'YNW Melly', target: 12, genre: 'Hip-Hop/Rap' },
    { name: 'Playboi Carti', target: 16, genre: 'Hip-Hop/Rap' },
    { name: '$uicideboy$', target: 14, genre: 'Hip-Hop/Rap' },
    { name: '6ix9ine', target: 10, genre: 'Hip-Hop/Rap' },
    { name: 'Lil Tecca', target: 14, genre: 'Hip-Hop/Rap' },
    { name: 'Gunna', target: 16, genre: 'Hip-Hop/Rap' },
    { name: 'Baby Keem', target: 12, genre: 'Hip-Hop/Rap' },
    { name: 'Polo G', target: 15, genre: 'Hip-Hop/Rap' },
    { name: 'Roddy Ricch', target: 14, genre: 'Hip-Hop/Rap' },
    { name: 'Kendrick Lamar', target: 20, genre: 'Hip-Hop/Rap' },
    { name: 'Tyler, The Creator', target: 16, genre: 'Hip-Hop/Rap' },
    { name: 'Outkast', target: 16, genre: 'Hip-Hop/Rap' },

    // Pop Priority
    { name: 'Shakira', target: 18, genre: 'Pop' },
    { name: 'Dua Lipa', target: 16, genre: 'Pop' },
    { name: 'Billie Eilish', target: 16, genre: 'Pop' },
    { name: 'Olivia Rodrigo', target: 14, genre: 'Pop' },
    { name: 'Justin Bieber', target: 20, genre: 'Pop' },
    { name: 'Ariana Grande', target: 20, genre: 'Pop' },
    { name: 'Bruno Mars', target: 18, genre: 'Pop' },
    { name: 'Rihanna', target: 20, genre: 'Pop' },
    { name: 'Lady Gaga', target: 18, genre: 'Pop' },
    { name: 'Katy Perry', target: 18, genre: 'Pop' },

    // Electronic / Dance Priority
    { name: 'Deadmau5', target: 15, genre: 'Dance' },
    { name: 'Kygo', target: 16, genre: 'Dance' },
    { name: 'Martin Garrix', target: 16, genre: 'Dance' },
    { name: 'Zedd', target: 15, genre: 'Dance' },
    { name: 'Major Lazer', target: 15, genre: 'Dance' },
    { name: 'DJ Snake', target: 15, genre: 'Dance' },
    { name: 'Calvin Harris', target: 20, genre: 'Dance' },
    { name: 'David Guetta', target: 20, genre: 'Dance' },
    { name: 'Avicii', target: 20, genre: 'Dance' },
    { name: 'The Chainsmokers', target: 16, genre: 'Dance' },
    { name: 'Marshmello', target: 16, genre: 'Dance' },

    // Latin Priority
    { name: 'Daddy Yankee', target: 18, genre: 'Latin' },
    { name: 'Karol G', target: 18, genre: 'Latin' },
    { name: 'Rosalía', target: 16, genre: 'Latin' },
    { name: 'Bad Bunny', target: 22, genre: 'Latin' },
    { name: 'J Balvin', target: 20, genre: 'Latin' },
    { name: 'Ozuna', target: 18, genre: 'Latin' },
    { name: 'Maluma', target: 18, genre: 'Latin' },
    { name: 'Rauw Alejandro', target: 16, genre: 'Latin' },
    { name: 'Luis Fonsi', target: 15, genre: 'Latin' },
    { name: 'Romeo Santos', target: 16, genre: 'Latin' },
    { name: 'Natanael Cano', target: 15, genre: 'Latin' },

    // R&B / Soul Priority
    { name: 'Marvin Gaye', target: 16, genre: 'R&B/Soul' },
    { name: 'Alicia Keys', target: 18, genre: 'R&B/Soul' },
    { name: 'James Brown', target: 16, genre: 'R&B/Soul' },
    { name: 'John Legend', target: 16, genre: 'R&B/Soul' },
    { name: 'Toni Braxton', target: 15, genre: 'R&B/Soul' },
    { name: 'Aaliyah', target: 15, genre: 'R&B/Soul' },
    { name: 'SZA', target: 16, genre: 'R&B/Soul' },
    { name: 'The Weeknd', target: 22, genre: 'R&B/Soul' },
    { name: 'Frank Ocean', target: 14, genre: 'R&B/Soul' },
    { name: 'Bryson Tiller', target: 14, genre: 'R&B/Soul' },
    { name: 'Khalid', target: 16, genre: 'R&B/Soul' },

    // Rock / Indie Priority
    { name: 'Bee Gees', target: 18, genre: 'Rock' },
    { name: 'Arctic Monkeys', target: 16, genre: 'Alternative' },
    { name: 'Coldplay', target: 20, genre: 'Rock' },
    { name: 'Imagine Dragons', target: 18, genre: 'Alternative' },
    { name: 'Tame Impala', target: 14, genre: 'Alternative' },
    { name: 'The 1975', target: 14, genre: 'Alternative' },
    { name: 'The Neighbourhood', target: 12, genre: 'Alternative' },
    { name: 'Nirvana', target: 16, genre: 'Rock' },
    { name: 'Queen', target: 20, genre: 'Rock' },
    { name: 'Linkin Park', target: 18, genre: 'Rock' },
    { name: 'Red Hot Chili Peppers', target: 18, genre: 'Rock' },
    { name: 'Green Day', target: 18, genre: 'Rock' },

    // Country Priority
    { name: 'Zach Bryan', target: 16, genre: 'Country' },
    { name: 'Luke Combs', target: 16, genre: 'Country' },
    { name: 'Shania Twain', target: 16, genre: 'Country' },
    { name: 'Morgan Wallen', target: 18, genre: 'Country' },
    { name: 'Carrie Underwood', target: 16, genre: 'Country' }
  ];

  console.log(`\n=== Step 2: Expanding ${priorityArtists.length} priority artists ===`);
  let addedTotal = 0;

  for (let idx = 0; idx < priorityArtists.length; idx++) {
    const item = priorityArtists[idx];
    const currentCount = artistCounts.get(norm(item.name)) || 0;
    const needed = Math.max(0, item.target - currentCount);

    if (needed <= 0) {
      console.log(`[${idx + 1}/${priorityArtists.length}] ${item.name}: already has ${currentCount} tracks (OK)`);
      continue;
    }

    process.stdout.write(`[${idx + 1}/${priorityArtists.length}] Fetching ${needed} tracks for ${item.name}... `);
    try {
      const fetched = await fetchCanonicalTracksForArtist(item.name, item.target + 5, item.genre);
      let artistAdded = 0;

      for (const track of fetched) {
        const sig = `${norm(track.artist)}:::${norm(track.title)}`;
        if (catalogMap.has(track.id) || songSignatures.has(sig)) continue;

        catalogMap.set(track.id, track);
        songSignatures.add(sig);
        artistAdded++;
        addedTotal++;

        if (currentCount + artistAdded >= item.target) break;
      }

      artistCounts.set(norm(item.name), currentCount + artistAdded);
      console.log(`added ${artistAdded} (now has ${currentCount + artistAdded})`);
    } catch (err: any) {
      console.log(`FAILED: ${err.message}`);
    }
  }

  console.log(`\n=== Step 3: Catalog Finalization ===`);
  const finalCatalog = Array.from(catalogMap.values());
  console.log(`Total canonical catalog size: ${finalCatalog.length} songs.`);

  // Write to catalog locations
  const catalogJson = JSON.stringify(finalCatalog, null, 2);
  fs.writeFileSync('src/data/melodexCatalog.json', catalogJson);
  fs.writeFileSync('src/data/melodex-catalog.json', catalogJson);
  fs.writeFileSync('public/melodex-catalog.json', catalogJson);

  console.log('Successfully written to:');
  console.log('  - src/data/melodexCatalog.json');
  console.log('  - src/data/melodex-catalog.json');
  console.log('  - public/melodex-catalog.json');
}

main().catch(console.error);
