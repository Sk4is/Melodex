import React, { useEffect, useRef } from 'react';
import { audioService } from '../services/audioService';
import { DecadeFilter } from '../types/game';
import { CATEGORY_THEMES } from '../types/theme';
import { useVisuals } from '../context/VisualContext';

interface AudioBackgroundProps {
  artworkUrl?: string;
  isResultRevealed?: boolean;
  isWon?: boolean;
  decade?: DecadeFilter;
}

interface DustParticle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  vy: number;
  vx: number;
  hueOffset: number;
}

export const AudioBackground: React.FC<AudioBackgroundProps> = ({
  artworkUrl,
  isResultRevealed = false,
  isWon = false,
  decade = 'all',
}) => {
  const { settings, effectiveAnswerEffect } = useVisuals();
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
    } else if (!isWon) {
      winTriggerTimeRef.current = null;
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

    const initialTheme = CATEGORY_THEMES[currentDecadeRef.current] || CATEGORY_THEMES.all;

    // Ambient floating orbs
    const orbs = [
      { x: 0.3, y: 0.35, radius: 0.45, vx: 0.00015, vy: 0.0001, hueOffset: 0, satOffset: 0, baseAlpha: 0.06 },
      { x: 0.7, y: 0.65, radius: 0.5, vx: -0.00012, vy: 0.00015, hueOffset: 12, satOffset: -5, baseAlpha: 0.05 },
      { x: 0.5, y: 0.5, radius: 0.35, vx: 0.0001, vy: -0.0001, hueOffset: -8, satOffset: 10, baseAlpha: 0.04 },
    ];

    // Ambient dust particles
    const dustCount = settings.ambientDust === 'OFF' ? 0 : settings.ambientDust === 'LOW' ? 20 : 42;
    const dustParticles: DustParticle[] = [];
    for (let i = 0; i < dustCount; i++) {
      dustParticles.push({
        x: Math.random(),
        y: Math.random(),
        radius: Math.random() * 1.3 + 0.5,
        alpha: Math.random() * 0.08 + 0.03,
        vy: -(Math.random() * 0.00025 + 0.00008),
        vx: (Math.random() - 0.5) * 0.0001,
        hueOffset: (Math.random() - 0.5) * 20,
      });
    }

    let currentHue = initialTheme.hue;
    let currentSat = initialTheme.sat;
    let smoothedEnergy = 0;
    let smoothedBass = 0;
    let time = 0;

    // Motion multiplier
    let motionMultiplier = 1;
    if (settings.reducedMotion || settings.backgroundMotion === 'OFF') {
      motionMultiplier = 0;
    } else if (settings.backgroundMotion === 'LOW') {
      motionMultiplier = 0.4;
    } else if (settings.backgroundMotion === 'HIGH') {
      motionMultiplier = 1.75;
    }

    // Glow multiplier
    let glowMultiplier = 1;
    if (settings.glowIntensity === 'OFF') glowMultiplier = 0.2;
    else if (settings.glowIntensity === 'LOW') glowMultiplier = 0.6;
    else if (settings.glowIntensity === 'HIGH') glowMultiplier = 1.6;

    const render = () => {
      time += 0.008 * (motionMultiplier > 0 ? motionMultiplier : 0.05);

      // Base background fill (solid dark neutral)
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

      // Real-time audio energy
      let energy = 0;
      let bass = 0;

      if (!settings.reducedMotion && settings.audioReactive && audioService.getIsPlaying()) {
        const audioStats = audioService.getAudioEnergy();
        energy = audioStats.overall;
        bass = audioStats.bass;
      }

      smoothedEnergy += (energy - smoothedEnergy) * 0.12;
      smoothedBass += (bass - smoothedBass) * 0.15;

      const dynamicScale = 1 + smoothedBass * 0.35 * (settings.audioReactive ? 1 : 0);
      const dynamicIntensity = (1 + smoothedEnergy * 1.6 * (settings.audioReactive ? 1 : 0)) * glowMultiplier;

      // Render atmospheric ambient orbs
      for (const orb of orbs) {
        if (motionMultiplier > 0) {
          orb.x += orb.vx * motionMultiplier;
          orb.y += orb.vy * motionMultiplier;
          if (orb.x < 0.15 || orb.x > 0.85) orb.vx *= -1;
          if (orb.y < 0.15 || orb.y > 0.85) orb.vy *= -1;
        }

        const orbHue = (currentHue + orb.hueOffset + 360) % 360;
        const orbSat = Math.max(20, Math.min(100, currentSat + orb.satOffset));

        const cx = orb.x * width + Math.sin(time + orb.hueOffset) * 20 * (motionMultiplier > 0 ? 1 : 0);
        const cy = orb.y * height + Math.cos(time + orb.hueOffset) * 20 * (motionMultiplier > 0 ? 1 : 0);
        const r = Math.min(width, height) * orb.radius * dynamicScale;

        const effectiveAlpha = Math.min(
          0.22,
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

      // Render Ambient Dust Particles
      if (dustParticles.length > 0 && !settings.reducedMotion) {
        for (const p of dustParticles) {
          if (motionMultiplier > 0) {
            p.y += p.vy * (motionMultiplier > 0 ? motionMultiplier : 0.5);
            p.x += p.vx * (motionMultiplier > 0 ? motionMultiplier : 0.5);
            if (p.y < -0.05) p.y = 1.05;
            if (p.x < -0.05) p.x = 1.05;
            if (p.x > 1.05) p.x = -0.05;
          }

          const px = p.x * width;
          const py = p.y * height;
          const particleHue = (currentHue + p.hueOffset + 360) % 360;

          ctx.fillStyle = `hsla(${particleHue}, ${currentSat}%, 75%, ${p.alpha * glowMultiplier})`;
          ctx.beginPath();
          ctx.arc(px, py, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Integrated Background Effect on Correct Answer
      if (winTriggerTimeRef.current !== null && !settings.reducedMotion) {
        const elapsed = (performance.now() - winTriggerTimeRef.current) / 1000;
        if (elapsed < 1.8) {
          const progress = elapsed / 1.8;
          const easeOut = 1 - Math.pow(1 - progress, 3);

          if (effectiveAnswerEffect === 'RESONANCE') {
            const resonanceRadius = Math.min(width, height) * (0.2 + easeOut * 0.9);
            const alpha = (1 - easeOut) * 0.22 * glowMultiplier;

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
          } else if (effectiveAnswerEffect === 'SHOCKWAVE') {
            const shockRadius = Math.min(width, height) * (0.1 + easeOut * 1.2);
            const alpha = (1 - easeOut) * 0.3 * glowMultiplier;
            const shockGrad = ctx.createRadialGradient(
              width / 2,
              height / 2,
              Math.max(0, shockRadius - 40),
              width / 2,
              height / 2,
              shockRadius
            );
            shockGrad.addColorStop(0, 'rgba(0,0,0,0)');
            shockGrad.addColorStop(0.8, `hsla(${currentHue}, ${currentSat}%, 65%, ${alpha})`);
            shockGrad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = shockGrad;
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, shockRadius, 0, Math.PI * 2);
            ctx.fill();
          } else if (effectiveAnswerEffect === 'AURORA') {
            const auroraBloomR = Math.min(width, height) * (0.3 + easeOut * 0.7);
            const alpha = (1 - easeOut) * 0.28 * glowMultiplier;
            const auroraGrad = ctx.createRadialGradient(
              width / 2,
              height / 2,
              0,
              width / 2,
              height / 2,
              auroraBloomR
            );
            auroraGrad.addColorStop(0, `hsla(${currentHue}, ${currentSat}%, 55%, ${alpha})`);
            auroraGrad.addColorStop(0.6, `hsla(${(currentHue + 30) % 360}, ${currentSat}%, 40%, ${alpha * 0.5})`);
            auroraGrad.addColorStop(1, 'rgba(6, 7, 9, 0)');

            ctx.fillStyle = auroraGrad;
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, auroraBloomR, 0, Math.PI * 2);
            ctx.fill();
          }

          // Gentle center illumination bloom
          const centerBloomR = Math.min(width, height) * 0.45;
          const bloomAlpha = (1 - easeOut) * 0.12 * glowMultiplier;
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

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [
    isResultRevealed,
    settings.backgroundMotion,
    settings.audioReactive,
    settings.ambientDust,
    settings.glowIntensity,
    settings.reducedMotion,
    effectiveAnswerEffect,
  ]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />

      {artworkUrl && isResultRevealed && settings.artworkAmbience && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-25 filter blur-[90px] scale-110"
          style={{ backgroundImage: `url(${artworkUrl})` }}
        />
      )}

      {settings.screenVignette !== 'OFF' && (
        <div
          className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
            settings.screenVignette === 'DEEP'
              ? 'bg-radial-gradient from-transparent via-[#060709]/80 to-[#060709]'
              : 'bg-radial-gradient from-transparent via-[#060709]/55 to-[#060709]'
          }`}
        />
      )}
    </div>
  );
};
