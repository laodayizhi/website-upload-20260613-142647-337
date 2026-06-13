(function () {
    var body = document.body;

    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function initMenu() {
        var toggle = one('[data-menu-toggle]');
        if (!toggle) {
            return;
        }
        toggle.addEventListener('click', function () {
            body.classList.toggle('nav-open');
        });
    }

    function initHero() {
        var hero = one('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = all('[data-hero-slide]', hero);
        var dots = all('[data-hero-dot]', hero);
        var next = one('[data-hero-next]', hero);
        var prev = one('[data-hero-prev]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
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
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFiltering() {
        var searchInput = one('[data-live-search]');
        var cards = all('[data-card]');
        var empty = one('[data-empty]');
        var chips = all('[data-filter-chip]');
        var activeSection = 'all';

        if (!cards.length) {
            return;
        }

        function apply() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var section = card.getAttribute('data-section') || '';
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchSection = activeSection === 'all' || section === activeSection;
                var showCard = matchQuery && matchSection;
                card.style.display = showCard ? '' : 'none';
                if (showCard) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (searchInput) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                searchInput.value = q;
            }
            searchInput.addEventListener('input', apply);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                activeSection = chip.getAttribute('data-filter-chip') || 'all';
                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });
                apply();
            });
        });

        apply();
    }

    function initPlayers() {
        all('[data-player]').forEach(function (shell) {
            var video = one('video', shell);
            var button = one('[data-play]', shell);
            var stream = shell.getAttribute('data-stream');
            var loaded = false;

            if (!video || !stream) {
                return;
            }

            function loadStream() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function playVideo() {
                loadStream();
                shell.classList.add('is-playing');
                var playTask = video.play();
                if (playTask && playTask.catch) {
                    playTask.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener('click', playVideo);
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });

            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
        });
    }

    initMenu();
    initHero();
    initFiltering();
    initPlayers();
})();
