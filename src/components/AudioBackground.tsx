import React, { useEffect, useRef } from 'react';
import { audioService } from '../services/audioService';
import { DecadeFilter } from '../types/game';
import { CATEGORY_THEMES } from '../types/theme';

interface AudioBackgroundProps {
  artworkUrl?: string;
  isResultRevealed?: boolean;
  isWon?: boolean;
  decade?: DecadeFilter;
}

export const AudioBackground: React.FC<AudioBackgroundProps> = ({
  artworkUrl,
  isResultRevealed = false,
  isWon = false,
  decade = 'all',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const currentDecadeRef = useRef<DecadeFilter>(decade);
  const winTriggerTimeRef = useRef<number | null>(null);
  const prevIsWonRef = useRef<boolean>(false);

  useEffect(() => {
    currentDecadeRef.current = decade;
  }, [decade]);

  useEffect(() => {
    if (isWon && !prevIsWonRef.current) {
      winTriggerTimeRef.current = performance.now();
    }
    prevIsWonRef.current = isWon;
  }, [isWon]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const initialTheme = CATEGORY_THEMES[currentDecadeRef.current] || CATEGORY_THEMES.all;

    // Ambient floating orbs parameters
    const orbs = [
      { x: 0.3, y: 0.35, radius: 0.45, vx: 0.00015, vy: 0.0001, hueOffset: 0, satOffset: 0, baseAlpha: 0.06 },
      { x: 0.7, y: 0.65, radius: 0.5, vx: -0.00012, vy: 0.00015, hueOffset: 12, satOffset: -5, baseAlpha: 0.05 },
      { x: 0.5, y: 0.5, radius: 0.35, vx: 0.0001, vy: -0.0001, hueOffset: -8, satOffset: 10, baseAlpha: 0.04 },
    ];

    let currentHue = initialTheme.hue;
    let currentSat = initialTheme.sat;
    let smoothedEnergy = 0;
    let smoothedBass = 0;
    let time = 0;

    const render = () => {
      time += 0.008;

      // Base background fill (solid near-black)
      ctx.fillStyle = '#060709';
      ctx.fillRect(0, 0, width, height);

      // Target theme from active decade
      const targetTheme = CATEGORY_THEMES[currentDecadeRef.current] || CATEGORY_THEMES.all;
      
      // Smooth color transition
      let dHue = targetTheme.hue - currentHue;
      if (dHue > 180) dHue -= 360;
      if (dHue < -180) dHue += 360;
      currentHue = (currentHue + dHue * 0.06 + 360) % 360;
      currentSat += (targetTheme.sat - currentSat) * 0.06;

      // Get real-time audio energy
      let energy = 0;
      let bass = 0;

      if (!prefersReducedMotion && audioService.getIsPlaying()) {
        const audioStats = audioService.getAudioEnergy();
        energy = audioStats.overall;
        bass = audioStats.bass;
      }

      // Smooth interpolation to avoid jitter
      smoothedEnergy += (energy - smoothedEnergy) * 0.12;
      smoothedBass += (bass - smoothedBass) * 0.15;

      const dynamicScale = 1 + smoothedBass * 0.35;
      const dynamicIntensity = 1 + smoothedEnergy * 1.6;

      // Render atmospheric ambient orbs
      for (const orb of orbs) {
        if (!prefersReducedMotion) {
          orb.x += orb.vx;
          orb.y += orb.vy;
          if (orb.x < 0.15 || orb.x > 0.85) orb.vx *= -1;
          if (orb.y < 0.15 || orb.y > 0.85) orb.vy *= -1;
        }

        const orbHue = (currentHue + orb.hueOffset + 360) % 360;
        const orbSat = Math.max(20, Math.min(100, currentSat + orb.satOffset));

        const cx = orb.x * width + Math.sin(time + orb.hueOffset) * 20;
        const cy = orb.y * height + Math.cos(time + orb.hueOffset) * 20;
        const r = Math.min(width, height) * orb.radius * dynamicScale;

        const effectiveAlpha = Math.min(
          0.18,
          orb.baseAlpha * dynamicIntensity * (isResultRevealed ? 0.6 : 1)
        );

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        gradient.addColorStop(0, `hsla(${orbHue}, ${orbSat}%, 45%, ${effectiveAlpha})`);
        gradient.addColorStop(0.5, `hsla(${orbHue}, ${orbSat}%, 30%, ${effectiveAlpha * 0.4})`);
        gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Subtle center resonance wave upon correct discovery (1.5s duration)
      if (winTriggerTimeRef.current !== null) {
        const elapsed = (performance.now() - winTriggerTimeRef.current) / 1000;
        if (elapsed < 1.5) {
          const progress = elapsed / 1.5; // 0 to 1
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const resonanceRadius = Math.min(width, height) * (0.25 + easeOut * 0.9);
          const alpha = (1 - easeOut) * 0.18;

          // Expanding soft resonance ring
          const ringGrad = ctx.createRadialGradient(
            width / 2,
            height / 2,
            Math.max(0, resonanceRadius - 60),
            width / 2,
            height / 2,
            resonanceRadius
          );
          ringGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
          ringGrad.addColorStop(0.7, `hsla(${currentHue}, ${currentSat}%, 55%, ${alpha})`);
          ringGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = ringGrad;
          ctx.beginPath();
          ctx.arc(width / 2, height / 2, resonanceRadius, 0, Math.PI * 2);
          ctx.fill();

          // Gentle center illumination bloom
          const centerBloomR = Math.min(width, height) * 0.45;
          const bloomAlpha = (1 - easeOut) * 0.12;
          const bloomGrad = ctx.createRadialGradient(
            width / 2,
            height / 2,
            0,
            width / 2,
            height / 2,
            centerBloomR
          );
          bloomGrad.addColorStop(0, `hsla(${currentHue}, ${currentSat}%, 60%, ${bloomAlpha})`);
          bloomGrad.addColorStop(1, 'rgba(6, 7, 9, 0)');

          ctx.fillStyle = bloomGrad;
          ctx.beginPath();
          ctx.arc(width / 2, height / 2, centerBloomR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Very subtle organic center glow reacting to music
      if (smoothedEnergy > 0.01) {
        const centerR = Math.min(width, height) * 0.4 * (1 + smoothedBass * 0.25);
        const centerGrad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          0,
          width / 2,
          height / 2,
          centerR
        );
        centerGrad.addColorStop(0, `hsla(${currentHue}, ${currentSat}%, 50%, ${smoothedEnergy * 0.08})`);
        centerGrad.addColorStop(1, 'rgba(6, 7, 9, 0)');

        ctx.fillStyle = centerGrad;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, centerR, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isResultRevealed]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Canvas ambient reactive layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Blurred album art overlay for revealed rounds (subtle, dark, low opacity) */}
      {artworkUrl && isResultRevealed && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-20 filter blur-[90px] scale-110"
          style={{ backgroundImage: `url(${artworkUrl})` }}
        />
      )}

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#060709]/60 to-[#060709] pointer-events-none" />
    </div>
  );
};
