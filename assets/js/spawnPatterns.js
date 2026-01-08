/**
 * Cet objet regroupe tous les patterns de SPAWN des ennemis.
 *
 * Chaque fonction retourne un tableau de positions { x, y }.
 * Ces positions sont ensuite utilisées dans app.js pour appeler spawnEnemy().
 *
 * Signature commune :
 * pattern(waveIndex, enemyType, count, screenWidth, screenHeight)
 *
 * - waveIndex     : index de la vague actuelle (peut servir à varier le pattern)
 * - enemyType     : stats de l’ennemi (notamment size)
 * - count         : nombre total d’ennemis à spawn
 * - screenWidth   : largeur du canvas
 * - screenHeight  : hauteur du canvas
 */

const spawnPatterns = {
  // Pattern par défaut : spawn aléatoire
  random(waveIndex, enemyType, count, screenWidth, screenHeight) {
    const positions = [];
    for (let i = 0; i < count; i++) {
      const margin = enemyType.size;
      const x = random(-screenWidth / 2 + margin, screenWidth / 2 - margin);
      const y = -screenHeight / 2 - margin;
      positions.push({ x, y });
    }
    return positions;
  },

  // Pattern ligne horizontale
  line(waveIndex, enemyType, count, screenWidth, screenHeight) {
    const positions = [];
    const margin = enemyType.size;
    const spacing = (screenWidth - 2 * margin) / (count + 1);
    for (let i = 0; i < count; i++) {
      const x = -screenWidth / 2 + margin + spacing * (i + 1);
      const y = -screenHeight / 2 - margin;
      positions.push({ x, y });
    }
    return positions;
  },

  // Pattern en étoile (radiaire)
  star(waveIndex, enemyType, count, screenWidth, screenHeight) {
    const positions = [];
    const centerX = 0;
    const centerY = -screenHeight / 2 - 150;
    const radius = Math.min(screenWidth, screenHeight) * 0.3;

    for (let i = 0; i < count; i++) {
      const angle = (TWO_PI / count) * i;
      const x = centerX + cos(angle) * radius;
      const y = centerY + sin(angle) * radius;
      positions.push({ x, y });
    }
    return positions;
  },

  // Pattern en cercle
  circle(waveIndex, enemyType, count, screenWidth, screenHeight) {
    const positions = [];
    const centerX = 0;
    const centerY = -screenHeight / 2 - 100;
    const radius = Math.min(screenWidth, screenHeight) * 0.25;

    for (let i = 0; i < count; i++) {
      const angle = (TWO_PI / count) * i;
      const x = centerX + cos(angle) * radius;
      const y = centerY + sin(angle) * radius;
      positions.push({ x, y });
    }
    return positions;
  },

  // Pattern diagonale (haut-gauche vers bas-droite)
  diagonal(waveIndex, enemyType, count, screenWidth, screenHeight) {
    const positions = [];
    const margin = enemyType.size;

    for (let i = 0; i < count; i++) {
      const t = i / Math.max(count - 1, 1);
      const x = -screenWidth / 2 + margin + t * (screenWidth - 2 * margin);
      const y = -screenHeight / 2 - margin - t * screenHeight * 0.3;
      positions.push({ x, y });
    }
    return positions;
  },

  // Pattern vague (sinusoïdale)
  wave(waveIndex, enemyType, count, screenWidth, screenHeight) {
    const positions = [];
    const margin = enemyType.size;
    const waveAmplitude = screenWidth * 0.2;
    const waveFreq = 2;

    for (let i = 0; i < count; i++) {
      const t = i / Math.max(count - 1, 1);
      const x = -screenWidth / 2 + margin + t * (screenWidth - 2 * margin);
      const waveOffset = sin(t * waveFreq * PI) * waveAmplitude;
      const y = -screenHeight / 2 - margin - waveOffset;
      positions.push({ x, y });
    }
    return positions;
  },

  // Pattern deux colonnes
  columns(waveIndex, enemyType, count, screenWidth, screenHeight) {
    const positions = [];
    const margin = enemyType.size;
    const spacing = (screenHeight * 0.4) / (count + 1);
    const colWidth = screenWidth * 0.3;

    for (let i = 0; i < count; i++) {
      const side = i % 2;
      const row = Math.floor(i / 2);
      const x = side === 0 ? -colWidth : colWidth;
      const y = -screenHeight / 2 - margin - spacing * (row + 1);
      positions.push({ x, y });
    }
    return positions;
  },

  // Pattern spirale
  spiral(waveIndex, enemyType, count, screenWidth, screenHeight) {
    const positions = [];
    const centerX = 0;
    const centerY = -screenHeight / 2 - 100;
    const maxRadius = Math.min(screenWidth, screenHeight) * 0.35;

    for (let i = 0; i < count; i++) {
      const t = i / Math.max(count - 1, 1);
      const angle = t * TWO_PI * 2; // 2 tours
      const radius = t * maxRadius;
      const x = centerX + cos(angle) * radius;
      const y = centerY + sin(angle) * radius;
      positions.push({ x, y });
    }
    return positions;
  },

  // Pattern formation (V inversé)
  formation(waveIndex, enemyType, count, screenWidth, screenHeight) {
    const positions = [];
    const margin = enemyType.size;
    const baseY = -screenHeight / 2 - margin;

    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = (col === 0 ? -1 : 1) * (row * 60 + 40);
      const y = baseY - row * 80;
      positions.push({ x, y });
    }
    return positions;
  },
};
