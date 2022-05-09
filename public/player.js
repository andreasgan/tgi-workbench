
export default class Player extends Phaser.Physics.Arcade.Sprite {
    /**
        @param {Phaser.Scene} scene 
    */
    constructor(scene, x, y) {
      super(scene, x, y)
      this.setTexture('mask-dude-idle')
      scene.add.existing(this)
      scene.physics.add.existing(this)
    }

    update() {
        let keys = this.scene.keys;
		if (keys.a.isDown) {
			this.play('mask-dude-run', true)
			this.flipX = true
			this.setVelocityX(-160);
		}
		else if (keys.d.isDown) {
			this.play('mask-dude-run', true)
			this.flipX = false
			this.setVelocityX(160);
		} else {
			this.setVelocityX(0);
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