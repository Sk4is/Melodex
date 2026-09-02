import React, { useEffect, useRef } from 'react';
import { audioService } from '../services/audioService';
import { useVisuals } from '../context/VisualContext';

interface WaveformVisualizerProps {
  isPlaying: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ isPlaying }) => {
  const { effectiveVisualizerStyle, settings } = useVisuals();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 220;
    const height = 36;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const BAR_COUNT = 24;
    const barWidth = 3.5;
    const barGap = (width - BAR_COUNT * barWidth) / (BAR_COUNT - 1);
    const heights = new Array(BAR_COUNT).fill(2.5);
    const targetHeights = new Array(BAR_COUNT).fill(2.5);
    const freqArray = new Uint8Array(64);

    let phase = 0;
    let smoothedEnergy = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let energy = 0;
      if (isPlaying) {
        audioService.getFrequencyData(freqArray);
        const stats = audioService.getAudioEnergy();
        energy = stats.overall;
        phase += 0.08;
      }
      smoothedEnergy += (energy - smoothedEnergy) * 0.15;

      const computedStyle = getComputedStyle(canvas);
      const accent = computedStyle.getPropertyValue('--accent').trim() || '#22C55E';
      const accentGlow = computedStyle.getPropertyValue('--accent-glow').trim() || 'rgba(34, 197, 94, 0.4)';
      const accentHover = computedStyle.getPropertyValue('--accent-hover').trim() || '#16a34a';

      // Glow setting
      const glowBlur = settings.glowIntensity === 'OFF' ? 0 : settings.glowIntensity === 'LOW' ? 3 : settings.glowIntensity === 'HIGH' ? 8 : 5;

      // 1. WAVE Style (Smooth curved audio wave)
      if (effectiveVisualizerStyle === 'WAVE') {
        const pointCount = 20;
        const waveStep = width / (pointCount - 1);
        ctx.beginPath();
        ctx.moveTo(0, height / 2);

        for (let i = 0; i < pointCount; i++) {
          const bin = Math.min(freqArray.length - 1, Math.floor((i / pointCount) * 24));
          const val = isPlaying ? (freqArray[bin] / 255) * 12 : 0;
          const sine = isPlaying ? Math.sin(phase + i * 0.5) * (val * 0.6 + 2) : 0;
          const y = height / 2 + sine;
          const x = i * waveStep;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = isPlaying ? accent : '#262626';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = isPlaying ? accentGlow : 'transparent';
        ctx.shadowBlur = isPlaying ? glowBlur : 0;
        ctx.stroke();

        // Second subtle harmonic wave
        if (isPlaying) {
          ctx.beginPath();
          for (let i = 0; i < pointCount; i++) {
            const bin = Math.min(freqArray.length - 1, Math.floor((i / pointCount) * 20));
            const val = (freqArray[bin] / 255) * 8;
            const sine = Math.cos(phase * 1.2 + i * 0.4) * (val * 0.4 + 1.5);
            const y = height / 2 - sine;
            const x = i * waveStep;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = accentHover;
          ctx.lineWidth = 1.4;
          ctx.globalAlpha = 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // 2. BARS Style (Classic Elegant Frequency Bars)
      else if (effectiveVisualizerStyle === 'BARS') {
        if (isPlaying) {
          for (let i = 0; i < BAR_COUNT; i++) {
            const binIndex = Math.min(freqArray.length - 1, Math.floor((i / BAR_COUNT) * 28));
            const rawValue = freqArray[binIndex] || 0;
            const normalized = rawValue / 255;
            const wave = Math.sin(phase + i * 0.45) * 0.15 + 0.15;
            const combined = Math.max(0.08, normalized * 0.85 + wave);
            targetHeights[i] = Math.max(3, combined * (height - 6));
          }
        } else {
          for (let i = 0; i < BAR_COUNT; i++) {
            targetHeights[i] = 2.5;
          }
        }

        for (let i = 0; i < BAR_COUNT; i++) {
          heights[i] += (targetHeights[i] - heights[i]) * 0.22;
          const h = heights[i];
          const x = i * (barWidth + barGap);
          const y = (height - h) / 2;

          if (isPlaying) {
            const grad = ctx.createLinearGradient(0, y, 0, y + h);
            grad.addColorStop(0, accent);
            grad.addColorStop(1, accentHover);
            ctx.fillStyle = grad;
            ctx.shadowColor = accentGlow;
            ctx.shadowBlur = glowBlur;
          } else {
            ctx.fillStyle = '#262626';
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
          }

          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, h, barWidth / 2);
          ctx.fill();
        }
      }

      // 3. ORBIT Style (Orbiting harmonic particles)
      else if (effectiveVisualizerStyle === 'ORBIT') {
        const cx = width / 2;
        const cy = height / 2;
        const particleCount = 12;

        for (let i = 0; i < particleCount; i++) {
          const angle = phase * 1.5 + (i * Math.PI * 2) / particleCount;
          const radiusX = 45 + (isPlaying ? smoothedEnergy * 25 : 0) + Math.sin(phase + i) * 6;
          const radiusY = 10 + (isPlaying ? smoothedEnergy * 4 : 0);
          const px = cx + Math.cos(angle) * radiusX;
          const py = cy + Math.sin(angle) * radiusY;
          const pSize = isPlaying ? 1.5 + (i % 2 === 0 ? 1 : 0.4) : 1.2;

          ctx.fillStyle = isPlaying ? accent : '#333333';
          ctx.shadowColor = isPlaying ? accentGlow : 'transparent';
          ctx.shadowBlur = isPlaying ? glowBlur : 0;
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. RINGS Style (Concentric Audio-Reactive Ellipses/Rings)
      else if (effectiveVisualizerStyle === 'RINGS') {
        const cx = width / 2;
        const cy = height / 2;
        const ringCount = 3;

        for (let r = 0; r < ringCount; r++) {
          const ringPhase = (phase * 0.8 + r * 0.33) % 1;
          const rx = 18 + ringPhase * 60 * (isPlaying ? 1 + smoothedEnergy * 0.8 : 0.6);
          const ry = 4 + ringPhase * 11 * (isPlaying ? 1 + smoothedEnergy * 0.8 : 0.6);
          const alpha = isPlaying ? Math.max(0, (1 - ringPhase) * 0.8) : 0.2;

          ctx.strokeStyle = isPlaying ? accent : '#2b2b2b';
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 1.3;
          ctx.shadowColor = isPlaying ? accentGlow : 'transparent';
          ctx.shadowBlur = isPlaying ? glowBlur : 0;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // 5. MINIMAL Style (Clean quiet single line)
      else if (effectiveVisualizerStyle === 'MINIMAL') {
        const cx = width / 2;
        const cy = height / 2;
        const lineLength = isPlaying ? 40 + smoothedEnergy * 50 : 28;

        ctx.strokeStyle = isPlaying ? accent : '#262626';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = isPlaying ? accentGlow : 'transparent';
        ctx.shadowBlur = isPlaying ? glowBlur : 0;
        ctx.beginPath();
        ctx.moveTo(cx - lineLength / 2, cy);
        ctx.lineTo(cx + lineLength / 2, cy);
        ctx.stroke();

        if (isPlaying) {
          ctx.fillStyle = accent;
          ctx.beginPath();
          ctx.arc(cx, cy, 2, 0, Math.PI * 2);
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
    };
  }, [isPlaying, effectiveVisualizerStyle, settings.glowIntensity]);

  return (
    <div className="w-full flex items-center justify-center my-2 h-8 select-none pointer-events-none">
      <canvas
        ref={canvasRef}
        style={{ width: 180, height: 32 }}
        className="block"
      />
    </div>
  );
};
