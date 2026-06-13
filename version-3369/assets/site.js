function ready(fn) {
    if (document.readyState !== "loading") {
        fn();
        return;
    }
    document.addEventListener("DOMContentLoaded", fn);
}

function setSearchValue() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    var inputs = document.querySelectorAll('input[name="q"], .filter-input');
    inputs.forEach(function (input) {
        if (q && !input.value) {
            input.value = q;
        }
    });
}

function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
        return;
    }
    button.addEventListener("click", function () {
        var open = panel.classList.toggle("is-open");
        button.setAttribute("aria-expanded", open ? "true" : "false");
        panel.setAttribute("aria-hidden", open ? "false" : "true");
        button.textContent = open ? "×" : "☰";
    });
}

function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
        return;
    }
    var index = 0;
    function show(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === index);
        });
    }
    dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
            show(i);
        });
    });
    show(0);
    window.setInterval(function () {
        show(index + 1);
    }, 5200);
}

function setupFilters() {
    var inputs = document.querySelectorAll(".filter-input");
    inputs.forEach(function (input) {
        var target = input.getAttribute("data-target") || ".movie-card, .rank-item";
        var scope = document.querySelector(input.getAttribute("data-scope") || "body");
        var empty = document.querySelector(input.getAttribute("data-empty") || ".no-results");
        function apply() {
            var q = input.value.trim().toLowerCase();
            var items = scope ? scope.querySelectorAll(target) : document.querySelectorAll(target);
            var visible = 0;
            items.forEach(function (item) {
                var text = item.getAttribute("data-search") || item.textContent.toLowerCase();
                var match = !q || text.indexOf(q) !== -1;
                item.style.display = match ? "" : "none";
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }
        input.addEventListener("input", apply);
        apply();
    });
}

function initStaticPlayer(id, src) {
    var video = document.getElementById(id);
    if (!video) {
        return;
    }
    var wrap = video.closest(".player-wrap");
    var button = wrap ? wrap.querySelector('[data-play-target="' + id + '"]') : null;
    var errorBox = wrap ? wrap.querySelector(".player-error") : null;
    var mounted = false;
    var hls = null;
    function showError() {
        if (errorBox) {
            errorBox.classList.add("is-visible");
        }
    }
    function mount() {
        if (mounted) {
            return true;
        }
        mounted = true;
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                    return;
                }
                showError();
            });
            return true;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            return true;
        }
        showError();
        return false;
    }
    function start(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (!mount()) {
            return;
        }
        if (button) {
            button.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                video.setAttribute("controls", "controls");
            });
        }
    }
    if (button) {
        button.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
        if (!mounted || video.paused) {
            start();
            return;
        }
        video.pause();
    });
    video.addEventListener("play", function () {
        if (button) {
            button.classList.add("is-hidden");
        }
    });
    video.addEventListener("ended", function () {
        if (button) {
            button.classList.remove("is-hidden");
        }
    });
    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}

ready(function () {
    setSearchValue();
    setupMenu();
    setupHero();
    setupFilters();
});
