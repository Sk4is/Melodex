import fs from 'fs';
import path from 'path';
import { Song } from '../src/types/song';
import { KNOWN_ORIGINAL_YEARS } from './knownSongYears';

function norm(s: string) {
  return (s || '').toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/feat\..*$/g, '')
    .replace(/ft\..*$/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export async function fetchAndVerifyArtist(artistName: string, maxTracks = 18): Promise<Song[]> {
  const query = encodeURIComponent(artistName);
  const url = `https://itunes.apple.com/search?term=${query}&entity=song&limit=80`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const rawResults: any[] = data.results || [];

  const seenTitles = new Set<string>();
  const verified: Song[] = [];

  const nTargetArtist = norm(artistName);

  for (const r of rawResults) {
    if (!r.trackId || !r.trackName || !r.artistName || !r.previewUrl) continue;

    // Strict artist identity check:
    // Either provider artist contains target, or target contains provider artist,
    // or primary artist before 'feat', '&', ',' matches target.
    const nRArtist = norm(r.artistName);
    const nRPrimary = norm(r.artistName.split(/[,&x+]|\sfeat\.\s|\sft\.\s|\swith\s/i)[0]);

    const artistMatches = 
      nRArtist === nTargetArtist ||
      nRPrimary === nTargetArtist ||
      nRArtist.includes(nTargetArtist) ||
      nTargetArtist.includes(nRArtist);

    if (!artistMatches) continue;

    // Filter out karaoke, tribute, parody, commentary, instrumental remake
    const lTitle = r.trackName.toLowerCase();
    const lArtist = r.artistName.toLowerCase();
    if (
      lTitle.includes('karaoke') || lTitle.includes('tribute') || lTitle.includes('parody') ||
      lTitle.includes('instrumental version') || lTitle.includes('originally performed') ||
      lArtist.includes('karaoke') || lArtist.includes('tribute')
    ) {
      continue;
    }

    // Title deduplication
    const nTitle = norm(r.trackName);
    if (nTitle.length < 2 || seenTitles.has(nTitle)) continue;

    // Verify release year
    let year: number | undefined = undefined;
    const cleanTitle = r.trackName.replace(/\(.*?\)/g, '').trim();
    if (KNOWN_ORIGINAL_YEARS[cleanTitle]) {
      year = KNOWN_ORIGINAL_YEARS[cleanTitle];
    } else if (r.releaseDate) {
      year = parseInt(r.releaseDate.slice(0, 4), 10);
    }

    if (!year || isNaN(year) || year < 1950 || year > 2026) continue;

    // Audio test (HEAD check)
    try {
      const aRes = await fetch(r.previewUrl, { method: 'HEAD' });
      if (aRes.status !== 200) continue;
    } catch {
      continue;
    }

    seenTitles.add(nTitle);

    // Build canonical song from single provider object
    const song: Song = {
      id: `itunes-${r.trackId}`,
      title: r.trackName,
      artist: r.artistName,
      normalizedArtist: artistName.toLowerCase(),
      album: r.collectionName || 'Single',
      year: year,
      verifiedOriginalYear: year,
      yearConfidence: 'high',
      genre: r.primaryGenreName || 'Hip-Hop/Rap',
      recognitionScore: Math.min(95, Math.max(65, 90 - verified.length * 2)),
      artworkUrl: r.artworkUrl100 ? r.artworkUrl100.replace('100x100bb', '600x600bb') : undefined,
      previewUrl: r.previewUrl,
      previewStart: 0,
      provider: 'itunes',
      trackIdentityVerified: true,
      providerTrackId: String(r.trackId)
    };

    verified.push(song);
    if (verified.length >= maxTracks) break;
  }

  return verified;
}

async function main() {
  const artists = [
    'Lil Skies', 'Lil Mosey', 'Lil Peep', 'Trippie Redd', 'Lil Pump',
    'Famous Dex', 'Fetty Wap', 'Lil Uzi Vert', 'Juice WRLD', 'XXXTentacion',
    'YoungBoy Never Broke Again', 'Post Malone', 'Drake', 'J. Cole',
    'Kanye West', 'Chief Keef', 'A Boogie wit da Hoodie'
  ];

  console.log('Testing canonical expansion for 17 artists...');
  for (const a of artists) {
    const start = Date.now();
    const tracks = await fetchAndVerifyArtist(a, 16);
    const duration = Date.now() - start;
    console.log(`${a.padEnd(28)} -> ${tracks.length} tracks (${duration}ms)`);
    if (tracks.length > 0) {
      console.log(`   Sample: "${tracks[0].title}" (${tracks[0].year})`);
    }
  }
}

if (process.argv[1] && process.argv[1].includes('test17Artists')) {
  main();
}
