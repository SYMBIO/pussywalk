import Constants from './Constants'
import SpriteSheet from 'spritesheet-canvas'

export default class Renderer {

  constructor(world, canvas, bodies) {
    this.world = world
    this.canvas = canvas
    this.context = this.canvas.getContext('2d')
    this.bodies = bodies
    this.levelTextures = []
    this.texturesConfig = {}

    this.physicsScale = 64
    this.scale = 1
    this.state = {}

    this.render = this.render.bind(this)
    this.drawTexture = this.drawTexture.bind(this)
    this.setState = this.setState.bind(this)

    var walk_texture = new Image();
    walk_texture.src = "images/walk_texture.png";

    // this.walk_spritesheet = SpriteSheet.new(walk_texture, {
    //   frames: [100, 100, 100], //Each frame defined by the amount of time it will be rendered before moving on
    //   x: 0, //Start coordinates of the sequence
    //   y: 0,
    //   width: 48, //Size of each frame. Only supports one frame size for all
    //   height: 48,
    //   restart: true, //Loops the sequence
    //   autoPlay: true, //Starts the
    // });

    for (var i = 0; i < 4; i++) {
      let image = new Image()
      image.src = "images/level/level_" + (i + 1) + ".jpg"
      this.levelTextures.push(image)
    }

    for (let key in Constants.texturesConfig) {
      let textureConfig = Constants.texturesConfig[key]
      let name = textureConfig.name ? textureConfig.name : textureConfig.body
      let image = new Image()
      image.src = "images/" + textureConfig.asset
      textureConfig.image = image
      this.texturesConfig[name] = textureConfig
    }
  }

  setState(state) {
    for (let key in state) {
      this.state[key] = state[key]
    }
  }

  render(bodies) {

    // Graphics

    // x: [0...3000] * scale
    let bodyOffset = {
      x: this.bodies['body'].GetPosition().get_x() * this.physicsScale * this.scale,
      y: this.bodies['body'].GetPosition().get_y() * this.physicsScale * this.scale
    };

    let canvasOffset = {
      x: bodyOffset.x - this.canvas.width / 2,
      y: bodyOffset.y + this.canvas.height / 2
    }

    canvasOffset.x = Math.max(0, Math.round(canvasOffset.x))
    canvasOffset.y = Math.min(0, Math.round(canvasOffset.y))

    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.translate(-canvasOffset.x, canvasOffset.y);

    // Draw level
    // let startIndex = Math.max(0, Math.floor(canvasOffset.x / 3000))
    let startIndex = 0
    // let endIndex = Math.min(3, Math.ceil((canvasOffset.x + this.canvas.width / this.scale) / 3000))
    let endIndex = 4
    for (var i = startIndex; i < endIndex; i++) {
      let texture = this.levelTextures[i]
      this.context.drawImage(texture,
        0,
        0,
        texture.naturalWidth,
        texture.naturalHeight,
        i * 3000 * this.scale,
        0,
        texture.naturalWidth * this.scale,
        texture.naturalHeight * this.scale
      )
    }

    // Putin's face:
    if (startIndex == 0) {
      let offset = {
        eye1: {
          x: 1780,
          y: 650
        },
        eye2: {
          x: 1850,
          y: 650
        }
      }
      var image = new Image();
      let percent = (this.bodies['body'].GetPosition().get_x() * this.physicsScale - (offset.eye1.x + offset.eye2.x) / 2) / 500
      percent = Math.min(1, Math.max(-1, percent))

      let position;

      position = {
        x: (offset.eye1.x + percent * 10) * this.scale,
        y: offset.eye1.y * this.scale
      }
      this.context.translate(position.x, position.y);
      image.src = "images/eyeball.png";
      this.context.drawImage(image, percent * 10, 0)
      this.context.translate(-position.x, -position.y);

      position = {
        x: (offset.eye2.x + percent * 10) * this.scale,
        y: offset.eye2.y * this.scale
      }
      this.context.translate(position.x, position.y);
      image.src = "images/eyeball.png";
      this.context.drawImage(image, percent * 10, 0)
      this.context.translate(-position.x, -position.y);
    }

    // Draw elements incl. figure
    for (var i in Constants.texturesConfig) {
      let textureConfig = Constants.texturesConfig[i]
      if (!this.state.sheep && textureConfig.body.indexOf("sheep_") == 0) {
        continue
      }
      this.drawTexture(textureConfig)
    }

    // Debug draw

  // this.context.setTransform(1, 0, 0, 1, 0, 0);
  // this.context.scale(this.physicsScale * this.scale, this.physicsScale * this.scale);
  // this.context.lineWidth = 1 / this.physicsScale;
  //
  // this.context.scale(1, -1);
  // this.world.DrawDebugData();
  }

  drawTexture(textureConfig) {

    if (this.bodies[textureConfig.body] == null) {
      return
    }

    let name = textureConfig.name ? textureConfig.name : textureConfig.body

    let image = textureConfig.image
    let body = this.bodies[textureConfig.body];

    let position = {
      x: body.GetPosition().get_x() * this.physicsScale * this.scale,
      y: -body.GetPosition().get_y() * this.physicsScale * this.scale
    }

    let offset = {
      x: -image.naturalWidth / 4 * this.scale,
      y: -image.naturalHeight / 4 * this.scale,
    }

    if (textureConfig.offset) {
      offset.x += textureConfig.offset.x * this.scale
      offset.y += textureConfig.offset.y * this.scale
    }

    let angle = textureConfig.fixedAngle ? 0 : -body.GetAngle()

    this.context.translate(position.x, position.y);
    this.context.rotate(angle)
    this.context.drawImage(image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      offset.x,
      offset.y,
      image.naturalWidth / 2 * this.scale,
      image.naturalHeight / 2 * this.scale
    )

    // if (body.name == 'head') {
    //   this.walk_spritesheet.tick();
    //   this.walk_spritesheet.draw(this.context);
    // }

    this.context.rotate(-angle)
    this.context.translate(-position.x, -position.y);

  }

  dispose() {
    this.world = null
    this.canvas = null
    this.context = null
    this.bodies = null
    this.levelTextures = null
    this.texturesConfig = null
  }
}
