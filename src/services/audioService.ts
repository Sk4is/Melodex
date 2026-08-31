export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface PlaybackStatus {
  state: PlaybackState;
  currentTime: number;
  duration: number;
  progress: number; // 0 to 1
  volume: number; // 0 to 1
  isMuted: boolean;
  error?: string;
}

export type PlaybackListener = (status: PlaybackStatus) => void;

const VOLUME_STORAGE_KEY = 'melodex_volume';
const MUTED_STORAGE_KEY = 'melodex_muted';

class AudioService {
  private audioCtx: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private currentSourceNode: AudioBufferSourceNode | null = null;
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private loadPromises: Map<string, Promise<AudioBuffer>> = new Map();

  // HTMLAudio fallback
  private fallbackAudio: HTMLAudioElement | null = null;
  private fallbackTimer: number | null = null;

  private isPlaying = false;
  private currentUrl = '';
  private currentStartTime = 0;
  private currentDuration = 0;
  private snippetStartAudioTime = 0;
  private rafId: number | null = null;

  private volume = 0.8;
  private isMuted = false;

  private listeners: Set<PlaybackListener> = new Set();
  private freqDataArray: Uint8Array = new Uint8Array(64);

  constructor() {
    this.loadSavedVolume();
  }

  private loadSavedVolume() {
    try {
      const savedVol = localStorage.getItem(VOLUME_STORAGE_KEY);
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.volume = parsed;
        }
      }
      const savedMuted = localStorage.getItem(MUTED_STORAGE_KEY);
      if (savedMuted !== null) {
        this.isMuted = savedMuted === 'true';
      }
    } catch {
      // Storage access may fail in restricted mode
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      
      this.masterGainNode = this.audioCtx.createGain();
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 128;
      this.analyserNode.smoothingTimeConstant = 0.82;
      this.freqDataArray = new Uint8Array(this.analyserNode.frequencyBinCount);

      this.updateMasterGain();
      
      this.analyserNode.connect(this.masterGainNode);
      this.masterGainNode.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch((err) => {
        console.warn('AudioContext auto-resume error:', err);
      });
    }
    return this.audioCtx;
  }

  private updateMasterGain() {
    const effectiveGain = this.isMuted ? 0 : this.volume;
    if (this.masterGainNode && this.audioCtx) {
      this.masterGainNode.gain.setValueAtTime(effectiveGain, this.audioCtx.currentTime);
    }
    if (this.fallbackAudio) {
      this.fallbackAudio.volume = effectiveGain;
    }
  }

  public setVolume(newVolume: number) {
    const clamped = Math.max(0, Math.min(1, newVolume));
    this.volume = clamped;
    if (this.isMuted && clamped > 0) {
      this.isMuted = false;
    }
    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, String(clamped));
      localStorage.setItem(MUTED_STORAGE_KEY, String(this.isMuted));
    } catch {
      // Ignore storage errors
    }
    this.updateMasterGain();
    this.emitStatus();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem(MUTED_STORAGE_KEY, String(this.isMuted));
    } catch {
      // Ignore storage errors
    }
    this.updateMasterGain();
    this.emitStatus();
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public subscribe(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    this.emitStatus();
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emitStatus(error?: string): void {
    let progress = 0;
    let elapsed = 0;

    if (this.isPlaying && this.currentDuration > 0) {
      if (this.audioCtx && this.snippetStartAudioTime > 0) {
        elapsed = Math.max(0, this.audioCtx.currentTime - this.snippetStartAudioTime);
      } else if (this.fallbackAudio) {
        elapsed = Math.max(0, this.fallbackAudio.currentTime - this.currentStartTime);
      }
      progress = Math.min(1, Math.max(0, elapsed / this.currentDuration));
    }

    const status: PlaybackStatus = {
      state: error ? 'error' : this.isPlaying ? 'playing' : 'idle',
      currentTime: elapsed,
      duration: this.currentDuration,
      progress,
      volume: this.volume,
      isMuted: this.isMuted,
      error,
    };

    for (const listener of this.listeners) {
      try {
        listener(status);
      } catch (err) {
        console.error('Error in audio state listener:', err);
      }
    }
  }

  /**
   * Pre-fetches and decodes the audio preview into an AudioBuffer
   */
  public async preloadAudio(url: string): Promise<AudioBuffer> {
    if (!url) throw new Error('No audio URL provided');
    if (this.bufferCache.has(url)) {
      return this.bufferCache.get(url)!;
    }

    if (this.loadPromises.has(url)) {
      return this.loadPromises.get(url)!;
    }

    const loadPromise = (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to download audio file: HTTP ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const ctx = this.getAudioContext();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        this.bufferCache.set(url, audioBuffer);
        return audioBuffer;
      } catch (err) {
        this.loadPromises.delete(url);
        throw err;
      }
    })();

    this.loadPromises.set(url, loadPromise);
    return loadPromise;
  }

  /**
   * Plays an exact snippet from startTime with duration using Web Audio API
   */
  public async playSnippet(url: string, startTime = 0, duration = 1): Promise<void> {
    this.stop();

    if (!url) {
      this.emitStatus('No audio preview URL available');
      return;
    }

    this.currentUrl = url;
    this.currentStartTime = Math.max(0, startTime);
    this.currentDuration = Math.max(0.05, duration);

    try {
      const ctx = this.getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      let buffer: AudioBuffer;
      try {
        buffer = await this.preloadAudio(url);
      } catch (decodeErr) {
        console.warn('Web Audio decode failed, falling back to HTMLAudio:', decodeErr);
        this.playSnippetFallback(url, startTime, duration);
        return;
      }

      const validStartTime = Math.min(this.currentStartTime, Math.max(0, buffer.duration - 0.05));
      const validDuration = Math.min(this.currentDuration, buffer.duration - validStartTime);

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      // Click-free fade envelope
      const envGain = ctx.createGain();
      const now = ctx.currentTime;
      envGain.gain.setValueAtTime(0, now);
      envGain.gain.linearRampToValueAtTime(1, now + 0.015);
      envGain.gain.setValueAtTime(1, now + validDuration - 0.02);
      envGain.gain.linearRampToValueAtTime(0, now + validDuration);

      source.connect(envGain);
      
      if (this.analyserNode) {
        envGain.connect(this.analyserNode);
      } else if (this.masterGainNode) {
        envGain.connect(this.masterGainNode);
      } else {
        envGain.connect(ctx.destination);
      }

      this.currentSourceNode = source;
      this.isPlaying = true;
      this.snippetStartAudioTime = ctx.currentTime;

      source.start(now, validStartTime, validDuration);
      source.stop(now + validDuration);

      this.startProgressTracking();
      this.emitStatus();

      source.onended = () => {
        if (this.currentSourceNode === source) {
          this.cleanupPlayback();
        }
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Playback failed';
      console.error('Audio playback error:', err);
      this.cleanupPlayback();
      this.emitStatus(message);
    }
  }

  private playSnippetFallback(url: string, startTime: number, duration: number): void {
    this.cleanupPlayback();

    const audio = new Audio(url);
    this.fallbackAudio = audio;
    this.isPlaying = true;
    this.currentStartTime = startTime;
    this.currentDuration = duration;

    const effectiveGain = this.isMuted ? 0 : this.volume;
    audio.volume = effectiveGain;
    audio.currentTime = startTime;

    audio
      .play()
      .then(() => {
        this.startProgressTracking();
        this.emitStatus();

        this.fallbackTimer = window.setTimeout(() => {
          this.cleanupPlayback();
        }, duration * 1000);
      })
      .catch((err) => {
        console.error('Fallback audio play failed:', err);
        this.cleanupPlayback();
        this.emitStatus('Click Play to allow audio playback.');
      });
  }

  private startProgressTracking(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    const tick = () => {
      if (this.isPlaying) {
        this.emitStatus();
        this.rafId = requestAnimationFrame(tick);
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private cleanupPlayback(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.fallbackTimer) {
      window.clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    if (this.fallbackAudio) {
      this.fallbackAudio.pause();
      this.fallbackAudio.currentTime = 0;
      this.fallbackAudio = null;
    }
    if (this.currentSourceNode) {
      try {
        this.currentSourceNode.disconnect();
      } catch {
        // Safe to ignore
      }
      this.currentSourceNode = null;
    }

    this.isPlaying = false;
    this.snippetStartAudioTime = 0;
    this.emitStatus();
  }

  public stop(): void {
    if (this.currentSourceNode) {
      try {
        this.currentSourceNode.stop();
      } catch {
        // Node might already be stopped
      }
    }
    this.cleanupPlayback();
  }

  /**
   * Get raw frequency data for audio-reactive visuals (0-255 values)
   */
  public getFrequencyData(outputArray?: Uint8Array): Uint8Array {
    if (this.analyserNode && this.isPlaying) {
      const target = outputArray || this.freqDataArray;
      this.analyserNode.getByteFrequencyData(target);
      return target;
    }
    if (outputArray) {
      outputArray.fill(0);
      return outputArray;
    }
    this.freqDataArray.fill(0);
    return this.freqDataArray;
  }

  /**
   * Returns normalized audio energy values (0.0 to 1.0)
   */
  public getAudioEnergy(): { bass: number; mid: number; treble: number; overall: number } {
    if (!this.isPlaying || !this.analyserNode) {
      return { bass: 0, mid: 0, treble: 0, overall: 0 };
    }

    this.analyserNode.getByteFrequencyData(this.freqDataArray);
    const count = this.freqDataArray.length;
    if (count === 0) return { bass: 0, mid: 0, treble: 0, overall: 0 };

    const bassEnd = Math.floor(count * 0.25);
    const midEnd = Math.floor(count * 0.65);

    let bassSum = 0;
    for (let i = 0; i < bassEnd; i++) bassSum += this.freqDataArray[i];
    const bass = bassSum / (bassEnd * 255);

    let midSum = 0;
    for (let i = bassEnd; i < midEnd; i++) midSum += this.freqDataArray[i];
    const mid = midSum / ((midEnd - bassEnd) * 255);

    let trebleSum = 0;
    for (let i = midEnd; i < count; i++) trebleSum += this.freqDataArray[i];
    const treble = trebleSum / ((count - midEnd) * 255);

    const overall = (bass * 0.5 + mid * 0.3 + treble * 0.2);

    return { bass, mid, treble, overall };
  }

  public destroy(): void {
    this.stop();
    this.bufferCache.clear();
    this.loadPromises.clear();
    this.listeners.clear();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioService = new AudioService();
