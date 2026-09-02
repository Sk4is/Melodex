import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { Song, AudioHealthStatus } from '../src/types/song';

const BATCH_SIZE = 40;
const CONCURRENCY = 4;
const REQUEST_TIMEOUT_MS = 6000;

const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 8,
  timeout: REQUEST_TIMEOUT_MS,
});

const CURATED_ARTISTS = [
  'post malone',
  'lil skies',
  'lil peep',
  'juice wrld',
  'lil uzi vert',
  'lil mosey',
  'lil tecca',
  'yung pinch',
  'famous dex',
  'fetty wap',
  'ynw melly',
  'trippie redd',
  'xxxtentacion',
  'drake',
  'travis scott',
  'rihanna',
  'the weeknd',
  'kendrick lamar',
];

interface AuditStats {
  total: number;
  healthy: number;
  unknown: number;
  temporaryFailure: number;
  dead: number;
  repaired: number;
  perm404: number;
  perm410: number;
  permDecodeCorrupt: number;
  permOther: number;
  tempNetwork: number;
  temp429: number;
  temp5xx: number;
  tempTimeout: number;
  removedFromPlayable: number;
}

const stats: AuditStats = {
  total: 0,
  healthy: 0,
  unknown: 0,
  temporaryFailure: 0,
  dead: 0,
  repaired: 0,
  perm404: 0,
  perm410: 0,
  permDecodeCorrupt: 0,
  permOther: 0,
  tempNetwork: 0,
  temp429: 0,
  temp5xx: 0,
  tempTimeout: 0,
  removedFromPlayable: 0,
};

function normalizeStr(s: string): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isCuratedArtist(artist: string): boolean {
  const norm = (artist || '').toLowerCase();
  return CURATED_ARTISTS.some((a) => norm.includes(a));
}

interface HttpCheckResult {
  ok: boolean;
  statusCode?: number;
  isPermanent?: boolean;
  isTemporary?: boolean;
  reason?: string;
  bytesReceived?: number;
}

async function checkAudioUrl(url: string, retryCount = 0): Promise<HttpCheckResult> {
  if (!url || !url.startsWith('http')) {
    return { ok: false, isPermanent: true, reason: 'invalid_url' };
  }

  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const req = https.request(
        u,
        {
          method: 'GET',
          agent,
          headers: {
            Range: 'bytes=0-8192',
            'User-Agent': 'MelodexCatalogAuditor/2.0',
            Accept: '*/*',
          },
          timeout: REQUEST_TIMEOUT_MS,
        },
        (res) => {
          let bytesReceived = 0;
          res.on('data', (chunk) => {
            bytesReceived += chunk.length;
          });

          res.on('end', () => {
            const status = res.statusCode || 0;
            const contentType = (res.headers['content-type'] || '').toLowerCase();
            const contentRange = res.headers['content-range'] || '';

            if (status === 200 || status === 206) {
              // Verify content length / range / bytes
              if (bytesReceived < 512) {
                resolve({
                  ok: false,
                  statusCode: status,
                  isPermanent: true,
                  reason: 'empty_truncated_media',
                  bytesReceived,
                });
                return;
              }
              resolve({ ok: true, statusCode: status, bytesReceived });
              return;
            }

            if (status === 404) {
              resolve({
                ok: false,
                statusCode: status,
                isPermanent: true,
                reason: 'HTTP 404',
                bytesReceived,
              });
              return;
            }

            if (status === 410) {
              resolve({
                ok: false,
                statusCode: status,
                isPermanent: true,
                reason: 'HTTP 410',
                bytesReceived,
              });
              return;
            }

            if (status === 429) {
              resolve({
                ok: false,
                statusCode: status,
                isTemporary: true,
                reason: 'HTTP 429',
                bytesReceived,
              });
              return;
            }

            if (status >= 500 && status < 600) {
              resolve({
                ok: false,
                statusCode: status,
                isTemporary: true,
                reason: `HTTP ${status}`,
                bytesReceived,
              });
              return;
            }

            // Other 4xx or unexpected
            if (status >= 400 && status < 500) {
              resolve({
                ok: false,
                statusCode: status,
                isPermanent: true,
                reason: `HTTP ${status}`,
                bytesReceived,
              });
              return;
            }

            resolve({
              ok: false,
              statusCode: status,
              isTemporary: true,
              reason: `Unexpected status ${status}`,
              bytesReceived,
            });
          });
        }
      );

      req.on('error', (err) => {
        resolve({
          ok: false,
          isTemporary: true,
          reason: `Network: ${err.message}`,
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          ok: false,
          isTemporary: true,
          reason: 'timeout',
        });
      });

      req.end();
    } catch (e: any) {
      resolve({
        ok: false,
        isPermanent: true,
        reason: `Malformed URL error: ${e.message}`,
      });
    }
  });
}

