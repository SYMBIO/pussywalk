// PussyWalk I bootstrap — originally embedded the SWF with swfobject; now runs it
// in the Ruffle Flash emulator (self-hosted under /ruffle/).
var PussyWalk = (function () {
  var _container;
  var _lang;

  function share() {
    var path = document.URL.indexOf('/cs') >= 0 ? '/cs' : '';
    var shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' +
      encodeURIComponent('https://1.pussywalk.com' + path);
    window.open(shareUrl, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=585,height=368');
  }

  // Called by the SWF through ExternalInterface (was a Google Analytics event).
  function restart() {}

  return {
    setLang: function (l) { _lang = l; },
    setContainer: function (c) { _container = c; },
    getContainer: function () { return _container; },
    share: share,
    restart: restart
  };
})();

(function () {
  var script = document.currentScript;
  var lang = (script && script.getAttribute('data-lang')) || 'en';

  // The game is keyboard controlled; phones get the original "no Flash" page.
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)) {
    window.location.replace('/m/' + lang);
    return;
  }

  window.RufflePlayer = window.RufflePlayer || {};
  window.RufflePlayer.config = {
    publicPath: '/ruffle/',
    polyfills: false,
    autoplay: 'on',
    unmuteOverlay: 'hidden',
    splashScreen: false,
    letterbox: 'off',
    contextMenu: 'rightClickOnly',
    showSwfDownload: false,
    backgroundColor: '#000000'
  };

  function init() {
    var cacheBuster = '?r=' + Math.random();
    var container = document.getElementById('flash-container');
    // swfobject used to *replace* this div with a 100%-high <object>; Ruffle is
    // appended inside it instead, so the div itself has to fill the wrapper.
    container.style.width = '100%';
    container.style.height = '100%';
    var player = window.RufflePlayer.newest().createPlayer();
    player.id = 'flash-player';
    player.style.width = '100%';
    player.style.height = '100%';
    container.appendChild(player);

    player.ruffle().load({
      url: '/swf/Preloader.swf' + cacheBuster,
      base: '/',
      scale: 'noScale',
      wmode: 'direct',
      allowScriptAccess: true,
      parameters: {
        lang: lang,
        config: 'xml/config.xml' + cacheBuster,
        application: 'swf/Application.swf' + cacheBuster
      }
    });

    PussyWalk.setLang(lang);
    PussyWalk.setContainer(player);
    player.focus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
