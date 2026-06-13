
(function () {
    window.setupMoviePlayer = function (videoId, overlayId, streamUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var prepared = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function prepare() {
            if (prepared) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            prepared = true;
        }

        function start() {
            prepare();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };
})();
