import React, { useState } from "react";
import SoundButton from "./SoundButton";
import VolumeControl from "./VolumeControl";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import { Sound } from "../types";
import { useKeyboardShortcuts, useAudio } from "../hooks";

const sounds: Sound[] = [
  {
    name: "Sample 1",
    filePath: "/sounds/sample1.mp3",
    keyBinding: "A",
  },
  {
    name: "Sample 2",
    filePath: "/sounds/sample2.mp3",
    keyBinding: "S",
  },
  {
    name: "Sample 3",
    filePath: "/sounds/sample3.mp3",
    keyBinding: "D",
  },
  {
    name: "Sample 4",
    filePath: "/sounds/sample1.mp3",
    keyBinding: "1",
  },
  {
    name: "Sample 5",
    filePath: "/sounds/sample2.mp3",
    keyBinding: "2",
  },
  {
    name: "Sample 6",
    filePath: "/sounds/sample3.mp3",
    keyBinding: "3",
  },
  {
    name: "Sample 7",
    filePath: "/sounds/sample1.mp3",
    keyBinding: "F",
  },
  {
    name: "Sample 8",
    filePath: "/sounds/sample2.mp3",
    keyBinding: "G",
  },
  {
    name: "Sample 9",
    filePath: "/sounds/sample3.mp3",
    keyBinding: "H",
  },
];

const Soundboard: React.FC = () => {
  const {
    playSound,
    previewSound,
    loading,
    error,
    volume,
    setVolume,
    muted,
    setMuted,
  } = useAudio();
  const { pressedKey } = useKeyboardShortcuts(sounds, playSound);
  const [previewing, setPreviewing] = useState<string | null>(null);

  // Loading state for all sounds
  const isLoading = Object.values(loading).some(Boolean);
  // Error state for all sounds
  const errorMsg = Object.values(error).find((e) => !!e);

  return (
    <main className="w-full max-w-4xl mx-auto p-4">
      <header className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-blue-700">Soundboard</h1>
        <VolumeControl
          volume={volume}
          setVolume={setVolume}
          muted={muted}
          setMuted={setMuted}
        />
      </header>
      <section className="mb-4 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-500">Keyboard Shortcuts:</span>
        {sounds.map((s) => (
          <span
            key={s.keyBinding}
            className="px-2 py-1 bg-gray-200 rounded text-xs font-mono text-blue-700"
          >
            {s.keyBinding}
          </span>
        ))}
      </section>
      <section className="mb-4">
        <input
          type="search"
          placeholder="Filter sounds..."
          className="w-full max-w-xs p-2 border rounded focus:ring focus:ring-blue-300"
          aria-label="Filter sounds"
        />
      </section>
      {isLoading && (
        <LoadingSpinner
          size="large"
          color="border-blue-500"
          label="Loading sounds..."
        />
      )}
      {errorMsg && (
        <ErrorMessage message={errorMsg} type="audio" severity="error" />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sounds.map((sound) => (
          <div key={sound.name} className="relative">
            <SoundButton
              sound={sound}
              pressedKey={pressedKey}
              playSound={playSound}
              loading={!!loading[sound.filePath]}
              error={error[sound.filePath]}
            />
            <button
              className="absolute top-2 right-2 bg-white border border-blue-300 rounded-full p-1 shadow hover:bg-blue-100 transition"
              aria-label={`Preview ${sound.name}`}
              onClick={() => {
                setPreviewing(sound.filePath);
                previewSound(sound.filePath);
                setTimeout(() => setPreviewing(null), 2000);
              }}
              disabled={!!loading[sound.filePath]}
            >
              <span className="text-blue-500 text-lg">👁️</span>
            </button>
            {previewing === sound.filePath && (
              <span className="absolute bottom-2 left-2 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs animate-fade-in">
                Previewing...
              </span>
            )}
          </div>
        ))}
      </div>
    </main>
  );
};

export default Soundboard;
