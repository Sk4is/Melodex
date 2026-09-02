import { DecadeFilter } from './game';

export interface CategoryTheme {
  id: DecadeFilter;
  name: string;
  accent: string;       // HEX
  accentRgb: string;    // "r, g, b"
  accentHover: string;  // HEX
  accentSoft: string;   // rgba
  accentGlow: string;   // rgba
  hue: number;          // for canvas HSL rendering
  sat: number;          // for canvas HSL rendering
  textColorOnAccent: string; // 'text-black' or 'text-white'
}

export const CATEGORY_THEMES: Record<DecadeFilter, CategoryTheme> = {
  all: {
    id: 'all',
    name: 'Any Year',
    accent: '#22C55E',
    accentRgb: '34, 197, 94',
    accentHover: '#16a34a',
    accentSoft: 'rgba(34, 197, 94, 0.15)',
    accentGlow: 'rgba(34, 197, 94, 0.35)',
    hue: 142,
    sat: 70,
    textColorOnAccent: 'text-black',
  },
  pre2000: {
    id: 'pre2000',
    name: '< 2000',
    accent: '#FFFFFF',
    accentRgb: '255, 255, 255',
    accentHover: '#E5E5E5',
    accentSoft: 'rgba(255, 255, 255, 0.16)',
    accentGlow: 'rgba(255, 255, 255, 0.30)',
    hue: 0,
    sat: 0,
    textColorOnAccent: 'text-black',
  },
  '2000s': {
    id: '2000s',
    name: "2000's",
    accent: '#3B82F6',
    accentRgb: '59, 130, 246',
    accentHover: '#2563EB',
    accentSoft: 'rgba(59, 130, 246, 0.18)',
    accentGlow: 'rgba(59, 130, 246, 0.35)',
    hue: 217,
    sat: 85,
    textColorOnAccent: 'text-black',
  },
  '2010s': {
    id: '2010s',
    name: "2010's",
    accent: '#F5C542',
    accentRgb: '245, 197, 66',
    accentHover: '#EAB308',
    accentSoft: 'rgba(245, 197, 66, 0.18)',
    accentGlow: 'rgba(245, 197, 66, 0.35)',
    hue: 44,
    sat: 90,
    textColorOnAccent: 'text-black',
  },
  '2020s': {
    id: '2020s',
    name: "2020's",
    accent: '#BB2649',
    accentRgb: '187, 38, 73',
    accentHover: '#9F1239',
    accentSoft: 'rgba(187, 38, 73, 0.20)',
    accentGlow: 'rgba(187, 38, 73, 0.35)',
    hue: 346,
    sat: 66,
    textColorOnAccent: 'text-white',
  },
};
