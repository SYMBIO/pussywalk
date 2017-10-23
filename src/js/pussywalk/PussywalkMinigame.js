import $ from 'jquery';
import Box2dWorld from './Box2dWorld';
import Renderer from './Renderer';

// https://github.com/kripken/box2d.js

var _json = null;
var _enterFrame = null;
var _world;
var _renderer;
var _canvas;
var _ctx;
var _keymap = {};
var _loaderPromise;
var _paused = false;
var _scoreboard = []

const resizeCanvas = () => {
  let htmlCanvas = $('canvas')[0]
  if (htmlCanvas && htmlCanvas.getContext) {

    let context = htmlCanvas.getContext('2d')

    let dpr = window.devicePixelRatio || 1;
    let bsr = context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio || 1;

    htmlCanvas.width = window.innerWidth * dpr / bsr;
    htmlCanvas.height = window.innerHeight * dpr / bsr;
    htmlCanvas.style.width = window.innerWidth + "px";
    htmlCanvas.style.height = window.innerHeight + "px";
  }
}

const loadJSON = () => {

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
    initGame();
  });

}

const initGame = () => {

  _canvas = $('<canvas />');
  $('.game__scene').prepend(_canvas);
  _ctx = _canvas[0].getContext('2d');

  _world = new Box2dWorld(_canvas[0], _json);
  _renderer = new Renderer(_world.world, _canvas[0], _world.bodies)

  _world.addEndListener(gameEndListener)
  _world.addRenderListener(_renderer.render)

  _renderer.scoreboard = _scoreboard

  resizeCanvas()

  if (!_paused) {
    start();
  }
}

const gameEndListener = (didWin) => {

  if (_world) {
    _world.dispose();
    _world = null;
  }

  if (_renderer) {
    _renderer.dispose();
    _renderer = null;
  }

  if (_canvas) {
    _canvas.remove()
  }

  if (!didWin) {
    initGame()
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

  constructor() {
    $(window).resize(resizeCanvas)

    loadJSON();
  }

  init() {}

  onResize() {}

  pause() {
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

  dispose() {

    if (_enterFrame) {
      window.cancelAnimationFrame(_enterFrame);
      _enterFrame = null;
    }

    if (_world) {
      _world.dispose();
      _world = null;
    }

    if (_canvas) {
      _canvas.remove();
      _canvas = null;
    }

    if (_loaderPromise) {
      _loaderPromise.reject();
      _loaderPromise = null;
    }

    if (_preloaderEF) {
      window.cancelAnimationFrame(_preloaderEF);
      _preloaderEF = null;
      _preloader = null;
    }

  }

  setScoreboard(scoreboard) {
    console.log(scoreboard);
    _scoreboard = scoreboard
    _renderer.scoreboard = scoreboard
  }

}
;
