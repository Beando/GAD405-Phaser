let firingTimer = 0;
let enemyBullets;
let living = [];
const mainState = {

  create: function () {
    //game.stage.backgroundColor = '#2d2d2d';

    game.add.tileSprite(0,0,800,600,'background');
    this.shipShot = game.add.audio('playerShoot');
    this.shipMove = game.add.audio('playerMove');
    this.enemyShoot = game.add.audio('enemyShoot');
    this.exp = game.add.audio('explode');
    this.ship = game.add.sprite(10, 250, 'ship');
    game.physics.enable(this.ship, Phaser.Physics.ARCADE);

    this.aliens = game.add.group();
    this.aliens.enableBody = true;
    this.aliens.physicsBodyType = Phaser.Physics.ARCADE;

    for (let i = 0; i < 56; i++) {
      let c = this.aliens.create(500 + (i % 8) * 80, 140 + Math.floor(i / 8) * 60, 'enemy');
      c.body.immovable = true;
    }

    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;

    for (let i = 0; i < 20; i++) {
      let b = this.bullets.create(0, 0, 'bullet');
      b.exists = false;
      b.visible = false;
      b.checkWorldBounds = true;
      b.events.onOutOfBounds.add((bullet) => { bullet.kill(); });
    }
    this.enemyBullets = game.add.group();
    this.enemyBullets.enableBody = true;
    this.enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyBullets.createMultiple(30, 'enemyBullet');
    this.enemyBullets.setAll('anchor.x', 0.5);
    this.enemyBullets.setAll('anchor.y', 1);
    this.enemyBullets.setAll('outOfBoundsKill', true);
    this.enemyBullets.setAll('checkWorldBounds', true);

    this.bulletTime = 0;

    this.explosion = this.game.add.sprite(0, 0, 'boom');
    this.explosion.exists = false;
    this.explosion.visible = false;
    this.explosion.anchor.x = 0.5;
    this.explosion.anchor.y = 0.5;
    this.explosion.animations.add('boom');

    this.lives = game.add.group();
    game.add.text(game.world.width - 250, 10, 'Lives : ', { font: '30px Arial', fill: '#fff' });

    for (let i = 0; i < 3; i++)
    {
        this.player = this.lives.create(game.world.width - 125 + (45 * i), 35, 'ship');
        this.player.anchor.setTo(0.5, 0.5);
        this.player.angle = 90;
    }

    this.highScore = localStorage.getItem('invadershighscore');
    if (this.highScore === null) {
      localStorage.setItem('invadershighscore', 0);
      this.highScore = 0;
    }

    this.score = 0;
    this.scoreDisplay = game.add.text(20, 20, `Score: ${this.score} \nHighScore: ${this.highScore}`, { font: '30px Arial', fill: '#fff' });



    this.cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
  },
enemyFires: function (){


      let enemyBullet = this.enemyBullets.getFirstExists(false);

      living.length=0;

      this.aliens.forEachAlive(function(alien){


          living.push(alien);
      });


      if (enemyBullet && living.length > 0)
      {
          this.enemyShoot.play();
          var random=game.rnd.integerInRange(0,living.length-1);

          var shooter=living[random];

          enemyBullet.reset(shooter.body.x, shooter.body.y);

          game.physics.arcade.moveToObject(enemyBullet,this.ship,120);
          firingTimer = game.time.now + 700;
      }

  },

  enemyFireHits: function(player,bullet){
    this.explosion.reset(this.ship.x + (this.ship.width / 2), this.ship.y + (this.ship.height / 2));
    bullet.kill();
    this.exp.play();
    game.camera.shake(0.03,100);
    this.explosion.animations.play('boom');
    this.score = this.score - 100;
    this.live = this.lives.getFirstAlive();

    if (this.live)
    {
        this.live.kill();

    }


    if (this.lives.countLiving() < 1)
    {
        this.ship.kill();
        this.enemyBullets.callAll('kill');
        game.state.start('gameover');
    }
  },

  fire: function () {
    if (game.time.now > this.bulletTime) {

      let bullet = this.bullets.getFirstExists(false);

      if (bullet) {
        this.shipShot.play();
        bullet.reset(this.ship.x + 45, this.ship.y +17);
        bullet.body.velocity.x = 300;
        this.bulletTime = game.time.now + 150;
      }
    }
  },

gameOver: function () {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('invadershighscore', this.highScore);
    }
    game.state.start('gameover');
  },
