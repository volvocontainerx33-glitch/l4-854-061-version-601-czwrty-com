(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
        toggle.textContent = menu.classList.contains("is-open") ? "×" : "☰";
      });
    }

    var carousel = document.querySelector("[data-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var prev = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) return;
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          var current = slideIndex === active;
          slide.classList.toggle("is-active", current);
          slide.setAttribute("aria-hidden", current ? "false" : "true");
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === active);
        });
      }

      function start() {
        if (timer) window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(active - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(active + 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      show(0);
      start();
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var search = scope.querySelector("[data-search-input]");
      var category = scope.querySelector("[data-category-filter]");
      var year = scope.querySelector("[data-year-filter]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".js-movie-card"));

      function apply() {
        var query = search ? search.value.trim().toLowerCase() : "";
        var cat = category ? category.value : "";
        var selectedYear = year ? year.value : "";
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-tags") || ""
          ].join(" ").toLowerCase();
          var matchText = !query || text.indexOf(query) !== -1;
          var matchCategory = !cat || card.getAttribute("data-category") === cat;
          var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
          card.classList.toggle("is-hidden", !(matchText && matchCategory && matchYear));
        });
      }

      if (search) search.addEventListener("input", apply);
      if (category) category.addEventListener("change", apply);
      if (year) year.addEventListener("change", apply);
    });

    document.querySelectorAll(".video-player").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-overlay");
      var stream = player.getAttribute("data-stream");
      var initialized = false;
      var hlsInstance = null;

      function attach() {
        if (!video || !stream || initialized) return;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        initialized = true;
      }

      function play() {
        attach();
        if (!video) return;
        player.classList.add("is-playing");
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!initialized || video.paused) {
            play();
          }
        });
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (video.currentTime === 0) {
            player.classList.remove("is-playing");
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