// Repair function: queries iTunes search API for the EXACT same canonical track
async function attemptRepairTrack(song: Song): Promise<string | null> {
  try {
    const query = encodeURIComponent(`${song.artist} ${song.title}`);
    const searchUrl = `https://itunes.apple.com/search?term=${query}&media=music&entity=song&limit=10`;

    const res = await new Promise<{ ok: boolean; data?: any }>((resolve) => {
      https
        .get(searchUrl, { timeout: 7000 }, (resp) => {
          let raw = '';
          resp.on('data', (c) => (raw += c));
          resp.on('end', () => {
            try {
              resolve({ ok: true, data: JSON.parse(raw) });
            } catch {
              resolve({ ok: false });
            }
          });
        })
        .on('error', () => resolve({ ok: false }));
    });

    if (!res.ok || !res.data || !Array.isArray(res.data.results)) {
      return null;
    }

    const nTitle = normalizeStr(song.title);
    const nArtist = normalizeStr(song.artist);

    // Reject false matches (karaoke, tributes, beats, etc.)
    const badMarkers = ['tribute', 'karaoke', 'instrumental', 'cover version', 'type beat', 'beats'];

    for (const r of res.data.results) {
      if (!r.previewUrl) continue;
      const rTrack = (r.trackName || '').toLowerCase();
      const rArt = (r.artistName || '').toLowerCase();

      if (badMarkers.some((m) => rTrack.includes(m) || rArt.includes(m))) continue;

      const nrTitle = normalizeStr(r.trackName || '');
      const nrArtist = normalizeStr(r.artistName || '');

      // Strict match
      const artistMatch = nrArtist.includes(nArtist) || nArtist.includes(nrArtist);
      const titleMatch = nrTitle.includes(nTitle) || nTitle.includes(nrTitle);

      if (artistMatch && titleMatch) {
        // Verify this fresh previewUrl actually works
        const check = await checkAudioUrl(r.previewUrl);
        if (check.ok) {
          return r.previewUrl;
        }
      }
    }
  } catch {
    // Repair failed gracefully
  }

  return null;
}

