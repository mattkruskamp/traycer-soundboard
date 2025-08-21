import React, { useState } from "react";

interface VolumeControlProps {
  volume: number;
  setVolume: (v: number) => void;
  muted: boolean;
  setMuted: (m: boolean) => void;
}

const getVolumeIcon = (volume: number, muted: boolean) => {
  if (muted || volume === 0) return "🔇";
  if (volume < 0.33) return "🔈";
  if (volume < 0.66) return "🔉";
  return "🔊";
};

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  setVolume,
  muted,
  setMuted,
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        aria-label={muted ? "Unmute" : "Mute"}
        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
        onClick={() => setMuted(!muted)}
      >
        <span className="text-xl">{getVolumeIcon(volume, muted)}</span>
      </button>
      <input
        type="range"
        min={0}
        max={100}
        value={muted ? 0 : Math.round(volume * 100)}
        onChange={(e) => setVolume(Number(e.target.value) / 100)}
        className="w-24 h-2 accent-blue-500 rounded-lg focus:outline-none"
        aria-label="Volume"
      />
      <span className="text-xs text-gray-600 w-8 text-center">
        {muted ? 0 : Math.round(volume * 100)}%
      </span>
    </div>
  );
};

export default VolumeControl;
