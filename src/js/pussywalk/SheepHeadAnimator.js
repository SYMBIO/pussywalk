import { TweenMax, Cubic } from 'gsap'

export default class SheepHeadAnimator {

  constructor(imagesConfig) {
    this.imagesConfig = imagesConfig
    this.interval = 0
    this.frames = []

    this.stepFrame = this.stepFrame.bind(this)
    this.setHeadTexture = this.setHeadTexture.bind(this)

    this.setHeadTexture(this.imagesConfig["figure/sheep/head_anim/sheep_head__0.png"])
  }

  playTs(large) {

    var i = 0
    var name

    this.frames = large ? this.largeTs() : this.smallTs()

    if (this.frames.length > 0) {
      clearInterval(this.interval)
      this.interval = setInterval(this.stepFrame, 83)
    }
  }

  smallTs() {
    return [
      this.imagesConfig["figure/sheep/head_anim/sheep_head__1.png"],
      this.imagesConfig["figure/sheep/head_anim/sheep_head__2.png"],
      this.imagesConfig["figure/sheep/head_anim/sheep_head__1.png"],
      this.imagesConfig["figure/sheep/head_anim/sheep_head__2.png"],
      this.imagesConfig["figure/sheep/head_anim/sheep_head__0.png"]
    ]
  }

  largeTs() {
    return [
      this.imagesConfig["figure/sheep/head_anim/sheep_head_big_tilt_1.png"],
      this.imagesConfig["figure/sheep/head_anim/sheep_head_big_tilt_2.png"],
      this.imagesConfig["figure/sheep/head_anim/sheep_head_big_tilt_1.png"],
      this.imagesConfig["figure/sheep/head_anim/sheep_head_big_tilt_2.png"],
      this.imagesConfig["figure/sheep/head_anim/sheep_head_big_tilt_1.png"],
      this.imagesConfig["figure/sheep/head_anim/sheep_head_big_tilt_2.png"],
      this.imagesConfig["figure/sheep/head_anim/sheep_head_big_tilt_1.png"],
      this.imagesConfig["figure/sheep/head_anim/sheep_head_big_tilt_2.png"],
      this.imagesConfig["figure/sheep/head_anim/sheep_head__0.png"]
    ]
  }

  stepFrame() {
    this.setHeadTexture(this.frames.shift())

    if (this.frames.length <= 0) {
      clearInterval(this.interval)
    }
  }

  setHeadTexture(texture) {

    debugger
    texture.body = "sheep_head"
    texture.offset = {
      x: -30,
      y: -20
    }

    this.headTexture = texture
  }
}
