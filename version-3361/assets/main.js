(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var menu = document.querySelector('.mobile-nav');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function getSearchScopes(form) {
    var section = form.closest('.movie-search-scope');
    if (section) {
      return [section];
    }
    var scopes = Array.prototype.slice.call(document.querySelectorAll('.movie-search-scope'));
    if (scopes.length) {
      return scopes;
    }
    return [document];
  }

  function cardMatches(card, query, filters) {
    var haystack = [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-genre') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-type') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
    if (query && haystack.indexOf(query) === -1) {
      return false;
    }
    if (filters.year && (card.getAttribute('data-year') || '').indexOf(filters.year) === -1) {
      return false;
    }
    if (filters.type && (card.getAttribute('data-type') || '').indexOf(filters.type) === -1) {
      return false;
    }
    return true;
  }

  function applyFilters(scope, query) {
    var filters = {};
    Array.prototype.slice.call(scope.querySelectorAll('.filter-select')).forEach(function (select) {
      var name = select.getAttribute('data-filter');
      if (name) {
        filters[name] = select.value;
      }
    });
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var visible = 0;
    cards.forEach(function (card) {
      var matched = cardMatches(card, query, filters);
      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });
    var empty = scope.querySelector('.empty-result');
    if (empty) {
      empty.classList.toggle('is-visible', cards.length > 0 && visible === 0);
    }
  }

  function setupSearch() {
    Array.prototype.slice.call(document.querySelectorAll('.search-form')).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('.search-input');
        var query = input ? input.value.trim().toLowerCase() : '';
        getSearchScopes(form).forEach(function (scope) {
          applyFilters(scope, query);
        });
      });
      var input = form.querySelector('.search-input');
      if (input) {
        input.addEventListener('input', function () {
          var query = input.value.trim().toLowerCase();
          getSearchScopes(form).forEach(function (scope) {
            applyFilters(scope, query);
          });
        });
      }
    });
    Array.prototype.slice.call(document.querySelectorAll('.filter-select')).forEach(function (select) {
      select.addEventListener('change', function () {
        var scope = select.closest('.movie-search-scope') || document;
        var input = scope.querySelector('.search-input');
        var query = input ? input.value.trim().toLowerCase() : '';
        applyFilters(scope, query);
      });
    });
  }

  window.initMoviePlayer = function (source) {
    var video = document.querySelector('.movie-video');
    var button = document.querySelector('.play-overlay');
    if (!video || !source) {
      return;
    }
    function bindSource() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.src !== source) {
          video.src = source;
        }
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!video.hlsInstance) {
          var hls = new window.Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
          video.hlsInstance = hls;
        }
        return;
      }
      if (video.src !== source) {
        video.src = source;
      }
    }
    function startPlayback() {
      bindSource();
      if (button) {
        button.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener('click', startPlayback);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();
