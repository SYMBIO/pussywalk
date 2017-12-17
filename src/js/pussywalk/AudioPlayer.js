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

    this.smallTiltSounds = Constants.sounds.smallTilts.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'auto';
      sound.load();
      return sound
    })

    this.largeTiltSounds = Constants.sounds.largeTilts.map(function(name) {
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

    this.cane = Constants.sounds.cane.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'auto';
      sound.load();
      return sound
    })

    this.chairs = Constants.sounds.chairs.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'auto';
      sound.load();
      return sound
    })

    this.cups = Constants.sounds.cups.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'auto';
      sound.load();
      return sound
    })

    this.tvLarge = Constants.sounds.tvLargeCollide.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'auto';
      sound.load();
      return sound
    })

    this.tvSmall = Constants.sounds.tvSmallCollide.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'auto';
      sound.load();
      return sound
    })

    this.bin = Constants.sounds.bin.map(function(name) {
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

    this.tvOff = new Audio("audio/tv_porn_off.mp3");
    this.tvOff.preload = 'auto';
    this.tvOff.load();

    this.end = new Audio("audio/finish.mp3");
    this.end.preload = 'auto';
    this.end.load();

    this.rewind = new Audio("audio/rewind.mp3");
    this.rewind.preload = 'auto';
    this.rewind.load();

    let that = this
    this.music.forEach(function(music) {
      music.volume = 0.5
      music.onended = that.onMusicEnded
    })

    this.musicIndex = this.playRandom(this.music)
  }

  setMute(mute) {
    this.isMute = mute

    this.music.forEach(function(music) {
      music.volume = mute ? 0 : 0.5
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
    TweenMax.to(this.music[this.musicIndex], 0.5, {
      volume: 0.5
    })
  }

  playStep(volume) {

    var index = Math.floor(Math.random() * (this.smallSteppingSounds.length))
    let sound
    if (volume > 0.5) {
      sound = this.largeSteppingSounds[index];
    } else {
      sound = this.smallSteppingSounds[index];
    }
    sound.volume = Math.min(volume, 0.5);
    this.play(sound)
  }

  playBottleBreak() {
    this.playRandom(this.bottleBreakingSounds)
  }

  playBottleImpact() {
    this.playRandom(this.bottleImpactSounds)
  }

  playHealth() {
    this.play(this.health)
  }

  playLoseHealth() {
    this.silenceMusic()
    this.play(this.loseHealth)
  }

  silenceMusic() {
    TweenMax.to(this.music[this.musicIndex], 0.5, {
      volume: 0.1
    })
  }

  playThump() {
    this.playRandom(this.thumps)
  }

  playSheep() {
    this.play(this.sheep)
  }

  playTVOff(name) {
    if (this.isMute) {
      return
    }

    this.play(this.tvOff)
  }

  playCane() {
    this.playRandom(this.cane)
  }

  playChair() {
    this.playRandom(this.chairs)
  }

  playCup() {
    this.playRandom(this.cups)
  }

  playEnd() {
    this.play(this.end)
  }

  playRewind() {
    this.play(this.rewind)
  }

  playBin() {
    this.playRandom(this.bin)
  }

  playTilt(tilt) {
    if (tilt > 0.5) {
      this.playRandom(this.largeTiltSounds)
    } else {
      this.playRandom(this.smallTiltSounds)
    }
  }

  playTV(impact) {
    if (impact > 0.5) {
      this.playRandom(this.tvLarge)
    } else {
      this.playRandom(this.tvSmall)
    }
  }

  playRandom(soundsArray) {
    var index = Math.floor(Math.random() * soundsArray.length)

    let sound

    sound = soundsArray[index];
    sound.play();

    this.play(sound)

    return index
  }

  play(sound) {
    if (this.isMute) {
      return
    } else {
      sound.play()
    }
  }

  stop() {
    this.smallSteppingSounds.forEach(function(sound) {
      sound.pause()
    })
    this.largeSteppingSounds.forEach(function(sound) {
      sound.pause()
    })
    this.bottleBreakingSounds.forEach(function(sound) {
      sound.pause()
    })
    this.bottleImpactSounds.forEach(function(sound) {
      sound.pause()
    })
    this.thumps.forEach(function(sound) {
      sound.pause()
    })
    this.music.forEach(function(sound) {
      sound.pause()
    })

    this.health.pause()
    this.loseHealth.pause()
    this.sheep.pause()
  }
}
