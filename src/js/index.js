import $ from 'jquery';
import * as firebase from 'firebase';
import styles from '../styles/index.less';
import PussywalkMinigame from './pussywalk/PussywalkMinigame';

// window.addEventListener('load', () => {
window.onload = function() {
  let _game = new PussywalkMinigame();

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCcl4aqLnBeiBfNHTThWIgxFpmXatzNegA",
    authDomain: "pussywalk-2.firebaseapp.com",
    databaseURL: "https://pussywalk-2.firebaseio.com",
    projectId: "pussywalk-2",
    storageBucket: "pussywalk-2.appspot.com",
    messagingSenderId: "597701981219"
  };
  firebase.initializeApp(config);

  $('.save_button').on('click', (e) => {
    firebase.database().ref('scoreboard').push({
      username: "username" + Math.random()
    });
  })

  var scoreboardListener = firebase.database().ref('scoreboard');
  scoreboardListener.on('value', function(snapshot) {

    var i = 10
    var usernames = []
    let values = snapshot.val()
    for (var element in values) {

      if (values[element].username) {
        usernames.push(values[element].username)
      }

      if (i-- == 0) {
        break
      }
    }
    _game.setScoreboard(usernames)
  });
}
