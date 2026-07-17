// =====================================================
// CHEATGUYS! - Aviso falso de cookies y regalo
// =====================================================
(function () {
    "use strict";

    const CONFIG = window.CG_CONFIG || {};
    const STORAGE_KEY = CONFIG.storageKeys?.cookieNoticeSeen || "cheatguys.cookieNoticeSeen.v1";
    const MAX_WAIT_MS = 45000;

    let shown = false;
    let observer = null;
    let timeoutId = null;
    let lastFocus = null;

    function hasSeenNotice() {
        try {
            return window.localStorage.getItem(STORAGE_KEY) === "1";
        } catch (_) {
            return false;
        }
    }

    function rememberNotice() {
        try {
            window.localStorage.setItem(STORAGE_KEY, "1");
        } catch (_) {
            // El aviso sigue siendo descartable aunque localStorage este bloqueado.
        }
    }

    function getElements() {
        const windowEl = document.getElementById("cookieNotice");
        return {
            windowEl,
            closeButton: windowEl?.querySelector("[data-cg-cookie-close]") || null,
            giftButton: windowEl?.querySelector("[data-cg-cookie-download]") || null
        };
    }

    function applyActiveLanguage(root) {
        if (!root || !window.CGLanguage) return;
        window.CGLanguage.refresh(root);
    }

    function cleanupWaiters() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        if (timeoutId) {
            window.clearTimeout(timeoutId);
            timeoutId = null;
        }
    }

    function setVisible(visible) {
        const { windowEl } = getElements();
        if (!windowEl) return;

        windowEl.hidden = !visible;
        windowEl.classList.toggle("is-open", visible);
        windowEl.setAttribute("aria-hidden", visible ? "false" : "true");
    }

    function showNotice() {
        const { windowEl, closeButton } = getElements();
        if (!windowEl || shown || hasSeenNotice()) return;

        shown = true;
        cleanupWaiters();
        lastFocus = document.activeElement;
        applyActiveLanguage(windowEl);
        setVisible(true);

        window.requestAnimationFrame(() => {
            try {
                (closeButton || windowEl).focus({ preventScroll: true });
            } catch (_) {
                (closeButton || windowEl).focus();
            }
        });
    }

    function closeNotice(options = {}) {
        const { windowEl } = getElements();
        if (!windowEl || windowEl.hidden) return;

        rememberNotice();
        setVisible(false);

        if (options.restoreFocus !== false && lastFocus && document.contains(lastFocus)) {
            window.requestAnimationFrame(() => lastFocus.focus({ preventScroll: true }));
        }
    }

    function maybeShowNotice() {
        if (shown || hasSeenNotice()) {
            cleanupWaiters();
            return;
        }

        if (document.body.classList.contains("page-loaded")) {
            showNotice();
        }
    }

    function waitForLobby() {
        if (hasSeenNotice()) return;

        maybeShowNotice();
        if (shown) return;

        observer = new MutationObserver(maybeShowNotice);
        observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
        timeoutId = window.setTimeout(cleanupWaiters, MAX_WAIT_MS);
    }

    function setup() {
        const { windowEl, closeButton, giftButton } = getElements();
        if (!windowEl) return;

        closeButton?.addEventListener("click", () => closeNotice());
        giftButton?.addEventListener("click", () => closeNotice({ restoreFocus: false }));
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !windowEl.hidden) {
                event.preventDefault();
                closeNotice();
            }
        });

        waitForLobby();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setup);
    } else {
        setup();
    }

    window.CG = window.CG || {};
    window.CG.cookieNotice = Object.freeze({
        show: showNotice,
        close: closeNotice,
        reset: () => {
            shown = false;
            try {
                window.localStorage.removeItem(STORAGE_KEY);
            } catch (_) {
                // Solo es una ayuda para pruebas locales.
            }
        },
        storageKey: STORAGE_KEY
    });
})();
