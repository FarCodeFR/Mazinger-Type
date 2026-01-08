/**
 * Script de l’écran d’accueil (menu principal).
 *
 * Responsabilités :
 * - afficher le meilleur score sauvegardé
 * - gérer l’ouverture / fermeture des panneaux (How To / Crédits)
 * - permettre de lancer le jeu avec la touche ESPACE
 */

// Élément HTML où afficher le meilleur score
const bestScoreEl = document.getElementById("best-score");

// Récupère le meilleur score stocké dans le localStorage
// Si absent → valeur par défaut "0"
const best = Number(localStorage.getItem("bestScore") || "0");

// Affiche le score si l’élément existe
if (bestScoreEl) bestScoreEl.textContent = best.toString();

// Boutons
const helpBtn = document.getElementById("help-btn");
const creditsBtn = document.getElementById("credits-btn");

// Panneaux correspondants
const help = document.getElementById("help");
const credits = document.getElementById("credits");

function toggle(panel) {
  if (!panel) return;
  panel.hidden = !panel.hidden;
}

/**
 * - cache les crédits si ouverts
 * - affiche / masque le panneau How To
 */
if (helpBtn) {
  helpBtn.addEventListener("click", () => {
    if (credits) credits.hidden = true;
    toggle(help);
  });
}

/**
 * - cache le panneau How To si ouvert
 * - affiche / masque les crédits
 */
if (creditsBtn) {
  creditsBtn.addEventListener("click", () => {
    if (help) help.hidden = true;
    toggle(credits);
  });
}

/**
 * Appui sur la touche ESPACE :
 * - redirige vers game.html
 * - permet de lancer le jeu sans cliquer
 */
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    window.location.href = "./game.html";
  }
});
