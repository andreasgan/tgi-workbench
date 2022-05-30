
import {RectangleButton} from './RectangleButton.js'

export default class Player extends Phaser.Physics.Arcade.Sprite {
	/**
		@param {Phaser.Scene} scene 
	*/
	constructor(scene, x, y) {
		super(scene, x, y)
		this.setTexture('mask-dude-idle')
		scene.add.existing(this)
		scene.physics.add.existing(this)
		this.setInteractive()
		this.on('pointerdown', (pointer) => {

			this.setTint(0xff0000);
			this.setVelocityY(-400)

		});

		let config = this.scene.game.config;
		if (scene.sys.game.device.os.desktop){
			console.log("desktop")
		}
		else {
			console.log("mobile")
		}
		if (!scene.sys.game.device.os.desktop) {
			this.buttonRight = new RectangleButton(scene, 
				config.width*0.75, // x
				config.height*0.75, // y
				 "👉");
			this.buttonRight.on("pointerdown", () => {
				this.moveRight()
			})
			this.buttonRight.on("pointerup", () => {
				this.stopMovement()
			})
			this.buttonLeft = new RectangleButton(scene, 
				config.width*0.25, // x
				config.height*0.75, // y
				 "👈");
			this.buttonLeft.on("pointerdown", () => {
				this.moveLeft()
			})
			this.buttonLeft.on("pointerup", () => {
				this.stopMovement()
			})
		}
	}

	moveLeft() {
		this.play('mask-dude-run', true)
		this.flipX = true
		this.setVelocityX(-160);
	}

	moveRight() {
		this.play('mask-dude-run', true)
		this.flipX = false
		this.setVelocityX(160);
	}

	stopMovement() {
		this.setVelocityX(0)
	}

	update() {
		let keys = this.scene.keys;
		if (keys.a.isDown) {
			this.moveLeft()
		}
		else if (keys.d.isDown) {
			this.moveRight()
		} else {
			//this.stopMovement()
		}
		if (keys.w.isDown) {
			if (this.body.blocked.down || this.body.touching.down) {
				this.setVelocityY(-270);
			}
		}
		if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
			this.play('mask-dude-idle', true)
		}
	}
}