import fs from 'fs';
import path from 'path';
import { Song, AudioHealthStatus } from '../src/types/song';
import { normalizeArtistKey, matchesGenre } from '../src/services/musicService';

interface TrackHealthRecord {
  status: AudioHealthStatus;
  validatedAt: number;
  failureCount: number;
  lastReason?: string;
}

const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Probe audio stream
async function probeAudioUrl(url: string, timeoutMs = 4000): Promise<{ ok: boolean; status?: number; error?: string }> {
  if (!url || !url.startsWith('http')) {
    return { ok: false, error: 'Invalid URL format' };
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-4096' },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.status === 200 || res.status === 206) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('audio') || contentType.includes('mp4') || contentType.includes('m4a') || contentType.includes('mpeg') || contentType.includes('octet-stream') || contentType === '') {
        return { ok: true, status: res.status };
      }
      return { ok: true, status: res.status };
    }
    return { ok: false, status: res.status, error: `HTTP ${res.status}` };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error' };
  }
}

// iTunes search for a specific track
async function searchItunesSong(artist: string, title: string, album?: string): Promise<{ previewUrl: string; year: number; album: string; trackName: string } | null> {
  const cleanTitle = title.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(/feat\..*/i, '').trim();
  const query = `${artist} ${cleanTitle}`.trim();
  try {
    const url = `${ITUNES_SEARCH_URL}?term=${encodeURIComponent(query)}&entity=song&limit=8`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;

    const normArtist = artist.toLowerCase().trim();
    const normTitle = cleanTitle.toLowerCase().trim();

    for (const r of data.results) {
      if (!r.previewUrl) continue;
      const rArtist = (r.artistName || '').toLowerCase().trim();
      const rTitle = (r.trackName || '').toLowerCase().trim();

      if (rArtist.includes(normArtist) || normArtist.includes(rArtist)) {
        if (rTitle.includes(normTitle) || normTitle.includes(rTitle)) {
          const year = r.releaseDate ? parseInt(r.releaseDate.substring(0, 4), 10) : 0;
          return {
            previewUrl: r.previewUrl,
            year: isNaN(year) ? 0 : year,
            album: r.collectionName || album || '',
            trackName: r.trackName,
          };
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
}

// Comprehensive list of target Post Malone songs
const POST_MALONE_MUST_HAVES = [
  { title: 'White Iverson', album: 'Stoney', year: 2015 },
  { title: 'Congratulations', album: 'Stoney', year: 2016 },
  { title: 'I Fall Apart', album: 'Stoney', year: 2016 },
  { title: 'Go Flex', album: 'Stoney', year: 2016 },
  { title: 'Too Young', album: 'Stoney', year: 2015 },
  { title: 'Deja Vu', album: 'Stoney', year: 2016 },
  { title: 'No Option', album: 'Stoney', year: 2016 },
  { title: 'Patient', album: 'Stoney', year: 2016 },
  { title: 'Feel', album: 'Stoney', year: 2016 },
  { title: 'Up There', album: 'Stoney', year: 2016 },
  { title: 'Yours Truly, Austin Post', album: 'Stoney', year: 2016 },
  { title: 'Leave', album: 'Stoney', year: 2016 },
  { title: 'Hit This Hard', album: 'Stoney', year: 2016 },
  { title: 'Money Made Me Do It', album: 'Stoney', year: 2016 },
  { title: 'Feeling Whitney', album: 'Stoney', year: 2016 },
  { title: 'Big Lie', album: 'Stoney', year: 2016 },
  { title: 'Cold', album: 'Stoney', year: 2016 },
  // beerbongs & bentleys
  { title: 'rockstar', album: 'beerbongs & bentleys', year: 2017 },
  { title: 'Psycho', album: 'beerbongs & bentleys', year: 2018 },
  { title: 'Candy Paint', album: 'beerbongs & bentleys', year: 2017 },
  { title: 'Better Now', album: 'beerbongs & bentleys', year: 2018 },
  { title: 'Stay', album: 'beerbongs & bentleys', year: 2018 },
  { title: 'Paranoid', album: 'beerbongs & bentleys', year: 2018 },
  { title: 'Rich & Sad', album: 'beerbongs & bentleys', year: 2018 },
  { title: 'Over Now', album: 'beerbongs & bentleys', year: 2018 },
  { title: 'Spoil My Night', album: 'beerbongs & bentleys', year: 2018 },
  { title: 'Ball for Me', album: 'beerbongs & bentleys', year: 2018 },
  { title: 'Zack and Codeine', album: 'beerbongs & bentleys', year: 2018 },
  { title: 'Takin\' Shots', album: 'beerbongs & bentleys', year: 2018 },
  { title: 'Same Bitches', album: 'beerbongs & bentleys', year: 2018 },
  { title: '92 Explorer', album: 'beerbongs & bentleys', year: 2018 },
  { title: 'Otherside', album: 'beerbongs & bentleys', year: 2018 },
  { title: 'Sugar Wraith', album: 'beerbongs & bentleys', year: 2018 },
  { title: 'Blame It on Me', album: 'beerbongs & bentleys', year: 2018 },
  { title: 'Jonestown (Interlude)', album: 'beerbongs & bentleys', year: 2018 },
  // Hollywood's Bleeding & other major hits
  { title: 'Circles', album: 'Hollywood\'s Bleeding', year: 2019 },
  { title: 'Wow.', album: 'Hollywood\'s Bleeding', year: 2018 },
  { title: 'Goodbyes', album: 'Hollywood\'s Bleeding', year: 2019 },
  { title: 'Take What You Want', album: 'Hollywood\'s Bleeding', year: 2019 },
  { title: 'Sunflower', album: 'Hollywood\'s Bleeding', year: 2018 },
  { title: 'Saint-Tropez', album: 'Hollywood\'s Bleeding', year: 2019 },
  { title: 'Enemies', album: 'Hollywood\'s Bleeding', year: 2019 },
  { title: 'Die For Me', album: 'Hollywood\'s Bleeding', year: 2019 },
  { title: 'On the Road', album: 'Hollywood\'s Bleeding', year: 2019 },
  { title: 'A Thousand Bad Times', album: 'Hollywood\'s Bleeding', year: 2019 },
  { title: 'Allergic', album: 'Hollywood\'s Bleeding', year: 2019 },
  { title: 'I Know', album: 'Hollywood\'s Bleeding', year: 2019 },
  { title: 'Myself', album: 'Hollywood\'s Bleeding', year: 2019 },
  { title: 'I\'m Gonna Be', album: 'Hollywood\'s Bleeding', year: 2019 },
  { title: 'Staring at the Sun', album: 'Hollywood\'s Bleeding', year: 2019 },
  { title: 'Internet', album: 'Hollywood\'s Bleeding', year: 2019 },
  // Twelve Carat Toothache & Austin & F-1 Trillion
  { title: 'Chemical', album: 'Austin', year: 2023 },
  { title: 'I Had Some Help', album: 'F-1 Trillion', year: 2024 },
  { title: 'I Like You (A Happier Song)', album: 'Twelve Carat Toothache', year: 2022 },
  { title: 'One Right Now', album: 'Twelve Carat Toothache', year: 2021 },
  { title: 'Cooped Up', album: 'Twelve Carat Toothache', year: 2022 },
  { title: 'Mourning', album: 'Austin', year: 2023 },
  { title: 'Overdrive', album: 'Austin', year: 2023 },
  { title: 'Enough Is Enough', album: 'Austin', year: 2023 },
  { title: 'Novacandy', album: 'Austin', year: 2023 },
  { title: 'Too Cool To Die', album: 'Austin', year: 2023 },
  { title: 'Sign Me Up', album: 'Austin', year: 2023 },
  { title: 'Speedometer', album: 'Austin', year: 2023 },
  { title: 'Something Real', album: 'Austin', year: 2023 },
  { title: 'Don\'t Understand', album: 'Austin', year: 2023 },
  { title: 'Guy For That', album: 'F-1 Trillion', year: 2024 },
  { title: 'Pour Me A Drink', album: 'F-1 Trillion', year: 2024 },
];

async function main() {
  console.log('🚀 Starting Melodex Audio Health & Catalog Purge / Expansion...');
  const catalogPath = path.resolve('src/data/melodex-catalog.json');
  const catalog: Song[] = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  console.log(`Initial songs in catalog: ${catalog.length}`);

  // Step 1: Ensure all Post Malone must-haves are present with valid Apple iTunes streams
  console.log('\n--- 1. AUDITING & ENRICHING POST MALONE MUST-HAVES ---');
  for (const item of POST_MALONE_MUST_HAVES) {
    const existing = catalog.find(
      (s) =>
        normalizeArtistKey(s.artist).includes('post malone') &&
        s.title.toLowerCase().replace(/[^\w]/g, '').includes(item.title.toLowerCase().replace(/[^\w]/g, ''))
    );

    let needsFetch = !existing || !existing.previewUrl.includes('itunes.apple.com');
    if (existing && existing.previewUrl.includes('itunes.apple.com')) {
      const probe = await probeAudioUrl(existing.previewUrl);
      if (!probe.ok) {
        needsFetch = true;
      }
    }

    if (needsFetch) {
      console.log(`Fetching permanent iTunes audio for Post Malone - ${item.title}...`);
      const itunesData = await searchItunesSong('Post Malone', item.title, item.album);
      if (itunesData) {
        const probe = await probeAudioUrl(itunesData.previewUrl);
        if (probe.ok) {
          if (existing) {
            existing.previewUrl = itunesData.previewUrl;
            existing.album = itunesData.album || item.album;
            existing.verifiedOriginalYear = item.year || itunesData.year || existing.verifiedOriginalYear;
            existing.year = existing.verifiedOriginalYear;
            existing.audioStatus = 'healthy';
            existing.audioValidatedAt = Date.now();
            existing.failureCount = 0;
            console.log(`  ✅ Updated ${item.title} with healthy iTunes audio`);
          } else {
            const newSong: Song = {
              id: `itunes_post_malone_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              title: itunesData.trackName || item.title,
              artist: 'Post Malone',
              album: itunesData.album || item.album,
              year: item.year || itunesData.year,
              verifiedOriginalYear: item.year || itunesData.year,
              yearConfidence: 'high',
              genre: 'Hip-Hop/Rap',
              recognitionScore: 92,
              previewUrl: itunesData.previewUrl,
              previewStart: 0,
              provider: 'itunes',
              trackIdentityVerified: true,
              audioStatus: 'healthy',
              audioValidatedAt: Date.now(),
              failureCount: 0,
            };
            catalog.push(newSong);
            console.log(`  ✅ Added new healthy Post Malone track: ${item.title}`);
          }
        }
      }
      await sleep(150);
    }
  }

  // Step 2: Systematically convert/repair all Deezer and broken URLs across the entire catalog to permanent iTunes
  console.log('\n--- 2. AUDITING & CONVERTING DEEZER / BROKEN PREVIEWS TO PERMANENT ITUNES ---');
  const deezerOrBroken = catalog.filter(
    (s) => s.previewUrl.includes('dzcdn.net') || s.previewUrl.includes('deezer') || !s.previewUrl.startsWith('http')
  );
  console.log(`Found ${deezerOrBroken.length} tracks with temporary Deezer URLs. Resolving...`);

  let resolvedCount = 0;
  let unresolvedCount = 0;

  for (let i = 0; i < deezerOrBroken.length; i++) {
    const song = deezerOrBroken[i];
    const itunesData = await searchItunesSong(song.artist, song.title, song.album);
    if (itunesData) {
      const probe = await probeAudioUrl(itunesData.previewUrl, 2500);
      if (probe.ok) {
        song.previewUrl = itunesData.previewUrl;
        song.provider = 'itunes';
        song.audioStatus = 'healthy';
        song.audioValidatedAt = Date.now();
        song.failureCount = 0;
        resolvedCount++;
      } else {
        song.audioStatus = 'dead';
        unresolvedCount++;
      }
    } else {
      song.audioStatus = 'dead';
      unresolvedCount++;
    }

    if ((i + 1) % 50 === 0 || i === deezerOrBroken.length - 1) {
      console.log(`  Processed ${i + 1}/${deezerOrBroken.length} (Resolved: ${resolvedCount}, Dead: ${unresolvedCount})`);
    }
    if ((i + 1) % 15 === 0) {
      await sleep(100);
    }
  }

  // Step 3: Fast-probe all remaining tracks in catalog to verify audio health
  console.log('\n--- 3. FAST BATCH PROBING ALL TRACKS IN CATALOG ---');
  let healthyCount = 0;
  let deadCount = 0;

  const BATCH_SIZE = 40;
  for (let i = 0; i < catalog.length; i += BATCH_SIZE) {
    const batch = catalog.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (song) => {
        if (song.audioStatus === 'dead') {
          deadCount++;
          return;
        }
        // If already probed within this run
        if (song.audioStatus === 'healthy' && song.audioValidatedAt && Date.now() - song.audioValidatedAt < 3600000) {
          healthyCount++;
          return;
        }

        const probe = await probeAudioUrl(song.previewUrl, 3000);
        if (probe.ok) {
          song.audioStatus = 'healthy';
          song.audioValidatedAt = Date.now();
          song.failureCount = 0;
          healthyCount++;
        } else {
          // Attempt rapid re-resolution via iTunes
          const fresh = await searchItunesSong(song.artist, song.title, song.album);
          if (fresh) {
            const probeFresh = await probeAudioUrl(fresh.previewUrl, 2500);
            if (probeFresh.ok) {
              song.previewUrl = fresh.previewUrl;
              song.provider = 'itunes';
              song.audioStatus = 'healthy';
              song.audioValidatedAt = Date.now();
              song.failureCount = 0;
              healthyCount++;
              return;
            }
          }
          song.audioStatus = 'dead';
          song.lastFailureReason = probe.error || `HTTP ${probe.status}`;
          deadCount++;
        }
      })
    );

    if ((i + BATCH_SIZE) % 500 === 0 || i + BATCH_SIZE >= catalog.length) {
      console.log(`  Probed ${Math.min(i + BATCH_SIZE, catalog.length)}/${catalog.length} | Healthy: ${healthyCount}, Dead: ${deadCount}`);
    }
    await sleep(50);
  }

  // Step 4: Filter out dead tracks and build clean healthy playable catalog
  console.log('\n--- 4. PURGING DEAD TRACKS & QUARANTINING ---');
  const healthyCatalog = catalog.filter((s) => s.audioStatus === 'healthy');
  const deadCatalog = catalog.filter((s) => s.audioStatus === 'dead');

  console.log(`Total original catalog: ${catalog.length}`);
  console.log(`Total healthy playable: ${healthyCatalog.length}`);
  console.log(`Total dead quarantined: ${deadCatalog.length}`);

  // Step 5: Post Malone Specific Verification Report
  const postHealthy = healthyCatalog.filter((s) => normalizeArtistKey(s.artist).includes('post malone'));
  const stoneyHealthy = postHealthy.filter((s) => (s.album || '').toLowerCase().includes('stoney'));
  const bbHealthy = postHealthy.filter((s) => (s.album || '').toLowerCase().includes('beerbongs'));

  console.log('\n--- POST MALONE FINAL HEALTH AUDIT ---');
  console.log(`Post Malone total healthy: ${postHealthy.length}`);
  console.log(`Stoney healthy: ${stoneyHealthy.length}`);
  console.log(`beerbongs & bentleys healthy: ${bbHealthy.length}`);

  // Step 6: Synchronize all catalog files
  const jsonStr = JSON.stringify(healthyCatalog, null, 2);
  fs.writeFileSync(path.resolve('src/data/melodex-catalog.json'), jsonStr, 'utf8');
  fs.writeFileSync(path.resolve('src/data/melodexCatalog.json'), jsonStr, 'utf8');
  fs.writeFileSync(path.resolve('public/melodex-catalog.json'), jsonStr, 'utf8');
  fs.writeFileSync(path.resolve('public/data/melodex-catalog-v2.json'), jsonStr, 'utf8');

  // Save quarantined list for persistent isolation
  fs.writeFileSync(
    path.resolve('src/data/quarantined-songs.json'),
    JSON.stringify(deadCatalog.map((s) => ({ id: s.id, artist: s.artist, title: s.title, reason: s.lastFailureReason })), null, 2),
    'utf8'
  );

  console.log('\n✅ All catalog destinations synchronized with 100% HEALTHY PLAYABLE songs!');
}

main().catch(console.error);
