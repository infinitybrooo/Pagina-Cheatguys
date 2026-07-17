// =====================================================
// CHEATGUYS! - Aviso falso de cookies y regalo
// =====================================================
(function () {
    "use strict";

    const CONFIG = window.CG_CONFIG || {};
    const STORAGE_KEY = CONFIG.cookieNotice?.storageKey || CONFIG.storageKeys?.cookieNoticeSeen || "cheatguys.cookieNoticeSeen.v1";
    const SEEN_DURATION_MS = CONFIG.cookieNotice?.seenDurationMs || CONFIG.startIntro?.seenDurationMs || 48 * 60 * 60 * 1000;
    const MAX_WAIT_MS = 45000;

    let shown = false;
    let observer = null;
    let timeoutId = null;
    let lastFocus = null;

    function safeReadTimestamp() {
        try {
            const value = window.localStorage.getItem(STORAGE_KEY);
            if (value === "1") {
                const migrated = Date.now();
                window.localStorage.setItem(STORAGE_KEY, String(migrated));
                return migrated;
            }
            const timestamp = Number(value);
            return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null;
        } catch (_) {
            return null;
        }
    }

    function shouldShowNotice() {
        const timestamp = safeReadTimestamp();
        if (!timestamp) return true;
        const elapsed = Date.now() - timestamp;
        return elapsed < 0 || elapsed >= SEEN_DURATION_MS;
    }

    function hasRecentNotice() {
        return !shouldShowNotice();
    }

    function rememberNotice() {
        try {
            window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
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
        if (!windowEl || shown || hasRecentNotice()) return;

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
        if (shown || hasRecentNotice()) {
            cleanupWaiters();
            return;
        }

        if (document.body.classList.contains("page-loaded")) {
            showNotice();
        }
    }

    function waitForLobby() {
        if (hasRecentNotice()) return;

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
        shouldShow: shouldShowNotice,
        storageKey: STORAGE_KEY,
        seenDurationMs: SEEN_DURATION_MS
    });
})();
