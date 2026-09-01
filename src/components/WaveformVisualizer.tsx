import React, { useEffect, useRef } from 'react';
import { audioService } from '../services/audioService';

interface WaveformVisualizerProps {
  isPlaying: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 220;
    const height = 32;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const BAR_COUNT = 24;
    const barWidth = 3.5;
    const barGap = (width - BAR_COUNT * barWidth) / (BAR_COUNT - 1);
    const heights = new Array(BAR_COUNT).fill(2);
    const targetHeights = new Array(BAR_COUNT).fill(2);
    const freqArray = new Uint8Array(64);

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (isPlaying) {
        audioService.getFrequencyData(freqArray);
        phase += 0.12;

        for (let i = 0; i < BAR_COUNT; i++) {
          // Sample frequency bins across spectrum with emphasis on bass & mid
          const binIndex = Math.min(
            freqArray.length - 1,
            Math.floor((i / BAR_COUNT) * 28)
          );
          const rawValue = freqArray[binIndex] || 0;
          const normalized = rawValue / 255;

          // Add a subtle harmonic wave for smooth organic motion
          const wave = Math.sin(phase + i * 0.45) * 0.15 + 0.15;
          const combined = Math.max(0.08, normalized * 0.85 + wave);
          targetHeights[i] = Math.max(3, combined * (height - 4));
        }
      } else {
        // Return smoothly to idle state
        for (let i = 0; i < BAR_COUNT; i++) {
          targetHeights[i] = 2.5;
        }
      }

      // Smooth interpolation
      for (let i = 0; i < BAR_COUNT; i++) {
        heights[i] += (targetHeights[i] - heights[i]) * 0.22;

        const h = heights[i];
        const x = i * (barWidth + barGap);
        const y = (height - h) / 2;

        // Gradient for bars based on category accent
        if (isPlaying) {
          const computedStyle = getComputedStyle(canvas);
          const accent = computedStyle.getPropertyValue('--accent').trim() || '#22C55E';
          const accentGlow = computedStyle.getPropertyValue('--accent-glow').trim() || 'rgba(34, 197, 94, 0.4)';
          const accentHover = computedStyle.getPropertyValue('--accent-hover').trim() || '#16a34a';

          const grad = ctx.createLinearGradient(0, y, 0, y + h);
          grad.addColorStop(0, accent);
          grad.addColorStop(1, accentHover);
          ctx.fillStyle = grad;
          ctx.shadowColor = accentGlow;
          ctx.shadowBlur = 5;
        } else {
          ctx.fillStyle = '#262626'; // Dark neutral
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }

        // Draw rounded pill bar
        ctx.beginPath();
        const r = barWidth / 2;
        ctx.roundRect(x, y, barWidth, h, r);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="w-full flex items-center justify-center my-2 h-7 select-none pointer-events-none">
      <canvas
        ref={canvasRef}
        style={{ width: 160, height: 28 }}
        className="block"
      />
    </div>
  );
};
