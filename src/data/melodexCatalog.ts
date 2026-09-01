/**
 * Melodex Permanent Verified Song Catalog
 * Auto-persisted and tracked in version control.
 * Total Playable Tracks: 6318
 */
import { Song } from '../types/song';
import rawCatalog from './melodexCatalog.json';

export const MELODEX_BASE_CATALOG: Song[] = rawCatalog as Song[];
export default MELODEX_BASE_CATALOG;
