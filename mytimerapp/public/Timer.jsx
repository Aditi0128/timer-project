import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Minimal confetti burst:
 * Creates floating colored pieces that rise & fade, then cleans up.
 */
function fireConfetti(container) {
  if (!container) return;
  const colors = ["#ff6b6b", "#ffd93d", "#6bcBef", "#51cf66", "#845ef7"];
  const pieces = 60;

  for (let i = 0; i < pieces; i++) {
    const div = document.createElement("div");
    const size = Math.floor(6 + Math.random() * 8);
    div.style.position = "absolute";
    div.style.left = Math.random() * 100 + "%";
    div.style.bottom = "0";
    div.style.width = size + "px";
    div.style.height = size * (0.5 + Math.random()) + "px";
    div.style.background = colors[Math.floor(Math.random() * colors.length)];
    div.style.opacity = "0.9";
    div.style.transform = `rotate(${Math.random() * 360}deg)`;
    div.style.borderRadius = "2px";
    div.style.pointerEvents = "none";
    div.style.filter = "drop-shadow(0 2px 2px rgba(0,0,0,0.2))";
    div.style.animation = `confettiUp ${
      800 + Math.random() * 600
    }ms ease-out forwards`;
    container.appendChild(div);
    setTimeout(() => div.remove(), 1600);
  }
}

export default function Timer({
  id,
  label,
  targetTime,
  theme,
  soundUrl,
  volume,
  onDelete,
}) {
  const [now, setNow] = useState(Date.now());
  const [paused, setPaused] = useState(false);
  const boxRef = useRef(null);
  const audioRef = useRef(null);

  const totalMs = useMemo(
    () => Math.max(0, targetTime - new Date()),
    [targetTime]
  ); // initial snapshot
  const msLeft = Math.max(0, targetTime - now);
  const done = msLeft <= 0;

  // Tick
  useEffect(() => {
    if (paused || done) return;
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, [paused, done]);

  // Play sound + confetti on finish
  const triggeredFinishRef = useRef(false);
  useEffect(() => {
    if (!done || triggeredFinishRef.current) return;
    triggeredFinishRef.current = true;

    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {}); // in case of autoplay block
    }

    // Confetti
    fireConfetti(boxRef.current);
  }, [done, volume]);

  // Format time
  const fmt = (ms) => {
    if (ms <= 0) return "⏰ Time's up!";
    const d = Math.floor(ms / (1000 * 60 * 60 * 24));
    const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const m = Math.floor((ms / (1000 * 60)) % 60);
    const s = Math.floor((ms / 1000) % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  // Progress (0→1)
  const progress = useMemo(() => {
    if (totalMs <= 0) return 1;
    return Math.min(1, 1 - msLeft / totalMs);
  }, [msLeft, totalMs]);

  // Progress ring math
  const R = 54;
  const CIRC = 2 * Math.PI * R;
  const dash = Math.max(0.0001, progress * CIRC);

  return (
    <div
      ref={boxRef}
      className={`timer-card ${done ? "finished" : ""} theme-${theme}`}
    >
      <div className="timer-top">
        <div className="timer-label">{label || "Untitled Timer"}</div>
        <button className="icon-btn" title="Delete" onClick={onDelete}>
          ❌
        </button>
      </div>

      {/* Progress Ring */}
      <div className="ring-wrap">
        <svg viewBox="0 0 120 120" className="ring">
          <circle className="ring-bg" cx="60" cy="60" r={R} />
          <circle
            className="ring-fg"
            cx="60"
            cy="60"
            r={R}
            strokeDasharray={`${dash} ${CIRC - dash}`}
          />
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            className="ring-text"
          >
            {done ? "Done" : fmt(msLeft)}
          </text>
        </svg>
      </div>

      {/* Controls */}
      <div className="timer-controls">
        <button
          className="tiny-btn"
          title="Pause"
          onClick={() => setPaused(true)}
          disabled={paused || done}
        >
          ⏸️
        </button>
        <button
          className="tiny-btn"
          title="Resume"
          onClick={() => setPaused(false)}
          disabled={!paused || done}
        >
          ▶️
        </button>
      </div>

      {/* Per-timer sound element */}
      <audio ref={audioRef} preload="auto" src={soundUrl} />
    </div>
  );
}
