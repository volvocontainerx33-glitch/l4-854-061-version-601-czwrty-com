(() => {
  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  };

  ready(() => {
    const toggle = document.querySelector(".mobile-toggle");
    const mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", () => {
        const isOpen = mobileNav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });
    }

    const carousel = document.querySelector(".hero-carousel");

    if (carousel) {
      const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
      const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
      const prev = carousel.querySelector(".hero-prev");
      const next = carousel.querySelector(".hero-next");
      let current = 0;
      let timer = null;

      const show = (index) => {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, position) => {
          slide.classList.toggle("active", position === current);
        });
        dots.forEach((dot, position) => {
          dot.classList.toggle("active", position === current);
        });
      };

      const start = () => {
        timer = window.setInterval(() => show(current + 1), 5200);
      };

      const restart = () => {
        window.clearInterval(timer);
        start();
      };

      if (prev) {
        prev.addEventListener("click", () => {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", () => {
          show(current + 1);
          restart();
        });
      }

      dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
          show(index);
          restart();
        });
      });

      show(0);
      start();
    }

    const filterPanels = Array.from(document.querySelectorAll(".filter-panel"));

    filterPanels.forEach((panel) => {
      const search = panel.querySelector(".movie-search");
      const selects = Array.from(panel.querySelectorAll(".movie-filter"));
      const section = panel.nextElementSibling;
      const cards = section ? Array.from(section.querySelectorAll(".movie-card")) : [];

      const apply = () => {
        const query = search ? search.value.trim().toLowerCase() : "";
        const rules = selects.map((select) => ({
          key: select.dataset.filter,
          value: select.value.trim().toLowerCase()
        }));

        cards.forEach((card) => {
          const haystack = [
            card.dataset.title,
            card.dataset.genre,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.category
          ].join(" ").toLowerCase();
          const matchedText = !query || haystack.includes(query);
          const matchedSelect = rules.every((rule) => {
            if (!rule.value || !rule.key) {
              return true;
            }
            return String(card.dataset[rule.key] || "").toLowerCase().includes(rule.value);
          });
          card.classList.toggle("is-hidden", !(matchedText && matchedSelect));
        });
      };

      if (search) {
        search.addEventListener("input", apply);
      }

      selects.forEach((select) => {
        select.addEventListener("change", apply);
      });
    });

    const players = Array.from(document.querySelectorAll(".player-box"));

    players.forEach((box) => {
      const video = box.querySelector("video");
      const trigger = box.querySelector(".player-trigger");
      let prepared = false;

      const launch = () => {
        if (!video || !trigger) {
          return;
        }

        const stream = trigger.getAttribute("data-stream");

        if (!prepared) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }
          video.controls = true;
          prepared = true;
        }

        box.classList.add("is-playing");
        const playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      };

      if (trigger) {
        trigger.addEventListener("click", launch);
      }

      if (video) {
        video.addEventListener("click", () => {
          if (!prepared) {
            launch();
          }
        });
      }
    });
  });
})();
