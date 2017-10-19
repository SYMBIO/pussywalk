import Constants from './Constants'

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
      y: 0
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

      this.context.rotate(body.GetAngle())
      this.context.translate(-position.x, -position.y);
    }

    // Debug draw
    //
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.translate(canvasOffset.x, canvasOffset.y);
    this.context.scale(this.scale, this.scale);
    this.context.lineWidth = 1 / this.scale;

    this.context.scale(1, -1);
    this.world.DrawDebugData();
  }

}