async function auditCatalog() {
  const catalogPath = path.resolve(process.cwd(), 'src/data/melodexCatalog.json');
  console.log(`Loading catalog from: ${catalogPath}`);
  const catalog: Song[] = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  stats.total = catalog.length;
  console.log(`Starting controlled health audit on ${stats.total} tracks...`);
  console.log(`Batch size: ${BATCH_SIZE}, Concurrency: ${CONCURRENCY}`);

  const auditedCatalog: Song[] = [];
  const quarantinedTracks: Song[] = [];
  const repairedList: { title: string; artist: string; oldUrl: string; newUrl: string }[] = [];

  const startTime = Date.now();

  for (let b = 0; b < catalog.length; b += BATCH_SIZE) {
    const batch = catalog.slice(b, b + BATCH_SIZE);

    // Process chunk by CONCURRENCY
    for (let c = 0; c < batch.length; c += CONCURRENCY) {
      const chunk = batch.slice(c, c + CONCURRENCY);

      await Promise.all(
        chunk.map(async (song) => {
          let check = await checkAudioUrl(song.previewUrl);

          // If temporary failure or ambiguous failure, retry after brief delay
          if (!check.ok && check.isTemporary) {
            await new Promise((r) => setTimeout(r, 400));
            check = await checkAudioUrl(song.previewUrl, 1);
            if (!check.ok && check.isTemporary) {
              await new Promise((r) => setTimeout(r, 800));
              check = await checkAudioUrl(song.previewUrl, 2);
            }
          }

          if (check.ok) {
            stats.healthy++;
            song.audioStatus = 'healthy';
            song.playable = true;
            song.audioValidatedAt = Date.now();
            auditedCatalog.push(song);
            return;
          }

          // Track failed - attempt repair first, especially if curated
          const isCurated = isCuratedArtist(song.artist);
          let repairedUrl: string | null = null;

          if (isCurated || check.isPermanent) {
            repairedUrl = await attemptRepairTrack(song);
          }

          if (repairedUrl) {
            stats.repaired++;
            stats.healthy++;
            repairedList.push({
              title: song.title,
              artist: song.artist,
              oldUrl: song.previewUrl,
              newUrl: repairedUrl,
            });
            song.previewUrl = repairedUrl;
            song.audioStatus = 'healthy';
            song.playable = true;
            song.audioValidatedAt = Date.now();
            auditedCatalog.push(song);
            return;
          }

          // Could not repair
          if (check.isPermanent) {
            stats.dead++;
            stats.removedFromPlayable++;
            if (check.reason === 'HTTP 404') stats.perm404++;
            else if (check.reason === 'HTTP 410') stats.perm410++;
            else if (check.reason === 'empty_truncated_media') stats.permDecodeCorrupt++;
            else stats.permOther++;

            song.audioStatus = 'dead';
            song.playable = false;
            song.failureCount = (song.failureCount || 0) + 1;
            song.lastFailureReason = check.reason || 'Permanent audio failure';
            quarantinedTracks.push(song);
          } else {
            // Temporary failure: network, 429, 5xx, timeout
            stats.temporaryFailure++;
            stats.removedFromPlayable++;
            if (check.reason === 'timeout') stats.tempTimeout++;
            else if (check.reason === 'HTTP 429') stats.temp429++;
            else if (check.reason && check.reason.startsWith('HTTP 5')) stats.temp5xx++;
            else stats.tempNetwork++;

            song.audioStatus = 'temporary_failure';
            song.playable = false;
            song.failureCount = (song.failureCount || 0) + 1;
            song.lastFailureReason = check.reason || 'Temporary audio failure';
            quarantinedTracks.push(song);
          }
        })
      );
    }

    if ((b + BATCH_SIZE) % 500 < BATCH_SIZE || b + BATCH_SIZE >= catalog.length) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const progress = Math.min(catalog.length, b + BATCH_SIZE);
      console.log(
        `[${progress}/${catalog.length}] in ${elapsed}s | Healthy: ${stats.healthy} | Dead: ${stats.dead} | Repaired: ${stats.repaired} | TempFail: ${stats.temporaryFailure}`
      );
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n========================================');
  console.log('MELODEX CATALOG HEALTH AUDIT REPORT');
  console.log('========================================');
  console.log(`Total catalog records: ${stats.total}`);
  console.log(`Healthy playable: ${stats.healthy}`);
  console.log(`Unknown pending validation: ${stats.unknown}`);
  console.log(`Temporary failures: ${stats.temporaryFailure}`);
  console.log(`Confirmed dead: ${stats.dead}`);
  console.log(`Successfully repaired: ${stats.repaired}`);
  console.log('\nPermanent failures:');
  console.log(`404: ${stats.perm404}`);
  console.log(`410: ${stats.perm410}`);
  console.log(`decode/corrupt: ${stats.permDecodeCorrupt}`);
  console.log(`other permanent: ${stats.permOther}`);
  console.log('\nTemporary failures:');
  console.log(`network: ${stats.tempNetwork}`);
  console.log(`429: ${stats.temp429}`);
  console.log(`5xx: ${stats.temp5xx}`);
  console.log(`timeout: ${stats.tempTimeout}`);
  console.log(`\ntracks removed from playable pool: ${stats.removedFromPlayable}`);
  console.log(`Audit completed in ${durationSec}s`);
  console.log('========================================\n');

  // Write updated catalog files (only healthy playable tracks in playable catalog)
  fs.writeFileSync(catalogPath, JSON.stringify(auditedCatalog, null, 2), 'utf8');
  console.log(`Saved ${auditedCatalog.length} healthy tracks to ${catalogPath}`);

  // Synchronize with other catalog locations
  const otherPaths = [
    path.resolve(process.cwd(), 'src/data/melodex-catalog.json'),
    path.resolve(process.cwd(), 'public/melodex-catalog.json'),
    path.resolve(process.cwd(), 'public/data/melodex-catalog.json'),
    path.resolve(process.cwd(), 'public/data/melodex-catalog-v2.json'),
  ];

  for (const p of otherPaths) {
    if (fs.existsSync(path.dirname(p))) {
      fs.writeFileSync(p, JSON.stringify(auditedCatalog, null, 2), 'utf8');
      console.log(`Synchronized healthy playable catalog to: ${p}`);
    }
  }

  // Save quarantined metadata (dead and temporary failure tracks)
  const quarantinePath = path.resolve(process.cwd(), 'src/data/quarantinedCatalog.json');
  fs.writeFileSync(quarantinePath, JSON.stringify(quarantinedTracks, null, 2), 'utf8');
  console.log(`Saved ${quarantinedTracks.length} quarantined tracks to ${quarantinePath}`);

  // Save audit report JSON
  const reportPath = path.resolve(process.cwd(), 'src/data/auditReport.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        durationSeconds: durationSec,
        stats,
        repairedList,
      },
      null,
      2
    ),
    'utf8'
  );
  console.log(`Saved detailed audit report to ${reportPath}`);
}

auditCatalog().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
