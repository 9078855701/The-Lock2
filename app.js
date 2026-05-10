
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/0rUGT0xC9/";
const UNLOCK_CLASS  = "Thumbs Up";
const THRESHOLD     = 0.85;
const HOLD_FRAMES   = 6;

let model, positiveStreak = 0, unlocked = false;

const btnOpen    = document.getElementById("btn-open");
const placeholder= document.getElementById("placeholder");
const videoEl    = document.getElementById("webcam");
const canvasEl   = document.getElementById("canvas");
const statusEl   = document.getElementById("status");

btnOpen.addEventListener("click", init);

async function init() {
  btnOpen.textContent = "Loading…";
  btnOpen.disabled = true;
  setStatus("Waking up…");

  try {
    model = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    videoEl.srcObject = stream;
    await videoEl.play();

    placeholder.style.display = "none";
    videoEl.style.display = "block";
    setStatus("Show the sign.");
    loop();

  } catch (e) {
    btnOpen.textContent = "Try again";
    btnOpen.disabled = false;
    setStatus("Could not open camera. Check permissions.");
  }
}

async function loop() {
  if (unlocked) return;

  const ctx = canvasEl.getContext("2d");
  canvasEl.width  = videoEl.videoWidth  || 380;
  canvasEl.height = videoEl.videoHeight || 285;
  ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

  const predictions = await model.predict(canvasEl);
  const match = predictions.find(p => p.className === UNLOCK_CLASS);
  const score = match ? match.probability : 0;

  if (score >= THRESHOLD) {
    positiveStreak++;
    setStatus("Hold still…");
  } else {
    positiveStreak = 0;
    setStatus(score >= 0.5 ? "Almost…" : "Show the sign.");
  }

  if (positiveStreak >= HOLD_FRAMES) {
    unlock();
    return;
  }

  setTimeout(loop, 200);
}

function unlock() {
  unlocked = true;
  setStatus("The door opens.");
  setTimeout(() => { window.location.href = "secret.html"; }, 1200);
}

function setStatus(msg) {
  statusEl.textContent = msg;
}
