import { TweenMax, Cubic } from 'gsap'

export default class FlashTexture {

  constructor(x, y) {
    this.image = new Image()
    this.image.src = "images/misc/flash.png"
    this.isFixed = true
    this.x = x
    this.y = y
    this.alpha = 1
    this.scale = 5
    this.offsetX = -550
    this.offsetY = -550

    this.onComplete = this.onComplete.bind(this)

    TweenMax.to(this, 0.2, {
      offsetX: 56,
      offsetY: 56,
      scale: 0.1,
      onComplete: this.onComplete
    })
  }

  onComplete() {
    if (this.completionBlock) {
      this.completionBlock()
    }
  }
}
