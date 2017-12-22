import Constants from './Constants'
import FlashTexture from './FlashTexture'
import SpriteSheet from 'spritesheet-canvas'

export default class AudioPlayer {

  constructor(hard) {

    this.onMusicEnded = this.onMusicEnded.bind(this)
    this.onLoseHealthEnded = this.onLoseHealthEnded.bind(this)
    this.stop = this.stop.bind(this)
    this.init = this.init.bind(this)
    this.playBallPop = this.playBallPop.bind(this)

    window.soundDidFinishPlaying = this.onSoundEnded.bind(this)

    if (hard) {
      this.music = Constants.sounds.hardMusic.map(function(name) {
        let sound = new Audio(name);
        sound.preload = 'none';
        sound.name = name
        return sound
      })
    } else {
      this.music = Constants.sounds.music.map(function(name) {
        let sound = new Audio(name);
        sound.preload = 'none';
        sound.name = name
        return sound
      })
    }

    this.smallSteppingSounds = Constants.sounds.smallSteps.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'none';
      sound.name = name
      return sound
    })

    this.largeSteppingSounds = Constants.sounds.largeSteps.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'none';
      sound.name = name
      return sound
    })

    this.smallTiltSounds = Constants.sounds.smallTilts.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'none';
      sound.name = name
      return sound
    })

    this.largeTiltSounds = Constants.sounds.largeTilts.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'none';
      sound.name = name
      return sound
    })

    this.smallTiltModSounds = Constants.sounds.smallTiltsMod.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'none';
      sound.name = name
      return sound
    })

    this.largeTiltModSounds = Constants.sounds.largeTiltsMod.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'none';
      sound.name = name
      return sound
    })

    this.smallSheepTiltSounds = Constants.sounds.smallSheepTilts.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'none';
      sound.name = name
      return sound
    })

    this.largeSheepTiltSounds = Constants.sounds.largeSheepTilts.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'none';
      sound.name = name
      return sound
    })

    this.bottleBreakingSounds = Constants.sounds.bottlesBreak.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'none';
      sound.name = name
      return sound
    })

    this.bottleImpactSounds = Constants.sounds.bottlesImpact.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'none';
      sound.name = name
      return sound
    })

    this.thumps = Constants.sounds.thumps.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'none';
      sound.name = name
      return sound
    })

    this.cane = Constants.sounds.cane.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'none';
      sound.name = name
      return sound
    })

    this.chairs = Constants.sounds.chairs.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'none';
      sound.name = name
      return sound
    })

    this.cups = Constants.sounds.cups.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'none';
      sound.name = name
      return sound
    })

    this.tvLarge = Constants.sounds.tvLargeCollide.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'none';
      sound.name = name
      return sound
    })

    this.tvSmall = Constants.sounds.tvSmallCollide.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'none';
      sound.name = name
      return sound
    })

    this.bin = Constants.sounds.bin.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'none';
      sound.name = name
      return sound
    })

    this.toiletpaper = Constants.sounds.toiletpaper.map(function(name) {
      let sound = new Audio(name);
      sound.preload = 'none';
      sound.name = name
      return sound
    })

    this.health = new Audio("audio/health.mp3");
    this.health.preload = 'none';
    this.health.name = 'audio/health.mp3';
    // this.health.load();

    this.loseHealth = new Audio("audio/health_lower.mp3");
    this.loseHealth.preload = 'none';
    this.loseHealth.name = 'audio/health_lower.mp3'
    this.loseHealth.onended = this.onLoseHealthEnded

    this.sheep = new Audio("audio/mrO.mp3");
    this.sheep.preload = 'none';
    this.sheep.name = 'audio/mrO.mp3';
    // this.sheep.load();

    this.tvOff = new Audio("audio/tv_porn_off.mp3");
    this.tvOff.preload = 'none';
    this.tvOff.name = 'audio/tv_porn_off.mp3';
    // this.tvOff.load();

    this.end = new Audio("audio/finish.mp3");
    this.end.preload = 'none';
    this.end.name = 'audio/finish.mp3';
    // this.end.load();

    this.rewind = new Audio("audio/rewind.mp3");
    this.rewind.preload = 'none';
    this.rewind.name = 'audio/rewind.mp3';
    // this.rewind.load();

    this.bear = new Audio("audio/bear.mp3");
    this.bear.preload = 'none';
    this.bear.name = 'audio/bear.mp3';
    // this.bear.load();

    this.ballBounce = new Audio("audio/ball_bounce.mp3");
    this.ballBounce.preload = 'none';
    this.ballBounce.name = 'audio/ball_bounce.mp3';

    this.ballPop = new Audio("audio/ball_out_furnice.mp3");
    this.ballPop.preload = 'none';
    this.ballPop.name = 'audio/ball_out_furnice.mp3';

    let that = this
    this.music.forEach(function(music) {
      music.volume = 0.5
      music.onended = that.onMusicEnded
    })

    this.mobileSounds = []
    this.mobileSounds = this.mobileSounds.concat(this.music)
    this.mobileSounds.push(this.health)
    this.mobileSounds.push(this.loseHealth)
    this.mobileSounds.push(this.sheep)
    this.mobileSounds.push(this.end)

    this.musicIndex = 0
    this.play(this.music[this.musicIndex])
  }

  init() {
    let music = this.music[this.musicIndex]
    this.mobileSounds.forEach(function(sound) {
      let process = (sound == music && music.paused) || sound != music
      if (process) {
        sound.play()
        sound.pause()
        sound.currentTime = 0
      }
    })

    if (music.paused) {
      this.play(this.music[this.musicIndex])
    }

    this.isInitialized = true
  }

  setMute(mute) {
    this.isMute = mute

    if (window.__delegateSound) {
      if (mute) {
        window.location.href = "setmute://true";
      } else {
        window.location.href = "setmute://false";
      }
    }

    this.music.forEach(function(music) {
      // music.volume = mute ? 0 : 0.5
      music.muted = mute
    })
  }

  onSoundEnded(filename) {
    if (filename == this.loseHealth.name) {
      if (window.__delegateSound) {
        window.location.href = "setvolume://" + this.music[this.musicIndex].name + "!0.5";
      } else {
        TweenMax.to(this.music[this.musicIndex], 0.5, {
          volume: 0.5
        })
      }
    }

    let track = this.music.find(function(music) {
      return music.name == filename
    })

    if (track) {
      this.musicIndex++
      if (this.musicIndex == this.music.length) {
        this.musicIndex = 0
      }

      this.play(this.music[this.musicIndex])
    }
  }

  onMusicEnded() {
    window.soundDidFinishPlaying(this.music[this.musicIndex].name)
  }

  onLoseHealthEnded() {
    if (this.isMute) {
      return
    }

    window.soundDidFinishPlaying(this.loseHealth.name)
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
    if (this.isMute) {
      return
    }

    if (window.__delegateSound) {
      let that = this
      setTimeout(function() {
        window.location.href = "setvolume://" + that.music[that.musicIndex].name + "!0.1";
      }, 100)
    } else {
      TweenMax.to(this.music[this.musicIndex], 0.5, {
        volume: 0.1
      })
    }
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

  playTilt(tilt, sheep) {
    if (tilt > 0.5) {
      if (sheep) {
        this.playRandom(this.largeTiltModSounds)
        this.playRandom(this.largeSheepTiltSounds)
      } else {
        this.playRandom(this.largeTiltSounds)
      }
    } else {
      if (sheep) {
        this.playRandom(this.smallTiltModSounds)
        this.playRandom(this.smallSheepTiltSounds)
      } else {
        this.playRandom(this.smallTiltSounds)
      }
    }
  }

  playBear() {
    this.play(this.bear)
  }

  playTV(impact) {
    if (impact > 0.5) {
      this.playRandom(this.tvLarge)
    } else {
      this.playRandom(this.tvSmall)
    }
  }

  playToiletpaper() {
    this.playRandom(this.toiletpaper)
  }

  playBallPop() {
    this.play(this.ballPop)
  }

  playBallBounce() {
    this.play(this.ballBounce)
  }

  playRandom(soundsArray) {
    var index = Math.floor(Math.random() * soundsArray.length)

    let sound

    sound = soundsArray[index];
    this.play(sound)

    return index
  }

  play(sound) {
    if (this.isMute) {
      return
    } else {
      if (window.__delegateSound) {
        window.location.href = "playsound://" + sound.name;
      } else {
        sound.play()
      }
    }
  }

  pause(sound) {
    if (window.__delegateSound) {
      window.location.href = "stopsound://" + sound.name;
    } else {
      sound.pause()
    }
  }

  stop() {

    let that = this
    let filenames = []
    this.smallSteppingSounds.forEach(function(sound) {
      that.pause(sound)
      filenames.push(sound.name)
    })
    this.largeSteppingSounds.forEach(function(sound) {
      that.pause(sound)
      filenames.push(sound.name)
    })
    this.bottleBreakingSounds.forEach(function(sound) {
      that.pause(sound)
      filenames.push(sound.name)
    })
    this.bottleImpactSounds.forEach(function(sound) {
      that.pause(sound)
      filenames.push(sound.name)
    })
    this.thumps.forEach(function(sound) {
      that.pause(sound)
      filenames.push(sound.name)
    })
    this.music.forEach(function(sound) {
      that.pause(sound)
      filenames.push(sound.name)
    })

    that.pause(this.health)
    filenames.push(this.health.name)

    that.pause(this.loseHealth)
    filenames.push(this.loseHealth.name)

    that.pause(this.sheep)
    filenames.push(this.sheep.name)

    that.pause(this.tvOff)
    filenames.push(this.tvOff.name)

    that.pause(this.end)
    filenames.push(this.end.name)

    that.pause(this.rewind)
    filenames.push(this.rewind.name)

    that.pause(this.bear)
    filenames.push(this.bear.name)

    that.pause(this.ballPop)
    filenames.push(this.ballPop.name)

    that.pause(this.ballBounce)
    filenames.push(this.ballBounce.name)

    if (window.__delegateSound) {
      window.location.href = "stopsounds://" + filenames.join(',');
    }
  }
}
