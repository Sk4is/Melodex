import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface StreakIndicatorProps {
  streak: number;
  isBroken?: boolean;
  onBreakComplete?: () => void;
  reducedMotion?: boolean;
  glowMultiplier?: number;
  className?: string;
}

// Minimalist custom SVG Flame with dual-tone core
const FlameIcon: React.FC<{
  tier: number;
  isBroken: boolean;
  reducedMotion: boolean;
}> = ({ tier, isBroken, reducedMotion }) => {
  // Flame animation intensity based on tier
  const isHighEnergy = tier >= 4;
  const isMidEnergy = tier >= 2;

  return (
    <div className="relative w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center flex-shrink-0">
      {/* Background glow halo for high streaks */}
      {tier >= 3 && !isBroken && !reducedMotion && (
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.35, 0.6, 0.35],
          }}
          transition={{
            repeat: Infinity,
            duration: tier >= 5 ? 1.2 : 1.8,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full blur-[3px] pointer-events-none"
          style={{ backgroundColor: 'var(--accent)' }}
        />
      )}

      <motion.svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 transition-transform duration-300"
        animate={
          isBroken
            ? { scale: 0.7, opacity: 0.3, y: 1 }
            : reducedMotion
            ? { scale: 1, opacity: 1 }
            : isHighEnergy
            ? {
                scale: [1, 1.12, 0.96, 1],
                rotate: [-1.5, 2, -1, 1.5, 0],
                y: [0, -0.6, 0.4, 0],
              }
            : isMidEnergy
            ? {
                scale: [1, 1.06, 0.98, 1],
                rotate: [-1, 1, -0.5, 0],
              }
            : { scale: 1 }
        }
        transition={
          reducedMotion || isBroken
            ? { duration: 0.3 }
            : {
                repeat: Infinity,
                duration: isHighEnergy ? 1.3 : 2.2,
                ease: 'easeInOut',
              }
        }
      >
        {/* Outer Flame body - inherits current decade accent */}
        <path
          d="M12 2.5C10.6 4.8 9.2 6.8 9.2 9.2C9.2 9.9 9.4 10.6 9.7 11.2C8.5 10.4 7.7 8.9 7.7 7.2C5.3 9.7 4.3 13.1 5.7 16.5C7 19.4 9.8 21.3 12.8 21.3C16.8 21.3 20 18 20 14C20 9.2 15.8 5.8 12 2.5Z"
          fill="currentColor"
          className="theme-transition"
          style={{
            color: isBroken ? '#737373' : 'var(--accent)',
          }}
        />
        {/* Inner Heart/Core - warm bright center */}
        {!isBroken && (
          <path
            d="M12.4 13.8C11.4 13.8 10.2 14.6 10.2 16C10.2 17.3 11.2 18.3 12.5 18.3C13.8 18.3 14.8 17.2 14.8 15.8C14.8 14.3 13.4 13.8 12.4 13.8Z"
            fill="#ffffff"
            fillOpacity={tier >= 3 ? 0.95 : 0.75}
          />
        )}
      </motion.svg>
    </div>
  );
};

