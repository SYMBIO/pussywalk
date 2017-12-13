import { TweenMax, Cubic } from 'gsap'

export default class HeadAnimator {

  constructor(imagesConfig) {
    this.imagesConfig = imagesConfig
    this.interval = 0

    this.playScare = this.playScare.bind(this)
    this.setModded = this.setModded.bind(this)
    this.stepFrame = this.stepFrame.bind(this)

    this.setHeadTexture(this.imagesConfig["figure/naked/head.png"])
    this.setModded(false)
  }

  setModded(show) {
    this.isModded = show
  }

  playScare(scare) {
    var i = 0
    var name

    this.frames = []

    while (true) {
      name = "figure/naked/head_anim/head_anim_" + scare + "_" + i + ".png"
      if (this.imagesConfig[name]) {
        this.frames.push(this.imagesConfig[name])
        i++
      } else {
        break
      }
    }

    this.frames.push(this.imagesConfig["figure/naked/head.png"])

    if (this.frames.length > 0) {
      clearInterval(this.interval)
      this.interval = setInterval(this.stepFrame, 83)
    }
  }

  stepFrame() {
    this.setHeadTexture(this.frames.shift())

    if (this.frames.length <= 0) {
      clearInterval(this.interval)
    }
  }

  setHeadTexture(texture) {
    console.log(texture.name);
    texture.body = "head"
    texture.offset = {
      x: -35,
      y: -35
    }

    this.headTexture = texture
  }
}
