import Player from './player.js'

class MainScene extends Phaser.Scene {
    constructor () {
        super('main');
    }

	// Preload() runs before the game starts
	// Used for preloading assets into your scene, such as images and sounds.
    preload() {
		this.load.spritesheet('mask-dude-idle', 'assets/mask-dude/idle.png', { frameWidth: 32, frameHeight: 32 });
		this.load.spritesheet('mask-dude-run', 'assets/mask-dude/run.png', { frameWidth: 32, frameHeight: 32 });
		this.load.spritesheet('mask-dude-jump', 'assets/mask-dude/jump.png', { frameWidth: 32, frameHeight: 32 });
		this.load.image('bg-yellow', 'assets/background/Yellow.png');
		this.load.image('terrain', 'assets/map/terrain.png');
		this.load.tilemapTiledJSON('map', 'assets/map/map.json');
		this.load.image('bullet', 'assets/spikeball.png');
    }

	// Create() runs when we start the game
    create(data) {
        // Keys we want to get information about
		this.keys = this.input.keyboard.addKeys({
			w: Phaser.Input.Keyboard.KeyCodes.W,
			a: Phaser.Input.Keyboard.KeyCodes.A,
			s: Phaser.Input.Keyboard.KeyCodes.S,
			d: Phaser.Input.Keyboard.KeyCodes.D,
			q: Phaser.Input.Keyboard.KeyCodes.Q,
			space: Phaser.Input.Keyboard.KeyCodes.SPACE
		})

		// Background
		this.bg = this.add.tileSprite(0, 0, config.width*2, config.height*2, 'bg-yellow')
		this.bg.setScrollFactor(0)
		this.bg.setOrigin(0, 0)
		this.bg.setScale(0.5)

		// Map
		this.map = this.add.tilemap('map')
		let tileset = this.map.addTilesetImage('terrain', 'terrain')
		let mainLayer = this.map.createLayer('Tile Layer 1', tileset)
		
		// Idle animation
		let maskDudeIdle = this.anims.generateFrameNames('mask-dude-idle');
		this.anims.create({ key: 'mask-dude-idle', frames: maskDudeIdle, frameRate: 20, repeat: -1 });
		
		// Run animation
		let maskDudeRun = this.anims.generateFrameNames('mask-dude-run');
		this.anims.create({ key: 'mask-dude-run', frames: maskDudeRun, frameRate: 20, repeat: -1 });
		// Player
		const spawnPoint = this.map.findObject("Objects", obj => obj.name === "Spawn Point");
		this.player = new Player(this, spawnPoint.x, spawnPoint.y);
		
		// Camera
		this.camera = this.cameras.main;
		this.camera.startFollow(this.player, false, 0.5, 0.5)
		this.camera.setZoom(1.5)

		// Bullets
		this.bullets = this.physics.add.group({ allowGravity: false, setImmovable: true })

		// Collisions
		this.physics.add.collider(this.player, mainLayer)
		mainLayer.setCollisionBetween(0,999);
		this.physics.add.collider(this.bullets, mainLayer, (bullet, layer) => bullet.destroy(true))

		// Put tile on click
		this.input.on(Phaser.Input.Events.POINTER_UP, (pointer) => {
			if (!mainLayer.hasTileAtWorldXY(pointer.worldX, pointer.worldY)) {
				this.score++
				mainLayer.putTileAtWorldXY(211, pointer.worldX, pointer.worldY)
			} else {
				this.loseGame()
			}
		})

		// Score text
		this.score = 0;
	    this.scoreText = this.add.text(
	      config.width / 2, // x
	      config.height - 100, // y
	      'Score: 0', // text
	      { font: "22px Arial Black", fill: "#fff"}); // Font settings
		this.scoreText.setOrigin(0.5, 0.5)
		this.scoreText.setScrollFactor(0)
    }

	// Update() runs many times per second
    update(time, delta) {
		let keys = this.keys;
		this.bg.tilePositionX = this.camera.scrollX / 2
		this.bg.tilePositionY = this.camera.scrollY / 2
		this.player.update()
		
		if (Phaser.Input.Keyboard.JustDown(keys.q)) {
			let bullet = this.physics.add.sprite(this.player.x, this.player.y, 'bullet')
			bullet.special = true
			this.bullets.add(bullet)
		}
		if (Phaser.Input.Keyboard.JustDown(keys.space)) {
			if (this.player.flipX) {
				let bullet = this.physics.add.image(this.player.x-10, this.player.y, 'bullet')
				this.bullets.add(bullet)
				bullet.setVelocityX(-400)
			} else {
				let bullet = this.physics.add.image(this.player.x+10, this.player.y, 'bullet')
				this.bullets.add(bullet)
				bullet.setVelocityX(400)
			}
		}

		this.scoreText.setText("Score: " + this.score)
    }
	
	async setHighScore(score) {
		let url = 'https://tgigame.onrender.com/highscore'
		if (window.location.hostname.includes('gitpod')) {
			url = 'https://5000-andreasgan-tgiworkbench-q4ksoso37ck.ws-eu44.gitpod.io/highscore'
		}
		await fetch(`${url}/${score}${window.location.search}`)
	}

	loseGame() {
		this.setHighScore(this.score)
		this.player.setVelocityX(0)
		this.player.play('mask-dude-idle', true)
	    const text = this.add.text(
	      config.width / 2, // width
	      100, // height
	      'GAME OVER', // text
	      { font: "22px Arial Black", fill: "#fff"}); // Font settings
		text.setOrigin(0.5, 0.5)
		text.setScrollFactor(0)
	}
	
	winGame() {
		this.setHighScore(this.score)
		this.player.setVelocityX(0)
		this.player.play('mask-dude-idle', true)
	    const text = this.add.text(
	      config.width / 2,
	      100,
	      'YOU WON',
	      { font: "22px Arial Black", fill: "#fff"}).setOrigin(0.5, 0.5);
		text.setScrollFactor(0)
	}
}

/** @type Phaser.Types.Core.GameConfig */
const config = {
    width: 600,
    height: 400,
    backgroundColor: '#f9f9f9',
	pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 700
            },
            debug: false
        }
    },
	fps: {
		target: 30,
		min: 30,
	},
    scene: [MainScene]
};

const game = new Phaser.Game(config);

window.game = game;