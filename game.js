// Créer le jeu avec Phaser
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

// Variables globales
let player;
let cursors;
let fpsText;
let enemies = [];
let shrinkingZoneRadius = Math.min(window.innerWidth, window.innerHeight) / 2; // Zone initiale
let shrinkingZoneSpeed = 1; // Vitesse de réduction de la zone
let zoneCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 }; // Centre de la zone
let bullets = []; // Tableau des balles tirées par l'IA

function preload() {
  // Charger les ressources (sprites, arrière-plan, etc.)
  this.load.image('player', 'path_to_player_image.png');
  this.load.image('enemy', 'path_to_enemy_image.png');
  this.load.image('bullet', 'path_to_bullet_image.png');
}

function create() {
  // Créer le joueur
  player = this.physics.add.image(400, 300, 'player').setCollideWorldBounds(true);

  // Configurer les contrôles de la souris
  this.input.on('pointermove', function (pointer) {
    player.rotation = Phaser.Math.Angle.Between(player.x, player.y, pointer.x, pointer.y);
  });

  // Afficher les FPS
  fpsText = this.add.text(10, 10, 'FPS: 0', { font: '16px Arial', fill: '#fff' });

  // Créer quelques ennemis
  for (let i = 0; i < 5; i++) {
    let enemy = this.physics.add.image(Phaser.Math.Between(100, window.innerWidth - 100), Phaser.Math.Between(100, window.innerHeight - 100), 'enemy');
    enemies.push(enemy);
  }
}

function update() {
  // Mettre à jour le FPS
  fpsText.setText('FPS: ' + Math.round(this.game.loop.actualFps));

  // Mettre à jour la zone de rétrécissement
  updateShrinkingZone();

  // Déplacement du joueur
  if (this.input.activePointer.isDown) {
    this.physics.moveTo(player, this.input.x, this.input.y, 200);
  }

  // Mettre à jour les ennemis
  updateEnemies(this);

  // Mettre à jour les balles tirées par l'IA
  updateBullets();
}

// Fonction de mise à jour de la zone de rétrécissement
function updateShrinkingZone() {
  // Réduire la zone
  shrinkingZoneRadius -= shrinkingZoneSpeed;
  if (shrinkingZoneRadius < 50) shrinkingZoneRadius = 50; // La zone ne doit pas devenir trop petite

  // Afficher la zone (cercle)
  this.graphics = this.add.graphics();
  this.graphics.lineStyle(2, 0xff0000, 1);
  this.graphics.strokeCircle(zoneCenter.x, zoneCenter.y, shrinkingZoneRadius);

  // Vérifier si le joueur est dans la zone
  let distanceToCenter = Phaser.Math.Distance.Between(player.x, player.y, zoneCenter.x, zoneCenter.y);
  if (distanceToCenter > shrinkingZoneRadius) {
    // Le joueur est hors de la zone, il perd des PV ou il meurt
    console.log('Le joueur est hors de la zone!');
    // Pour simplifier, on peut mettre fin au jeu ici, mais tu peux ajouter un système de santé.
  }
}

// Fonction de mise à jour des ennemis
function updateEnemies(scene) {
  enemies.forEach(enemy => {
    // L'IA se dirige vers le joueur
    let angleToPlayer = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    scene.physics.moveTo(enemy, player.x, player.y, 100); // L'ennemi se déplace lentement vers le joueur

    // Tirer sur le joueur si dans une certaine distance
    let distanceToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
    if (distanceToPlayer < 300 && Phaser.Math.Between(0, 100) < 2) { // Tirer avec une probabilité
      shootBullet(enemy.x, enemy.y, angleToPlayer);
    }
  });
}

// Fonction pour tirer des balles
function shootBullet(x, y, angle) {
  let bullet = this.physics.add.image(x, y, 'bullet');
  bullet.setRotation(angle);
  this.physics.velocityFromRotation(angle, 400, bullet.body.velocity); // Vitesse de la balle

  bullets.push(bullet);

  // Détecter la collision avec le joueur
  this.physics.add.overlap(bullet, player, function () {
    console.log('Le joueur a été touché!');
    bullet.destroy();
    // Tu pourrais ici mettre en place un système de santé et de dommage.
  });
}

// Mettre à jour les balles tirées
function updateBullets() {
  bullets.forEach(bullet => {
    // Si la balle sort de l'écran, on la détruit
    if (bullet.x < 0 || bullet.x > window.innerWidth || bullet.y < 0 || bullet.y > window.innerHeight) {
      bullet.destroy();
    }
  });
}
