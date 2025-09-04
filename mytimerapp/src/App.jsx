import React, { useEffect, useMemo, useRef, useState } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import "flatpickr/dist/themes/dark.css";
import Timer from "../public/Timer";

// ---- Configs -------------------------------------------------
const TIMER_THEMES = ["sunset", "ocean", "galaxy", "forest"];
const APP_THEMES = [
  "light-theme",
  "dark-theme",
  "sunset-theme",
  "ocean-theme",
  "galaxy-theme",
  "forest-theme",
];

const SOUND_PACKS = [
  {
    id: "bell",
    name: "Soft Bell",
    url: "/bell.mp3",
  },
  {
    id: "chime",
    name: "Calm Chime",
    url: "/chime.mp3",
  },
  {
    id: "sparkle",
    name: "Sparkle",
    url: "/sparkle.mp3",
  },
];


const LS_KEYS = {
  APP_STATE: "countdown_app_state_v2",
};

export default function App() {
  const [timers, setTimers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timerTheme, setTimerTheme] = useState("random");
  const [appTheme, setAppTheme] = useState("light-theme");
  const [soundId, setSoundId] = useState(SOUND_PACKS[0].id);
  const [volume, setVolume] = useState(0.8);
  const [label, setLabel] = useState("");
  const [showBanner, setShowBanner] = useState(true);
  const [stepIndex, setStepIndex] = useState(-1);

  const dateInputRef = useRef(null);
  const startButtonRef = useRef(null);
  const audioRef = useRef(null); // unlocked on first click

  // --------- Load / Save State (LocalStorage) -----------------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEYS.APP_STATE);
      if (!raw) return;

      const parsed = JSON.parse(raw);

      if (parsed.appTheme && APP_THEMES.includes(parsed.appTheme)) {
        setAppTheme(parsed.appTheme);
      }
      if (typeof parsed.volume === "number") setVolume(parsed.volume);
      if (parsed.soundId && SOUND_PACKS.some((s) => s.id === parsed.soundId)) {
        setSoundId(parsed.soundId);
      }
      if (Array.isArray(parsed.timers)) {
        const restored = parsed.timers
          .map((t) => ({
            ...t,
            targetTime: new Date(t.targetTime),
          }))
          .filter((t) => !Number.isNaN(t.targetTime.getTime()));
        setTimers(restored);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const toSave = {
      appTheme,
      soundId,
      volume,
      timers: timers.map((t) => ({
        id: t.id,
        label: t.label || "",
        theme: t.theme,
        targetTime: t.targetTime.toISOString(),
      })),
    };
    localStorage.setItem(LS_KEYS.APP_STATE, JSON.stringify(toSave));
  }, [appTheme, soundId, volume, timers]);

  // --------- Flatpickr init -----------------------------------
  useEffect(() => {
    if (!dateInputRef.current) return;
    flatpickr(dateInputRef.current, {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      minDate: "today",
      defaultDate: new Date(),
      time_24hr: true,
      onChange: (dates) => setSelectedDate(dates[0]),
    });
  }, []);

  // --------- Onboarding steps ---------------------------------
  useEffect(() => {
    if (stepIndex < 0) return;
    const id = setTimeout(() => setStepIndex((p) => p + 1), 2800);
    return () => clearTimeout(id);
  }, [stepIndex]);

  // --------- Apply app theme to body --------------------------
  useEffect(() => {
    document.body.className = appTheme;
  }, [appTheme]);

  // --------- First click to unlock audio ----------------------
  useEffect(() => {
    const unlock = () => {
      if (!audioRef.current) return;
      const audio = audioRef.current;
      audio.volume = volume;
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
        })
        .catch(() => {});
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [volume]);

  // --------- Derived: selected sound URL ----------------------
  const soundUrl = useMemo(
    () => SOUND_PACKS.find((s) => s.id === soundId)?.url || SOUND_PACKS[0].url,
    [soundId]
  );

  // --------- Actions ------------------------------------------
  const addTimer = (date, lbl) => {
    const dt = date ?? selectedDate;
    if (!dt || Number.isNaN(dt.getTime())) {
      alert("Please select a valid date & time.");
      return;
    }
    const chosenTheme =
      timerTheme === "random"
        ? TIMER_THEMES[Math.floor(Math.random() * TIMER_THEMES.length)]
        : timerTheme;

    const newTimer = {
      id: Date.now(),
      label: ((lbl ?? label) || "").trim(),
      targetTime: dt,
      theme: chosenTheme,
    };
    setTimers((prev) => [newTimer, ...prev]);
    setLabel("");
  };

  const removeTimer = (id) =>
    setTimers((prev) => prev.filter((t) => t.id !== id));

  // Quick presets
  const addPreset = (mins, name) => {
    const d = new Date(Date.now() + mins * 60 * 1000);
    addTimer(d, name);
  };

  return (
    <div>
      {/* Welcome Banner */}
      {showBanner && (
        <div className="welcome-banner">
          👋 Hey! Ready to make every second count? Set a time, give it a name,
          and let’s go ⏳✨
          <button
            onClick={() => {
              setShowBanner(false);
              setStepIndex(0);
            }}
          >
            Got it!
          </button>
        </div>
      )}

      {/* App */}
      <div className="app-container">
        <div className="header-row">
          <h1>⏳ Flow Timer</h1>

          {/* App Theme Switcher */}
          <div className="theme-switcher">
            <select
              value={appTheme}
              onChange={(e) => setAppTheme(e.target.value)}
              aria-label="Application Theme"
            >
              <option value="light-theme">🌞 Light</option>
              <option value="dark-theme">🌙 Dark</option>
              <option value="sunset-theme">🌅 Sunset</option>
              <option value="ocean-theme">🌊 Ocean</option>
              <option value="galaxy-theme">🌌 Galaxy</option>
              <option value="forest-theme">🌲 Forest</option>
            </select>
          </div>
        </div>

        <div className="input-container">
          {/* Label */}
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Optional label (e.g., Study, Break, Workout)"
          />

          {/* Date Picker */}
          <div style={{ position: "relative", width: "100%", maxWidth: 340 }}>
            <input
              type="text"
              ref={dateInputRef}
              placeholder="Select date & time"
              id="datetime-picker"
              className={stepIndex === 0 ? "highlight" : ""}
            />
            {stepIndex === 0 && (
              <div className="tooltip">📅 Pick a date & time!</div>
            )}
          </div>

          {/* Timer Theme Selector */}
          <div style={{ position: "relative", width: "100%", maxWidth: 340 }}>
            <select
              id="themePicker"
              value={timerTheme}
              onChange={(e) => setTimerTheme(e.target.value)}
              className={stepIndex === 1 ? "highlight" : ""}
            >
              <option value="random">🎲 Random Theme</option>
              {TIMER_THEMES.map((t) => (
                <option key={t} value={t}>
                  {t === "sunset" && "🌇 Sunset"}
                  {t === "ocean" && "🌊 Ocean"}
                  {t === "galaxy" && "🌌 Galaxy"}
                  {t === "forest" && "🌲 Forest"}
                </option>
              ))}
            </select>
            {stepIndex === 1 && (
              <div className="tooltip">🎨 Choose a timer vibe!</div>
            )}
          </div>

          {/* Sound + Volume */}
          <div className="sound-row">
            <select
              value={soundId}
              onChange={(e) => setSoundId(e.target.value)}
              aria-label="Sound Pack"
            >
              {SOUND_PACKS.map((s) => (
                <option key={s.id} value={s.id}>
                  🔔 {s.name}
                </option>
              ))}
            </select>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Volume"
            />
          </div>

          {/* Start + Presets */}
          <div className="actions-row">
            <button
              id="startButton"
              ref={startButtonRef}
              onClick={() => addTimer()}
              className={stepIndex === 2 ? "highlight" : ""}
            >
              Start Countdown
            </button>
            {stepIndex === 2 && (
              <div className="tooltip">⏱️ Create your timer!</div>
            )}

            <div className="quick-set">
              <button onClick={() => addPreset(5, "⏱️ 5 min")}>5m</button>
              <button onClick={() => addPreset(15, "☕ Coffee 15m")}>
                15m
              </button>
              <button onClick={() => addPreset(30, "💤 Power Nap 30m")}>
                30m
              </button>
              <button onClick={() => addPreset(60, "🧠 Deep Work 1h")}>
                1h
              </button>
            </div>
          </div>
        </div>

        {/* Timers */}
        <div id="timers">
          {timers.map((t) => (
            <Timer
              key={t.id}
              id={t.id}
              label={t.label}
              targetTime={t.targetTime}
              theme={t.theme}
              soundUrl={soundUrl}
              volume={volume}
              onDelete={() => removeTimer(t.id)}
            />
          ))}
          {timers.length === 0 && (
            <div className="empty-state">
              <div className="empty-emoji">✨</div>
              <div className="empty-text">
                No timers yet. Add one above or use a quick preset!
              </div>
            </div>
          )}
        </div>
      </div>

      
      <audio id="sparkle" ref={audioRef} preload="auto" src="/sparkle.mp3" />
      <audio id="soft bells" ref={audioRef} preload="auto" src="/bell.mp3" />
      <audio id="chime" ref={audioRef} preload="auto" src="/chime.mp3" />
    </div>
  );
}
