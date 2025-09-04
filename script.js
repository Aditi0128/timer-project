// script.js
window.addEventListener('click', () => {
  const ding = document.getElementById("ding");
  if (ding) {
    ding.play().then(() => {
      ding.pause();  // unlock the audio engine silently
      ding.currentTime = 0;
    }).catch(() => {});
  }
}, { once: true });

// Initialize flatpickr on the datetime input
flatpickr("#datetime-picker", {
  enableTime: true,
  dateFormat: "Y-m-d H:i",
  minDate: "today",
  defaultDate: new Date(),
  time_24hr: true
});

const startButton = document.getElementById("startButton");
const addButton = document.createElement("button");
addButton.textContent = "➕ Add Another Timer";
addButton.style.display = "none";
addButton.id = "addButton";
addButton.style.marginTop = "1rem";
startButton.insertAdjacentElement("afterend", addButton);

const timersDiv = document.getElementById("timers");
const audioDing = document.getElementById("ding");

// Predefined list of themes
const themes = ["sunset", "ocean", "galaxy", "forest"];

// Create a countdown timer
function createCountdown() {
  const dateInput = document.getElementById("datetime-picker").value;
  const targetTime = new Date(dateInput);

  if (isNaN(targetTime.getTime())) {
    alert("Please select a valid date & time.");
    return;
  }

  const themeSelect = document.getElementById("themePicker").value;
  const theme = themeSelect === "random" ? themes[Math.floor(Math.random() * themes.length)] : themeSelect;

  const id = `timer-${Date.now()}`;
  const timerBox = document.createElement("div");
  timerBox.className = `timer-box theme-${theme}`;

  const timeDisplay = document.createElement("div");
  timeDisplay.id = id;
  timeDisplay.textContent = "Calculating...";

  const controls = document.createElement("div");
  controls.className = "timer-controls";

  const pauseBtn = document.createElement("button");
  pauseBtn.textContent = "⏸️";
  pauseBtn.title = "Pause";
  pauseBtn.className = "tiny-btn";

  const resumeBtn = document.createElement("button");
  resumeBtn.textContent = "▶️";
  resumeBtn.title = "Resume";
  resumeBtn.disabled = true;
  resumeBtn.className = "tiny-btn";

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.title = "Delete";
  deleteBtn.className = "tiny-btn";

  controls.appendChild(pauseBtn);
  controls.appendChild(resumeBtn);
  controls.appendChild(deleteBtn);

  timerBox.appendChild(timeDisplay);
  timerBox.appendChild(controls);
  timersDiv.appendChild(timerBox);

  let interval;
  let paused = false;
  let remainingTime = targetTime - new Date();

  function updateDisplay() {
    if (remainingTime <= 0) {
      timeDisplay.innerText = "⏰ Time's up!";
      timerBox.style.color = '#000000';
      timerBox.style.boxShadow = '0 0 20px#000000';
      const ding = document.getElementById("ding");
      
// Attempt to reset and play the sound with higher volume
if (ding) {
  ding.pause();       // stop if already playing
  ding.currentTime = 0;  // rewind
  ding.volume = 1;    // max volume

  // Play with browser safety catch
  ding.play().then(() => {
    console.log("Ding played!");
  }).catch(err => {
    console.warn("Auto-play blocked. Sound will play on next interaction.", err);
  });
}

      clearInterval(interval);
      pauseBtn.disabled = true;
      resumeBtn.disabled = true;
      return;
    }

    const d = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const h = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
    const m = Math.floor((remainingTime / (1000 * 60)) % 60);
    const s = Math.floor((remainingTime / 1000) % 60);

    timeDisplay.innerText = `${d}d ${h}h ${m}m ${s}s`;
  }

  function startCountdown() {
    interval = setInterval(() => { /* function to update the countdown in real-time.*/
      if (!paused) {
        remainingTime -= 1000;
        updateDisplay();
      }
    }, 1000);
  }

  updateDisplay();
  startCountdown();

  pauseBtn.addEventListener("click", () => {
    paused = true;
    pauseBtn.disabled = true;
    resumeBtn.disabled = false;
  });

  resumeBtn.addEventListener("click", () => {
    paused = false;
    pauseBtn.disabled = false;
    resumeBtn.disabled = true;
  });

  deleteBtn.addEventListener("click", () => {
    clearInterval(interval);
    timerBox.remove();
  });
}

startButton.addEventListener("click", () => {
  createCountdown();
  addButton.style.display = "inline-block";
});

addButton.addEventListener("click", () => {
  createCountdown();
});
