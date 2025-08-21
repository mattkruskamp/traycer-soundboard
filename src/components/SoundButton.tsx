import React, { useRef } from "react";
import { Sound } from "../types";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";

interface SoundButtonProps {
  sound: Sound;
  pressedKey?: string | null;
  playSound: (filePath: string) => void;
  loading: boolean;
  error: string | null;
}

const SoundButton: React.FC<SoundButtonProps> = ({
  sound,
  pressedKey,
  playSound,
  loading,
  error,
}) => {
  const isPressed = pressedKey && sound.keyBinding.toUpperCase() === pressedKey;
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Ripple effect
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playSound(sound.filePath);
    const btn = buttonRef.current;
    if (!btn) return;
    const ripple = document.createElement("span");
    ripple.className =
      "absolute rounded-full bg-blue-300 opacity-50 animate-ripple";
    const rect = btn.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    ripple.style.width = ripple.style.height = "120px";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <button
      ref={buttonRef}
      className={
        `relative overflow-hidden flex flex-col items-center justify-center bg-white border border-gray-300 rounded-lg shadow-md p-4 m-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 ` +
        (isPressed
          ? "bg-blue-300 scale-95 shadow-lg animate-bounce-short"
          : "hover:bg-blue-100") +
        (loading ? " cursor-wait opacity-70" : "") +
        (error ? " border-red-400" : "")
      }
      style={isPressed ? { boxShadow: "0 0 0 6px #3b82f6" } : undefined}
      onClick={handleClick}
      disabled={loading}
      aria-label={`Play sound: ${sound.name} (${sound.keyBinding})`}
      tabIndex={0}
    >
      <span className="text-xl font-semibold text-gray-800 mb-2">
        {sound.name}
      </span>
      <span
        className={
          `text-sm font-mono px-2 py-1 rounded transition-all duration-200 ` +
          (isPressed
            ? "bg-blue-200 text-blue-900"
            : "bg-blue-100 text-blue-600")
        }
      >
        {sound.keyBinding}
      </span>
      {loading && (
        <div className="mt-2">
          <LoadingSpinner
            size="small"
            color="border-blue-400"
            label="Loading"
          />
        </div>
      )}
      {error && (
        <div className="mt-2 w-full">
          <ErrorMessage message={error} type="audio" severity="error" />
        </div>
      )}
    </button>
  );
};

export default SoundButton;
