
(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initMobileMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var expanded = button.getAttribute("aria-expanded") === "true";
            button.setAttribute("aria-expanded", expanded ? "false" : "true");
            panel.hidden = expanded;
            button.textContent = expanded ? "☰" : "×";
        });
    }

    function initSearchForms() {
        document.querySelectorAll("form.site-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                if (!query) {
                    event.preventDefault();
                    window.location.href = "./search.html";
                }
            });
        });
    }

    function initCarousel() {
        var carousel = document.querySelector("[data-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var prev = carousel.querySelector("[data-carousel-prev]");
        var next = carousel.querySelector("[data-carousel-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide") || 0));
                restart();
            });
        });
        show(0);
        restart();
    }

    function initYearFilters() {
        document.querySelectorAll("[data-filter-bar]").forEach(function (bar) {
            var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-list .movie-card"));
            bar.addEventListener("click", function (event) {
                var button = event.target.closest("button[data-filter-year]");
                if (!button) {
                    return;
                }
                var year = button.getAttribute("data-filter-year");
                bar.querySelectorAll("button").forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                cards.forEach(function (card) {
                    var match = year === "all" || card.getAttribute("data-year") === year;
                    card.classList.toggle("is-filtered-out", !match);
                });
            });
        });
    }

    function initSearchPage() {
        var list = document.getElementById("searchableList");
        if (!list) {
            return;
        }
        var input = document.getElementById("searchPageInput");
        var line = document.getElementById("searchResultLine");
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var activeType = "all";

        if (input) {
            input.value = query;
            input.addEventListener("input", function () {
                query = input.value;
                apply();
            });
        }

        var typeBar = document.querySelector("[data-type-filter]");
        if (typeBar) {
            typeBar.addEventListener("click", function (event) {
                var button = event.target.closest("button[data-filter-type]");
                if (!button) {
                    return;
                }
                activeType = button.getAttribute("data-filter-type") || "all";
                typeBar.querySelectorAll("button").forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                apply();
            });
        }

        function apply() {
            var q = normalize(query);
            var count = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var type = card.getAttribute("data-type") || "";
                var textMatch = !q || text.indexOf(q) !== -1;
                var typeMatch = activeType === "all" || type === activeType;
                var show = textMatch && typeMatch;
                card.classList.toggle("is-search-hidden", !show);
                if (show) {
                    count += 1;
                }
            });
            if (line) {
                line.textContent = q || activeType !== "all" ? "已找到 " + count + " 部作品" : "热门影片";
            }
        }

        apply();
    }

    ready(function () {
        initMobileMenu();
        initSearchForms();
        initCarousel();
        initYearFilters();
        initSearchPage();
    });
})();
