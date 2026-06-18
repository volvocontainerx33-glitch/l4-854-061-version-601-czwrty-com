var MovieSite = (function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
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

    function restart() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        show(itemIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initFilters() {
    var groups = Array.prototype.slice.call(document.querySelectorAll("[data-filter-group]"));

    groups.forEach(function (group) {
      var input = group.querySelector("[data-filter-input]");
      var select = group.querySelector("[data-filter-select]");
      var cards = Array.prototype.slice.call(group.querySelectorAll(".movie-card"));
      var empty = group.querySelector("[data-empty-state]");

      function matchSelect(card, selected) {
        var type = (card.getAttribute("data-type") || "").toLowerCase();
        var year = card.getAttribute("data-year") || "";

        if (selected === "all") {
          return true;
        }

        if (selected === "movie") {
          return type.indexOf("电影") !== -1 || type.indexOf("movie") !== -1;
        }

        if (selected === "series") {
          return type.indexOf("剧") !== -1 || type.indexOf("综艺") !== -1 || type.indexOf("动画剧集") !== -1;
        }

        if (selected === "classic") {
          var parsed = parseInt(year, 10);
          return parsed && parsed <= 2010;
        }

        return year.indexOf(selected) !== -1;
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var selected = select ? select.value : "all";
        var shown = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year")
          ].join(" ").toLowerCase();

          var visible = text.indexOf(keyword) !== -1 && matchSelect(card, selected);
          card.style.display = visible ? "" : "none";

          if (visible) {
            shown += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", shown === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      if (select) {
        select.addEventListener("change", apply);
      }

      apply();
    });
  }

  function initPlayer(streamUrl) {
    ready(function () {
      var video = document.getElementById("mainVideo");
      var cover = document.getElementById("playCover");
      var connected = false;

      if (!video || !streamUrl) {
        return;
      }

      function connect() {
        if (connected) {
          return;
        }

        connected = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function start() {
        connect();

        if (cover) {
          cover.classList.add("is-hidden");
        }

        var promise = video.play();

        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", start);
      }

      video.addEventListener("click", function () {
        if (!connected) {
          start();
        }
      });

      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });

  return {
    initPlayer: initPlayer
  };
})();
