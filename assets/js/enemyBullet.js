//  Représente un projectile tiré par un ennemi.
class EnemyBullet {
  constructor(
    x,
    y,
    bulletSpeed,
    bulletSize,
    color,
    shape,
    angle,
    spiralColor,
    rotationSpeed
  ) {
    // Position
    this.x = x;
    this.y = y;

    // Mouvement
    this.speed = bulletSpeed;

    // Taille & état
    this.size = bulletSize;
    this.dead = false;

    // Couleur principale
    this.color = color;

    // Forme du projectile (fallback si non défini)
    this.shape = shape || "rect";

    /**
     * Couleurs pour l'effet "spiral"
     * - baseColor : couleur par défaut (si null => "white")
     * - spiralColor : couleur alternative (utilisée dans l’animation)
     */
    this.baseColor = this.color || "white";
    this.spiralColor = spiralColor || this.color;

    // temps de vie de la balle pour l'animation
    this.life = 0;
    this.rotation = 0;
    this.rotationSpeed = rotationSpeed || 0;

    /**
     * Direction (vx/vy)
     * - Si angle === null : tir vertical simple vers le bas (vx=0, vy=speed)
     * - Sinon : tir directionnel avec cos/sin
     */
    if (angle === null) {
      this.vx = 0;
      this.vy = this.speed;
    } else {
      this.vx = cos(angle) * this.speed;
      this.vy = sin(angle) * this.speed;
    }
  }

  /**
   * Met à jour la balle :
   * - avance sa position (x += vx, y += vy)
   * - incrémente son "temps de vie" (life)
   * - applique la rotation (si rotationSpeed != 0)
   * - marque la balle comme "dead" :
   *    - si elle sort de l’écran
   *    - OU si elle a une rotation active et dépasse une durée de vie (ici > 50 frames)
   */
  update() {
    // Déplacement
    this.x += this.vx;
    this.y += this.vy;

    // Animation
    this.life++;
    this.rotation += this.rotationSpeed;

    // Si la balle est "animée" (rotation) : elle disparaît après 50 frames
    // (ça évite qu’un pattern spiral/fx ne reste trop longtemps)
    if (this.rotationSpeed !== 0 && this.life > 50) {
      this.dead = true;
    }

    // Sortie du canvas → on tue la balle (évite de remplir enemyBullets)
    if (
      this.y > height / 2 + this.size ||
      this.y < -height / 2 - this.size ||
      this.x < -width / 2 - this.size ||
      this.x > width / 2 + this.size
    ) {
      this.dead = true;
    }
  }

  /**
   * Affiche le projectile en WEBGL :
   * - translate au bon endroit
   * - applique une rotation Z si nécessaire
   * - animation de couleur : alterne entre color et spiralColor (effet pulsation)
   * - dessine la forme selon this.shape
   */
  draw() {
    push();
    // Position en 3D (z=30 pour être devant certains éléments)
    translate(this.x, this.y, 30);

    // Rotation visuelle (effet "balle qui tourne")
    rotateZ(this.rotation);
    /**
     * Animation de couleur :
     * t oscille entre 0 et 1 grâce à sin()
     * si t > 0.5 → on utilise spiralColor, sinon color
     */
    let t = (sin(this.life * 0.2) + 1) / 2; // entre 0 et 1
    let useAlt = t > 0.5;

    // Couleur
    fill(useAlt ? this.spiralColor : this.color);
    noStroke();

    // Forme (rendu en WEBGL)
    switch (this.shape) {
      case "circle":
        sphere(this.size);
        break;
      case "square":
        box(this.size);
        break;
      case "triangle":
        cone(this.size, this.size * 2);
        break;
      case "rect":
      default:
        plane(this.size, this.size * 3);
    }
    pop();
  }

  /**
   * Renvoie si le projectile doit être supprimé du tableau enemyBullets.
   * (Appelé dans app.js via filter)
   */
  isDead() {
    return this.dead;
  }
}
