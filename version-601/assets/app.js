(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });
        start();
    }

    function setupSearchForms() {
        Array.prototype.slice.call(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (!value) {
                    return;
                }
                event.preventDefault();
                window.location.href = "./library.html?q=" + encodeURIComponent(value);
            });
        });
    }

    function setupLibraryFilters() {
        var grid = document.querySelector("[data-library-grid]");
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
        var search = document.querySelector("[data-library-search]");
        var filters = Array.prototype.slice.call(document.querySelectorAll("[data-library-filter]"));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (search && initial) {
            search.value = initial;
        }

        function apply() {
            var query = normalize(search ? search.value : "");
            var active = {};
            filters.forEach(function (filter) {
                active[filter.getAttribute("data-library-filter")] = normalize(filter.value);
            });
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var visible = !query || haystack.indexOf(query) !== -1;
                Object.keys(active).forEach(function (key) {
                    var value = active[key];
                    if (value && normalize(card.getAttribute("data-" + key)) !== value) {
                        visible = false;
                    }
                });
                card.classList.toggle("is-hidden", !visible);
            });
        }

        if (search) {
            search.addEventListener("input", apply);
        }
        filters.forEach(function (filter) {
            filter.addEventListener("change", apply);
        });
        apply();
    }

    function initVideoPlayer(videoId, buttonId, src) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        if (!video || !button || !src) {
            return;
        }
        var loaded = false;
        var hls = null;

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function start() {
            load();
            button.classList.add("is-hidden");
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
        video.addEventListener("ended", function () {
            button.classList.remove("is-hidden");
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initVideoPlayer = initVideoPlayer;

    ready(function () {
        setupMenu();
        setupHero();
        setupSearchForms();
        setupLibraryFilters();
    });
})();
