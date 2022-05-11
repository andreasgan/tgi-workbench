
export default class Button extends Phaser.Physics.Arcade.Sprite {

    isDown = false

    constructor() {
      this.setInteractive()
      this.on('pointerdown', (pointer) => {
            isDown = true
        });

      this.on('pointerup', (pointer) => {
            isDown = false
        });
    
    }

}