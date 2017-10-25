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
    this.scoreboard = []

    this.physicsScale = 64
    this.scale = 1

    this.render = this.render.bind(this)

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

    var canvasOffset = {
      x: -this.bodies['body'].GetPosition().get_x() * this.physicsScale + this.canvas.width / 2 + 10,
      y: this.bodies['body'].GetPosition().get_y() * this.physicsScale + this.canvas.height / 2 + 10
    };

    canvasOffset.x = Math.min(0, Math.round(canvasOffset.x))
    canvasOffset.y = Math.min(0, Math.round(canvasOffset.y))

    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.translate(canvasOffset.x, canvasOffset.y);

    // Draw level
    let startIndex = Math.max(1, Math.ceil(-(canvasOffset.x) / 3000))
    let endIndex = Math.min(4, startIndex + 2)
    for (var i = startIndex; i < endIndex; i++) {
      this.context.drawImage(this.levelTextures[i - 1], (i - 1) * 3000, 0)
    }

    // Putin's face:
    if (startIndex == 1) {
      // Offset 1500
      let offset = {
        eye1: {
          x: 1870,
          y: 650
        },
        eye2: {
          x: 1920,
          y: 650
        }
      }
      var image = new Image();
      let percent = (this.bodies['body'].GetPosition().get_x() * this.physicsScale - (offset.eye1.x + offset.eye2.x) / 2) / 500
      percent = Math.min(1, Math.max(-1, percent))

      image.src = "images/eyeball.png";
      this.context.drawImage(image, offset.eye1.x + percent * 10, offset.eye1.y)

      image.src = "images/eyeball.png";
      this.context.drawImage(image, offset.eye2.x + percent * 10, offset.eye2.y)
    }

    // Scoreboard

    this.context.font = '48px serif';
    this.context.fillStyle = "#F00"
    for (var i = 0; i < this.scoreboard.length; i++) {
      this.context.fillText(this.scoreboard[i], 1000, 500 + 50 * i);
    }

    // Draw figure
    for (var i in Constants.textureNames) {

      let textureName = Constants.textureNames[i]
      if (this.bodies[textureName.body] == null) {
        continue;
      }

      let texture = this.textures[textureName.body]
      let body = this.bodies[textureName.body];

      let position = {
        x: body.GetPosition().get_x() * this.physicsScale,
        y: -body.GetPosition().get_y() * this.physicsScale
      }

      let offset = {
        x: -texture.naturalWidth / 2,
        y: -texture.naturalHeight / 2
      }

      if (Constants.offsets[textureName.body]) {
        offset.x += Constants.offsets[textureName.body].x
        offset.y += Constants.offsets[textureName.body].y
      }

      this.context.translate(position.x, position.y);
      this.context.rotate(-body.GetAngle())
      this.context.drawImage(texture,
        0,
        0,
        texture.naturalWidth,
        texture.naturalHeight,
        offset.x / this.scale,
        offset.y / this.scale,
        texture.naturalWidth / this.scale,
        texture.naturalHeight / this.scale
      )

      // if (body.name == 'head') {
      //   this.walk_spritesheet.tick();
      //   this.walk_spritesheet.draw(this.context);
      // }

      this.context.rotate(body.GetAngle())
      this.context.translate(-position.x, -position.y);
    }

    // Debug draw

    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.translate(canvasOffset.x, canvasOffset.y);
    this.context.scale(this.physicsScale, this.physicsScale);
    this.context.lineWidth = 1 / this.physicsScale;

    this.context.scale(1, -1);
    this.world.DrawDebugData();
  }

  dispose() {
    this.world = null
    this.canvas = null
    this.context = null
    this.bodies = null
    this.levelTextures = null
    this.textures = null
    this.scoreboard = null
  }
}
