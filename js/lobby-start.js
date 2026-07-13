// =====================================================
// CHEATGUYS! - Inicio, carga y transiciones del lobby
// =====================================================
(function () {
    "use strict";

    const CONFIG = window.CG_CONFIG || {};
    const START_WINDOW_SESSION_KEY = CONFIG.storageKeys?.startWindowSeenSession || "cheatguys.startWindowSeen.v1";

    function hasSeenStartWindowThisSession() {
        try {
            return window.sessionStorage.getItem(START_WINDOW_SESSION_KEY) === "1";
        } catch (_) {
            return false;
        }
    }

    function rememberStartWindowSession() {
        try {
            window.sessionStorage.setItem(START_WINDOW_SESSION_KEY, "1");
        } catch (_) {
            // La pantalla sigue funcionando aunque sessionStorage este bloqueado.
        }
    }

    function resetStartWindowSession() {
        try {
            window.sessionStorage.removeItem(START_WINDOW_SESSION_KEY);
        } catch (_) {
            // El reinicio continuara aunque no se pueda modificar el almacenamiento.
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

        if (hasSeenStartWindowThisSession()) {
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

        const revealLobby = () => {
            startWindow.classList.add("is-finished");
            showLoadingScreen(() => {
                document.body.style.overflow = "auto";
                document.body.classList.remove("start-window-active");
                document.body.classList.add("page-loaded");
                startWindow.remove();
                window.AudioManager?.playBg("bgMusicPage");
            });
        };

        const startLobby = () => {
            pressStartBtn.disabled = true;
            document.removeEventListener("keydown", startOnKey);
            rememberStartWindowSession();

            try {
                const intro = window.CGStartIntro;
                const introEnabled = CONFIG.startIntro?.enabled === true;
                if (!introEnabled || !intro || !intro.shouldShow()) {
                    revealLobby();
                    return;
                }

                const started = intro.start({
                    onComplete: revealLobby,
                    onSkip: revealLobby,
                    onError: revealLobby
                });
                if (!started) revealLobby();
            } catch (error) {
                if (window.CG_LOG) window.CG_LOG.error("START_INTRO", "CG-INTRO-001", "Fallback hacia el lobby.", error);
                revealLobby();
            }
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
        showLoadingScreen,
        resetStartWindowSession,
        sessionKey: START_WINDOW_SESSION_KEY
    });
    window.CGLobbyStart = window.CG.lobbyStart;
    window.showLoadingScreen = showLoadingScreen;
})();
