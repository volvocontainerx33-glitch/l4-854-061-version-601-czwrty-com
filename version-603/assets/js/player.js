(function() {
  function start(box) {
    var video = box.querySelector('video');
    var stream = box.getAttribute('data-stream');
    if (!video || !stream) {
      return;
    }
    if (!box.dataset.ready) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        box._hls = hls;
      } else {
        video.src = stream;
      }
      box.dataset.ready = '1';
    }
    box.classList.add('playing');
    var playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function() {});
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-stream]')).forEach(function(box) {
    var button = box.querySelector('.player-start');
    var video = box.querySelector('video');
    if (button) {
      button.addEventListener('click', function() {
        start(box);
      });
    }
    if (video) {
      video.addEventListener('click', function() {
        if (video.paused) {
          start(box);
        }
      });
      video.addEventListener('play', function() {
        box.classList.add('playing');
      });
    }
  });
})();
