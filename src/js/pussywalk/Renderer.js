import Constants from './Constants'
import FlashTexture from './FlashTexture'
import HeadAnimator from './HeadAnimator'
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
    this.figureConfig = {}
    this.imagesConfig = {}

    this.physicsScale = 64
    this.scale = 1
    this.state = {}
    this.frameCounter = 0
    this.renderPorn = true
    this.isShowingBodyMod = false
    this.visibleLifes = []
    this.drawDebug = false

    this.vignette = new Image()
    this.vignette.src = "images/misc/vignette.png"

    this.furniceWall = new Image()
    this.furniceWall.src = "images/level/furnice_wall.jpg"

    this.render = this.render.bind(this)
    this.drawTexture = this.drawTexture.bind(this)
    this.setState = this.setState.bind(this)
    this.isNaked = this.isNaked.bind(this)

    this.prepareLights()
    this.prepareTextures()

    this.eyeball = this.imagesConfig["elements/eyeball.png"]
    this.mrP = this.imagesConfig["elements/mr_p.png"]
    this.pillbottle = this.imagesConfig["elements/pill_bottle.png"]
    this.headAnimator = new HeadAnimator(this.imagesConfig)
    this.sheep = this.imagesConfig["elements/ctveracek.png"]
    this.fanBackground = this.imagesConfig["elements/dira.png"]
    this.fan = this.imagesConfig["elements/vetrak.png"]
  }

  prepareLights() {
    var image
    this.lights = []

    image = new Image()
    image.src = "images/level/lights/fluorescent_bathroom.jpg"
    this.lights.push(image)

    image = new Image()
    image.src = "images/level/lights/fluorescent_general.jpg"
    this.lights.push(image)

    image = new Image()
    image.src = "images/level/lights/furnice.jpg"
    this.lights.push(image)

    image = new Image()
    image.src = "images/level/lights/general_lightbulb.jpg"
    this.lights.push(image)

    image = new Image()
    image.src = "images/level/lights/ovcacek_room_light.jpg"
    this.lights.push(image)

    image = new Image()
    image.src = "images/level/lights/warm_bathroom.jpg"
    this.lights.push(image)
  }

  prepareTextures() {
    for (var i = 0; i < 8; i++) {
      let image = new Image()
      image.src = "images/level/level_" + (i + 1) + ".jpg"
      this.levelTextures.push(image)
    }

    // Load spritesheets
    var i = 0
    while (true) {
      let config
      let image
      try {
        config = require('images/spritesheet-' + i + '.json')
      } catch (e) {
        // statements to handle any exceptions
        break
      }

      // Went through OK
      image = new Image()
      image.src = 'images/spritesheet-' + i + '.png'

      for (let path in config.frames) {
        let frame = config.frames[path]
        frame.image = image
        this.imagesConfig[path] = frame
      }

      i++
    }

    // Map texture configs
    for (let key in Constants.texturesConfig) {
      let textureConfig = Constants.texturesConfig[key]
      let name
      if (textureConfig.name) {
        name = textureConfig.name
      } else {
        if (textureConfig.body) {
          name = textureConfig.body
        } else {
          name = textureConfig.asset
        }
      }

      if (this.imagesConfig[textureConfig.asset] == null) {
        console.log("Can't find imagesConfig element " + textureConfig.asset);
      }

      textureConfig.frame = this.imagesConfig[textureConfig.asset].frame
      textureConfig.image = this.imagesConfig[textureConfig.asset].image

      this.texturesConfig[name] = textureConfig
    }

    // Map naked body configs
    let bodyTexturesConfig = Constants.nakedBodyTexturesConfig.concat(Constants.dressedBodyTexturesConfig)
    for (let key in bodyTexturesConfig) {
      let textureConfig = bodyTexturesConfig[key]
      let name
      if (textureConfig.name) {
        name = textureConfig.name
      } else {
        if (textureConfig.body) {
          name = textureConfig.body
        } else {
          name = textureConfig.asset
        }
      }

      if (this.imagesConfig[textureConfig.asset] == null) {
        console.log("Can't find imagesConfig element " + textureConfig.asset);
      }

      textureConfig.frame = this.imagesConfig[textureConfig.asset].frame
      textureConfig.image = this.imagesConfig[textureConfig.asset].image

      this.figureConfig[name] = textureConfig
    }

    this.showNakedBody(false)
    this.setModded(false)
  }

  setState(state) {
    for (let key in state) {
      switch (key) {
        case "sheep":
          this.flash()
          this.setModded(state[key])
          break;
        case "renderPorn":
          this.renderPorn = state[key]
          break;
        case "drawDebug":
          this.drawDebug = state[key]
          break;
        case "naked":
          this.showNakedBody(state[key])
          break;
        case "visibleLifes":
          this.visibleLifes = state[key]
          this.flash()
          break
      }
    }
  }

  isNaked() {
    return this.figurePrefix == "naked_"
  }

  showNakedBody(show) {
    this.figurePrefix = show ? "naked_" : "dressed_"
    this.activeFigureConfig = {}
    for (var key in this.figureConfig) {
      let figureConfig = this.figureConfig[key]
      if (figureConfig.name.indexOf(this.figurePrefix) == 0) {
        this.activeFigureConfig[key] = figureConfig;
      }
    }

    this.setModded(this.isShowingBodyMod)
  }

  setModded(show) {

    this.isShowingBodyMod = show

    let normalPartNames = [
      "body",
      "body_collar"
    ]
    let moddedPartNames = [
      "body_mod",
      "sheep_body",
      "sheep_arm",
      "sheep_leg",
      "sheep_chain",
      "sheep_udder",
      "sheep_head",
      "body_collar_mod"
    ]

    for (var idx in normalPartNames) {
      if (this.figureConfig[this.figurePrefix + normalPartNames[idx]]) {
        this.figureConfig[this.figurePrefix + normalPartNames[idx]].visible = !show
      }
    }

    for (var idx in moddedPartNames) {
      if (this.figureConfig[this.figurePrefix + moddedPartNames[idx]]) {
        this.figureConfig[this.figurePrefix + moddedPartNames[idx]].visible = show
      }
    }

    if (this.headAnimator) {
      this.headAnimator.setModded(show)
    }
  }

  flash() {
    let body = this.bodies.body
    let flashTexture = new FlashTexture(
      body.GetPosition().get_x() * this.physicsScale * this.scale,
      -body.GetPosition().get_y() * this.physicsScale * this.scale
    )
    this.flashTexture = flashTexture
    let that = this
    flashTexture.completionBlock = function() {
      that.flashTexture = null
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

    canvasOffset.x = Math.min(canvasOffset.x, 11736 * this.scale - this.canvas.width)

    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.translate(-canvasOffset.x, canvasOffset.y);

    if (this.frameCounter % 2 == 0) {
      this.startPixel = canvasOffset.x
      this.endPixel = canvasOffset.x + this.canvas.width

      this.startIndex = Math.floor(this.startPixel / (1500 * this.scale))
      this.endIndex = Math.ceil(this.endPixel / (1500 * this.scale))
    }

    // Draw level
    for (var i = this.startIndex; i < this.endIndex; i++) {
      let texture = this.levelTextures[i]
      this.context.drawImage(texture,
        0,
        0,
        texture.naturalWidth,
        texture.naturalHeight,
        i * 1500 * this.scale,
        0,
        texture.naturalWidth * this.scale * 2,
        texture.naturalHeight * this.scale * 2
      )
    }

    let idx = Math.floor((this.frameCounter % 60) / 2)

    // Shower
    if (this.startIndex == 0) {
      let showerImage = this.imagesConfig['shower/shower_' + idx + '.png']
      if (showerImage) {
        this.context.drawImage(showerImage.image,
          showerImage.frame.x,
          showerImage.frame.y,
          showerImage.frame.w,
          showerImage.frame.h,
          800 * this.scale,
          700 * this.scale,
          showerImage.frame.w * this.scale * 8,
          showerImage.frame.h * this.scale * 8
        )
      } else {
        console.log('shower/shower_' + idx + '.png');
      }
    }

    if (this.endIndex == 7) {
      // Furnace

      let furnaceImage = this.imagesConfig['furnace/furnace_' + idx + '.jpg']
      if (furnaceImage) {
        this.context.drawImage(furnaceImage.image,
          furnaceImage.frame.x,
          furnaceImage.frame.y,
          furnaceImage.frame.w,
          furnaceImage.frame.h,
          1000 * this.scale,
          917 * this.scale,
          furnaceImage.frame.w * this.scale * 2,
          furnaceImage.frame.h * this.scale * 2
        )
      } else {
        console.log('furnace/furnace_' + idx + '.png');
      }

    // Fan
    }

    this.context.drawImage(this.fanBackground.image,
      this.fanBackground.frame.x,
      this.fanBackground.frame.y,
      this.fanBackground.frame.w,
      this.fanBackground.frame.h,
      9800 * this.scale,
      1200 * this.scale,
      this.fanBackground.frame.w * this.scale * 2,
      this.fanBackground.frame.h * this.scale * 2
    )

    let position = {
      x: (9825 + this.fan.frame.w) * this.scale,
      y: (1230 + this.fan.frame.h) * this.scale
    }

    this.context.translate(position.x, position.y);
    this.context.rotate(this.frameCounter / 10)

    this.context.drawImage(this.fan.image,
      this.fan.frame.x,
      this.fan.frame.y,
      this.fan.frame.w,
      this.fan.frame.h,
      -this.fan.frame.w * this.scale,
      -this.fan.frame.h * this.scale,
      this.fan.frame.w * this.scale * 2,
      this.fan.frame.h * this.scale * 2
    )
    this.context.rotate(-this.frameCounter / 10)
    this.context.translate(-position.x, -position.y);


    // Mr P
    if (this.startIndex < 2) {
      let offset = {
        eye1: {
          x: 1867,
          y: 668
        },
        eye2: {
          x: 1905,
          y: 672
        }
      }

      var image = new Image();
      let percent = (this.bodies['body'].GetPosition().get_x() * this.physicsScale - (offset.eye1.x + offset.eye2.x) / 2) / 500
      percent = Math.min(1, Math.max(-1, percent))

      let position;

      position = {
        x: (offset.eye1.x + percent * 4) * this.scale,
        y: offset.eye1.y * this.scale
      }
      this.context.translate(position.x, position.y);
      this.context.drawImage(this.eyeball.image,
        this.eyeball.frame.x,
        this.eyeball.frame.y,
        this.eyeball.frame.w,
        this.eyeball.frame.h,
        0,
        0,
        this.eyeball.frame.w,
        this.eyeball.frame.h
      )
      this.context.translate(-position.x, -position.y);

      position = {
        x: (offset.eye2.x + percent * 4) * this.scale,
        y: offset.eye2.y * this.scale
      }
      this.context.translate(position.x, position.y);

      this.context.drawImage(this.eyeball.image,
        this.eyeball.frame.x,
        this.eyeball.frame.y,
        this.eyeball.frame.w,
        this.eyeball.frame.h,
        0,
        0,
        this.eyeball.frame.w,
        this.eyeball.frame.h
      )
      this.context.translate(-position.x, -position.y);


      this.context.drawImage(this.mrP.image,
        this.mrP.frame.x,
        this.mrP.frame.y,
        this.mrP.frame.w,
        this.mrP.frame.h,
        1840 * this.scale,
        520 * this.scale,
        this.mrP.frame.w * this.scale,
        this.mrP.frame.h * this.scale
      )
    }

    // Draw elements
    for (var i in this.texturesConfig) {
      let textureConfig = this.texturesConfig[i]
      if (textureConfig == null) {
        debugger
      }
      if (textureConfig.visible == false) {
        continue
      }
      this.drawTexture(textureConfig)
    }

    if (!this.isShowingBodyMod) {
      let imageConfig = this.sheep
      this.context.drawImage(imageConfig.image,
        imageConfig.frame.x,
        imageConfig.frame.y,
        imageConfig.frame.w,
        imageConfig.frame.h,
        4600,
        980,
        imageConfig.frame.w * this.scale * 2,
        imageConfig.frame.h * this.scale * 2
      )

    }

    // Lift number
    if (this.startIndex < 4 && this.endIndex > 4) {
      let x = this.bodies.lift_1.GetPosition().get_x()
      let y = this.bodies.lift_1.GetPosition().get_y()
      // 27.117166 34.85
      let percentage = Math.max(0, (y + 34.85) / (-27.117166 + 34.85) * 18)

      x = (x * this.physicsScale + 30) * this.scale
      y = -(y * this.physicsScale + 220) * this.scale

      this.context.font = 'italic ' + Math.round(60 * this.scale) + 'px "barlow", Arial, Helvetica, sans-serif';
      this.context.fillStyle = "#FFF"
      this.context.fillText(Math.round(percentage) + '%', x, y);
    }

    // Porn
    if (this.renderPorn) {
      let body = this.bodies["decor_monitor"];
      let index = Math.floor((this.frameCounter / 20) % 4) + 1
      let imageConfig = this.imagesConfig["porn/porn_0" + index + ".png"]
      let position = {
        x: body.GetPosition().get_x() * this.physicsScale * this.scale,
        y: -body.GetPosition().get_y() * this.physicsScale * this.scale
      }

      let offset = {
        x: (-imageConfig.frame.w / 2 + 14) * this.scale,
        y: (-imageConfig.frame.h / 2 - 12) * this.scale,
      }
      let angle = -body.GetAngle()

      this.context.translate(position.x, position.y);
      this.context.rotate(angle)

      this.context.drawImage(imageConfig.image,
        imageConfig.frame.x,
        imageConfig.frame.y,
        imageConfig.frame.w,
        imageConfig.frame.h,
        offset.x,
        offset.y,
        imageConfig.frame.w * this.scale * 2,
        imageConfig.frame.h * this.scale * 2
      )

      this.context.rotate(-angle)
      this.context.translate(-position.x, -position.y);
    }

    // Draw the pills
    let delta = Math.sin(this.frameCounter / 10) * 10
    for (var i in this.visibleLifes) {
      this.context.drawImage(this.pillbottle.image,
        this.pillbottle.frame.x,
        this.pillbottle.frame.y,
        this.pillbottle.frame.w,
        this.pillbottle.frame.h,
        (this.visibleLifes[i].x * this.physicsScale) * this.scale,
        (-this.visibleLifes[i].y * this.physicsScale + delta) * this.scale,
        this.pillbottle.frame.w * this.scale,
        this.pillbottle.frame.h * this.scale
      )
    }

    // Draw figure
    for (var i in this.activeFigureConfig) {
      let figureConfig = this.activeFigureConfig[i]
      if (figureConfig == null) {
        debugger
      }
      if (figureConfig.visible == false) {
        continue
      }

      if (figureConfig.name == "dressed_head" || figureConfig.name == "naked_head") {
        this.drawTexture(this.headAnimator.headTexture)
        continue
      }

      this.drawTexture(figureConfig)
    }

    if (this.flashTexture) {
      this.drawTexture(this.flashTexture)
    }

    if (this.endIndex == 8) {
      this.context.drawImage(this.furniceWall,
        0,
        0,
        1042,
        938,
        10438 * this.scale,
        1086 * this.scale,
        1042 * this.scale * 2,
        938 * this.scale * 2
      )
    }

    // Lights

    this.context.globalCompositeOperation = "screen"

    this.context.drawImage(this.lights[0],
      0,
      0,
      588,
      603,
      2397 * this.scale,
      305 * this.scale,
      588 * this.scale * 4,
      603 * this.scale * 4,
    )

    this.context.drawImage(this.lights[1],
      0,
      0,
      1433,
      1323,
      301 * this.scale,
      104 * this.scale,
      1433 * this.scale * 4,
      1323 * this.scale * 4,
    )

    this.context.drawImage(this.lights[1],
      0,
      0,
      977,
      921,
      6422 * this.scale,
      511 * this.scale,
      977 * this.scale * 4,
      921 * this.scale * 4,
    )

    this.context.drawImage(this.lights[1],
      0,
      0,
      977,
      921,
      7793 * this.scale,
      511 * this.scale,
      977 * this.scale * 4,
      921 * this.scale * 4,
    )

    this.context.drawImage(this.lights[2],
      0,
      0,
      461,
      487,
      9530 * this.scale,
      881 * this.scale,
      461 * this.scale * 4,
      487 * this.scale * 4,
    )

    this.context.drawImage(this.lights[3],
      0,
      0,
      977,
      921,
      5449 * this.scale,
      333 * this.scale,
      977 * this.scale * 4,
      921 * this.scale * 4,
    )

    this.context.drawImage(this.lights[4],
      0,
      0,
      1369,
      1667,
      4125 * this.scale,
      22 * this.scale,
      1369 * this.scale * 4,
      1667 * this.scale * 4,
    )

    this.context.drawImage(this.lights[5],
      0,
      0,
      879,
      831,
      3562 * this.scale,
      353 * this.scale,
      879 * this.scale * 4,
      831 * this.scale * 4,
    )

    this.context.globalCompositeOperation = "source-over"

    this.context.drawImage(this.vignette,
      0,
      0,
      300,
      300,
      canvasOffset.x,
      -canvasOffset.y,
      this.context.canvas.width,
      this.context.canvas.height
    )

    this.frameCounter += 1

    // Debug draw

  // if (this.drawDebug) {
  //   this.context.scale(this.physicsScale * this.scale, this.physicsScale * this.scale);
  //   this.context.lineWidth = 1 / this.physicsScale;
  //   this.context.scale(1, -1);
  //   this.world.DrawDebugData();
  // }
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

    if (position.x < this.startPixel - 500 || position.x > this.endPixel + 500) {
      return
    }

    this.context.translate(position.x, position.y);
    this.context.rotate(angle)
    this.context.globalAlpha = alpha;

    this.context.drawImage(textureConfig.image,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      offset.x,
      offset.y,
      frame.w * this.scale * scale,
      frame.h * this.scale * scale
    )

    this.context.globalAlpha = 1
    this.context.rotate(-angle)
    this.context.translate(-position.x, -position.y);
  }

  playScare(scare) {
    this.headAnimator.playScare(scare)
  }

  dispose() {
    delete this.world
    delete this.canvas
    delete this.context
    delete this.bodies
    delete this.levelTextures
    delete this.texturesConfig
    delete this.figureConfig
  }
}
