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

    this.scale = 64

    this.render = this.render.bind(this)

    var walk_texture = new Image();
    walk_texture.src = "images/walk_texture.png";

    this.walk_spritesheet = SpriteSheet.new(walk_texture, {
      frames: [100, 100, 100], //Each frame defined by the amount of time it will be rendered before moving on
      x: 0, //Start coordinates of the sequence
      y: 0,
      width: 48, //Size of each frame. Only supports one frame size for all
      height: 48,
      restart: true, //Loops the sequence
      autoPlay: true, //Starts the
    });

    for (var i = 0; i < 4; i++) {
      let image = new Image()
      image.src = "images/level/level_" + (i + 1) + ".jpg"
      this.levelTextures.push(image)
    }

    for (var key in bodies) {
      let body = bodies[key]
      let index = Constants.textureNames.indexOf(body.name)
      if (index != -1) {
        let image = new Image()
        image.src = "images/figure/" + body.name + ".png"
        this.textures[body.name] = image
      }
    }
  }

  render(bodies) {

    // Graphics

    var canvasOffset = {
      x: -this.bodies['body'].GetPosition().get_x() * this.scale + this.canvas.width / 2 + 10,
      y: this.bodies['body'].GetPosition().get_y() * this.scale + this.canvas.height / 2 + 10
    };

    canvasOffset.x = Math.round(canvasOffset.x)

    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.translate(canvasOffset.x, canvasOffset.y);

    // Draw level
    let startIndex = Math.max(1, Math.ceil(-(canvasOffset.x) / 3000))
    let endIndex = Math.min(4, startIndex + 2)
    for (var i = startIndex; i < endIndex; i++) {
      this.context.drawImage(this.levelTextures[i - 1], (i - 1) * 3000, 0)
    }

    // Draw figure
    for (var i in Constants.textureNames) {

      let textureName = Constants.textureNames[i]
      if (this.bodies[textureName] == null) {
        continue;
      }

      let texture = this.textures[textureName]
      let body = this.bodies[textureName];

      let position = {
        x: body.GetPosition().get_x() * this.scale,
        y: -body.GetPosition().get_y() * this.scale
      }

      let offset = {
        x: -texture.naturalWidth / 2,
        y: -texture.naturalHeight / 2
      }

      if (Constants.offsets[textureName]) {
        offset.x += Constants.offsets[textureName].x
        offset.y += Constants.offsets[textureName].y
      }

      this.context.translate(position.x, position.y);
      this.context.rotate(-body.GetAngle())
      // Stretch out the textures becuase we have 1x scale only now
      this.context.drawImage(texture,
        0,
        0,
        texture.naturalWidth,
        texture.naturalHeight,
        offset.x * 2,
        offset.y * 2,
        texture.naturalWidth * 2,
        texture.naturalHeight * 2
      )

      if (body.name == 'head') {
        this.walk_spritesheet.tick();
        this.walk_spritesheet.draw(this.context);
      }

      this.context.rotate(body.GetAngle())
      this.context.translate(-position.x, -position.y);
    }

    // Debug draw

    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.translate(canvasOffset.x, canvasOffset.y);
    this.context.scale(this.scale, this.scale);
    this.context.lineWidth = 1 / this.scale;

    this.context.scale(1, -1);
    this.context.rect(this.bodies.lift_1.GetPosition().get_x(),
      this.bodies.lift_1.GetPosition().get_y(), 10, 10);
    this.context.stroke();
    this.world.DrawDebugData();
  }

}
