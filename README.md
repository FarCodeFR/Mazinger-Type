# 🤖 Mazinger-Type

Un jeu de type **shoot'em up / bullet hell** inspiré de l'univers de Mazinger Z, développé avec **p5.js** et servi via **Express**.

## 🎮 Aperçu

<p align="center">
  <img src="https://github.com/user-attachments/assets/1fc13330-305b-417d-983d-daade12841cd" alt="Aperçu du jeu" width="500"/>
</p>

> Special thanks to [amstradmuseum.emu-france.info](https://amstradmuseum.emu-france.info/) for pics!

---

## ✨ Fonctionnalités

- 🚀 **Shoot'em up** — vaisseau joueur avec tirs et esquives
- 💥 **Bullet Hell** — patterns de tirs ennemis variés
- 👾 **Ennemis** — spawn dynamique avec patterns configurables
- 🎵 **Son** — effets sonores via p5.sound
- 🏆 **HUD** — affichage du score et du niveau en temps réel
- 📺 **Multi-niveaux** — progression par niveaux

---

## 🛠️ Stack technique

| Technologie | Version |
|---|---|
| JavaScript | ES6+ |
| p5.js | ^2.1.1 |
| p5.sound | 1.9.0 |
| Express | ^5.1.0 |
| HTML / CSS | — |

---

## 🚀 Installation & lancement

### Prérequis

- [Node.js](https://nodejs.org/) v18+

### Cloner le projet

```bash
git clone https://gitlab.com/ViriatoF/Mazinger-Type.git
cd Mazinger-Type
```

### Installer les dépendances

```bash
npm install
```

### Démarrer le serveur

```bash
npm run dev
```

Puis ouvre ton navigateur sur [http://localhost:3080](http://localhost:3080)

---

## 📁 Structure du projet

```
Mazinger-Type/
├── assets/
│   └── js/
│       ├── player.js          # Logique du joueur
│       ├── playerBullet.js    # Tirs du joueur
│       ├── enemy.js           # Logique des ennemis
│       ├── enemyBullet.js     # Tirs ennemis
│       ├── bulletPatterns.js  # Patterns de tirs
│       └── spawnPatterns.js   # Patterns de spawn
├── index.html                 # Page d'accueil / menu
├── game.html                  # Page de jeu
├── app.js                     # Logique principale p5.js
├── style.css                  # Styles
├── server.js                  # Serveur Express
└── package.json
```

---

## 🔧 Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Démarre le serveur Express |

---


<p align="center">Réalisé par ViriatoF et FarCodeFR </p>
