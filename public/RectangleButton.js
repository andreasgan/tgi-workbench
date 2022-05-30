
export class RectangleButton extends Phaser.GameObjects.Container {
    static preload(scene) {
		scene.load.image('rectanglebutton_base', 'assets/buttons/rectanglebutton_base.png');
		scene.load.image('rectanglebutton_pressed', 'assets/buttons/rectanglebutton_pressed.png');
    }
    /**
        @param {Phaser.Scene} scene 
    */
    constructor(scene, x, y, text) {
        super(scene, x, y)
        scene.add.existing(this)

        this.setScrollFactor(0)

        // Add the background
        this.bg = scene.add.sprite(0, 0, 'rectanglebutton_base')
        this.bg.setOrigin(0.5)
        this.bg.setScale(3)
        this.add(this.bg)

        // Add some text
        this.text = scene.add.text(0, 0, text)
        this.text.setOrigin(0.5)
        this.add(this.text)

        this.border = scene.add.rectangle(0, 0, 100, 50)
        this.add(this.border)

        this.setSize(this.bg.displayWidth, this.bg.displayHeight)
        this.setInteractive()
        this.on('pointerdown', (pointer) => {   
            this.text.setPosition(0, 2)
            this.bg.setTexture('rectanglebutton_pressed')
        });
        this.on('pointerup', (pointer) => {   
            this.text.setPosition(0, 0)
            this.bg.setTexture('rectanglebutton_base')
        });
    }

    update() {
    }
}