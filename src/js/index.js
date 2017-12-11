import assetsLoader from 'assets-loader';
import $ from 'jquery';
import * as firebase from 'firebase';
import styles from '../styles/app.less';
import PussywalkMinigame from './pussywalk/PussywalkMinigame';

// todo proper list
let loader = assetsLoader({
  assets: [
    // images
    '/images/spritesheet-0.json',
    '/images/spritesheet-0.png',
    '/images/spritesheet-1.json',
    '/images/spritesheet-1.png',
    '/images/spritesheet-2.json',
    '/images/spritesheet-2.png',
    '/images/spritesheet-3.json',
    '/images/spritesheet-3.png',
    '/images/spritesheet-4.json',
    '/images/spritesheet-4.png',
    '/images/spritesheet-5.json',
    '/images/spritesheet-5.png',
    '/images/spritesheet-6.json',
    '/images/spritesheet-6.png',
    '/images/spritesheet-7.json',
    '/images/spritesheet-7.png',
    '/images/spritesheet-8.json',
    '/images/spritesheet-8.png',
    '/images/spritesheet-9.json',
    '/images/spritesheet-9.png',
    '/images/layout/loading-bg.jpg',
    '/images/layout/loading-ico.png',
    '/images/layout/logo-pussywalk-2.png',
    '/images/layout/logo-pussywalk-2-pink.png',
    '/images/layout/menu-bg.png',
    '/images/layout/mission-ico.png',
    '/images/layout/top-bg.png',
    '/images/layout/tutorial-keys.png',
    '/images/level/furnice_wall.jpg',
    '/images/level/level_1.jpg',
    '/images/level/level_2.jpg',
    '/images/level/level_3.jpg',
    '/images/level/level_4.jpg',
    '/images/level/lights/fluorescent_bathroom.jpg',
    '/images/level/lights/fluorescent_general.jpg',
    '/images/level/lights/furnice.jpg',
    '/images/level/lights/general_lightbulb.jpg',
    '/images/level/lights/ovcacek_room_light.jpg',
    '/images/level/lights/warm_bathroom.jpg',
    '/images/misc/flash.png',
    '/images/misc/light.jpg',
    '/images/misc/vignette.png',

    // audio
    '/audio/step_big_01.wav',
    '/audio/step_big_02.wav',
    '/audio/step_big_03.wav',
    '/audio/step_big_04.wav',
    '/audio/step_small_01.wav',
    '/audio/step_small_02.wav',
    '/audio/step_small_03.wav',
    '/audio/step_small_04.wav',
  ]
  })
  .on('error', function(error) {
    console.error(error);
  })
  .on('progress', function(progress) {
    let percentage = (progress * 100).toFixed() + '%';
    $('.loader__bar').css({
      'transform': 'translateX(' + percentage + ')'
    })
  })
  .on('complete', function(assets) {
    setTimeout(function(){
      hideLayer('.layer--loading');
    }, 500)
  })
  .start();

let _game;
let _callbacks;

window.onload = function() {
  initializeElements()
  initializeFirebase()

  _callbacks = {
    onGameEnd: onGameEnd,
    onTick: onTick
  }

  startGame()
}

function showLayer(layer) {
  $('.layer').removeClass('is-visible');
  $(layer).addClass('is-visible');
}

function hideLayer(layer) {
  $(layer).removeClass('is-visible');
}

