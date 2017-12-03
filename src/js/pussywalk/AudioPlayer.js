import Constants from './Constants'
import FlashTexture from './FlashTexture'
import SpriteSheet from 'spritesheet-canvas'

export default class AudioPlayer {

  constructor() {
    this.smallSteppingSounds = Constants.sounds.smallSteps.map(function(name) {
      var sound = new Audio(name);
      sound.preload = 'auto';
      sound.load();
      return sound
    })
    this.largeSteppingSounds = Constants.sounds.largeSteps.map(function(name) {
      var sound = new Audio(name);
      sound.preload = 'auto';
      sound.load();
      return sound
    })
  }

  playStep(volume) {
    var index = Math.round(Math.random() * (this.smallSteppingSounds.length - 1))
    var click
    if (volume > 0.5) {
      click = this.largeSteppingSounds[index];
    } else {
      click = this.smallSteppingSounds[index];
    }
    click.volume = Math.min(volume, 1);
    click.play();
  }
}
