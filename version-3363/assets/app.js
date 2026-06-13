(function () {
    var mobileButton = document.querySelector("[data-mobile-toggle]");
    var siteNav = document.querySelector("[data-site-nav]");

    if (mobileButton && siteNav) {
        mobileButton.addEventListener("click", function () {
            siteNav.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function move(step) {
            showSlide(current + step);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                move(1);
            }, 6200);
        }

        if (previous) {
            previous.addEventListener("click", function () {
                move(-1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                move(1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = Number(dot.getAttribute("data-hero-dot"));
                showSlide(index);
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var filterInput = document.querySelector("[data-filter-input]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var categoryFilter = document.querySelector("[data-category-filter]");
    var emptyState = document.querySelector("[data-empty-state]");

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        var query = normalize(filterInput ? filterInput.value : "");
        var typeValue = normalize(typeFilter ? typeFilter.value : "");
        var yearValue = normalize(yearFilter ? yearFilter.value : "");
        var categoryValue = normalize(categoryFilter ? categoryFilter.value : "");
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute("data-search"));
            var typeText = normalize(card.getAttribute("data-type"));
            var yearText = normalize(card.getAttribute("data-year"));
            var categoryText = normalize(card.getAttribute("data-category"));
            var matched = true;

            if (query && haystack.indexOf(query) === -1) {
                matched = false;
            }

            if (typeValue && typeText.indexOf(typeValue) === -1) {
                matched = false;
            }

            if (yearValue && yearText.indexOf(yearValue) === -1) {
                matched = false;
            }

            if (categoryValue && categoryText !== categoryValue) {
                matched = false;
            }

            card.hidden = !matched;

            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    if (filterInput || typeFilter || yearFilter || categoryFilter) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");

        if (initialQuery && filterInput) {
            filterInput.value = initialQuery;
        }

        [filterInput, typeFilter, yearFilter, categoryFilter].forEach(function (element) {
            if (element) {
                element.addEventListener("input", applyFilters);
                element.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    }

    window.createMoviePlayer = function (source) {
        var video = document.getElementById("movieVideo");
        var button = document.getElementById("moviePlayButton");
        var initialized = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function prepare() {
            if (initialized) {
                return;
            }

            initialized = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            prepare();

            if (button) {
                button.classList.add("is-hidden");
            }

            var playRequest = video.play();

            if (playRequest && typeof playRequest.catch === "function") {
                playRequest.catch(function () {
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

        video.addEventListener("pause", function () {
            if (button && video.currentTime === 0) {
                button.classList.remove("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };
}());
