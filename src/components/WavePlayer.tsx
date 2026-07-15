"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

interface WavePlayerProps {
  audio: string;
  height?: number;
  onPlay?: () => void;
}

export function WavePlayer({ audio, height = 64, onPlay }: WavePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const ws = WaveSurfer.create({
      container: containerRef.current,
      url: audio,
      waveColor: "#3a3a44",
      progressColor: "#B5D300",
      cursorColor: "#9B30FF",
      cursorWidth: 2,
      height,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      normalize: true,
    });
    wsRef.current = ws;
    ws.on("ready", () => {
      setReady(true);
      setDuration(ws.getDuration());
    });
    ws.on("play", () => setPlaying(true));
    ws.on("pause", () => setPlaying(false));
    ws.on("finish", () => setPlaying(false));
    ws.on("timeupdate", (t) => setPosition(t));
    return () => {
      ws.destroy();
      wsRef.current = null;
    };
  }, [audio, height]);

  const toggle = () => {
    wsRef.current?.playPause();
    if (!playing) onPlay?.();
  };

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className={playing ? "waveform-playing" : ""}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          disabled={!ready}
          aria-label={playing ? "Pause" : "Play"}
          className="shrink-0 w-11 h-11 rounded-full bg-[var(--color-accent)] text-black flex items-center justify-center font-bold hover:bg-[var(--color-accent-hot)] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {playing ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        <div ref={containerRef} className="flex-1 min-w-0" />
        <div className="text-xs tabular-nums text-[var(--color-text-muted)] whitespace-nowrap">
          {fmt(position)} / {fmt(duration)}
        </div>
      </div>
    </div>
  );
}