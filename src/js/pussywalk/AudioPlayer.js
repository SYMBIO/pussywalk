import Constants from './Constants'
import FlashTexture from './FlashTexture'
import SpriteSheet from 'spritesheet-canvas'

export default class AudioPlayer {

  constructor(hard) {

    this.hard = hard
    this.mobileSoundsNames = []

    this.onMusicEnded = this.onMusicEnded.bind(this)
    this.onLoseHealthEnded = this.onLoseHealthEnded.bind(this)
    this.stop = this.stop.bind(this)
    this.init = this.initMobile.bind(this)
    this.playBallPop = this.playBallPop.bind(this)
    this.createOrReuseSound = this.createOrReuseSound.bind(this)

    this.isMobileInitialized = false

    window.soundDidFinishPlaying = this.onSoundEnded.bind(this)

    if (window.__mobileSounds) {
      this.mobileSoundsNames = window.__mobileSounds.map(function(s) {
        return s.name
      })
    }

    this.hardMusic = Constants.sounds.hardMusic.map(this.createOrReuseSound)
    this.music = Constants.sounds.music.map(this.createOrReuseSound)

    this.smallSteppingSounds = Constants.sounds.smallSteps.map(this.createOrReuseSound)
    this.largeSteppingSounds = Constants.sounds.largeSteps.map(this.createOrReuseSound)
    this.smallTiltSounds = Constants.sounds.smallTilts.map(this.createOrReuseSound)
    this.largeTiltSounds = Constants.sounds.largeTilts.map(this.createOrReuseSound)
    this.smallTiltModSounds = Constants.sounds.smallTiltsMod.map(this.createOrReuseSound)
    this.largeTiltModSounds = Constants.sounds.largeTiltsMod.map(this.createOrReuseSound)
    this.smallSheepTiltSounds = Constants.sounds.smallSheepTilts.map(this.createOrReuseSound)
    this.largeSheepTiltSounds = Constants.sounds.largeSheepTilts.map(this.createOrReuseSound)
    this.bottleBreakingSounds = Constants.sounds.bottlesBreak.map(this.createOrReuseSound)
    this.bottleImpactSounds = Constants.sounds.bottlesImpact.map(this.createOrReuseSound)
    this.thumps = Constants.sounds.thumps.map(this.createOrReuseSound)
    this.cane = Constants.sounds.cane.map(this.createOrReuseSound)
    this.chairs = Constants.sounds.chairs.map(this.createOrReuseSound)
    this.cups = Constants.sounds.cups.map(this.createOrReuseSound)
    this.tvLarge = Constants.sounds.tvLargeCollide.map(this.createOrReuseSound)
    this.tvSmall = Constants.sounds.tvSmallCollide.map(this.createOrReuseSound)
    this.bin = Constants.sounds.bin.map(this.createOrReuseSound)
    this.toiletpaper = Constants.sounds.toiletpaper.map(this.createOrReuseSound)

    this.health = this.createOrReuseSound("audio/health.mp3");
    this.loseHealth = this.createOrReuseSound("audio/health_lower.mp3");
    this.loseHealth.onended = this.onLoseHealthEnded
    this.sheep = this.createOrReuseSound("audio/mrO.mp3");
    this.tvOff = this.createOrReuseSound("audio/tv_porn_off.mp3");
    this.end = this.createOrReuseSound("audio/finish.mp3");
    this.rewind = this.createOrReuseSound("audio/rewind.mp3");
    this.bear = this.createOrReuseSound("audio/bear.mp3");
    this.ballBounce = this.createOrReuseSound("audio/ball_bounce.mp3");
    this.ballPop = this.createOrReuseSound("audio/ball_out_furnice.mp3");

    let that = this
    this.music.forEach(function(music) {
      music.volume = 0.5
      music.onended = that.onMusicEnded
    })
    this.hardMusic.forEach(function(music) {
      music.volume = 0.5
      music.onended = that.onMusicEnded
    })

    debugger

    // this.musicIndex = this.playRandom(this.hard ? this.hardMusic : this.music)
    let musicArray = this.hard ? this.hardMusic : this.music
    this.musicIndex = 0
    this.play(musicArray[this.musicIndex])
  }

  createOrReuseSound(name) {
    let index = this.mobileSoundsNames.indexOf(name)
    if (index == -1) {
      let sound = new Audio(name);
      sound.preload = 'none';
      sound.name = name
      return sound
    } else {
      return window.__mobileSounds[index]
    }
  }

  initMobile() {
    if (window.__mobileSounds) {
      return
    }

    let musicArray = this.hard ? this.hardMusic : this.music
    let music = musicArray[this.musicIndex]
    window.__mobileSounds = []
    window.__mobileSounds = window.__mobileSounds.concat(this.music)
    window.__mobileSounds = window.__mobileSounds.concat(this.hardMusic)
    window.__mobileSounds.push(this.health)
    window.__mobileSounds.push(this.loseHealth)
    window.__mobileSounds.push(this.sheep)
    window.__mobileSounds.push(this.end)
    window.__mobileSounds.forEach(function(sound) {
      let process = (sound == music && music.paused) || sound != music
      if (process) {
        sound.play()
        sound.pause()
        sound.currentTime = 0
      }
    })

    if (music.paused) {
      this.play(musicArray[this.musicIndex])
    }
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

    let musicArray = this.hard ? this.hardMusic : this.music

    musicArray.forEach(function(music) {
      // music.volume = mute ? 0 : 0.5
      music.muted = mute
    })
  }

  onSoundEnded(filename) {
    let musicArray = this.hard ? this.hardMusic : this.music

    if (filename == this.loseHealth.name) {
      if (window.__delegateSound) {
        window.location.href = "setvolume://" + musicArray[this.musicIndex].name + "!0.5";
      } else {
        TweenMax.to(musicArray[this.musicIndex], 0.5, {
          volume: 0.5
        })
      }
    }

    let track = musicArray.find(function(music) {
      return music.name == filename
    })

    if (track) {
      this.musicIndex++
      if (this.musicIndex == musicArray.length) {
        this.musicIndex = 0
      }

      this.play(musicArray[this.musicIndex])
    }
  }

  onMusicEnded() {
    let musicArray = this.hard ? this.hardMusic : this.music
    window.soundDidFinishPlaying(musicArray[this.musicIndex].name)
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
      let musicArray = this.hard ? this.hardMusic : this.music
      TweenMax.to(musicArray[this.musicIndex], 0.5, {
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
        if (window.__canAutoPlaySounds || (window.__mobileSounds && window.__mobileSounds.map(function(s) {
            return s.src
          }).indexOf(sound.src) != -1)) {
          sound.play()
        }
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
    this.hardMusic.forEach(function(sound) {
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
