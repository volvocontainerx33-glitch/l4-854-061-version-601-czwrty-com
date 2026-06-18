(function () {
  "use strict";

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function getText(value) {
    return (value || "").toString().toLowerCase();
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero]");

    if (!slider) {
      return;
    }

    var slides = selectAll("[data-hero-slide]", slider);
    var dots = selectAll("[data-hero-dot]", slider);
    var previous = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    slider.addEventListener("mouseenter", stopTimer);
    slider.addEventListener("mouseleave", startTimer);
    showSlide(0);
    startTimer();
  }

  function initSearchFilters() {
    var forms = selectAll("[data-filter-form]");

    forms.forEach(function (form) {
      var scopeSelector = form.getAttribute("data-filter-form");
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      var cards = selectAll("[data-movie-card]", scope || document);
      var counter = document.querySelector(form.getAttribute("data-result-counter") || "");
      var fields = selectAll("input, select", form);

      function matches(card) {
        return fields.every(function (field) {
          var expected = getText(field.value).trim();

          if (!expected || expected === "all") {
            return true;
          }

          var key = field.getAttribute("data-filter-key");
          var actual = getText(card.getAttribute("data-" + key));

          if (key === "keyword") {
            actual = getText(card.getAttribute("data-search"));
            return actual.indexOf(expected) !== -1;
          }

          return actual === expected || actual.indexOf(expected) !== -1;
        });
      }

      function update() {
        var visibleCount = 0;

        cards.forEach(function (card) {
          var visible = matches(card);
          card.classList.toggle("hidden-by-filter", !visible);
          if (visible) {
            visibleCount += 1;
          }
        });

        if (counter) {
          counter.textContent = "当前显示 " + visibleCount + " 部影片";
        }
      }

      fields.forEach(function (field) {
        field.addEventListener("input", update);
        field.addEventListener("change", update);
      });

      update();
    });
  }

  function initPlayers() {
    selectAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var playButtons = selectAll("[data-play-toggle]", player);
      var muteButton = player.querySelector("[data-mute-toggle]");
      var fullscreenButton = player.querySelector("[data-fullscreen-toggle]");
      var status = player.querySelector("[data-player-status]");
      var src = player.getAttribute("data-src");
      var loaded = false;
      var hls = null;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function loadSource() {
        if (loaded || !video || !src) {
          return Promise.resolve();
        }

        loaded = true;
        setStatus("正在加载播放源…");
        video.controls = true;
        video.playsInline = true;

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("播放源已就绪");
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放遇到错误，已尝试恢复");
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
              } else {
                hls.destroy();
              }
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          setStatus("播放源已就绪");
        } else {
          setStatus("当前浏览器需要启用 HLS 支持后播放");
        }

        return Promise.resolve();
      }

      function togglePlay() {
        loadSource().then(function () {
          if (!video) {
            return;
          }

          if (video.paused) {
            var promise = video.play();
            if (promise && promise.catch) {
              promise.catch(function () {
                setStatus("请再次点击播放按钮开始观看");
              });
            }
          } else {
            video.pause();
          }
        });
      }

      playButtons.forEach(function (button) {
        button.addEventListener("click", togglePlay);
      });

      if (video) {
        video.addEventListener("click", togglePlay);
        video.addEventListener("play", function () {
          player.classList.add("playing");
          setStatus("正在播放");
        });
        video.addEventListener("pause", function () {
          player.classList.remove("playing");
          setStatus("已暂停");
        });
        video.addEventListener("waiting", function () {
          setStatus("缓冲中…");
        });
        video.addEventListener("playing", function () {
          setStatus("正在播放");
        });
      }

      if (muteButton && video) {
        muteButton.addEventListener("click", function () {
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? "🔇" : "🔊";
        });
      }

      if (fullscreenButton) {
        fullscreenButton.addEventListener("click", function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (player.requestFullscreen) {
            player.requestFullscreen();
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  function initBackTop() {
    var button = document.querySelector("[data-back-top]");

    if (!button) {
      return;
    }

    window.addEventListener("scroll", function () {
      button.classList.toggle("visible", window.scrollY > 400);
    });

    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHeroSlider();
    initSearchFilters();
    initPlayers();
    initBackTop();
  });
})();
