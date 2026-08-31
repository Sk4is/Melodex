import { Song } from '../src/types/song';
import { KNOWN_ORIGINAL_YEARS } from './knownSongYears';
import { normalizeText } from '../src/utils/normalizeText';
import { isArtistMatch } from './auditCatalog';

interface RawCandidate {
  source: 'itunes' | 'deezer';
  id: string;
  title: string;
  artist: string;
  album?: string;
  releaseDate?: string;
  year?: number;
  genre?: string;
  previewUrl: string;
  artworkUrl?: string;
  rank?: number;
}

export async function fetchDeezerCandidates(artistName: string, limit = 50): Promise<RawCandidate[]> {
  const candidates: RawCandidate[] = [];
  try {
    const searchUrl = `https://api.deezer.com/search?q=artist:${encodeURIComponent(`"${artistName}"`)}&limit=${limit}`;
    const res = await fetch(searchUrl);
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        for (const t of json.data) {
          if (!t.preview || !t.title || !t.artist?.name) continue;
          candidates.push({
            source: 'deezer',
            id: `dz_${t.id}`,
            title: t.title_short || t.title,
            artist: t.artist.name,
            album: t.album?.title,
            artworkUrl: t.album?.cover_big || t.album?.cover_medium,
            previewUrl: t.preview,
            rank: t.rank || 50,
          });
        }
      }
    }
  } catch (err) {
    console.error(`Deezer fetch error for ${artistName}:`, err);
  }
  return candidates;
}

export async function fetchItunesCandidates(artistName: string, searchQuery?: string, limit = 50): Promise<RawCandidate[]> {
  const candidates: RawCandidate[] = [];
  const term = searchQuery || artistName;
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=${limit}&media=music`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
        'Accept': 'application/json',
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        for (const t of data.results) {
          if (!t.previewUrl || !t.trackName || !t.artistName) continue;
          let year: number | undefined;
          if (t.releaseDate) {
            const parsed = new Date(t.releaseDate).getFullYear();
            if (!isNaN(parsed) && parsed > 1900) year = parsed;
          }
          candidates.push({
            source: 'itunes',
            id: `it_${t.trackId}`,
            title: t.trackName,
            artist: t.artistName,
            album: t.collectionName,
            releaseDate: t.releaseDate,
            year,
            genre: t.primaryGenreName,
            artworkUrl: t.artworkUrl100?.replace('100x100bb', '600x600bb'),
            previewUrl: t.previewUrl,
          });
        }
      }
    }
  } catch {
    // Ignore, fallback to other providers
  }
  return candidates;
}

async function test() {
  console.log('=== Fetching Pitbull Candidates from Deezer ===');
  const deezerTracks = await fetchDeezerCandidates('Pitbull', 25);
  console.log(`Found ${deezerTracks.length} tracks for Pitbull:`);
  for (const t of deezerTracks.slice(0, 10)) {
    console.log(` - [${t.source}] ${t.artist} — ${t.title} (preview: ${t.previewUrl.slice(0, 40)}...)`);
  }
}

test();
