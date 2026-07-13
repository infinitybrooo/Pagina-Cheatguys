// =====================================================
// CHEATGUYS! - Inicio, carga y transiciones del lobby
// =====================================================
(function () {
    "use strict";

    const CONFIG = window.CG_CONFIG || {};
    const START_INTRO_SESSION_KEY = CONFIG.storageKeys?.startIntroSeen || "cheatguys.startIntroSeen.v1";

    function hasSeenStartIntro() {
        try {
            return sessionStorage.getItem(START_INTRO_SESSION_KEY) === "1";
        } catch (_) {
            return false;
        }
    }

    function rememberStartIntro() {
        try {
            sessionStorage.setItem(START_INTRO_SESSION_KEY, "1");
        } catch (_) {
            // La introduccion sigue funcionando aunque el almacenamiento este bloqueado.
        }
    }

    function showLoadingScreen(callback) {
        const loader = document.getElementById("globalLoader");
        if (!loader) {
            if (callback) callback();
            return;
        }

        loader.style.display = "flex";
        void loader.offsetWidth;
        loader.style.opacity = "1";
        setTimeout(() => {
            loader.style.opacity = "0";
            setTimeout(() => {
                loader.style.display = "none";
                if (callback) callback();
            }, 400);
        }, 900);
    }

    function setupStartWindow() {
        const startWindow = document.getElementById("startWindow");
        const pressStartBtn = document.getElementById("pressStartBtn");

        if (hasSeenStartIntro()) {
            if (startWindow) startWindow.remove();
            showLoadingScreen(() => {
                document.body.style.overflow = "auto";
                document.body.classList.remove("start-window-active");
                document.body.classList.add("page-loaded");
            });
            return;
        }

        if (!startWindow || !pressStartBtn) {
            showLoadingScreen(() => {
                document.body.style.overflow = "auto";
                document.body.classList.add("page-loaded");
            });
            return;
        }

        document.body.classList.add("start-window-active");
        window.setTimeout(() => startWindow.classList.add("is-booted"), 1250);
        window.setTimeout(() => {
            startWindow.classList.add("is-ready");
            pressStartBtn.focus({ preventScroll: true });
        }, 2250);

        const startLobby = () => {
            pressStartBtn.disabled = true;
            document.removeEventListener("keydown", startOnKey);
            rememberStartIntro();
            startWindow.classList.add("is-finished");
            showLoadingScreen(() => {
                document.body.style.overflow = "auto";
                document.body.classList.remove("start-window-active");
                document.body.classList.add("page-loaded");
                startWindow.remove();
            });
        };

        const startOnKey = (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                pressStartBtn.click();
            }
        };

        pressStartBtn.addEventListener("click", startLobby, { once: true });
        document.addEventListener("keydown", startOnKey);
    }

    function shouldUseLoadingTransition(link) {
        if (!link || link.dataset.cgTransition !== "true") return false;
        const rawHref = link.getAttribute("href") || "";
        if (!rawHref || rawHref === "#" || rawHref.startsWith("#")) return false;
        if (rawHref.startsWith("mailto:") || rawHref.startsWith("tel:") || rawHref.startsWith("javascript:")) return false;
        if (link.target === "_blank" || link.hasAttribute("download")) return false;

        let linkUrl;
        try {
            linkUrl = new URL(link.href, window.location.href);
        } catch (error) {
            return false;
        }

        const samePageHash = linkUrl.hash
            && linkUrl.origin === window.location.origin
            && linkUrl.pathname === window.location.pathname;

        return linkUrl.origin === window.location.origin && !samePageHash;
    }

    function setupExplicitLinkTransitions(options = {}) {
        const showToast = options.showToast || window.showToast;

        document.querySelectorAll("a").forEach((link) => {
            if (link.classList.contains("btn-patreon")) {
                link.addEventListener("click", (event) => {
                    event.preventDefault();
                    if (typeof showToast === "function") {
                        showToast("SYSTEM: Función 'Patreon Guild' Coming Soon...");
                    }
                });
            }

            if (!shouldUseLoadingTransition(link)) return;

            link.addEventListener("click", (event) => {
                event.preventDefault();
                showLoadingScreen(() => {
                    window.location.href = link.href;
                });
            });
        });
    }

    function setup(options = {}) {
        document.body.style.overflow = "hidden";
        setupStartWindow();
        setupExplicitLinkTransitions(options);
    }

    window.CG = window.CG || {};
    window.CG.lobbyStart = Object.freeze({
        setup,
        setupStartWindow,
        setupExplicitLinkTransitions,
        shouldUseLoadingTransition,
        showLoadingScreen
    });
    window.CGLobbyStart = window.CG.lobbyStart;
    window.showLoadingScreen = showLoadingScreen;
})();
