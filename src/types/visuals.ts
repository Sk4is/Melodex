export type BackgroundMotion = 'OFF' | 'LOW' | 'NORMAL' | 'HIGH';
export type VisualizerStyle = 'WAVE' | 'BARS' | 'ORBIT' | 'RINGS' | 'MINIMAL';
export type GlowIntensity = 'OFF' | 'LOW' | 'NORMAL' | 'HIGH';
export type AlbumArtStyle = 'CLASSIC' | 'FLOAT' | 'VINYL' | 'GLOW' | 'HOLOGRAPHIC';
export type CorrectAnswerEffect =
  | 'RESONANCE'
  | 'SHOCKWAVE'
  | 'SCAN'
  | 'PORTAL'
  | 'ECHO'
  | 'AURORA'
  | 'GLITCH'
  | 'WARP';
export type AmbientDust = 'OFF' | 'LOW' | 'NORMAL';
export type ScreenVignette = 'OFF' | 'SOFT' | 'DEEP';

export interface VisualSettings {
  backgroundMotion: BackgroundMotion;
  audioReactive: boolean;
  visualizerStyle: VisualizerStyle;
  glowIntensity: GlowIntensity;
  albumArtStyle: AlbumArtStyle;
  artworkAmbience: boolean;
  correctAnswerEffect: CorrectAnswerEffect;
  playEnergy: boolean;
  ambientDust: AmbientDust;
  screenVignette: ScreenVignette;
  immersive: boolean;
  reducedMotion: boolean;
  shuffleVisuals: boolean;
}

export const DEFAULT_VISUAL_SETTINGS: VisualSettings = {
  backgroundMotion: 'NORMAL',
  audioReactive: true,
  visualizerStyle: 'WAVE',
  glowIntensity: 'NORMAL',
  albumArtStyle: 'CLASSIC',
  artworkAmbience: true,
  correctAnswerEffect: 'RESONANCE',
  playEnergy: true,
  ambientDust: 'LOW',
  screenVignette: 'SOFT',
  immersive: false,
  reducedMotion: false,
  shuffleVisuals: false,
};
