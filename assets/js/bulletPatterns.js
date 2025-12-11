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

  // Tir en spirale
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

  // Tir test
  boom(enemy, bulletsArray) {
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

  // Tir rafal
  shotgun(enemy, bulletsArray) {
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
