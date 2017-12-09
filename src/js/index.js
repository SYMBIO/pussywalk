import $ from 'jquery';
import * as firebase from 'firebase';
import styles from '../styles/app.less';
import PussywalkMinigame from './pussywalk/PussywalkMinigame';

let _game;
let _callbacks;

window.onload = function() {
  initializeElements()
  initializeFirebase()

  _callbacks = {
    onGameEnd: onGameEnd
  }

  startGame()
}


function toggleLayer(layer) {
  $(layer).togleClass('is-visible');
}

function showLayer(layer) {
  $(layer).addClass('is-visible');
}

function hideLayer(layer) {
  $(layer).removeClass('is-visible');
}

function initializeElements() {
  $('#name_dialogue').hide()
  //$('#scoreboard').hide()
  $('#game_controls').show()
  $('#send_name').attr("disabled", true);

  $('#send_name').on('click', function() {
    $('#name_dialogue').hide()

    firebase.database().ref('scoreboard').push({
      username: $("#name_input").val(),
      time: _game.playTime()
    }, function(error) {
      //$('#scoreboard').show()
      showLayer('.layer--scoreboard')
    });
  })
  $('#cancel_send_name').on('click', function() {
    $('#name_dialogue').hide()
    startGame()
  })
  $('#name_input').on('input', function() {
    $('#send_name').attr("disabled", $("#name_input").val().length == 0);
  })

  $('#scoreboard_close').on('click', function() {
    $('#name_dialogue').hide()
    //$('#scoreboard').hide()
    hideLayer('.layer--scoreboard');
    $('#game_controls').show()
    startGame()
  })

  $('.nav-link').on('click', function(e){
    e.preventDefault();

    $('.nav').toggleClass('is-active');
  });

  $('.test__layers a').on('click', function(e){
    e.preventDefault();

    var link = $(this);

    $('.nav').removeClass('is-active');
    showLayer('.layer--' + link.data('layer'))
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
      timeSpan.append(snapshot.val().time)
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

function onGameEnd(didWin) {
  if (didWin) {
    $('#name_dialogue').show()
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
