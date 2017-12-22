import Constants from './Constants'
import Config from './Config'
import FlashTexture from './FlashTexture'
import HeadAnimator from './HeadAnimator'
import SheepHeadAnimator from './SheepHeadAnimator'
import SpriteSheet from 'spritesheet-canvas'
import { TweenMax, Linear } from 'gsap'

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
    this.showRewind = false
    this.fireballIndex = -1
    this.drawDebug = false
    this.flies = [[], []]
    this.fliesPosition = {
      x: 0,
      y: 0
    }

    this.vignette = new Image()
    this.vignette.src = "images/misc/vignette.png"

    this.furniceWall = new Image()
    this.furniceWall.src = "images/level/furnice_wall.jpg?" + Config.cachebuster

    this.render = this.render.bind(this)
    this.drawTexture = this.drawTexture.bind(this)
    this.setState = this.setState.bind(this)
    this.isNaked = this.isNaked.bind(this)
    this.playRewind = this.playRewind.bind(this)
    this.stopRewind = this.stopRewind.bind(this)

    this.prepareLights()
    this.prepareTextures()

    this.eyeball = this.imagesConfig["elements/eyeball.png"]
    this.mrP = this.imagesConfig["elements/mr_p.png"]
    this.pillbottle = this.imagesConfig["elements/pill_bottle.png"]
    this.headAnimator = new HeadAnimator(this.imagesConfig)
    this.sheepHeadAnimator = new SheepHeadAnimator(this.imagesConfig)
    this.sheep = this.imagesConfig["elements/ctveracek.png"]
    this.fanBackground = this.imagesConfig["elements/dira.png"]
    this.fan = this.imagesConfig["elements/vetrak.png"]
    var i = 0
    while (true) {
      let image = this.imagesConfig["figure/flies/around/flies_" + i + ".png"]
      if (image) {
        this.flies[0].push(image)
      } else {
        break
      }
      i++
    }
    i = 0
    while (true) {
      let image = this.imagesConfig["figure/flies/around/flies_" + i + ".png"]
      if (image) {
        this.flies[1].push(image)
      } else {
        break
      }
      i++
    }
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
      image.src = "images/level/level_" + (i + 1) + ".jpg?" + Config.cachebuster
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
      image.src = 'images/spritesheet-' + i + '.png?' + Config.cachebuster

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

    if (this.endIndex >= 7) {
      let furnaceImage = this.imagesConfig['furnace/furnace_' + idx + '.jpg']
      if (furnaceImage) {
        this.context.drawImage(furnaceImage.image,
          furnaceImage.frame.x,
          furnaceImage.frame.y,
          furnaceImage.frame.w,
          furnaceImage.frame.h,
          10158 * this.scale,
          919 * this.scale,
          furnaceImage.frame.w * this.scale * 2,
          furnaceImage.frame.h * this.scale * 2
        )
      } else {
        console.log('furnace/furnace_' + idx + '.png');
      }

      // Fireball
      // this.fireballIndex = 8

      if (this.fireballIndex != -1) {

        this.context.globalCompositeOperation = "screen"

        let fireballImage = this.imagesConfig['fireball/fireball_' + Math.floor(this.fireballIndex / 4) + '.png']
        if (fireballImage) {
          this.context.drawImage(fireballImage.image,
            fireballImage.frame.x,
            fireballImage.frame.y,
            fireballImage.frame.w,
            fireballImage.frame.h,
            9840 * this.scale,
            1020 * this.scale,
            fireballImage.frame.w * this.scale * 4,
            fireballImage.frame.h * this.scale * 4
          )

          this.fireballIndex++
        }

        this.context.globalCompositeOperation = "source-over"
      }


      // Fan
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
    }

    // Mr P
    if (this.startIndex < 2) {
      let offset = {
        eye1: {
          x: 1871,
          y: 670
        },
        eye2: {
          x: 1908,
          y: 672
        }
      }

      var image = new Image();
      let percent = (this.bodies['body'].GetPosition().get_x() * this.physicsScale - (offset.eye1.x + offset.eye2.x) / 2) / 500
      percent = Math.min(1, Math.max(-1, percent))

      let position;

      position = {
        x: offset.eye1.x + percent * 3,
        y: offset.eye1.y
      }
      this.context.drawImage(this.eyeball.image,
        this.eyeball.frame.x,
        this.eyeball.frame.y,
        this.eyeball.frame.w,
        this.eyeball.frame.h,
        position.x * this.scale,
        position.y * this.scale,
        this.eyeball.frame.w * this.scale,
        this.eyeball.frame.h * this.scale
      )

      position = {
        x: offset.eye2.x + percent * 3,
        y: offset.eye2.y
      }
      this.context.drawImage(this.eyeball.image,
        this.eyeball.frame.x,
        this.eyeball.frame.y,
        this.eyeball.frame.w,
        this.eyeball.frame.h,
        position.x * this.scale,
        position.y * this.scale,
        this.eyeball.frame.w * this.scale,
        this.eyeball.frame.h * this.scale
      )

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

    if (!this.isShowingBodyMod) {
      let imageConfig = this.sheep
      this.context.drawImage(imageConfig.image,
        imageConfig.frame.x,
        imageConfig.frame.y,
        imageConfig.frame.w,
        imageConfig.frame.h,
        4840 * this.scale,
        1030 * this.scale,
        imageConfig.frame.w * this.scale * 2,
        imageConfig.frame.h * this.scale * 2
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
      let index = Math.floor((this.frameCounter / 20) % 3) + 1
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

      if (figureConfig.name == "naked_sheep_head" || figureConfig.name == "dressed_sheep_head") {
        this.drawTexture(this.sheepHeadAnimator.headTexture)
        continue
      }

      if (figureConfig.name == "dressed_head" || figureConfig.name == "naked_head") {
        this.drawTexture(this.headAnimator.headTexture)

        if (this.isNaked()) {
          // Draw flies
          let body = this.bodies.body
          let newPosition = {
            x: (body.GetPosition().get_x() * this.physicsScale - 100 + 100 * Math.sin(this.frameCounter / 100)) * this.scale,
            y: (-body.GetPosition().get_y() * this.physicsScale - 250 + 50 * Math.sin(this.frameCounter / 66)) * this.scale
          }
          let delta = {
            x: newPosition.x - this.fliesPosition.x,
            y: newPosition.y - this.fliesPosition.y
          }
          this.fliesPosition.x += delta.x * 0.03
          this.fliesPosition.y += delta.y * 0.03

          let idx = Math.floor(this.frameCounter / 4 % this.flies[0].length)

          let imageConfig = this.flies[0][idx]
          this.context.drawImage(imageConfig.image,
            imageConfig.frame.x,
            imageConfig.frame.y,
            imageConfig.frame.w,
            imageConfig.frame.h,
            this.fliesPosition.x,
            this.fliesPosition.y,
            imageConfig.frame.w * this.scale * 2,
            imageConfig.frame.h * this.scale * 2,
          )

          imageConfig = this.flies[1][idx]
          this.context.drawImage(imageConfig.image,
            imageConfig.frame.x,
            imageConfig.frame.y,
            imageConfig.frame.w,
            imageConfig.frame.h,
            this.fliesPosition.x - 150 * this.scale,
            this.fliesPosition.y,
            imageConfig.frame.w * this.scale * 2,
            imageConfig.frame.h * this.scale * 2,
          )
        }

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
        this.furniceWall.naturalWidth,
        this.furniceWall.naturalHeight,
        10438 * this.scale,
        1086 * this.scale,
        this.furniceWall.naturalWidth * this.scale * 2,
        this.furniceWall.naturalHeight * this.scale * 2
      )
    }

    // Lights

    this.context.globalCompositeOperation = "screen"

    this.context.drawImage(this.lights[0],
      0,
      0,
      this.lights[0].naturalWidth,
      this.lights[0].naturalHeight,
      2397 * this.scale,
      305 * this.scale,
      this.lights[0].naturalWidth * this.scale * 4,
      this.lights[0].naturalHeight * this.scale * 4,
    )

    this.context.drawImage(this.lights[1],
      0,
      0,
      this.lights[1].naturalWidth,
      this.lights[1].naturalHeight,
      301 * this.scale,
      104 * this.scale,
      this.lights[1].naturalWidth * this.scale * 4,
      this.lights[1].naturalHeight * this.scale * 4,
    )

    this.context.drawImage(this.lights[1],
      0,
      0,
      this.lights[1].naturalWidth,
      this.lights[1].naturalHeight,
      6422 * this.scale,
      511 * this.scale,
      this.lights[1].naturalWidth * this.scale * 4,
      this.lights[1].naturalHeight * this.scale * 4,
    )

    this.context.drawImage(this.lights[1],
      0,
      0,
      this.lights[1].naturalWidth,
      this.lights[1].naturalHeight,
      7793 * this.scale,
      511 * this.scale,
      this.lights[1].naturalWidth * this.scale * 4,
      this.lights[1].naturalHeight * this.scale * 4,
    )

    this.context.drawImage(this.lights[2],
      0,
      0,
      this.lights[2].naturalWidth,
      this.lights[2].naturalHeight,
      9530 * this.scale,
      881 * this.scale,
      this.lights[2].naturalWidth * this.scale * 4,
      this.lights[2].naturalHeight * this.scale * 4,
    )

    this.context.drawImage(this.lights[3],
      0,
      0,
      this.lights[3].naturalWidth,
      this.lights[3].naturalHeight,
      5449 * this.scale,
      333 * this.scale,
      this.lights[3].naturalWidth * this.scale * 4,
      this.lights[3].naturalHeight * this.scale * 4,
    )

    this.context.drawImage(this.lights[4],
      0,
      0,
      this.lights[4].naturalWidth,
      this.lights[4].naturalHeight,
      4125 * this.scale,
      22 * this.scale,
      this.lights[4].naturalWidth * this.scale * 4,
      this.lights[4].naturalHeight * this.scale * 4,
    )

    this.context.drawImage(this.lights[5],
      0,
      0,
      this.lights[5].naturalWidth,
      this.lights[5].naturalHeight,
      3562 * this.scale,
      353 * this.scale,
      this.lights[5].naturalWidth * this.scale * 4,
      this.lights[5].naturalHeight * this.scale * 4,
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

    if (this.showRewind) {
      let imageConfig = this.imagesConfig["rewind/rewind_" + Math.floor((this.frameCounter / 2) % 10) + ".png"]
      this.context.drawImage(imageConfig.image,
        imageConfig.frame.x,
        imageConfig.frame.y,
        128,
        128,
        canvasOffset.x,
        -canvasOffset.y,
        this.context.canvas.width,
        this.context.canvas.height
      )
    }

    this.frameCounter += 1

    // Debug draw

    if (this.drawDebug) {
      this.context.scale(this.physicsScale * this.scale, this.physicsScale * this.scale);
      this.context.lineWidth = 1 / this.physicsScale;
      this.context.scale(1, -1);
      this.world.DrawDebugData();
    }
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
    this.sheepHeadAnimator.playTs(scare == 1)
  }

  removeScare() {
    this.headAnimator.removeScare()
  }

  playDeath() {
    this.headAnimator.playDeath()
  }

  playRewind() {
    this.showRewind = true
    TweenMax.to(this, 1, {
      showRewind: true,
      onComplete: this.stopRewind
    })
  }

  stopRewind() {
    this.showRewind = false
  }

  didFinish() {
    this.fireballIndex = 0
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
