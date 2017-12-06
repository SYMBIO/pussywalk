import Constants from './Constants'
import FlashTexture from './FlashTexture'
import SpriteSheet from 'spritesheet-canvas'
// import SpriteSheet0 from '../../images/spritesheet-0.json'
// import SpriteSheet1 from '../../images/spritesheet-1.json'

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

    this.vignette = new Image()
    this.vignette.src = "images/misc/vignette.png"

    this.render = this.render.bind(this)
    this.drawTexture = this.drawTexture.bind(this)
    this.setState = this.setState.bind(this)

    this.prepareTextures()
  }

  prepareTextures() {
    for (var i = 0; i < 4; i++) {
      let image = new Image()
      image.src = "images/level/level_" + (i + 1) + ".jpg"
      this.levelTextures.push(image)
    }

    var combinedConfig = {}
    // Sprite
    var i = 0
    while (true) {
      let config
      let image
      try {
        config = require('../../images/spritesheet-' + i + '.json')
      } catch (e) {
        // statements to handle any exceptions
        break
      }

      // Went through OK
      image = new Image()
      image.src = 'images/spritesheet-' + i + '.png'

      for (let key in config.frames) {
        let frame = config.frames[key]
        frame.src = key
        frame.image = image
        combinedConfig[key] = frame
      }

      i++
    }

    for (let key in Constants.texturesConfig) {
      let textureConfig = Constants.texturesConfig[key]
      let name = textureConfig.name ? textureConfig.name : textureConfig.body
      if (combinedConfig[textureConfig.asset]) {
        textureConfig.frame = combinedConfig[textureConfig.asset].frame
      }

      textureConfig.image = combinedConfig[textureConfig.asset].image
      this.texturesConfig[name] = textureConfig
    }

    this.texturesConfig["body_mod"].visible = false
    this.texturesConfig["head_mod"].visible = false

    this.texturesConfig["sheep_body"].visible = false
    this.texturesConfig["sheep_arm"].visible = false
    this.texturesConfig["sheep_leg"].visible = false
    this.texturesConfig["sheep_chain"].visible = false
    this.texturesConfig["sheep_udder"].visible = false
    this.texturesConfig["sheep_head"].visible = false

    this.texturesConfig["outline_sheep_body"].visible = false
    this.texturesConfig["outline_sheep_head"].visible = false
    this.texturesConfig["outline_sheep_leg"].visible = false
  }

  setState(state) {
    for (let key in state) {
      this.state[key] = state[key]
      if (key == "sheep" && state[key]) {
        this.flash()

        this.texturesConfig["head"].visible = false
        this.texturesConfig["body"].visible = false
        this.texturesConfig["body_mod"].visible = true
        this.texturesConfig["head_mod"].visible = true

        this.texturesConfig["sheep_body"].visible = true
        this.texturesConfig["sheep_arm"].visible = true
        this.texturesConfig["sheep_leg"].visible = true
        this.texturesConfig["sheep_chain"].visible = true
        this.texturesConfig["sheep_udder"].visible = true
        this.texturesConfig["sheep_head"].visible = true

        this.texturesConfig["outline_sheep_body"].visible = true
        this.texturesConfig["outline_sheep_head"].visible = true
        this.texturesConfig["outline_sheep_leg"].visible = true
      }
    }
  }

  flash() {
    let body = this.bodies.body
    let flashTexture = new FlashTexture(
      body.GetPosition().get_x() * this.physicsScale * this.scale,
      -body.GetPosition().get_y() * this.physicsScale * this.scale
    )
    this.texturesConfig["flash"] = flashTexture
    let that = this
    flashTexture.completionBlock = function() {
      delete that.texturesConfig["flash"]
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
      y: bodyOffset.y + this.canvas.height / 2 - 100
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

    // // Putin's face:
    // if (startIndex == 0) {
    //   let offset = {
    //     eye1: {
    //       x: 1780,
    //       y: 650
    //     },
    //     eye2: {
    //       x: 1850,
    //       y: 650
    //     }
    //   }
    //   var image = new Image();
    //   let percent = (this.bodies['body'].GetPosition().get_x() * this.physicsScale - (offset.eye1.x + offset.eye2.x) / 2) / 500
    //   percent = Math.min(1, Math.max(-1, percent))
    //
    //   let position;
    //
    //   position = {
    //     x: (offset.eye1.x + percent * 10) * this.scale,
    //     y: offset.eye1.y * this.scale
    //   }
    //   this.context.translate(position.x, position.y);
    //   image.src = "images/eyeball.png";
    //   this.context.drawImage(image, percent * 10, 0)
    //   this.context.translate(-position.x, -position.y);
    //
    //   position = {
    //     x: (offset.eye2.x + percent * 10) * this.scale,
    //     y: offset.eye2.y * this.scale
    //   }
    //   this.context.translate(position.x, position.y);
    //   image.src = "images/eyeball.png";
    //   this.context.drawImage(image, percent * 10, 0)
    //   this.context.translate(-position.x, -position.y);
    // }

    // Draw elements incl. figure
    for (var i in this.texturesConfig) {
      let textureConfig = this.texturesConfig[i]
      if (textureConfig.visible == false) {
        continue
      }
      this.drawTexture(textureConfig)
    }

    // Lift number

    let x = this.bodies.lift_1.GetPosition().get_x()
    let y = this.bodies.lift_1.GetPosition().get_y()
    let percentage = Math.max(0, (y + 39.8187) / (-32.1753 + 39.8187) * 18)

    x = (x * this.physicsScale - 30) * this.scale
    y = -(y * this.physicsScale + 500) * this.scale

    this.context.font = Math.round(48 * this.scale) + 'px serif';
    this.context.fillStyle = "#FFF"
    this.context.fillText(Math.round(percentage) + '%', x, y);

    this.context.drawImage(this.vignette,
      0,
      0,
      300,
      300,
      canvasOffset.x,
      -canvasOffset.y,
      this.context.canvas.width,
      this.context.canvas.height)

      // Debug draw

  // this.context.scale(this.physicsScale * this.scale, this.physicsScale * this.scale);
  // this.context.lineWidth = 1 / this.physicsScale;
  // this.context.scale(1, -1);
  // this.world.DrawDebugData();
  }

  drawTexture(textureConfig) {

    let angle
    let position
    let offset
    let alpha
    let scale
    let compositeOperation

    let frame = textureConfig.frame ? textureConfig.frame : {
      x: 0,
      y: 0,
      w: textureConfig.image.naturalWidth,
      h: textureConfig.image.naturalHeight
    }

    if (textureConfig.isFixed) {

      angle = 0
      position = {
        x: textureConfig.x,
        y: textureConfig.y
      }
      offset = {
        x: textureConfig.offsetX * this.scale,
        y: textureConfig.offsetY * this.scale
      }
      alpha = textureConfig.alpha
      scale = textureConfig.scale

      // compositeOperation = "screen"

    } else {
      if (this.bodies[textureConfig.body] == null) {
        return
      }

      let name = textureConfig.name ? textureConfig.name : textureConfig.body
      let body = this.bodies[textureConfig.body];

      position = {
        x: body.GetPosition().get_x() * this.physicsScale * this.scale,
        y: -body.GetPosition().get_y() * this.physicsScale * this.scale
      }

      offset = {
        x: -frame.w / 4 * this.scale,
        y: -frame.h / 4 * this.scale,
      }

      if (textureConfig.offset) {
        offset.x += textureConfig.offset.x * this.scale
        offset.y += textureConfig.offset.y * this.scale
      }

      angle = textureConfig.fixedAngle ? 0 : -body.GetAngle()
      alpha = 1
      scale = 1
    }

    this.context.translate(position.x, position.y);
    this.context.rotate(angle)
    // this.context.globalAlpha = alpha;
    // if (compositeOperation) {
    //   this.context.globalCompositeOperation = compositeOperation
    // }

    this.context.drawImage(textureConfig.image,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      offset.x,
      offset.y,
      frame.w / 2 * this.scale * scale,
      frame.h / 2 * this.scale * scale
    )

    // if (body.name == 'head') {
    //   this.walk_spritesheet.tick();
    //   this.walk_spritesheet.draw(this.context);
    // }
    // if (compositeOperation) {
    //   this.context.globalCompositeOperation = "source-over"
    // }
    // this.context.globalAlpha = 1
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
