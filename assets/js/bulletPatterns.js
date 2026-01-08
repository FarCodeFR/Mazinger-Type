const bulletPatterns = {
  // Tir tout droit vers le bas
  regular(enemy, bulletsArray) {
    const angle = null;
    bulletsArray.push(
      new EnemyBullet(
        enemy.x,
        enemy.y + enemy.size / 2,
        enemy.bulletSpeed,
        enemy.bulletSize,
        enemy.bulletColor,
        enemy.bulletShape,
        angle,
        enemy.bulletSpiralColor,
        enemy.bulletRotationSpeed
      )
    );
  },

  /**
   * Pattern spécial boss : cercle complet de tirs.
   *
   * - Envoie plusieurs balles réparties sur 360°
   * - Très lisible visuellement
   * - Bon pattern “signature” de boss
   */
  boss_ring(enemy, bulletsArray) {
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = (TWO_PI / count) * i;
      bulletsArray.push(
        new EnemyBullet(
          enemy.x,
          enemy.y + enemy.size / 2,
          enemy.bulletSpeed,
          enemy.bulletSize,
          enemy.bulletColor,
          enemy.bulletShape,
          angle,
          enemy.bulletSpiralColor,
          0
        )
      );
    }
  },

  /**
   * Tir ciblé vers la position actuelle du joueur.
   *
   * - Calcule un angle dynamique vers goldorak
   * - Le tir n’est PAS homing après le tir
   *   (il vise une fois puis continue droit)
   */
  boss_homing(enemy, bulletsArray) {
    if (typeof goldorak === "undefined") return;
    const angle = atan2(goldorak.y - enemy.y, goldorak.x - enemy.x);
    bulletsArray.push(
      new EnemyBullet(
        enemy.x,
        enemy.y + enemy.size / 2,
        enemy.bulletSpeed,
        enemy.bulletSize,
        enemy.bulletColor,
        enemy.bulletShape,
        angle,
        enemy.bulletSpiralColor,
        0
      )
    );
  },

  /**
   * Rafale lourde en éventail qui tourne progressivement.
   *
   * - Plusieurs balles par tir
   * - Angle global qui évolue dans le temps (enemy.shotAngle)
   * - Donne une impression de pression constante
   */
  boss_heavy(enemy, bulletsArray) {
    const spread = 0.6;
    const count = 11;
    for (let i = 0; i < count; i++) {
      const angle = enemy.shotAngle + map(i, 0, count - 1, -spread, spread);
      bulletsArray.push(
        new EnemyBullet(
          enemy.x,
          enemy.y + enemy.size / 2,
          enemy.bulletSpeed * 0.9,
          enemy.bulletSize * 1.3,
          enemy.bulletColor,
          enemy.bulletShape,
          angle,
          enemy.bulletSpiralColor,
          0
        )
      );
    }
    enemy.shotAngle += 0.05;
  },

  /**
   * Tir en spirale continue.
   *
   * - Une balle par tir
   * - L’angle augmente progressivement
   * - Peut être combiné avec une rotation visuelle de la balle
   */
  spiral(enemy, bulletsArray) {
    const angle = enemy.shotAngle;
    bulletsArray.push(
      new EnemyBullet(
        enemy.x,
        enemy.y + enemy.size / 2,
        enemy.bulletSpeed,
        enemy.bulletSize,
        enemy.bulletColor,
        enemy.bulletShape,
        angle,
        enemy.bulletSpiralColor,
        enemy.bulletRotationSpeed
      )
    );
    // On fait tourner la spirale pour le prochain tir
    enemy.shotAngle += enemy.shotAngleSpeed;
  },

  /**
   * Tir chaotique / test.
   *
   * - Plusieurs balles
   * - Angles aléatoires
   * - Pattern imprévisible (bon pour ennemis “fous” ou power-ups)
   */ boom(enemy, bulletsArray) {
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle = enemy.shotAngle + random(count);
      bulletsArray.push(
        new EnemyBullet(
          enemy.x,
          enemy.y + enemy.size / 2,
          enemy.bulletSpeed,
          enemy.bulletSize,
          enemy.bulletColor,
          enemy.bulletShape,
          angle,
          enemy.bulletSpiralColor,
          enemy.bulletRotationSpeed
        )
      );
    }
  },

  /**
   * Tir en cône (fusil à pompe).
   *
   * - Plusieurs balles en éventail
   * - Angles légèrement randomisés
   * - Très efficace à courte/moyenne distance
   */ shotgun(enemy, bulletsArray) {
    const spread = 0.3; // angle d’ouverture (~17°)
    const count = 7; // nombre de balles

    for (let i = 0; i < count; i++) {
      const angle = enemy.shotAngle + random(-spread, spread);
      bulletsArray.push(
        new EnemyBullet(
          enemy.x,
          enemy.y + enemy.size / 2,
          enemy.bulletSpeed,
          enemy.bulletSize,
          enemy.bulletColor,
          enemy.bulletShape,
          angle,
          enemy.bulletSpiralColor,
          0
        )
      );
    }
  },
};
