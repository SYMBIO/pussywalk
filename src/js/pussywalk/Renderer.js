import Constants from './Constants'
import SpriteSheet from 'spritesheet-canvas'

export default class Renderer {

  constructor(world, canvas, bodies) {
    this.world = world
    this.canvas = canvas
    this.context = this.canvas.getContext('2d')
    this.bodies = bodies
    this.levelTextures = []
    this.textures = {}

    this.physicsScale = 64
    this.scale = 1

    this.render = this.render.bind(this)
    this.drawTexture = this.drawTexture.bind(this)

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

    let mappedTextureNames = Constants.textureNames.map(function(textureName) {
      return textureName.body
    })

    for (var key in bodies) {
      let body = bodies[key]
      let index = mappedTextureNames.indexOf(body.name)
      if (index != -1) {
        let image = new Image()
        image.src = "images/" + Constants.textureNames[index].asset
        this.textures[body.name] = image
      }
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
    for (var i in Constants.textureNames) {
      this.drawTexture(Constants.textureNames[i])
    }

  // // Debug draw
  //
  // this.context.setTransform(1, 0, 0, 1, 0, 0);
  // // this.context.translate(canvasOffset.x, canvasOffset.y);
  // this.context.scale(this.physicsScale, this.physicsScale);
  // this.context.lineWidth = 1 / this.physicsScale;
  //
  // this.context.scale(1, -1);
  // this.world.DrawDebugData();
  }

  drawTexture(textureName) {
    if (this.bodies[textureName.body] == null) {
      return
    }

    let texture = this.textures[textureName.body]
    let body = this.bodies[textureName.body];

    let position = {
      x: body.GetPosition().get_x() * this.physicsScale * this.scale,
      y: -body.GetPosition().get_y() * this.physicsScale * this.scale
    }

    let offset = {
      x: -texture.naturalWidth / 4 * this.scale,
      y: -texture.naturalHeight / 4 * this.scale,
    }

    if (Constants.offsets[texture.body]) {
      offset.x += Constants.offsets[textureName.body].x * this.scale
      offset.y += Constants.offsets[textureName.body].y * this.scale
    }

    this.context.translate(position.x, position.y);
    this.context.rotate(-body.GetAngle())
    this.context.drawImage(texture,
      0,
      0,
      texture.naturalWidth,
      texture.naturalHeight,
      offset.x,
      offset.y,
      texture.naturalWidth / 2 * this.scale,
      texture.naturalHeight / 2 * this.scale
    )

    // if (body.name == 'head') {
    //   this.walk_spritesheet.tick();
    //   this.walk_spritesheet.draw(this.context);
    // }

    this.context.rotate(body.GetAngle())
    this.context.translate(-position.x, -position.y);

  }

  dispose() {
    this.world = null
    this.canvas = null
    this.context = null
    this.bodies = null
    this.levelTextures = null
    this.textures = null
  }
}
