(function () {
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    const restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    showSlide(0);
    restart();
  }

  const filterPanel = document.querySelector('.filter-panel');

  if (filterPanel) {
    const input = filterPanel.querySelector('[data-search-input]');
    const categorySelect = filterPanel.querySelector('[data-filter-category]');
    const yearSelect = filterPanel.querySelector('[data-filter-year]');
    const genreSelect = filterPanel.querySelector('[data-filter-genre]');
    const resetButton = filterPanel.querySelector('[data-filter-reset]');
    const noResults = filterPanel.querySelector('[data-no-results]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const params = new URLSearchParams(window.location.search);

    const appendOptions = function (select, values) {
      if (!select) {
        return;
      }

      values.forEach(function (value) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    };

    const uniqueValues = function (attribute) {
      const result = new Set();

      cards.forEach(function (card) {
        const raw = card.getAttribute(attribute) || '';
        raw.split(/[\/、,，|；;\s]+/).forEach(function (item) {
          const value = item.trim();

          if (value) {
            result.add(value);
          }
        });
      });

      return Array.from(result).sort(function (a, b) {
        return b.localeCompare(a, 'zh-Hans-CN');
      });
    };

    appendOptions(yearSelect, uniqueValues('data-year'));
    appendOptions(genreSelect, uniqueValues('data-genre'));

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    const applyFilter = function () {
      const query = input ? input.value.trim().toLowerCase() : '';
      const category = categorySelect ? categorySelect.value : '';
      const year = yearSelect ? yearSelect.value : '';
      const genre = genreSelect ? genreSelect.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-category') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();

        const matchQuery = !query || haystack.includes(query);
        const matchCategory = !category || (card.getAttribute('data-category') || '') === category;
        const matchYear = !year || (card.getAttribute('data-year') || '') === year;
        const matchGenre = !genre || (card.getAttribute('data-genre') || '').includes(genre);
        const isVisible = matchQuery && matchCategory && matchYear && matchGenre;

        card.classList.toggle('is-hidden', !isVisible);

        if (isVisible) {
          visible += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle('show', visible === 0);
      }
    };

    [input, categorySelect, yearSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }

        if (categorySelect) {
          categorySelect.value = '';
        }

        if (yearSelect) {
          yearSelect.value = '';
        }

        if (genreSelect) {
          genreSelect.value = '';
        }

        applyFilter();
      });
    }

    applyFilter();
  }

  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach(function (shell) {
    const video = shell.querySelector('video');
    const button = shell.querySelector('.play-overlay');
    let ready = false;

    const start = function () {
      if (!video) {
        return;
      }

      const stream = video.getAttribute('data-stream');

      if (!stream) {
        return;
      }

      if (!ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
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

        ready = true;
      }

      shell.classList.add('playing');
      video.setAttribute('controls', 'controls');
      video.play().catch(function () {});
    };

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', start);
    }
  });
}());
