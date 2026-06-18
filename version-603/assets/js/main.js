(function() {
  function qs(root, selector) {
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  }

  qs(document, '[data-menu-button]').forEach(function(button) {
    button.addEventListener('click', function() {
      var nav = document.querySelector('[data-mobile-nav]');
      if (nav) {
        nav.classList.toggle('open');
      }
    });
  });

  qs(document, '[data-hero]').forEach(function(hero) {
    var slides = qs(hero, '[data-hero-slide]');
    var dots = qs(hero, '[data-hero-dot]');
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    show(0);
    start();
  });

  qs(document, '[data-filter-panel]').forEach(function(panel) {
    var input = panel.querySelector('[data-card-search]');
    var buttons = qs(panel, '[data-filter-value]');
    var target = panel.getAttribute('data-target') || '.searchable-card';
    var cards = qs(document, target);
    var active = 'all';

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function(card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var group = card.getAttribute('data-group') || '';
        var matchText = !query || text.indexOf(query) !== -1;
        var matchGroup = active === 'all' || group === active;
        card.classList.toggle('hidden-card', !(matchText && matchGroup));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    buttons.forEach(function(button) {
      button.addEventListener('click', function() {
        active = button.getAttribute('data-filter-value') || 'all';
        buttons.forEach(function(item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });

    apply();
  });
})();
