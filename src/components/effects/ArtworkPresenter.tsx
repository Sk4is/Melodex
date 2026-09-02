import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Music, Play, Square, Disc3 } from 'lucide-react';
import { AlbumArtStyle } from '../../types/visuals';

interface ArtworkPresenterProps {
  artworkUrl?: string;
  title: string;
  artist: string;
  style: AlbumArtStyle;
  isPlaying: boolean;
  isWon: boolean;
  reducedMotion?: boolean;
  glowMultiplier?: number;
  artworkAmbience?: boolean;
  onTogglePlay: () => void;
  size?: 'normal' | 'preview';
}

export const ArtworkPresenter: React.FC<ArtworkPresenterProps> = ({
  artworkUrl,
  title,
  artist,
  style,
  isPlaying,
  isWon,
  reducedMotion = false,
  glowMultiplier = 1,
  artworkAmbience = true,
  onTogglePlay,
  size = 'normal',
}) => {
  const isPreview = size === 'preview';
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, mouseX: 50, mouseY: 50 });

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion || isPreview || (style !== 'FLOAT' && style !== 'HOLOGRAPHIC')) {
        return;
      }
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / rect.width; // 0 to 1
      const y = (e.clientY - rect.top) / rect.height; // 0 to 1

      // Subtle 3D tilt angles (-7 to +7 degrees)
      const rotateY = (x - 0.5) * 12;
      const rotateX = (0.5 - y) * 12;

      setTilt({
        x: rotateX,
        y: rotateY,
        mouseX: Math.round(x * 100),
        mouseY: Math.round(y * 100),
      });
    },
    [reducedMotion, isPreview, style]
  );

  const handlePointerLeave = useCallback(() => {
    setTilt({ x: 0, y: 0, mouseX: 50, mouseY: 50 });
  }, []);

  const isVinyl = style === 'VINYL';
  const isGlow = style === 'GLOW' || artworkAmbience;
  const isFloat = style === 'FLOAT' && !reducedMotion;
  const isHolo = style === 'HOLOGRAPHIC';

  const boxDimClass = isPreview
    ? 'w-24 h-24 sm:w-28 sm:h-28'
    : 'w-44 h-44 sm:w-56 sm:h-56';

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative flex items-center justify-center select-none ${
        isVinyl && !isPreview ? 'pr-4 sm:pr-8' : ''
      }`}
      style={{ perspective: 900 }}
    >
      {/* 1. GLOW MODE & AMBIENCE: Soft Blurred Ambient Backlight */}
      {isGlow && artworkUrl && (
        <div
          className={`absolute -inset-4 rounded-3xl opacity-40 filter blur-2xl scale-95 pointer-events-none transition-all duration-700 theme-transition ${
            isPlaying && !reducedMotion ? 'animate-pulse' : ''
          }`}
          style={{
            backgroundImage: `url(${artworkUrl})`,
            backgroundSize: 'cover',
            filter: `blur(${isPreview ? '12px' : '26px'}) saturate(1.4)`,
          }}
        />
      )}

      {/* 2. VINYL MODE: Realistic Protruding Rotating Vinyl Record */}
      {isVinyl && (
        <motion.div
          initial={{ x: 0, rotate: 0, opacity: 0 }}
          animate={{
            x: isPreview ? 14 : isWon ? 32 : 24,
            opacity: 1,
            rotate: isPlaying && !reducedMotion ? 360 : 18,
          }}
          transition={{
            x: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
            rotate: isPlaying && !reducedMotion
              ? { repeat: Infinity, duration: 6, ease: 'linear' }
              : { duration: 0.5 },
          }}
          className={`absolute right-0 rounded-full border-2 sm:border-4 border-[#1f1f24] shadow-2xl flex items-center justify-center -z-10 pointer-events-none ${
            isPreview ? 'w-22 h-22' : 'w-40 h-40 sm:w-52 sm:h-52'
          }`}
          style={{
            background:
              'radial-gradient(circle, #2a2a32 12%, #101013 13%, #1b1b22 25%, #0e0e12 38%, #191922 55%, #0b0b0e 72%)',
            boxShadow: '0 8px 28px rgba(0,0,0,0.85)',
          }}
        >
          {/* Vinyl Center Grooves & Label */}
          <div
            className={`rounded-full flex items-center justify-center shadow-inner theme-transition ${
              isPreview ? 'w-8 h-8' : 'w-14 h-14 sm:w-16 sm:h-16'
            }`}
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-text-color)',
            }}
          >
            <Disc3 className={`${isPreview ? 'w-4 h-4' : 'w-6 h-6'} opacity-90`} />
          </div>
        </motion.div>
      )}

      {/* 3. Main Artwork Card with Floating, Tilt, and Holographic capabilities */}
      <motion.div
        animate={{
          y: isFloat ? [0, -6, 0] : 0,
          rotateX: isFloat || isHolo ? tilt.x : 0,
          rotateY: isFloat || isHolo ? tilt.y : 0,
        }}
        transition={{
          y: isFloat
            ? { repeat: Infinity, duration: 4.0, ease: 'easeInOut' }
            : undefined,
          rotateX: { duration: 0.12, ease: 'easeOut' },
          rotateY: { duration: 0.12, ease: 'easeOut' },
        }}
        onClick={onTogglePlay}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onTogglePlay();
          }
        }}
        aria-label={isPlaying ? 'Pause song preview' : 'Play song preview'}
        className={`relative group cursor-pointer overflow-hidden rounded-3xl transition-shadow duration-300 ${boxDimClass}`}
        style={{
          boxShadow:
            isPlaying || isWon
              ? `0 12px ${Math.round(36 * glowMultiplier)}px var(--accent-glow), 0 4px 18px rgba(0,0,0,0.6)`
              : '0 10px 30px rgba(0,0,0,0.8)',
          border: isWon ? '1px solid var(--accent-soft)' : '1px solid rgba(255,255,255,0.08)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Album Artwork Image */}
        {artworkUrl ? (
          <img
            src={artworkUrl}
            alt={`${title} by ${artist}`}
            className="w-full h-full object-cover rounded-3xl"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full rounded-3xl bg-neutral-900 flex items-center justify-center text-neutral-600">
            <Music className={isPreview ? 'w-8 h-8' : 'w-16 h-16'} />
          </div>
        )}

        {/* 4. HOLOGRAPHIC SPECULAR SHEEN OVERLAY */}
        {isHolo && (
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none mix-blend-color-dodge transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${tilt.mouseX}% ${tilt.mouseY}%, rgba(255,255,255,0.45) 0%, rgba(120,200,255,0.2) 25%, rgba(255,150,220,0.15) 50%, transparent 75%)`,
              opacity: 0.85,
            }}
          />
        )}

        {/* Holographic Ambient Sheen for mobile/default */}
        {isHolo && !reducedMotion && (
          <motion.div
            initial={{ x: '-150%', opacity: 0.3 }}
            animate={{ x: '150%', opacity: [0.1, 0.4, 0.1] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: 'linear' }}
            className="absolute inset-0 w-3/4 -skew-x-20 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none mix-blend-overlay"
          />
        )}

        {/* Subtle Play/Pause Overlay on Hover */}
        <div
          className={`absolute inset-0 rounded-3xl bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-all duration-200 ${
            isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus:opacity-100'
          }`}
        >
          <div
            className={`rounded-full flex items-center justify-center shadow-xl theme-transition ${
              isPreview ? 'w-9 h-9' : 'w-13 h-13 sm:w-14 sm:h-14'
            }`}
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-text-color)',
            }}
          >
            {isPlaying ? (
              <Square className={`${isPreview ? 'w-3.5 h-3.5' : 'w-5 h-5'} fill-current`} />
            ) : (
              <Play className={`${isPreview ? 'w-4 h-4 ml-0.5' : 'w-6 h-6 ml-0.5'} fill-current`} />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
