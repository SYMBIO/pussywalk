import $ from 'jquery';
import AudioPlayer from './AudioPlayer';
import Box2dWorld from './Box2DWorld';
import Renderer from './Renderer';

// https://github.com/kripken/box2d.js

var _json = null;
var _enterFrame = null;
var _world;
var _renderer;
var _audioPlayer;
var _canvas;
var _ctx;
var _keymap = {};
var _loaderPromise;
var _paused = false;
var _callbacks;
var _lowQuality;

const resizeCanvas = () => {
  updateQuality()
}

const updateQuality = () => {
  let htmlCanvas = $('canvas')[0]
  if (htmlCanvas && htmlCanvas.getContext) {

    let context = htmlCanvas.getContext('2d')

    let dpr
    let bsr

    if (_lowQuality) {
      dpr = 1
      bsr = 1
    } else {
      dpr = window.devicePixelRatio || 1;
      bsr = context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;
    }

    htmlCanvas.width = window.innerWidth * dpr / bsr;
    htmlCanvas.height = window.innerHeight * dpr / bsr;
    htmlCanvas.style.width = window.innerWidth + "px";
    htmlCanvas.style.height = window.innerHeight + "px";

    // (pixel density) * (figure to scene ratio) * (default graphics in 2x res.)
    _renderer.scale = (dpr / bsr) * (window.innerHeight / 500) / 3;

    let paused = _world.paused
    _world.paused = false
    _world.step()
    _world.paused = paused
  }
}

const loadJSON = (config) => {

  enableLoader(true);

  _loaderPromise = $.Deferred((deferred) => {
    $(deferred.resolve);
  });

  $.when(
    $.getScript('/js/vendor/Box2D_v2.3.1_min.js?1'),
    $.getJSON('/js/vendor/pussywalk.json', (d) => {
      _json = d;
    }),
    _loaderPromise
  ).done((dn) => {
    _loaderPromise = null;
    initGame(config);
  });

}

const initGame = (config) => {

  _canvas = $('<canvas />');
  $('.game__scene').prepend(_canvas);
  _ctx = _canvas[0].getContext('2d');

  _world = new Box2dWorld(_canvas[0], _json, config.startNaked);
  _renderer = new Renderer(_world.world, _canvas[0], _world.bodies)

  _world.callbacks = _callbacks
  _world.renderer = _renderer
  _world.audioPlayer = _audioPlayer

  _world.sync()
  _renderer.showNakedBody(config.startNaked)

  if (config.mute) {
    _audioPlayer.setMute(true)
  }

  resizeCanvas()

  if (!_paused) {
    start();
  }
}

const start = () => {
  render();
  enableLoader(false);
  $('.game__scene').focus();
}

const render = () => {
  step();
  _enterFrame = window.requestAnimationFrame(render);
}

const step = () => {
  _world.step();
}

var _preloader;
var _preloaderEF;

const enableLoader = (status) => {
  if (status && !_preloader) {
    _preloader = $('<div class="game__loader" />');
    _preloader.currentFrame = 0;
    $('.game__scene').append(_preloader);

    playLoader();
  } else if (!status && _preloader) {
    _preloader.remove();
    _preloader = null;
    window.cancelAnimationFrame(_preloaderEF);
    _preloaderEF = null;

    _canvas.css('visibility', 'visible');
  }
}

const playLoader = () => {

  let dt = 1;
  let frame = parseInt(_preloader.currentFrame);
  _preloader.currentFrame += 0.6 * dt;

  if (frame >= 79) {
    if (_world && !_paused) {
      start();
      return;
    } else {
      _preloader.currentFrame = 0;
    }
  }
  _preloader.css('background-position', '0 ' + (frame * -160) + 'px');
  _preloaderEF = window.requestAnimationFrame(playLoader);
}

export default class PussywalkMinigame {

  constructor(callbacks, naked, mute) {
    _callbacks = callbacks;
    _audioPlayer = new AudioPlayer(naked);

    $(window).resize(resizeCanvas)

    if(_audioPlayer.isMusicPlaying()) {
      $('.nav__sound').removeClass('is-active');
    } else {
      $('.nav__sound').addClass('is-active');
    }

    this.onTick = this.onTick.bind(this)
    this.isMusicPlaying = this.isMusicPlaying.bind(this)

    this.updateInterval = setInterval(this.onTick, 1000)
    this.lastTickTime = new Date()
    this.playTime = 0

    loadJSON({
      startNaked: naked,
      mute: mute
    });
  }

  setLowQuality(lowQuality) {
    _lowQuality = lowQuality
    _renderer.lowQuality = lowQuality
    updateQuality()
  }

  init() {}

  onResize() {}

  pause() {
    this.onTick();
    _paused = true;
    if (_enterFrame) {
      window.cancelAnimationFrame(_enterFrame);
      _enterFrame = null;
    }
  }

  play() {
    _paused = false;
    if (_world) {
      start();
    }
  }

  onTick() {
    let now = new Date().getTime()
    let delta = now - this.lastTickTime
    this.lastTickTime = now
    if (!_paused) {
      this.playTime += delta

      if (_callbacks.onTick) {
        _callbacks.onTick(this.playTime)
      }
    }
  }

  isMusicPlaying() {
    if (_audioPlayer) {
      return _audioPlayer.isMusicPlaying()
    }
  }

  initAudio() {
    if (_audioPlayer && !_audioPlayer.isInitialized) {
      _audioPlayer.init()
    }
  }

  setMute(mute) {
    if (_audioPlayer) {
      _audioPlayer.setMute(mute)
    }
  }

  dispose() {

    $(window).off("resize");

    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }

    if (_enterFrame) {
      window.cancelAnimationFrame(_enterFrame);
      _enterFrame = null;
    }

    if (_world) {
      _world.dispose();
      _world = null;
    }

    if (_renderer) {
      _renderer.dispose();
      _renderer = null;
    }

    if (_canvas) {
      _canvas.remove();
      _canvas = null;
    }

    if (_loaderPromise) {
      _loaderPromise.reject();
      _loaderPromise = null;
    }

    if (_audioPlayer) {
      _audioPlayer.stop()
      _audioPlayer = null
    }

    if (_preloaderEF) {
      window.cancelAnimationFrame(_preloaderEF);
      _preloaderEF = null;
      _preloader = null;
    }
  }
}
;
