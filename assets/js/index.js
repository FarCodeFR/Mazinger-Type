// Best score
const bestScoreEl = document.getElementById("best-score");
const best = Number(localStorage.getItem("bestScore") || "0");
if (bestScoreEl) bestScoreEl.textContent = best.toString();

// Toggles
const howtoBtn = document.getElementById("howto-btn");
const creditsBtn = document.getElementById("credits-btn");
const howto = document.getElementById("howto");
const credits = document.getElementById("credits");

function toggle(panel) {
  if (!panel) return;
  panel.hidden = !panel.hidden;
}

if (howtoBtn) {
  howtoBtn.addEventListener("click", () => {
    if (credits) credits.hidden = true;
    toggle(howto);
  });
}

if (creditsBtn) {
  creditsBtn.addEventListener("click", () => {
    if (howto) howto.hidden = true;
    toggle(credits);
  });
}

// Space -> Play
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    window.location.href = "./game.html";
  }
});
