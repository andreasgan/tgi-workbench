

		
let peer = new Peer();

peer.on('open', function (id) {
	console.log('ID: ' + peer.id);
	document.getElementById("myId").innerHTML = "ID: " + peer.id;
});

let conn;

function setupPeer() {
	let id = document.getElementById("peerInput").value
	console.log(id)
	conn = peer.connect(id);
	conn.on('open', function(){
		console.log(conn.id)
		setInterval(() => conn.send("hi"), 1000)
	});
}


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
		this.player.setVelocity(160)
		this.player.play("mask-dude-run", true)

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

		this.enemy = undefined
		peer.on('connection', (c) => {
			conn = c
			conn.on('data', (data) => {
				document.getElementById("dump").innerHTML = data
				console.log(data);
				let playerId = data.playerId
				console.log("updating pos")
				if (!this.enemy) {
					this.enemy = this.add.sprite(data.x, data.y, 'mask-dude-idle');
					this.enemy.setOrigin(0,0)
				} else {
					if (data.type == "move") {
						this.enemy.setPosition(data.x, data.y)
					} else if (data.type == "playAnimation"){
						this.enemy.play(data.name, true)
					} else if (data.type == "setFlipX"){
						this.enemy.flipX = data.value
					}
				}
			});
		});
		
    }

    update(time, delta) {
		this.bg.tilePositionX = this.camera.scrollX / 2
		this.bg.tilePositionY = this.camera.scrollY / 2
		let keys = this.keys;
		let player = this.player;
		if (keys.a.isDown) {
			this.playAnimation('mask-dude-run', true)
			this.setFlipX(true)
			player.setVelocityX(-160);
		}
		else if (keys.d.isDown) {
			this.playAnimation('mask-dude-run', true)
			this.setFlipX(false)
			player.setVelocityX(160);
		} else {
			//player.setVelocityX(0);
		}
		if (Phaser.Input.Keyboard.JustDown(keys.w)) {
			if (player.body.blocked.down || player.body.touching.down) {
				this.playAnimation('mask-dude-jump', true)
				player.setVelocityY(-230);
			}
		}
		if (Phaser.Input.Keyboard.JustDown(keys.space)) {
			if (player.flipX) {
				let bullet = this.physics.add.image(player.x-10, player.y+5, 'bullet')
				this.bullets.add(bullet)
				bullet.setVelocityX(-400)
			} else {
				let bullet = this.physics.add.image(player.x+10, player.y+5, 'bullet')
				this.bullets.add(bullet)
				bullet.setVelocityX(400)
			}
		}
		if (player.body.velocity.x === 0 && player.body.velocity.y === 0) {
			this.playAnimation('mask-dude-idle')
		}

		if (conn) {
			conn.send({
				type: "move",
				x: player.body.position.x,
				y: player.body.position.y
			})
		}
    }

	setFlipX(value) {
		this.player.flipX = value
		if (conn) {
			conn.send({
				type: "setFlipX",
				value: value
			})
		}
	}

	playAnimation(name) {
		this.player.play(name, true)
		if (conn) {
			conn.send({
				type: "playAnimation",
				name: name
			})
		}
	}
}

const config = {
    type: Phaser.CANVAS,
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
	fps: {
		target: 10,
		min: 10,
	},
    scene: [Game]
};

const game = new Phaser.Game(config);