(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      document.body.classList.toggle("is-menu-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initSiteSearch() {
    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./search.html";
        window.location.href = query ? target + "?q=" + encodeURIComponent(query) : target;
      });
    });
  }

  function initHero() {
    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      if (!slides.length) {
        return;
      }
      var index = 0;
      var timer = null;
      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }
      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
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
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-grid]").forEach(function (grid) {
      var scope = grid.closest("main") || document;
      var search = scope.querySelector("[data-filter-search]");
      var kind = scope.querySelector("[data-filter-kind]");
      var year = scope.querySelector("[data-filter-year]");
      var category = scope.querySelector("[data-filter-category]");
      var empty = scope.querySelector("[data-empty-state]");
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card, .ranking-row"));
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && search) {
        search.value = query;
      }
      function apply() {
        var q = normalize(search && search.value);
        var k = normalize(kind && kind.value);
        var y = normalize(year && year.value);
        var c = normalize(category && category.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-kind"),
            card.getAttribute("data-category"),
            card.getAttribute("data-region"),
            card.getAttribute("data-tags")
          ].join(" "));
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (k && normalize(card.getAttribute("data-kind")) !== k) {
            ok = false;
          }
          if (y && normalize(card.getAttribute("data-year")) !== y) {
            ok = false;
          }
          if (c && normalize(card.getAttribute("data-category")) !== c) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }
      [search, kind, year, category].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-play-button]");
      var playSrc = box.getAttribute("data-play");
      var initialized = false;
      var hlsInstance = null;
      if (!video || !playSrc) {
        return;
      }
      function prepare() {
        if (initialized) {
          return;
        }
        initialized = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = playSrc;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(playSrc);
          hlsInstance.attachMedia(video);
        } else {
          video.src = playSrc;
        }
      }
      function play() {
        prepare();
        if (button) {
          button.classList.add("is-hidden");
        }
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            if (button) {
              button.classList.remove("is-hidden");
            }
          });
        }
      }
      if (button) {
        button.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initSiteSearch();
    initHero();
    initFilters();
    initPlayers();
  });
})();
