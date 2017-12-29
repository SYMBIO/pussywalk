import assetsLoader from './vendor/assets-loader.js';
import $ from 'jquery';
import * as firebase from 'firebase';
import styles from '../styles/app.less';
import PussywalkMinigame from './pussywalk/PussywalkMinigame';
import Config from './pussywalk/Config';

if ('ontouchstart' in document.documentElement) {
  $('html').removeClass('no-touch').addClass('touch');
}

if (window.location.hostname == 'localhost') {
  $('html').removeClass('no-app').addClass('app');
}

// Used for delegating sound to app
window.__delegateSound = false

//
var mute = !window.__canAutoPlaySounds;

// tutorial
var tutorial = true;
if (getCookie('tutorial-new') == 1) {
  tutorial = false;
}

var nudeMode = false;
var nudeModePlaying = false;

var online,
  onlineTrue = function() {
    online = true;
    $('.online').show();
    $('.offline').hide();
  },
  onlineFalse = function() {
    online = false;
    $('.online').hide();
    $('.offline').show();
}

if (navigator.onLine) {
  onlineTrue();
} else {
  onlineFalse();
}

window.addEventListener('online', function() {
  onlineTrue();
});
window.addEventListener('offline', function() {
  onlineFalse();
});

// todo proper list
let loader = assetsLoader({
  assets: [
    // images
    '/images/spritesheet-0.json?' + Config.cachebuster,
    '/images/spritesheet-0.png?' + Config.cachebuster,
    '/images/spritesheet-1.json?' + Config.cachebuster,
    '/images/spritesheet-1.png?' + Config.cachebuster,
    '/images/spritesheet-2.json?' + Config.cachebuster,
    '/images/spritesheet-2.png?' + Config.cachebuster,
    '/images/spritesheet-3.json?' + Config.cachebuster,
    '/images/spritesheet-3.png?' + Config.cachebuster,
    '/images/spritesheet-4.json?' + Config.cachebuster,
    '/images/spritesheet-4.png?' + Config.cachebuster,
    '/images/layout/loading-bg.jpg',
    '/images/layout/loading-ico.png',
    '/images/layout/logo-pussywalk-2.png',
    '/images/layout/logo-pussywalk-2-pink.png',
    '/images/layout/menu-bg.png',
    '/images/layout/top-bg.png',
    '/images/layout/tutorial-keys.png',
    '/images/layout/tutorial-bg.png',
    '/images/layout/tutorial-circle.png',
    '/images/layout/tutorial-desktop-arrow.png',
    '/images/layout/tutorial-finger.png',
    '/images/layout/tutorial-leg.png',
    '/images/layout/tutorial-mobile-button-l.png',
    '/images/layout/tutorial-mobile-button-r.png',
    '/images/level/furnice_wall.jpg?' + Config.cachebuster,
    '/images/level/level_1.jpg?' + Config.cachebuster,
    '/images/level/level_2.jpg?' + Config.cachebuster,
    '/images/level/level_3.jpg?' + Config.cachebuster,
    '/images/level/level_4.jpg?' + Config.cachebuster,
    '/images/level/level_5.jpg?' + Config.cachebuster,
    '/images/level/level_6.jpg?' + Config.cachebuster,
    '/images/level/level_7.jpg?' + Config.cachebuster,
    '/images/level/level_8.jpg?' + Config.cachebuster,
    '/images/misc/flash.png',
    '/images/misc/vignette.png',
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
    $('.loading__logo').attr('src', window.__isCensored ? 'images/layout/censored/logo-pussywalk-2-pink.png' : 'images/layout/logo-pussywalk-2-pink.png')
  })
  .on('complete', function(assets) {
    setTimeout(function() {
      if (tutorial) {
        //showLayer('.layer--tutorial');
        hideLayer('.layer--loading');
        $('.tutorial-new').addClass('is-visible');
      } else {
        showLayer('.layer--mission-1');
        continueGame();
      }

      let filename = window.__isCensored ? 'images/layout/censored/logo-pussywalk-2.png' : 'images/layout/logo-pussywalk-2.png'
      $('.logo').css('background-image', 'url(' + filename + ')')

    }, (2 - assetsLoader.stats.secs) * 1000)
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

  initializeAudio().then(startGame)
}

function initializeAudio() {
  return new Promise(function(resolve, reject) {
    // The following block should not be executed as a result of a user generated event
    let testSound = new Audio()
    testSound.volume = 0
    testSound.src = "data:audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"
    testSound.play().then(function() {
      // Went through OK
      window.__canAutoPlaySounds = true
      $('.nav__sound').removeClass('is-active');
      mute = false
      resolve()
    }, function() {
      // Can't play
      window.__canAutoPlaySounds = false
      $('.nav__sound').addClass('is-active');
      mute = true
      resolve()
    });
  })
}

var openNav = function() {

  $('.nav').addClass('is-active');
  $('.nav-link').addClass('is-active');

  if ($('.popup-merch').hasClass('is-visible')) {
    $('.popup-merch').removeClass('is-visible');
  }
}
var closeNav = function() {
  $('.nav').removeClass('is-active');
  $('.nav-link').removeClass('is-active');
}
var checkNav = function() {
  return $('.nav').hasClass('is-active');
}

function showLayer(layer) {
  $('.layer').removeClass('is-visible');
  $(layer).addClass('is-visible');
}

function hideLayer(layer) {
  $(layer).removeClass('is-visible');
  if (!checkNav() && !$('.layer.is-visible').length) {
    continueGame()
  }
}

function initializeElements() {
  $('#game_controls, #game_lives').show()
  $('#send_name').attr("disabled", true);

  $('#send_name').on('click', function() {
    hideLayer('.layer--finish');
    pauseGame();
    finished = true;

    firebase.database().ref('scoreboard').push({
      username: $("#name_input").val(),
      time: _game.playTime,
      naked: nudeModePlaying
    }, function(error) {
      console.log(error);
      if (error) {
        console.log(error);
      }
      scoreUpdate(_game.playTime, nudeMode);
    });
  });

  $('#cancel_send_name').on('click', function() {
    hideLayer('.layer--finish');
    startGame()
  })

  $('#name_input').on('input', function() {
    $('#send_name').attr("disabled", $("#name_input").val().length == 0);
  })

  $(document).on('click', '#scoreboard_close, .js-too-bad-play', function(e) {
    e.preventDefault();

    hideLayer('.layer--finish');
    hideLayer('.layer--scoreboard');
    $('#game_controls, #game_lives').show()
    if (finished) {
      startGame(nudeMode)
      if (nudeMode) {
        setTimeout(function() {
          pauseGame();
          showLayer('.layer--naked');
        }, 500)
      }
    }
  })

  $('.nav-link').on('click', function(e) {
    e.preventDefault();

    if (!$('.nav').hasClass('is-active')) {
      openNav()
      pauseGame()
      if (online) {
        window.wtfga('send', 'event', 'navigation', 'on')
      }
      ;
    } else {
      closeNav();
      continueGame()
      if (online) {
        window.wtfga('send', 'event', 'navigation', 'off')
      }
      ;
    }
  });

  $('.nav-link-bg').on('click', function(e) {
    e.preventDefault();

    closeNav();
    continueGame()
    if (online) {
      window.wtfga('send', 'event', 'navigation', 'off', 'mimo menu')
    }
    ;
  });

  $('.nav__restart').on('click', function(e) {
    e.preventDefault();

    closeNav();
    startGame();
    continueGame();

    if (online) {
      window.wtfga('send', 'event', 'navigation', 'restart')
    }
    ;
  });

  /*
  $('.nav-sound').on('click', function(e) {
    e.preventDefault();

    var link = $(this);

    if (mute) {
      setMute(false);
      link.removeClass('is-muted');
      mute = false;
    } else {
      setMute(true);
      link.addClass('is-muted');
      mute = true;
    }
  });
  */
  $('.nav__sound').on('click', function(e) {
    e.preventDefault();

    var link = $(this);

    if (mute) {
      setMute(false);
      if (online) {
        window.wtfga('send', 'event', 'sound', 'on')
      }
      link.removeClass('is-active');
      mute = false;
      initMobileAudio();
    } else {
      setMute(true);
      if (online) {
        window.wtfga('send', 'event', 'sound', 'off')
      }
      link.addClass('is-active');
      mute = true;
    }
  });

  $('.nav__quality').on('click', function(e) {
    e.preventDefault();

    var link = $(this);

    if (link.hasClass('is-active')) {
      link.removeClass('is-active');
      _game.setLowQuality(false);
      if (online) {
        window.wtfga('send', 'event', 'low quality', 'on')
      }
      ;
    } else {
      link.addClass('is-active');
      _game.setLowQuality(true);
      if (online) {
        window.wtfga('send', 'event', 'low quality', 'off')
      }
      ;
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
    if (online) {
      window.wtfga('send', 'event', 'layer', layer)
    }
    ;
  });

  $('.js-play-again').on('click', function(e) {
    e.preventDefault();

    hideLayer('.layer--finish');

    finished = true;
    startGame(nudeMode);
    $('#game_controls, #game_lives').show();
    if (nudeMode) {
      setTimeout(function() {
        pauseGame();
        showLayer('.layer--naked');
      }, 500)
    }
  });

  $('.js-play').on('click', function(e) {
    e.preventDefault();

    //closeTutorial();

    showLayer('.layer--mission-1');

  /*
  setTimeout(function() {
    $('.popup-merch').addClass('is-visible');
  }, 7500);
  */
  });

  $('.js-play-naked').on('click', function(e) {
    e.preventDefault();

    hideLayer('.layer--naked');

    continueGame();
  });

  $('.js-scoreboard-update').on('click', function(e) {
    e.preventDefault();

    closeNav();
    scoreUpdate();
  });

  if (getCookie('share') != 1) {
    var shareTimeout,
      shareInterval = setInterval(function() {
        $('.nav-share').addClass('has-wiggle');

        shareTimeout = setTimeout(function() {
          $('.nav-share').removeClass('has-wiggle');
        }, 1000)
      }, 60000);
  }

  $(document).on('click', '.js-share', function(e) {
    e.preventDefault();

    setCookie('share', '1', 365);
    window.clearInterval(shareInterval);
    window.clearTimeout(shareTimeout);

    if ($(this).hasClass('nav-share')) {
      if (online) {
        window.wtfga('send', 'event', 'share', 'like')
      }
      ;
    } else {
      if (online) {
        window.wtfga('send', 'event', 'share', 'vitez')
      }
      ;
    }

    window.open($(this).attr('href'), 'fbShareWindow', 'height=450, width=550, top=100, left=100, toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
    return false;
  });

  $('.popup-merch p').on('click', function() {
    $('.popup-merch').removeClass('is-visible');
    pauseGame();
    showLayer('.layer--merch');
    if (online) {
      window.wtfga('send', 'event', 'popup', 'show merch')
    }
    ;
  });

  $('.popup__close').on('click', function(e) {
    e.preventDefault();

    $('.popup-merch').removeClass('is-visible');

    if (online) {
      window.wtfga('send', 'event', 'popup', 'close')
    }
    ;
  });

  $('.js-merch').on('click', function(e) {
    if (online) {
      window.wtfga('send', 'event', 'merch', 'objednat')
    }
    ;
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
    //hideLayer('.layer--tutorial');
    $('.tutorial-new').removeClass('is-visible');
    tutorial = false;
    setCookie('tutorial-new', '1', 365);
    continueGame();
  }
}

if (tutorial) {
  var leftButtonPress = false,
    rightButtonPress = false;

  $(document).keydown(function(e) {
    if (e.keyCode == 37) {
      leftButtonPress = true;
    }
    if (e.keyCode == 39) {
      rightButtonPress = true;
    }
    if (leftButtonPress && rightButtonPress) {
      closeTutorial();
    }
  });

  $('.game__key').on('touchstart', function(e) {
    if ($(this).hasClass('game__key--left')) {
      leftButtonPress = true;
    }
    if ($(this).hasClass('game__key--right')) {
      rightButtonPress = true;
    }
    if (leftButtonPress && rightButtonPress) {
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

//$("#name_input").val('Ondratra');
//scoreUpdate(67913);
}

function scoreUpdate(time, naked) {

  $('.pacman').html('<div class="lds-css ng-scope"><div style="width:100%;height:100%" class="lds-pacman"><div><div></div><div></div><div></div></div><div><div></div><div></div></div></div>');
  $('#scoreboard_top3').html('');
  $('#scoreboard_list').html('');

  showLayer('.layer--scoreboard');

  var reqTime = 40000,
    upTo = 2000;

  var scoreboardListener = firebase.database().ref('scoreboard');

  let scoreboard = $('#scoreboard_list');
  let scoreboardTop3 = $('#scoreboard_top3');

  var i = 0
  var j = 0
  var k = 0
  var t = 0

  if (!isNaN(parseFloat(time)) && isFinite(time)) {

    var listItemNude = nudeModePlaying ? '1' : '';
    var listItemNude2 = nudeModePlaying ? '-nude' : '';

    scoreboardListener.orderByChild('time').startAt(reqTime).limitToFirst(upTo).once('value', function(snapshot) {

      scoreboard.empty()
      scoreboardTop3.empty()

      var lastTime = 0;
      snapshot.forEach(function(snapshot) {
        lastTime = snapshot.val().time;
      });

      //console.log(lastTime);
      //2000. Gelu NUDE 01:17:230

      if (time > lastTime) {
        $('.scoreboard__too-bad').show();
        $('.scoreboard__normal').hide();

        $('.pacman').html('');

        $('#scoreboard__too-bad_time').html(niceTime((time - lastTime), true, true));
        $('#scoreboard__too-bad__share').html('<a href="https://www.facebook.com/sharer/sharer.php?u=http://pussywalk.com/images/layout/share.php?n=' + $("#name_input").val() + '%26t=' + niceTime(time, true, true) + '%26c=' + listItemNude + '" class="btn btn--fb js-share">Sdílej svoje score na</a>');

      } else {
        $('.scoreboard__normal').show();
        $('.scoreboard__too-bad').hide();

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
          let nakedSpan = '';
          if (snapshot.val().naked) {
            nakedSpan = ' <span class="scoreboard__nude">NUDE</span>';
          }
          nameSpan.append(snapshot.val().username + nakedSpan)
          timeSpan.append(scoreTime(snapshot.val().time))

          listItem.append(posSpan)
          listItem.append(nameSpan)
          listItem.append(timeSpan)

          if (snapshot.val().username == $("#name_input").val() && snapshot.val().time == time && k == 0) {
            listItem.append('<span class="share"><span></span><a href="https://www.facebook.com/sharer/sharer.php?u=http://pussywalk.com/images/layout/share.php?n=' + snapshot.val().username + '%26t=' + niceTime(snapshot.val().time, true, true) + '%26c=' + listItemNude + '" class="btn btn--fb js-share">Sdílej svoje score na</a><img src="/images/layout/master' + listItemNude2 + '.png" alt=""></span>')
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

            if (i >= 3 && i > t - plusminus && i < t + plusminus + 2) {
              scoreboard.append(listItem)
            }

          }

          i++;
        })

        $('.pacman').html('');

        $('#scoreboard').animate({
          scrollTop: $('.chosen-one').position().top - $('#scoreboard').height() / 3
        }, 500);
      }
    });

  } else {

    $('.scoreboard__too-bad').hide();
    $('.scoreboard__normal').show();

    scoreboardListener.orderByChild('time').startAt(reqTime).limitToFirst(100).once('value', function(snapshot) {

      scoreboard.empty()
      scoreboardTop3.empty()

      snapshot.forEach(function(snapshot) {
        let listItem = $("<li />")
        let posSpan = $("<span class=\"position\" />")
        let nameSpan = $("<span class=\"username\" />")
        let timeSpan = $("<span class=\"time\" />")
        posSpan.append(i + 1 + '.')
        let nakedSpan = '';
        if (snapshot.val().naked) {
          nakedSpan = ' <span class="scoreboard__nude">NUDE</span>';
        }
        nameSpan.append(snapshot.val().username + nakedSpan)
        timeSpan.append(scoreTime(snapshot.val().time))
        listItem.append(posSpan)
        listItem.append(nameSpan)
        listItem.append(timeSpan)

        scoreboardTop3.append(listItem)

        i++;
      })

      $('.pacman').html('');

    });

  }
}

function niceTime(time, nicer, nospan) {
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

    if (nospan) {
      return time;
    } else {
      return spanWrap(time);
    }
  }
}

function scoreTime(duration, nicer) {
  var spanWrap = function(what) {
      return what.replace(/(\d)/g, '<span>$1</span>');
    },
    milliseconds = parseInt(duration % 1000),
    seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt((duration / (1000 * 60 * 60)) % 24),
    timeHours,
    timeMinutes,
    timeSeconds,
    timeMilliseconds,
    time;

  timeHours = (hours < 10) ? "0" + hours : hours;
  timeMinutes = (minutes < 10) ? "0" + minutes : minutes;
  timeSeconds = (seconds < 10) ? "0" + seconds : seconds;
  timeMilliseconds = milliseconds;
  if (milliseconds < 10) {
    timeMilliseconds = "0" + milliseconds;
  }
  if (timeMilliseconds < 100) {
    timeMilliseconds = "0" + timeMilliseconds;
  }

  time = 0 + ':' + timeSeconds + ':' + timeMilliseconds;

  if (minutes > 0) {
    time = timeMinutes + ':' + timeSeconds + ':' + timeMilliseconds;
  }

  if (hours > 0) {
    time = timeHours + ':' + timeMinutes + ':' + timeSeconds + ':' + timeMilliseconds;
  }

  return spanWrap(time);
}

function onTick(time) {
  $('#time').html(niceTime(time));
}

function onSheepPickup() {
  //$('.popup-merch').removeClass('is-visible');

  showLayer('.layer--mission-2');

  setTimeout(function() {
    hideLayer('.layer--mission-2');
  }, 7500);
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

function onGameEnd(didWin, progress, wasNude) {
  nudeMode = didWin;

  if (didWin) {
    //$('#name_dialogue').show()
    pauseGame();
    $('#finish_time').html(niceTime(_game.playTime, true));
    if (nudeModePlaying) {
      $('.layer--finish').addClass('is-naked');
    } else {
      $('.layer--finish').removeClass('is-naked');
    }
    setTimeout(function() {
      showLayer('.layer--finish');
    }, 10);
    $('#game_controls, #game_lives').hide()
  } else {
    startGame(didWin || wasNude)
  }

  if (online) {
    window.wtfga('send', 'event', 'game', 'end', progress)
  }
  ;
}

function startGame(naked) {
  finished = false;

  nudeModePlaying = naked;
  if (!naked) {
    nudeModePlaying = false;
  }

  if (window.location.href.indexOf("localhost") != -1) {
    window.location.href = "delegatesound://";
  }

  if (_game) {
    _game.dispose()
  }
  _game = new PussywalkMinigame(_callbacks, naked, mute);

  if (typeof ga === 'function') {
    window.wtfga = ga;
  }

  if (online) {
    window.wtfga('send', 'event', 'game', 'start')
  }
  ;

  if (nudeMode) {
    $('.popup-merch').addClass('is-visible');
  }

  if (!tutorial) {
    setTimeout(function() {
      hideLayer('.layer--mission-1');
    //$('.popup-merch').addClass('is-visible');
    }, 7500);
  }
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

function initMobileAudio() {
  if (_game) {
    _game.initMobileAudio()
  }
}

(function(i, s, o, g, r, a, m) {
  i['GoogleAnalyticsObject'] = r;i[r] = i[r] || function() {
    (i[r].q = i[r].q || []).push(arguments)
  }, i[r].l = 1 * new Date();a = s.createElement(o),
  m = s.getElementsByTagName(o)[0];
  a.async = 1;
  a.src = g;m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-162303-31', 'auto');
ga('send', 'pageview');
