const bulletPatterns = {
  // Tir tout droit vers le bas
  straight(enemy, bulletsArray) {
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

  // Exemple : burst circulaire
  radialBurst(enemy, bulletsArray) {
    const count = 12;
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
};