gameWin: function () {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('invadershighscore', this.highScore);
    }
    game.state.start('gamewin');
  },

  hit: function (bullet, enemy) {
    this.score = this.score + 10;
    this.explosion.reset(enemy.x+(enemy.width / 2),enemy.y+(enemy.height / 2));
    bullet.kill();
    enemy.kill();
    game.camera.shake(0.01,100);
    this.exp.play();
    this.explosion.animations.play('boom');
    if (this.aliens.countLiving() === 0) {
      this.score = this.score + 100;
      this.gameWin();
    }
    this.scoreDisplay.text = `Score: ${this.score} \nHighScore: ${this.highScore}`;
  },

  preload: function () {
    game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.load.image('ship', 'assets/ship.png');
    game.load.image('enemy', 'assets/enemy1.png');
    game.load.image('bullet', 'assets/bullet.png');
    //game.load.spritesheet('shooting', 'assets/Ship_shot_anim.png', 45, 45);
    game.load.image('background','assets/Background.png')
    game.load.image('enemyBullet','assets/enemyBullet.png')
    game.load.audio('playerShoot','assets/playerShoot.mp3')
    game.load.audio('playerMove','assets/playerMove.mp3')
    game.load.audio('enemyShoot','assets/enemyShoot.mp3')
    game.load.audio('explode','assets/explode.mp3')
    game.load.spritesheet('boom', 'assets/explosion.png', 45, 45);
  },

  shipGotHit: function (alien, ship) {

    this.ship.kill();

    this.gameOver()
  },

  update: function () {
    if (this.ship.alive){
    game.physics.arcade.overlap(this.bullets, this.aliens, this.hit, null, this);
    game.physics.arcade.overlap(this.aliens, this.ship, this.shipGotHit, null, this);
    game.physics.arcade.overlap(this.enemyBullets, this.ship, this.enemyFireHits, null, this);

    this.ship.body.velocity.y = 0;
    this.aliens.forEach(
      (alien) => {
        alien.body.position.x = alien.body.position.x - (Math.sin(game.time.now/100)) - 0.4;
        alien.body.position.y = alien.body.position.y + (1.3*(Math.sin(game.time.now/100)));
        //console.log(alien.body.position.y)
        if (alien.x  > game.y) { this.gameOver(); }
      }
    );

    if (this.cursors.up.isDown) {
      this.ship.body.velocity.y = -300;
      this.shipMove.play();
    } else if (this.cursors.down.isDown) {
      this.ship.body.velocity.y = 300;
      this.shipMove.play();
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
      this.fire();
    }
    if (game.time.now > firingTimer){
    this.enemyFires();
    }
  }
}
};

const gameoverState = {
  preload: function () {
    game.load.image('gameover', 'assets/gameover.png');
    game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
  },
  create: function () {
    const gameOverImg = game.cache.getImage('gameover');
    game.add.sprite(
      game.world.centerX - gameOverImg.width / 2,
      game.world.centerY - gameOverImg.height / 2,
      'gameover');
    game.input.onDown.add(() => { game.state.start('startScreen'); });
  }
};
const gamewinState = {
  preload: function () {
    game.load.image('gamewin', 'assets/gameover1.png');
    game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
  },
  create: function () {
    const gameWinImg = game.cache.getImage('gamewin');
    game.add.sprite(
      game.world.centerX - gameWinImg.width / 2,
      game.world.centerY - gameWinImg.height / 2,
      'gamewin');
    game.input.onDown.add(() => { game.state.start('startScreen'); });
  }
};
const startScreen = {
  preload: function () {
    game.load.image('startscreen', 'assets/startScreen.png');
    game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
  },
  create: function () {
    game.add.tileSprite(0,0,800,600,'startscreen');
    game.input.onDown.add(() => { game.state.start('main'); });
  }
};
const game = new Phaser.Game(800, 600);
game.state.add('startScreen',startScreen);
game.state.add('main', mainState);
game.state.add('gameover', gameoverState);
game.state.add('gamewin', gamewinState);
game.state.start('startScreen');
