localStorage.debug = 'socket.io-client:socket'
class Game extends Phaser.Scene {
    constructor () {
        super('Boot');
    }

    preload() {
        // Used for preloading assets into your scene, such as images and sounds.
		this.load.spritesheet('mask-dude-idle', 'assets/mask-dude/idle.png', { frameWidth: 32, frameHeight: 32 });
		this.load.spritesheet('mask-dude-run', 'assets/mask-dude/run.png', { frameWidth: 32, frameHeight: 32 });
		this.load.spritesheet('mask-dude-jump', 'assets/mask-dude/jump.png', { frameWidth: 32, frameHeight: 32 });
		this.load.atlasXML('players', 'assets/spritesheet_players.png', 'assets/spritesheet_players.xml');
		this.load.image('bg-purple', 'assets/Background/Purple.png');
		this.load.image('terrain', 'assets/map/terrain.png');
		this.load.tilemapTiledJSON('mapa', 'assets/map/2.json');
		this.load.image('bullet', 'assets/spikeball.png');
		this.socket = io("https://tgi-workbench.tgi-koding.repl.co/");
    }

    create(data) {
        // Used to add objects to your game
		this.keys = this.input.keyboard.addKeys({
			w: Phaser.Input.Keyboard.KeyCodes.W,
			a: Phaser.Input.Keyboard.KeyCodes.A,
			s: Phaser.Input.Keyboard.KeyCodes.S,
			d: Phaser.Input.Keyboard.KeyCodes.D,
			space: Phaser.Input.Keyboard.KeyCodes.SPACE
		})

		// Background
		this.bg = this.add.tileSprite(0, 0, config.width*2, config.height*2, 'bg-purple')
		this.bg.setScrollFactor(0)
		this.bg.setOrigin(0, 0)
		this.bg.setScale(0.5)

		this.map = this.add.tilemap('mapa')
		let tileset = this.map.addTilesetImage('terrain', 'terrain')
		let mainLayer = this.map.createLayer('a', tileset)
		
		// Idle animation
		let maskDudeIdle = this.anims.generateFrameNames('mask-dude-idle');
		this.anims.create({ key: 'mask-dude-idle', frames: maskDudeIdle, frameRate: 20, repeat: -1 });
		
		// Run animation
		let maskDudeRun = this.anims.generateFrameNames('mask-dude-run');
		this.anims.create({ key: 'mask-dude-run', frames: maskDudeRun, frameRate: 20, repeat: -1 });
		
		// Green guy (atlas)
		let greenWalk = this.anims.generateFrameNames('players', {
			prefix: 'playerGreen_walk',
			suffix: '.png',
			start: 1,
			end: 5
		});
		console.log(greenWalk)
		this.anims.create({ key: 'green-walk', frames: greenWalk, frameRate: 20, repeat: -1 });

		// Player
		const spawnPoint = this.map.findObject("objects", obj => obj.name === "Spawn Point");
		this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'mask-dude-idle');

		// Target
		const targetPoint = this.map.findObject("objects", obj => obj.name === "target");
		this.target = this.physics.add.sprite(targetPoint.x, targetPoint.y, 'mask-dude-idle');
		this.target.setImmovable(true)
		this.target.play('mask-dude-idle')

		// Camera
		this.camera = this.cameras.main;
		this.camera.startFollow(this.player, false, 0.5, 0.5)
		this.camera.setZoom(1.5)

		// Walls
		this.wallGroup = this.physics.add.staticGroup()
		this.physics.add.collider(this.wallGroup, this.player)

		this.box = this.add.rectangle(200, 300, 100, 100, 0xff66aa)
		this.wallGroup.add(this.box)

		// Bullets
		this.bullets = this.physics.add.group({ allowGravity: false, setImmovable: true })
		
		this.physics.add.collider(this.player, mainLayer)
		this.physics.add.collider(this.target, mainLayer)
		this.physics.add.collider(this.bullets, mainLayer, (bullet, layer) => bullet.destroy(true))
		this.physics.add.collider(this.bullets, this.target, (target, bullet) => {
			bullet.destroy(true)
			target.alpha -= 0.4
			if (target.alpha <= 0.1) {
				target.destroy(true)
			}
		})
		mainLayer.setCollisionBetween(0,999);
    }

    update(time, delta) {
		this.bg.tilePositionX = this.camera.scrollX / 2
		this.bg.tilePositionY = this.camera.scrollY / 2
		let keys = this.keys;
		let player = this.player;
		if (keys.a.isDown) {
			player.play('mask-dude-run', true)
			player.flipX = true;
			player.setVelocityX(-160);
		}
		else if (keys.d.isDown) {
			player.play('mask-dude-run', true)
			player.flipX = false;
			player.setVelocityX(160);
		} else {
			player.setVelocityX(0);
		}
		if (Phaser.Input.Keyboard.JustDown(keys.w)) {
			if (player.body.blocked.down || player.body.touching.down) {
				player.play('mask-dude-jump', true)
				player.setVelocityY(-210);
			}
		}
		if (Phaser.Input.Keyboard.JustDown(keys.space)) {
			let bullet = this.physics.add.image(player.body.position.x+10, player.body.position.y+15, 'bullet')
			this.bullets.add(bullet)
			bullet.setVelocityX(player.flipX ? -400 : 400)
		}
		if (player.body.velocity.x === 0 && player.body.velocity.y === 0) {
			player.play('mask-dude-idle', true)
		}
		this.socket.emit('info', {
			x: player.body.position.x
			y: player.body.position.y
		})
		
    }
}

const config = {
    type: Phaser.AUTO,
    width: 500,
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
    scene: [Game]
};

const game = new Phaser.Game(config);