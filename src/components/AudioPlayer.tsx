import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Square, 
  Volume2, 
  VolumeX, 
  Volume1, 
  AlertCircle 
} from 'lucide-react';
import { audioService, PlaybackStatus } from '../services/audioService';
import { STAGES } from '../types/game';
import { TimeProgressBar } from './TimeProgressBar';
import { WaveformVisualizer } from './WaveformVisualizer';

interface AudioPlayerProps {
  previewUrl: string;
  previewStart?: number;
  currentStage: number;
  disabled?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  previewUrl,
  previewStart = 0,
  currentStage,
  disabled = false,
}) => {
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>({
    state: 'idle',
    currentTime: 0,
    duration: STAGES[currentStage] || 0.5,
    progress: 0,
    volume: audioService.getVolume(),
    isMuted: audioService.getIsMuted(),
  });

  const duration = STAGES[currentStage] || 0.5;

  useEffect(() => {
    const unsubscribe = audioService.subscribe((status) => {
      setPlaybackStatus(status);
    });

    if (previewUrl) {
      audioService.preloadAudio(previewUrl).catch((err) => {
        console.warn('Audio preload notice:', err);
      });
    }

    return () => {
      audioService.stop();
      unsubscribe();
    };
  }, [previewUrl]);

  const handlePlayToggle = () => {
    if (disabled || !previewUrl) return;

    if (playbackStatus.state === 'playing') {
      audioService.stop();
    } else {
      audioService.playSnippet(previewUrl, previewStart, duration);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    audioService.setVolume(newVol);
  };

  const handleMuteToggle = () => {
    audioService.toggleMute();
  };

  const isPlaying = playbackStatus.state === 'playing';

  const VolumeIcon = playbackStatus.isMuted || playbackStatus.volume === 0
    ? VolumeX
    : playbackStatus.volume < 0.5
    ? Volume1
    : Volume2;

  const currentVolume = playbackStatus.isMuted ? 0 : playbackStatus.volume;

  return (
    <div id="audio-player-section" className="w-full flex flex-col items-center select-none py-2">
      {/* 1. Clean Time Progression */}
      <TimeProgressBar
        currentStage={currentStage}
        playbackProgress={playbackStatus.progress}
        isPlaying={isPlaying}
      />

      {/* 2. Large Central Play Button */}
      <div className="relative mt-8 mb-3 flex flex-col items-center">
        {/* Very subtle pulse when playing */}
        {isPlaying && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0.4 }}
            animate={{ scale: 1.18, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeOut' }}
            className="absolute -inset-2 rounded-full pointer-events-none theme-transition"
            style={{ backgroundColor: 'var(--accent-glow)' }}
          />
        )}

        <motion.button
          id="play-snippet-btn"
          type="button"
          onClick={handlePlayToggle}
          disabled={disabled || !previewUrl}
          whileHover={{ scale: disabled ? 1 : 1.04 }}
          whileTap={{ scale: disabled ? 1 : 0.96 }}
          className={`relative z-10 w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed theme-transition ${
            isPlaying
              ? 'bg-neutral-900 border shadow-lg'
              : 'shadow-lg'
          }`}
          style={{
            borderColor: isPlaying ? 'var(--accent)' : undefined,
            color: isPlaying ? 'var(--accent)' : 'var(--accent-text-color)',
            backgroundColor: isPlaying ? undefined : 'var(--accent)',
            boxShadow: isPlaying ? '0 0 20px var(--accent-glow)' : '0 8px 24px var(--accent-glow)',
          }}
          aria-label={isPlaying ? 'Stop' : `Play snippet`}
        >
          {isPlaying ? (
            <Square className="w-7 h-7 fill-current" />
          ) : (
            <Play className="w-8 h-8 fill-current ml-1" />
          )}
        </motion.button>
      </div>

      {/* 3. Smooth Minimal Waveform Visualizer */}
      <WaveformVisualizer isPlaying={isPlaying} />

      {/* 4. Minimalist Volume Slider */}
      <div
        id="volume-control-container"
        className="flex items-center gap-2.5 mt-2 text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        <button
          id="mute-toggle-btn"
          type="button"
          onClick={handleMuteToggle}
          className="focus:outline-none hover:text-white transition-colors"
          aria-label={playbackStatus.isMuted ? 'Unmute' : 'Mute'}
        >
          <VolumeIcon className="w-4 h-4" />
        </button>

        {/* Custom styled thin slider */}
        <div className="relative flex items-center w-24 sm:w-28 h-4">
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={currentVolume}
            onChange={handleVolumeChange}
            className="w-full h-1 bg-neutral-800 rounded-full appearance-none cursor-pointer focus:outline-none theme-transition"
            style={{
              background: `linear-gradient(to right, var(--accent) ${currentVolume * 100}%, #262626 ${currentVolume * 100}%)`,
            }}
            aria-label="Volume"
          />
        </div>
      </div>

      {/* Audio Error Banner if any */}
      <AnimatePresence>
        {playbackStatus.error && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-3 flex items-center gap-2 text-xs text-rose-400 bg-rose-950/30 px-3 py-2 rounded-xl"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{playbackStatus.error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
