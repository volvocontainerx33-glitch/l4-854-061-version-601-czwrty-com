(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-menu]");

  if (menuButton && menu) {
    menuButton.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  document.querySelectorAll(".hero-carousel").forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dots button"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        show(itemIndex);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-filter-root]").forEach(function (root) {
    var input = root.querySelector(".filter-input");
    var selects = Array.prototype.slice.call(root.querySelectorAll(".filter-select"));
    var container = root.nextElementSibling;
    var cards = container ? Array.prototype.slice.call(container.querySelectorAll(".js-card")) : [];

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var activeFilters = selects.map(function (select) {
        return {
          key: select.getAttribute("data-filter"),
          value: select.value.trim().toLowerCase()
        };
      });

      cards.forEach(function (card) {
        var searchable = (card.getAttribute("data-search") || "").toLowerCase();
        var visible = !query || searchable.indexOf(query) !== -1;

        activeFilters.forEach(function (filter) {
          if (!filter.value) {
            return;
          }
          var cardValue = (card.getAttribute("data-" + filter.key) || "").toLowerCase();
          if (cardValue.indexOf(filter.value) === -1) {
            visible = false;
          }
        });

        card.classList.toggle("hide-card", !visible);
      });
    }

    if (input) {
      input.addEventListener("input", applyFilters);
      var params = new URLSearchParams(window.location.search);
      var queryValue = params.get("q");
      if (queryValue) {
        input.value = queryValue;
      }
    }

    selects.forEach(function (select) {
      select.addEventListener("change", applyFilters);
    });

    applyFilters();
  });

  window.initMoviePlayer = function (videoId, m3u8Url) {
    var video = document.getElementById(videoId);
    var button = document.querySelector('[data-player-button="' + videoId + '"]');
    var started = false;
    var hlsInstance = null;

    if (!video) {
      return;
    }

    function reveal() {
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function attachWithHls() {
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hlsInstance.loadSource(m3u8Url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      } else {
        video.src = m3u8Url;
        playVideo();
      }
    }

    function begin() {
      reveal();
      video.setAttribute("controls", "controls");

      if (started) {
        playVideo();
        return;
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = m3u8Url;
        playVideo();
        return;
      }

      attachWithHls();
    }

    if (button) {
      button.addEventListener("click", begin);
    }

    video.addEventListener("click", function () {
      if (!started) {
        begin();
      }
    });

    video.addEventListener("play", reveal);

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
