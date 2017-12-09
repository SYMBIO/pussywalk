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
    this.imagesConfig = {}

    this.physicsScale = 64
    this.scale = 1
    this.state = {}
    this.frameCounter = 0

    this.vignette = new Image()
    this.vignette.src = "images/misc/vignette.png"

    this.render = this.render.bind(this)
    this.drawTexture = this.drawTexture.bind(this)
    this.setState = this.setState.bind(this)

    this.prepareLights()
    this.prepareTextures()

    this.eyeball = this.imagesConfig["elements/eyeball.png"]
    this.furniceWall = new Image()
    this.furniceWall.src = "images/level/furnice_wall.jpg"
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
    for (var i = 0; i < 4; i++) {
      let image = new Image()
      image.src = "images/level/level_" + (i + 1) + ".jpg"
      this.levelTextures.push(image)
    }

    // Sprite
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

    this.showBodyMod(false)
  }

  setState(state) {
    for (let key in state) {
      this.state[key] = state[key]
      if (key == "sheep" && state[key]) {
        this.flash()

        this.showBodyMod(true)
      }
    }
  }

  showBodyMod(show) {
    this.texturesConfig["head"].visible = !show
    this.texturesConfig["body"].visible = !show
    this.texturesConfig["body_mod"].visible = show
    this.texturesConfig["head_mod"].visible = show

    this.texturesConfig["sheep_body"].visible = show
    this.texturesConfig["sheep_arm"].visible = show
    this.texturesConfig["sheep_leg"].visible = show
    this.texturesConfig["sheep_chain"].visible = show
    this.texturesConfig["sheep_udder"].visible = show
    this.texturesConfig["sheep_head"].visible = show

    this.texturesConfig["outline_sheep_body"].visible = show
    this.texturesConfig["outline_sheep_head"].visible = show
    this.texturesConfig["outline_sheep_leg"].visible = show
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

    // Shower

    let idx = Math.floor(this.frameCounter)
    let showerImage = this.imagesConfig['shower/shower_' + idx + '.png']
    if (showerImage) {
      this.context.drawImage(showerImage.image,
        showerImage.frame.x,
        showerImage.frame.y,
        showerImage.frame.w,
        showerImage.frame.h,
        800 * this.scale,
        700 * this.scale,
        showerImage.frame.w * this.scale * 4,
        showerImage.frame.h * this.scale * 4
      )
    } else {
      console.log('shower/shower_' + idx + '.png');
    }

    // Furnace

    let furnaceImage = this.imagesConfig['furnace/furnace_' + idx + '.jpg']
    if (furnaceImage) {
      this.context.drawImage(furnaceImage.image,
        furnaceImage.frame.x,
        furnaceImage.frame.y,
        furnaceImage.frame.w,
        furnaceImage.frame.h,
        10158 * this.scale,
        917 * this.scale,
        furnaceImage.frame.w * this.scale,
        furnaceImage.frame.h * this.scale
      )
    } else {
      console.log('furnace/furnace_' + idx + '.png');
    }

    // Mr P
    if (startIndex == 0) {
      let offset = {
        eye1: {
          x: 1864,
          y: 665
        },
        eye2: {
          x: 1902,
          y: 669
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
      // this.context.drawImage(this.eyeball, percent * 10, 0)
      this.context.translate(-position.x, -position.y);
    }

    // Draw elements incl. figure
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

    let x = this.bodies.lift_1.GetPosition().get_x()
    let y = this.bodies.lift_1.GetPosition().get_y()
    let percentage = Math.max(0, (y + 39.8187) / (-32.1753 + 39.8187) * 18)

    x = (x * this.physicsScale - 30) * this.scale
    y = -(y * this.physicsScale + 500) * this.scale

    this.context.font = Math.round(48 * this.scale) + 'px serif';
    this.context.fillStyle = "#FFF"
    this.context.fillText(Math.round(percentage) + '%', x, y);

    this.context.drawImage(this.furniceWall,
      0,
      0,
      1042,
      938,
      10438 * this.scale,
      1086 * this.scale,
      1042 * this.scale,
      938 * this.scale
    )

    // Lights

    this.context.globalCompositeOperation = "screen"

    this.context.drawImage(this.lights[0],
      0,
      0,
      588,
      603,
      2397 * this.scale,
      305 * this.scale,
      588 * this.scale * 2,
      603 * this.scale * 2,
    )

    this.context.drawImage(this.lights[1],
      0,
      0,
      1433,
      1323,
      301 * this.scale,
      104 * this.scale,
      1433 * this.scale * 2,
      1323 * this.scale * 2,
    )

    this.context.drawImage(this.lights[1],
      0,
      0,
      977,
      921,
      6422 * this.scale,
      511 * this.scale,
      977 * this.scale * 2,
      921 * this.scale * 2,
    )

    this.context.drawImage(this.lights[1],
      0,
      0,
      977,
      921,
      7793 * this.scale,
      511 * this.scale,
      977 * this.scale * 2,
      921 * this.scale * 2,
    )

    this.context.drawImage(this.lights[2],
      0,
      0,
      461,
      487,
      9530 * this.scale,
      881 * this.scale,
      461 * this.scale * 2,
      487 * this.scale * 2,
    )

    this.context.drawImage(this.lights[3],
      0,
      0,
      977,
      921,
      5449 * this.scale,
      333 * this.scale,
      977 * this.scale * 2,
      921 * this.scale * 2,
    )

    this.context.drawImage(this.lights[4],
      0,
      0,
      1369,
      1667,
      4125 * this.scale,
      22 * this.scale,
      1369 * this.scale * 2,
      1667 * this.scale * 2,
    )

    this.context.drawImage(this.lights[5],
      0,
      0,
      879,
      831,
      3562 * this.scale,
      353 * this.scale,
      879 * this.scale * 2,
      831 * this.scale * 2,
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

    this.frameCounter += 0.5

    if (this.frameCounter == 30) {
      this.frameCounter = 0
    }

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
    this.context.globalAlpha = alpha;

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

    this.context.globalAlpha = 1
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
