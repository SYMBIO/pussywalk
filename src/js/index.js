import assetsLoader from 'assets-loader';
import $ from 'jquery';
import * as firebase from 'firebase';
import styles from '../styles/app.less';
import PussywalkMinigame from './pussywalk/PussywalkMinigame';

// tutorial
var tutorial = true;
if (getCookie('tutorial') == 1) {
  tutorial = false;
}

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
    '/images/level/level_5.jpg',
    '/images/level/level_6.jpg',
    '/images/level/level_7.jpg',
    '/images/level/level_8.jpg',
    '/images/level/lights/fluorescent_bathroom.jpg',
    '/images/level/lights/fluorescent_general.jpg',
    '/images/level/lights/furnice.jpg',
    '/images/level/lights/general_lightbulb.jpg',
    '/images/level/lights/ovcacek_room_light.jpg',
    '/images/level/lights/warm_bathroom.jpg',
    '/images/misc/flash.png',
    '/images/misc/vignette.png',

    // audio
    '/audio/step_big_01.mp3',
    '/audio/step_big_02.mp3',
    '/audio/step_big_03.mp3',
    '/audio/step_big_04.mp3',
    '/audio/step_small_01.mp3',
    '/audio/step_small_02.mp3',
    '/audio/step_small_03.mp3',
    '/audio/step_small_04.mp3',
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
    setTimeout(function() {
      hideLayer('.layer--loading');

      if (tutorial) {
        showLayer('.layer--tutorial');
        pauseGame();
      } else {
        continueGame();
      }
    }, 500)
  })
  .start();

let _game;
let _callbacks;
let finished = false;

window.onload = function() {
  initializeElements()
  initializeFirebase()

  _callbacks = {
    onGameEnd: onGameEnd,
    onTick: onTick,
    onLifesUpdate: onLifesUpdate,
    onSheepPickup: onSheepPickup
  }

  startGame()
}

function showLayer(layer) {
  $('.layer').removeClass('is-visible');
  $(layer).addClass('is-visible');
}

function hideLayer(layer) {
  $(layer).removeClass('is-visible');
  continueGame()
}

function initializeElements() {
  //$('#name_dialogue').hide()
  //$('#scoreboard').hide()
  $('#game_controls, #game_lives').show()
  $('#send_name').attr("disabled", true);

  $('#send_name').on('click', function() {
    //$('#name_dialogue').hide()
    hideLayer('.layer--finish');
    pauseGame();
    finished = true;
    firebase.database().ref('scoreboard').push({
      username: $("#name_input").val(),
      time: _game.playTime
    }, function(error) {
      //$('#scoreboard').show()
      scoreUpdate();
    });
  });

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
    $('#game_controls, #game_lives').show()
    if (finished) {
      startGame()
    }
  })

  var openNav = function() {
    $('.nav').addClass('is-active');
  }
  var closeNav = function() {
    $('.nav').removeClass('is-active');
  }

  $('.nav-link').on('click', function(e) {
    e.preventDefault();

    if (!$('.nav').hasClass('is-active')) {
      openNav()
      pauseGame()
      gtag('event', 'navigation', {
        'status': 'on'
      });
    } else {
      closeNav();
      gtag('event', 'navigation', {
        'status': 'off'
      });
      continueGame()
    }
  });

  $('.nav__restart').on('click', function(e) {
    e.preventDefault();

    closeNav();
    startGame();
    continueGame()
  });

  var mute = false;
  $('.nav__sound').on('click', function(e) {
    e.preventDefault();

    var link = $(this);

    if (mute) {
      setMute(false);
      link.removeClass('is-muted');
      link.html(link.data('off'))
      mute = false;
    } else {
      setMute(true);
      link.addClass('is-muted');
      link.html(link.data('on'))
      mute = true;
    }
  });

  $('.layer__close').on('click', function(e) {
    e.preventDefault();

    hideLayer($(this).parents('.layer').eq(0));
  });

  $('.js-show-layer').on('click', function(e) {
    e.preventDefault();

    var link = $(this),
      layer = link.data('layer');

    $('.nav').removeClass('is-active');
    showLayer('.layer--' + layer);

    gtag('event', 'layer', {
      'name': layer
    });
  });

  $('.js-play').on('click', function(e) {
    e.preventDefault();

    closeTutorial();
  });

  $('.js-scoreboard-update').on('click', function(e) {
    e.preventDefault();

    closeNav();
    scoreUpdate();
  });
}

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function closeTutorial() {
  if (tutorial) {
    hideLayer('.layer--tutorial');
    tutorial = false;
    setCookie('tutorial', '1', 365);
    continueGame();
  }
}

if (tutorial) {
  $(document).keydown(function(e) {
    if (e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 13 || e.keyCode == 27) {
      closeTutorial();
    }
  });
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

//scoreUpdate();
}

