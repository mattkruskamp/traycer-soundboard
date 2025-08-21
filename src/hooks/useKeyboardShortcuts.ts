import { useEffect, useState, useMemo, useRef } from "react";
import { Sound } from "../types";

interface UseKeyboardShortcutsResult {
  pressedKey: string | null;
}

export function useKeyboardShortcuts(
  sounds: Sound[],
  playSound: (filePath: string) => void
): UseKeyboardShortcutsResult {
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const pressedKeyRef = useRef<string | null>(null);
  const playRef = useRef(playSound);
  playRef.current = playSound;

  // Memoize keyMap for performance and stable reference
  const keyMap = useMemo(() => {
    const map: Record<string, Sound> = {};
    sounds.forEach((sound) => {
      map[sound.keyBinding.toUpperCase()] = sound;
    });
    return map;
  }, [sounds]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore repeated keydown events
      if (e.repeat) return;
      // Ignore if modifier keys are pressed
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Ignore if target is input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      // Normalize key: use e.code for numbers
      let key = e.key.toUpperCase();
      if (/^Digit[1-9]$/.test(e.code)) {
        key = e.code.replace("Digit", "");
      }
      if (keyMap[key]) {
        e.preventDefault();
        setPressedKey(key);
        pressedKeyRef.current = key;
        playRef.current(keyMap[key].filePath);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      // Normalize key: use e.code for numbers
      let key = e.key.toUpperCase();
      if (/^Digit[1-9]$/.test(e.code)) {
        key = e.code.replace("Digit", "");
      }
      if (keyMap[key] && pressedKeyRef.current === key) {
        setPressedKey(null);
        pressedKeyRef.current = null;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyMap]);

  return { pressedKey };
}
