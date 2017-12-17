import Constants from './Constants'
import FlashTexture from './FlashTexture'
import SpriteSheet from 'spritesheet-canvas'

export default class AudioPlayer {

  constructor() {

    this.onMusicEnded = this.onMusicEnded.bind(this)
    this.onLoseHealthEnded = this.onLoseHealthEnded.bind(this)

    this.smallSteppingSounds = Constants.sounds.smallSteps.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'auto';
      sound.load();
      return sound
    })
    this.largeSteppingSounds = Constants.sounds.largeSteps.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'auto';
      sound.load();
      return sound
    })

    this.bottleBreakingSounds = Constants.sounds.bottlesBreak.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'auto';
      sound.load();
      return sound
    })
    this.bottleImpactSounds = Constants.sounds.bottlesImpact.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'auto';
      sound.load();
      return sound
    })
    this.thumps = Constants.sounds.thumps.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'auto';
      sound.load();
      return sound
    })
    this.music = Constants.sounds.music.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'auto';
      sound.load();
      return sound
    })

    this.health = new Audio("audio/health.mp3");
    this.health.preload = 'auto';
    this.health.load();

    this.loseHealth = new Audio("audio/health_lower.mp3");
    this.loseHealth.preload = 'auto';
    this.loseHealth.load();
    this.loseHealth.onended = this.onLoseHealthEnded

    this.sheep = new Audio("audio/mrO.mp3");
    this.sheep.preload = 'auto';
    this.sheep.load();

    let that = this
    this.music.forEach(function(music) {
      music.onended = that.onMusicEnded
    })
    this.musicIndex = 0

    this.music[this.musicIndex].play()
  }

  setMute(mute) {
    this.isMute = mute

    this.music.forEach(function(music) {
      music.volume = mute ? 0 : 1
    })
  }

  onMusicEnded() {
    this.musicIndex++
    if (this.musicIndex == this.music.length) {
      this.musicIndex = 0
    }

    this.music[this.musicIndex].play()
  }

  onLoseHealthEnded() {
    this.music[this.musicIndex].play()
    TweenMax.to(this.music[this.musicIndex], 0.5, {
      volume: 1
    })
  }

  //

  playStep(volume) {

    if (this.isMute) {
      return
    }

    var index = Math.floor(Math.random() * (this.smallSteppingSounds.length))
    let sound
    if (volume > 0.5) {
      sound = this.largeSteppingSounds[index];
    } else {
      sound = this.smallSteppingSounds[index];
    }
    sound.volume = Math.min(volume, 1);
    sound.play();
  }

  playBottleBreak() {

    if (this.isMute) {
      return
    }

    var index = Math.floor(Math.random() * (this.bottleBreakingSounds.length))
    let sound

    sound = this.bottleBreakingSounds[index];
    sound.play();
  }

  playBottleImpact() {

    if (this.isMute) {
      return
    }

    var index = Math.floor(Math.random() * (this.bottleImpactSounds.length))
    let sound

    sound = this.bottleImpactSounds[index];
    sound.play();
  }

  playHealth() {

    if (this.isMute) {
      return
    }

    this.health.play()
  }

  playLoseHealth() {

    if (this.isMute) {
      return
    }

    TweenMax.to(this.music[this.musicIndex], 0.5, {
      volume: 0.1
    })
    this.loseHealth.play()
  }

  playThump() {

    if (this.isMute) {
      return
    }

    var index = Math.floor(Math.random() * (this.thumps.length))
    let sound

    sound = this.thumps[index];
    sound.play();
  }

  playSheep() {

    if (this.isMute) {
      return
    }

    this.sheep.play()
  }
}