function scoreUpdate(time) {

  $('#scoreboard_top3').html('<div class="lds-css ng-scope"><div style="width:100%;height:100%" class="lds-pacman"><div><div></div><div></div><div></div></div><div><div></div><div></div></div></div>');
  $('#scoreboard_list').html('');

  showLayer('.layer--scoreboard');

  var scoreboardListener = firebase.database().ref('scoreboard');
  scoreboardListener.orderByChild("time").once('value', function(snapshot) {
    let scoreboard = $('#scoreboard_list')
    let scoreboardTop3 = $('#scoreboard_top3')
    var i = 0
    var j = 0
    var k = 0
    var t = 0
    scoreboard.empty()
    scoreboardTop3.empty()

    if (!isNaN(parseFloat(time)) && isFinite(time)) {

      var score = [];

      snapshot.forEach(function(snapshot) {
        score.push([j, snapshot.val().username, snapshot.val().time]);

        if (snapshot.val().username == $("#name_input").val() && snapshot.val().time == time) {
          t = j;
        }

        j++;
      });

      var plusminus = 35;

      snapshot.forEach(function(snapshot) {
        let listItem = $("<li />");
        if (snapshot.val().username == $("#name_input").val() && snapshot.val().time == time && k == 0) {
          listItem = $("<li class='chosen-one' />");
        }
        let posSpan = $("<span class=\"position\" />")
        let nameSpan = $("<span class=\"username\" />")
        let timeSpan = $("<span class=\"time\" />")

        posSpan.append(i + 1 + '.')
        nameSpan.append(snapshot.val().username)
        timeSpan.append(niceTime(snapshot.val().time))

        listItem.append(posSpan)
        listItem.append(nameSpan)
        listItem.append(timeSpan)

        if (snapshot.val().username == $("#name_input").val() && snapshot.val().time == time && k == 0) {
          listItem.append('<span class="share"><span></span><a href="" class="btn btn--fb">Sdílej svoje score na</a></span>')

          k = 1;
        }

        if (t < 3) {

          if (i < 15) {
            scoreboardTop3.append(listItem)
          }

        } else {

          if (i < 3) {
            scoreboardTop3.append(listItem)
          }

          if (i > 3 && i > t - plusminus && i < t + plusminus + 2) {
            scoreboard.append(listItem)
          }

        }

        i++;
      })

      $('#scoreboard').animate({
        scrollTop: $('.chosen-one').position().top - $('#scoreboard').height() / 3
      }, 500);

    } else {

      snapshot.forEach(function(snapshot) {
        let listItem = $("<li />")
        let posSpan = $("<span class=\"position\" />")
        let nameSpan = $("<span class=\"username\" />")
        let timeSpan = $("<span class=\"time\" />")
        posSpan.append(i + 1 + '.')
        nameSpan.append(snapshot.val().username)
        timeSpan.append(niceTime(snapshot.val().time))
        listItem.append(posSpan)
        listItem.append(nameSpan)
        listItem.append(timeSpan)

        if (i < 100) {
          scoreboardTop3.append(listItem)
        }

        i++;
      })

    }

  });
}

function niceTime(time, nicer) {
  var spanWrap = function(what) {
      return what.replace(/(\d)/g, '<span>$1</span>');
    },
    totalSeconds = time / 1000,
    hours = Math.floor(totalSeconds / 3600);

  totalSeconds %= 3600;

  var minutes = ('0' + Math.floor(totalSeconds / 60)).slice(-2),
    seconds = ('0' + Math.floor(totalSeconds % 60)).slice(-2),
    time = '0:' + seconds;

  if (nicer) {
    time = seconds + ' s.';

    if (minutes > 0) {
      time = minutes + ' min. a ' + seconds + ' s.';
    }

    if (hours > 0) {
      time = hours + ' hod., ' + minutes + ' min. a ' + seconds + ' s.';
    }

    return time;
  } else {
    if (minutes > 0) {
      time = minutes + ':' + seconds;
    }

    if (hours > 0) {
      time = hours + ':' + minutes + ':' + seconds;
    }

    return spanWrap(time);
  }
}

function onTick(time) {
  $('#time').html(niceTime(time));
}

function onSheepPickup() {
  console.log("picked up sheep");
}

function onLifesUpdate(numberOfLifes, delta) {
  var cont = $('#game_lives'),
    oldCont = $('.game__live--old'),
    newCont = $('.game__live--new'),
    oldLive,
    newLive = numberOfLifes;

  newCont.html(newLive);

  cont.addClass('has-change');

  newCont[0].addEventListener('transitionend', function() {

    oldCont.html(newLive);
    cont.removeClass('has-change');

  });
}

function onGameEnd(didWin) {
  if (didWin) {
    //$('#name_dialogue').show()
    pauseGame();
    $('#finish_time').html(niceTime(_game.playTime, true));
    showLayer('.layer--finish');
    $('#game_controls, #game_lives').hide()
  } else {
    startGame(true)
  }
}

function startGame(naked) {
  finished = false;

  if (_game) {
    _game.dispose()
  }
  _game = new PussywalkMinigame(_callbacks, naked);

  setTimeout(function() {
    hideLayer('.layer--mission-1');
  }, 7500);
}

function pauseGame() {
  if (_game) {
    _game.pause()
  }
}

function continueGame() {
  if (_game) {
    _game.pause()
    _game.play()
  }
}

function setMute(mute) {
  if (_game) {
    _game.setMute(mute)
  }
}