// Lightweight ambient sparks for tiers x3+
const StreakSparks: React.FC<{ tier: number; reducedMotion: boolean }> = ({
  tier,
  reducedMotion,
}) => {
  if (reducedMotion || tier < 2) return null;

  const sparkCount = tier >= 5 ? 4 : tier >= 4 ? 3 : tier >= 3 ? 2 : 1;
  const sparks = [
    { id: 1, left: '15%', delay: 0, duration: 1.8, xDelta: -4 },
    { id: 2, left: '82%', delay: 0.6, duration: 2.1, xDelta: 5 },
    { id: 3, left: '38%', delay: 1.1, duration: 1.9, xDelta: -3 },
    { id: 4, left: '65%', delay: 1.5, duration: 2.4, xDelta: 4 },
  ].slice(0, sparkCount);

  return (
    <div className="absolute -inset-2 pointer-events-none overflow-visible">
      {sparks.map((spark) => (
        <motion.span
          key={spark.id}
          className="absolute w-1 h-1 rounded-full theme-transition"
          style={{
            left: spark.left,
            bottom: '10%',
            backgroundColor: 'var(--accent)',
            boxShadow: '0 0 6px var(--accent)',
          }}
          animate={{
            y: [0, -18, -26],
            x: [0, spark.xDelta, spark.xDelta * 1.5],
            opacity: [0, 0.85, 0],
            scale: [0.6, 1.1, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: spark.duration,
            delay: spark.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({
  streak,
  isBroken = false,
  onBreakComplete,
  reducedMotion = false,
  glowMultiplier = 1,
  className = '',
}) => {
  const [pulseKey, setPulseKey] = useState(0);
  const [isMilestone, setIsMilestone] = useState(false);
  const prevStreakRef = useRef(streak);

  // Determine current progression tier
  // x1-x2: tier 1 (subtle)
  // x3-x4: tier 2 (slight energy)
  // x5-x7: tier 3 (noticeable)
  // x8-x9: tier 4 (impressive)
  // x10+: tier 5 (high energy)
  const tier =
    streak >= 10 ? 5 : streak >= 8 ? 4 : streak >= 5 ? 3 : streak >= 3 ? 2 : 1;

  // Progressive internal energy fill percentage (10% at x1, 50% at x5, 100% at x10+)
  const energyFillPct = Math.min(Math.max(streak * 10, 10), 100);

  // Trigger pulse animations on streak increment
  useEffect(() => {
    if (streak > prevStreakRef.current && streak > 0) {
      const isNewMilestone = streak % 5 === 0;
      setIsMilestone(isNewMilestone);
      setPulseKey((k) => k + 1);

      const timer = setTimeout(
        () => {
          setIsMilestone(false);
        },
        isNewMilestone ? 500 : 350
      );
      return () => clearTimeout(timer);
    }
    prevStreakRef.current = streak;
  }, [streak]);

  // Handle streak break dissolution timing (~500ms)
  useEffect(() => {
    if (isBroken) {
      const timer = setTimeout(() => {
        if (onBreakComplete) {
          onBreakComplete();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isBroken, onBreakComplete]);

  // Do not display if streak is 0 and not breaking
  if (streak === 0 && !isBroken) {
    return null;
  }

  // Dynamic glow styling based on tier and user settings
  const hasGlow = glowMultiplier > 0;
  const glowShadow = !hasGlow || isBroken
    ? undefined
    : tier >= 5
    ? `0 0 ${Math.round(24 * glowMultiplier)}px var(--accent-glow), 0 0 ${Math.round(8 * glowMultiplier)}px var(--accent-soft)`
    : tier >= 4
    ? `0 0 ${Math.round(20 * glowMultiplier)}px var(--accent-glow)`
    : tier >= 3
    ? `0 0 ${Math.round(16 * glowMultiplier)}px var(--accent-glow)`
    : tier >= 2
    ? `0 0 ${Math.round(12 * glowMultiplier)}px var(--accent-soft)`
    : `0 0 ${Math.round(8 * glowMultiplier)}px var(--accent-soft)`;

  return (
    <div
      id="streak-indicator-container"
      className={`w-full flex items-center justify-center pointer-events-none select-none my-1 sm:my-1.5 ${className}`}
      aria-label={isBroken ? 'Streak lost' : `Streak: ${streak} songs`}
      role="status"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isBroken ? 'streak-broken' : 'streak-active'}
          initial={
            reducedMotion
              ? { opacity: 0 }
              : { opacity: 0, y: -4, scale: 0.94 }
          }
          animate={
            isBroken
              ? {
                  opacity: [1, 0.7, 0],
                  scale: [1, 0.98, 0.92],
                  filter: 'grayscale(100%) brightness(0.7)',
                }
              : reducedMotion
              ? { opacity: 1, scale: 1, y: 0 }
              : isMilestone
              ? {
                  opacity: 1,
                  y: 0,
                  scale: [1, 1.08, 1],
                  filter: ['brightness(1)', 'brightness(1.35)', 'brightness(1)'],
                }
              : pulseKey > 0
              ? {
                  opacity: 1,
                  y: 0,
                  scale: [1, 1.04, 1],
                  filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'],
                }
              : {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: 'brightness(1)',
                }
          }
          exit={{
            opacity: 0,
            scale: 0.92,
            y: 4,
            transition: { duration: 0.3, ease: 'easeIn' },
          }}
          transition={{
            duration: isBroken ? 0.5 : isMilestone ? 0.45 : 0.35,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.2 rounded-full border backdrop-blur-md overflow-hidden theme-transition"
          style={{
            backgroundColor: isBroken
              ? 'rgba(23, 23, 23, 0.8)'
              : 'rgba(10, 10, 12, 0.85)',
            borderColor: isBroken
              ? 'rgba(255, 255, 255, 0.08)'
              : tier >= 4
              ? 'var(--accent)'
              : tier >= 2
              ? 'rgba(var(--accent-rgb), 0.4)'
              : 'rgba(var(--accent-rgb), 0.22)',
            boxShadow: glowShadow,
          }}
        >
          {/* Subtle Ambient Glowing Backdrop Fill (scales with energy) */}
          {!isBroken && (
            <div
              className="absolute inset-0 pointer-events-none rounded-full transition-opacity duration-500 theme-transition"
              style={{
                background:
                  'radial-gradient(ellipse at center, var(--accent-soft) 0%, transparent 80%)',
                opacity: Math.min(0.12 + tier * 0.08, 0.5),
              }}
            />
          )}

          {/* Tier 5+ Moving Shimmer Wave */}
          {tier >= 5 && !isBroken && !reducedMotion && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, var(--accent-soft) 50%, transparent 100%)',
              }}
              animate={{ x: ['-120%', '220%'] }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: 'easeInOut',
                repeatDelay: 1.5,
              }}
            />
          )}

          {/* Sparks / Particle Emitter */}
          <StreakSparks tier={tier} reducedMotion={reducedMotion} />

          {/* Flame Icon */}
          <FlameIcon
            tier={tier}
            isBroken={isBroken}
            reducedMotion={reducedMotion}
          />

          {/* Streak Label & Number */}
          <div className="relative z-10 flex items-center gap-1 text-[11px] sm:text-xs font-bold tracking-wider uppercase theme-transition">
            {isBroken ? (
              <span className="text-neutral-400 font-medium tracking-widest text-[10px] sm:text-[11px]">
                STREAK LOST
              </span>
            ) : (
              <>
                <span className="text-neutral-300 font-semibold">
                  STREAK
                </span>
                <div className="relative inline-flex items-center overflow-visible">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={streak}
                      initial={
                        reducedMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: -4, scale: 0.82 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={
                        reducedMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: 4, scale: 0.82 }
                      }
                      transition={{
                        duration: 0.32,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="font-black theme-transition"
                      style={{
                        color: 'var(--accent)',
                        textShadow:
                          hasGlow && tier >= 2
                            ? '0 0 8px var(--accent-glow)'
                            : undefined,
                      }}
                    >
                      x{streak}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Progressive Hairline Energy Fill at Bottom */}
          {!isBroken && (
            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-neutral-800/50 overflow-hidden pointer-events-none">
              <motion.div
                className="h-full rounded-full theme-transition"
                style={{
                  backgroundColor: 'var(--accent)',
                  boxShadow: '0 0 6px var(--accent)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${energyFillPct}%` }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
