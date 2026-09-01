import { Song } from '../types/song';
import rawCatalog from './melodex-catalog.json';

export const MELODEX_BASE_CATALOG: Song[] = rawCatalog as unknown as Song[];
