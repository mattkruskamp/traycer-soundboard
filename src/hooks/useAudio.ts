import { useState } from "react";

interface AudioState {
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  volume: number;
  muted: boolean;
  contextState: AudioContextState;
}

// Module-scoped singletons
let audioContext: AudioContext | null = null;
const bufferCache: Map<string, AudioBuffer> = new Map();
let currentSource: AudioBufferSourceNode | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Safari-compatible decodeAudioData
function decodeAudioDataCompat(
  ctx: AudioContext,
  arrayBuffer: ArrayBuffer
): Promise<AudioBuffer> {
  // Safari only supports callback form
  return new Promise((resolve, reject) => {
    try {
      const decode = ctx.decodeAudioData as any;
      if (decode.length === 2) {
        // callback form
        decode.call(ctx, arrayBuffer, resolve, reject);
      } else {
        // promise form
        decode.call(ctx, arrayBuffer).then(resolve, reject);
      }
    } catch (err) {
      reject(err);
    }
  });
}

export function useAudio() {
  const [audioState, setAudioState] = useState<AudioState>({
    loading: {},
    error: {},
    volume: 1,
    muted: false,
    contextState: getAudioContext().state,
  });

  // Volume control
  const setVolume = (v: number) => {
    setAudioState((s) => ({
      ...s,
      volume: Math.max(0, Math.min(1, v)),
      muted: v === 0 ? true : s.muted,
    }));
  };
  const setMuted = (m: boolean) => {
    setAudioState((s) => ({ ...s, muted: m }));
  };

  // Preload function
  const preload = async (filePath: string) => {
    if (bufferCache.get(filePath)) return;
    setAudioState((s) => ({
      ...s,
      loading: { ...s.loading, [filePath]: true },
      error: { ...s.error, [filePath]: null },
    }));
    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error("Failed to fetch audio file");
      const arrayBuffer = await response.arrayBuffer();
      const ctx = getAudioContext();
      if (ctx.state === "suspended") await ctx.resume();
      const buffer = await decodeAudioDataCompat(ctx, arrayBuffer);
      bufferCache.set(filePath, buffer);
      setAudioState((s) => ({
        ...s,
        loading: { ...s.loading, [filePath]: false },
      }));
    } catch (err: any) {
      setAudioState((s) => ({
        ...s,
        loading: { ...s.loading, [filePath]: false },
        error: { ...s.error, [filePath]: err.message || "Preload error" },
      }));
    }
  };

  // Play sound function
  const playSound = async (filePath: string) => {
    let buffer = bufferCache.get(filePath);
    if (!buffer) {
      setAudioState((s) => ({
        ...s,
        loading: { ...s.loading, [filePath]: true },
        error: { ...s.error, [filePath]: null },
      }));
      try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error("Failed to fetch audio file");
        const arrayBuffer = await response.arrayBuffer();
        const ctx = getAudioContext();
        if (ctx.state === "suspended") await ctx.resume();
        buffer = await decodeAudioDataCompat(ctx, arrayBuffer);
        bufferCache.set(filePath, buffer);
      } catch (err: any) {
        setAudioState((s) => ({
          ...s,
          loading: { ...s.loading, [filePath]: false },
          error: {
            ...s.error,
            [filePath]: err.message || "Audio playback error",
          },
        }));
        return;
      }
      setAudioState((s) => ({
        ...s,
        loading: { ...s.loading, [filePath]: false },
      }));
    } else {
      setAudioState((s) => ({
        ...s,
        loading: { ...s.loading, [filePath]: false },
        error: { ...s.error, [filePath]: null },
      }));
    }
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") await ctx.resume();
      // Stop previous sound
      if (currentSource) {
        try {
          currentSource.stop();
        } catch {}
        currentSource.disconnect();
      }
      // Create gain node for volume
      const gainNode = ctx.createGain();
      gainNode.gain.value = audioState.muted ? 0 : audioState.volume;
      gainNode.connect(ctx.destination);
      // Fade in
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        audioState.muted ? 0 : audioState.volume,
        ctx.currentTime + 0.2
      );
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(gainNode);
      source.start(0);
      currentSource = source;
      // Fade out at end
      const duration = buffer.duration;
      gainNode.gain.linearRampToValueAtTime(
        0,
        ctx.currentTime + duration - 0.2
      );
      source.onended = () => {
        gainNode.disconnect();
        currentSource = null;
      };
    } catch (err: any) {
      setAudioState((s) => ({
        ...s,
        error: {
          ...s.error,
          [filePath]: err.message || "Audio playback error",
        },
      }));
    }
  };

  // Preview sound (play first 2 seconds)
  const previewSound = async (filePath: string) => {
    let buffer = bufferCache.get(filePath);
    if (!buffer) await preload(filePath);
    buffer = bufferCache.get(filePath);
    if (!buffer) return;
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") await ctx.resume();
      // Stop previous sound
      if (currentSource) {
        try {
          currentSource.stop();
        } catch {}
        currentSource.disconnect();
      }
      const gainNode = ctx.createGain();
      gainNode.gain.value = audioState.muted ? 0 : audioState.volume;
      gainNode.connect(ctx.destination);
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        audioState.muted ? 0 : audioState.volume,
        ctx.currentTime + 0.2
      );
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(gainNode);
      source.start(0);
      currentSource = source;
      // Fade out after 2 seconds
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.8);
      setTimeout(() => {
        try {
          source.stop();
        } catch {}
        gainNode.disconnect();
        currentSource = null;
      }, 2000);
    } catch {}
  };

  // Stop current sound
  const stopSound = () => {
    if (currentSource) {
      try {
        currentSource.stop();
      } catch {}
      currentSource.disconnect();
      currentSource = null;
    }
  };

  // Get sound duration
  const getDuration = (filePath: string): number | null => {
    const buffer = bufferCache.get(filePath);
    return buffer ? buffer.duration : null;
  };

  // Context state
  const updateContextState = () => {
    setAudioState((s) => ({ ...s, contextState: getAudioContext().state }));
  };

  return {
    playSound,
    previewSound,
    preload,
    stopSound,
    setVolume,
    setMuted,
    getDuration,
    loading: audioState.loading,
    error: audioState.error,
    volume: audioState.volume,
    muted: audioState.muted,
    contextState: audioState.contextState,
    updateContextState,
  };
}
