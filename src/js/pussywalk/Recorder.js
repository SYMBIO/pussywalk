export default class Recorder {

  constructor(world, initialState) {
    this.world = world
    this.initialState = initialState
    this.frames = []
    this.touchedDecor = []
    this.currentFrame = 0

    this.removedFrontSlipper = false
    this.removedBackSlipper = false
  }

  snap() {
    var state = {}
    var body = this.world.GetBodyList()
    while (body.e != 0) {
      state[body.name] = {
        x: body.GetPosition().get_x(),
        y: body.GetPosition().get_y(),
        angle: body.GetAngle()
      }

      body = body.GetNext()
    }
    this.frames.push(state)
    this.currentFrame = this.frames.length
  }

  addDecor(decorName) {
    this.touchedDecor.push(decorName)
  }
}