function initializeElements() {
  //$('#name_dialogue').hide()
  //$('#scoreboard').hide()
  $('#game_controls').show()
  $('#send_name').attr("disabled", true);

  $('#send_name').on('click', function() {
    //$('#name_dialogue').hide()
    hideLayer('.layer--finish');

    firebase.database().ref('scoreboard').push({
      username: $("#name_input").val(),
      time: _game.playTime()
    }, function(error) {
      //$('#scoreboard').show()
      showLayer('.layer--scoreboard')
    });
  })
  $('#cancel_send_name').on('click', function() {
    //$('#name_dialogue').hide()
    hideLayer('.layer--finish');
    startGame()
  })
  $('#name_input').on('input', function() {
    $('#send_name').attr("disabled", $("#name_input").val().length == 0);
  })

  $('#scoreboard_close').on('click', function() {
    //$('#name_dialogue').hide()
    hideLayer('.layer--finish');
    //$('#scoreboard').hide()
    hideLayer('.layer--scoreboard');
    $('#game_controls').show()
    startGame()
  })

  $('.nav-link').on('click', function(e){
    e.preventDefault();

    $('.nav').toggleClass('is-active');
  });

  $('.layer__close').on('click', function(e){
    e.preventDefault();

    hideLayer($(this).parents('.layer').eq(0));
  });

  $('.js-show-layer').on('click', function(e){
    e.preventDefault();

    var link = $(this);

    $('.nav').removeClass('is-active');
    showLayer('.layer--' + link.data('layer'))
  });
}

function niceTime() {
var spanWrap = function(what) {
        return what.replace(/(\d)/g, '<span>$1</span>');
      },
      totalSeconds = time / 1000,
      hours = Math.floor(totalSeconds / 3600);
  
  totalSeconds %= 3600;
  var minutes = ('0' + Math.floor(totalSeconds / 60)).slice(-2),
      seconds = ('0' + Math.floor(totalSeconds % 60)).slice(-2),
      time = '0:' + spanWrap(seconds);

  if(minutes > 0) {
    time = spanWrap(minutes) + ':' + spanWrap(seconds);
  }

  if(hours > 0) {
    time = spanWrap(hours) + ':' + spanWrap(minutes) + ':' + spanWrap(seconds);
  }
}

function initializeFirebase() {

  var config = {
    apiKey: "AIzaSyCcl4aqLnBeiBfNHTThWIgxFpmXatzNegA",
    authDomain: "pussywalk-2.firebaseapp.com",
    databaseURL: "https://pussywalk-2.firebaseio.com",
    projectId: "pussywalk-2",
    storageBucket: "pussywalk-2.appspot.com",
    messagingSenderId: "597701981219"
  };
  firebase.initializeApp(config);

  var scoreboardListener = firebase.database().ref('scoreboard');
  scoreboardListener.orderByChild("time").on('value', function(snapshot) {
    let scoreboard = $('#scoreboard_list')
    let scoreboardTop3 = $('#scoreboard_top3')
    var i = 0
    scoreboard.empty()
    scoreboardTop3.empty()
    snapshot.forEach(function(snapshot) {
      let listItem = $("<li />")
      let nameSpan = $("<span class=\"username\" />")
      let timeSpan = $("<span class=\"time\" />")
      nameSpan.append(snapshot.val().username)
      timeSpan.append(niceTime(snapshot.val().time))
      listItem.append(nameSpan)
      listItem.append(timeSpan)
      if (i > 2) {
        scoreboard.append(listItem)
      } else {
        scoreboardTop3.append(listItem)
      }
      i++;
    })
  });
}

function niceTime (time) {
  var spanWrap = function(what) {
        return what.replace(/(\d)/g, '<span>$1</span>');
      },
      totalSeconds = time / 1000,
      hours = Math.floor(totalSeconds / 3600);
  
  totalSeconds %= 3600;

  var minutes = ('0' + Math.floor(totalSeconds / 60)).slice(-2),
      seconds = ('0' + Math.floor(totalSeconds % 60)).slice(-2),
      time = '0:' + seconds;

  if(minutes > 0) {
    time = minutes + ':' + seconds;
  }

  if(hours > 0) {
    time = hours + ':' + minutes + ':' + seconds;
  }

  return spanWrap(time);
}

function onTick(time) {
  $('#time').html(niceTime(time));
}

function onGameEnd(didWin) {
  if (didWin) {
    //$('#name_dialogue').show()
    showLayer('.layer--finish');
    $('#game_controls').hide()
  } else {
    startGame()
  }
}

function startGame() {
  if (_game) {
    _game.dispose()
  }
  _game = new PussywalkMinigame(_callbacks);
}
