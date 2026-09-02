import React from 'react';
import { motion } from 'motion/react';
import { CorrectAnswerEffect } from '../../types/visuals';

interface AnswerEffectRendererProps {
  effect: CorrectAnswerEffect;
  isTriggered: boolean;
  reducedMotion?: boolean;
  glowMultiplier?: number;
  size?: 'normal' | 'preview';
}

export const AnswerEffectRenderer: React.FC<AnswerEffectRendererProps> = ({
  effect,
  isTriggered,
  reducedMotion = false,
  glowMultiplier = 1,
  size = 'normal',
}) => {
  if (!isTriggered) return null;

  const isPreview = size === 'preview';
  const scaleMod = isPreview ? 0.8 : 1;

  // Reduced Motion Fallback
  if (reducedMotion) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4 * glowMultiplier, 0] }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="absolute -inset-6 rounded-full pointer-events-none theme-transition"
        style={{
          background: 'radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)',
          boxShadow: `0 0 ${Math.round(24 * glowMultiplier)}px var(--accent-glow)`,
        }}
      />
    );
  }

  // 1. RESONANCE: 3-4 Concentric Sound Wave Rings
  if (effect === 'RESONANCE') {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-visible">
        {/* Ring 1 */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0.75 * glowMultiplier }}
          animate={{ scale: 2.3 * scaleMod, opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 rounded-full theme-transition"
          style={{
            border: `${1.5 * scaleMod}px solid var(--accent)`,
            boxShadow: `0 0 ${Math.round(20 * glowMultiplier * scaleMod)}px var(--accent-glow)`,
          }}
        />
        {/* Ring 2 */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0.6 * glowMultiplier }}
          animate={{ scale: 2.75 * scaleMod, opacity: 0 }}
          transition={{ delay: 0.15, duration: 1.25, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 rounded-full theme-transition"
          style={{
            border: `${1.5 * scaleMod}px solid var(--accent)`,
            boxShadow: `0 0 ${Math.round(24 * glowMultiplier * scaleMod)}px var(--accent-glow)`,
          }}
        />
        {/* Ring 3 */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0.45 * glowMultiplier }}
          animate={{ scale: 3.2 * scaleMod, opacity: 0 }}
          transition={{ delay: 0.3, duration: 1.35, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 rounded-full theme-transition"
          style={{
            border: `${1.2 * scaleMod}px solid var(--accent)`,
            boxShadow: `0 0 ${Math.round(28 * glowMultiplier * scaleMod)}px var(--accent-glow)`,
          }}
        />
        {/* Ring 4 */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0.3 * glowMultiplier }}
          animate={{ scale: 3.65 * scaleMod, opacity: 0 }}
          transition={{ delay: 0.45, duration: 1.45, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 rounded-full theme-transition"
          style={{
            border: `${1 * scaleMod}px solid var(--accent)`,
            boxShadow: `0 0 ${Math.round(32 * glowMultiplier * scaleMod)}px var(--accent-glow)`,
          }}
        />
      </div>
    );
  }

  // 2. SHOCKWAVE: Fast Punchy Circular Impact & Radial Pulse
  if (effect === 'SHOCKWAVE') {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-visible">
        {/* Central Brightness Flash */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0.85 * glowMultiplier }}
          animate={{ scale: 2.0 * scaleMod, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.08, 0.82, 0.17, 1] }}
          className="absolute -inset-10 rounded-full theme-transition"
          style={{
            background: 'radial-gradient(circle, var(--accent) 0%, var(--accent-soft) 40%, transparent 70%)',
            filter: `blur(${Math.round(8 * scaleMod)}px)`,
          }}
        />
        {/* Expanding High-Impact Ring */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0.95 * glowMultiplier }}
          animate={{ scale: 3.4 * scaleMod, opacity: 0 }}
          transition={{ duration: 0.75, ease: [0.08, 0.82, 0.17, 1] }}
          className="absolute inset-0 rounded-full theme-transition"
          style={{
            border: `${3 * scaleMod}px solid var(--accent)`,
            boxShadow: `0 0 ${Math.round(36 * glowMultiplier * scaleMod)}px var(--accent), inset 0 0 ${Math.round(20 * glowMultiplier * scaleMod)}px var(--accent-glow)`,
          }}
        />
      </div>
    );
  }

  // 3. SCAN: Futuristic Identification Laser Beam
  if (effect === 'SCAN') {
    return (
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-3xl">
        {/* Darkening scan veil */}
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
          className="absolute inset-0 bg-black/35"
        />

        {/* Traveling Laser Line */}
        <motion.div
          initial={{ top: '-10%', opacity: 1 }}
          animate={{ top: '110%', opacity: [1, 1, 0.8, 0] }}
          transition={{ duration: 1.0, ease: 'easeInOut' }}
          className="absolute left-0 right-0 h-1.5 flex flex-col items-center justify-center"
        >
          {/* Main Laser Beam */}
          <div
            className="w-full h-0.5 theme-transition"
            style={{
              backgroundColor: 'var(--accent)',
              boxShadow: `0 0 ${Math.round(14 * glowMultiplier)}px 2px var(--accent), 0 0 24px var(--accent-glow)`,
            }}
          />
          {/* Subtle Scan Glow Trail */}
          <div
            className="w-full h-8 -mt-4 opacity-40 theme-transition"
            style={{
              background: 'linear-gradient(to top, var(--accent-soft), transparent)',
            }}
          />
        </motion.div>

        {/* Corner Target Reticles */}
        <motion.div
          initial={{ opacity: 0.8, scale: 1.05 }}
          animate={{ opacity: 0, scale: 1 }}
          transition={{ duration: 1.0 }}
          className="absolute inset-2 border border-white/20 rounded-2xl pointer-events-none"
        />
      </div>
    );
  }

  // 4. PORTAL: Depth Aperture Ring & Emergence
  if (effect === 'PORTAL') {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-visible">
        {/* Expanding Dark Void Aperture */}
        <motion.div
          initial={{ scale: 0.1, opacity: 0.95 }}
          animate={{ scale: 2.2 * scaleMod, opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 rounded-full bg-black/90 border border-white/10"
        />
        {/* Rotating Portal Energy Ring */}
        <motion.div
          initial={{ scale: 0.2, rotate: 0, opacity: 0.85 * glowMultiplier }}
          animate={{ scale: 2.5 * scaleMod, rotate: 90, opacity: 0 }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 rounded-full theme-transition"
          style={{
            border: `${2.5 * scaleMod}px dashed var(--accent)`,
            boxShadow: `0 0 ${Math.round(32 * glowMultiplier * scaleMod)}px var(--accent-glow)`,
          }}
        />
        {/* Solid Outer Ring */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0.9 * glowMultiplier }}
          animate={{ scale: 2.0 * scaleMod, opacity: 0 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 rounded-full theme-transition"
          style={{
            border: `${1.5 * scaleMod}px solid var(--accent)`,
            boxShadow: `0 0 ${Math.round(20 * glowMultiplier * scaleMod)}px var(--accent)`,
          }}
        />
      </div>
    );
  }

  // 5. ECHO: Visual Reverberation Ghost Copies
  if (effect === 'ECHO') {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-visible">
        {/* Ghost 1 */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0.65 * glowMultiplier }}
          animate={{ scale: 1.14 * scaleMod, opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="absolute inset-0 rounded-3xl theme-transition"
          style={{
            border: `${1.5 * scaleMod}px solid var(--accent)`,
            boxShadow: `0 0 ${Math.round(20 * glowMultiplier * scaleMod)}px var(--accent-glow)`,
          }}
        />
        {/* Ghost 2 */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0.45 * glowMultiplier }}
          animate={{ scale: 1.28 * scaleMod, opacity: 0 }}
          transition={{ delay: 0.1, duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 rounded-3xl theme-transition"
          style={{
            border: `${1.5 * scaleMod}px solid var(--accent)`,
            boxShadow: `0 0 ${Math.round(28 * glowMultiplier * scaleMod)}px var(--accent-glow)`,
          }}
        />
        {/* Ghost 3 */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0.28 * glowMultiplier }}
          animate={{ scale: 1.42 * scaleMod, opacity: 0 }}
          transition={{ delay: 0.2, duration: 0.95, ease: 'easeOut' }}
          className="absolute inset-0 rounded-3xl theme-transition"
          style={{
            border: `${1.2 * scaleMod}px solid var(--accent)`,
            boxShadow: `0 0 ${Math.round(36 * glowMultiplier * scaleMod)}px var(--accent-glow)`,
          }}
        />
      </div>
    );
  }

  // 6. AURORA: Atmospheric Flowing Light Bloom
  if (effect === 'AURORA') {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-visible">
        {/* Flowing Organic Aurora Cloud */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -15 }}
          animate={{
            scale: [0.6, 2.3 * scaleMod, 2.6 * scaleMod],
            opacity: [0, 0.7 * glowMultiplier, 0],
            rotate: [ -15, 20, 45 ],
          }}
          transition={{ duration: 1.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute -inset-16 rounded-[40%] filter blur-2xl theme-transition"
          style={{
            background: 'radial-gradient(ellipse at center, var(--accent) 0%, var(--accent-soft) 45%, transparent 75%)',
          }}
        />
        {/* Secondary Harmonic Wave */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: 25 }}
          animate={{
            scale: [0.8, 1.9 * scaleMod, 2.2 * scaleMod],
            opacity: [0, 0.5 * glowMultiplier, 0],
            rotate: [ 25, -15, -35 ],
          }}
          transition={{ delay: 0.2, duration: 2.0, ease: 'easeOut' }}
          className="absolute -inset-12 rounded-[50%] filter blur-xl theme-transition"
          style={{
            background: 'radial-gradient(circle at 60% 40%, var(--accent-glow) 0%, transparent 65%)',
          }}
        />
      </div>
    );
  }

  // 7. GLITCH: Short Tasteful Signal Acquisition Distortion
  if (effect === 'GLITCH') {
    return (
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-3xl">
        {/* Cyan/Blue offset slice */}
        <motion.div
          initial={{ opacity: 0.8, x: -6, y: -2 }}
          animate={{
            opacity: [0.8, 0.9, 0.4, 0],
            x: [-6, 7, -3, 0],
            y: [-2, 3, -1, 0],
          }}
          transition={{ duration: 0.35, ease: 'linear', times: [0, 0.3, 0.7, 1] }}
          className="absolute inset-0 bg-cyan-400/20 mix-blend-screen pointer-events-none"
        />
        {/* Red/Accent offset slice */}
        <motion.div
          initial={{ opacity: 0.8, x: 6, y: 2 }}
          animate={{
            opacity: [0.8, 0.9, 0.3, 0],
            x: [6, -7, 2, 0],
            y: [2, -3, 1, 0],
          }}
          transition={{ duration: 0.35, ease: 'linear', times: [0, 0.3, 0.7, 1] }}
          className="absolute inset-0 bg-rose-500/20 mix-blend-screen pointer-events-none"
        />
        {/* Scan lines glitch bar */}
        <motion.div
          initial={{ top: '20%', opacity: 0.9 }}
          animate={{ top: ['20%', '70%', '40%', '90%'], opacity: [0.9, 0.7, 0.4, 0] }}
          transition={{ duration: 0.3, ease: 'linear' }}
          className="absolute left-0 right-0 h-3 bg-white/20 pointer-events-none"
        />
      </div>
    );
  }

  // 8. WARP: Spatial Inward Compression and Grid Elastic Expansion
  if (effect === 'WARP') {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-visible">
        {/* Warp Streak Lines SVG */}
        <motion.svg
          viewBox="0 0 200 200"
          className="absolute -inset-24 w-[calc(100%+12rem)] h-[calc(100%+12rem)]"
          initial={{ scale: 1.8, opacity: 0.9 * glowMultiplier }}
          animate={{
            scale: [1.8, 0.85, 2.5 * scaleMod],
            opacity: [0.9 * glowMultiplier, 0.7, 0],
          }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 12;
            const x1 = 100 + Math.cos(angle) * 30;
            const y1 = 100 + Math.sin(angle) * 30;
            const x2 = 100 + Math.cos(angle) * 95;
            const y2 = 100 + Math.sin(angle) * 95;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--accent)"
                strokeWidth={1.5 * scaleMod}
                strokeLinecap="round"
                opacity={0.8}
              />
            );
          })}
        </motion.svg>

        {/* Warp Inward Core Ring */}
        <motion.div
          initial={{ scale: 2.2, opacity: 0 }}
          animate={{
            scale: [2.2, 0.8, 2.8 * scaleMod],
            opacity: [0, 0.9 * glowMultiplier, 0],
          }}
          transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 rounded-full theme-transition"
          style={{
            border: `${2 * scaleMod}px solid var(--accent)`,
            boxShadow: `0 0 ${Math.round(28 * glowMultiplier * scaleMod)}px var(--accent-glow)`,
          }}
        />
      </div>
    );
  }

  return null;
};
