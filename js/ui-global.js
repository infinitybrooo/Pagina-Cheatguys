// =====================================================
// UI GLOBAL - Sidebar, overlays y helpers responsivos
// =====================================================
(function () {
    "use strict";

    const overlayStack = [];
    let savedBodyOverflow = null;

    function setFloatingUiHidden(hidden) {
        document.body.classList.toggle("overlay-open", hidden);
    }

    function lockScroll() {
        if (savedBodyOverflow !== null) return;
        savedBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
    }

    function restoreScrollIfIdle() {
        if (overlayStack.length > 0) return;
        document.body.style.overflow = savedBodyOverflow !== null ? savedBodyOverflow : "";
        savedBodyOverflow = null;
    }

    function getOverlayIndex(id) {
        return overlayStack.findIndex((entry) => entry.id === id);
    }

    function getFocusable(container) {
        return Array.from(container.querySelectorAll([
            "a[href]",
            "button:not([disabled])",
            "input:not([disabled])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            "[tabindex]:not([tabindex='-1'])"
        ].join(","))).filter((element) => element.offsetParent !== null || element === document.activeElement);
    }

    function applyOverlayVisibility(element, open, options) {
        const mode = options.mode || "display";
        element.setAttribute("aria-hidden", open ? "false" : "true");

        if (mode === "class") {
            element.classList.toggle(options.openClass || "is-open", open);
            return;
        }

        if (mode === "hidden") {
            element.hidden = !open;
            if (options.openClass) element.classList.toggle(options.openClass, open);
            return;
        }

        element.style.display = open ? (options.display || "flex") : "none";
    }

    function focusOverlay(element, preferredFocus) {
        const target = preferredFocus || getFocusable(element)[0] || element;
        if (!target) return;

        if (!target.hasAttribute("tabindex") && target === element) {
            target.setAttribute("tabindex", "-1");
        }

        window.requestAnimationFrame(() => {
            try {
                target.focus({ preventScroll: true });
            } catch (error) {
                target.focus();
            }
        });
    }

    function openOverlay(id, options = {}) {
        const element = typeof id === "string" ? document.getElementById(id) : id;
        if (!element) return false;

        const overlayId = element.id || options.id;
        if (!overlayId) return false;

        if (options.closeOthers) {
            [...overlayStack].forEach((entry) => closeOverlay(entry.id, { restoreFocus: false }));
        } else {
            const existingIndex = getOverlayIndex(overlayId);
            if (existingIndex >= 0) overlayStack.splice(existingIndex, 1);
        }

        overlayStack.push({
            id: overlayId,
            element,
            options,
            previousFocus: options.returnFocus || document.activeElement
        });

        lockScroll();
        applyOverlayVisibility(element, true, options);
        setFloatingUiHidden(true);
        focusOverlay(element, options.focusElement);

        if (window.CG_LOG) window.CG_LOG.log("OVERLAY", `open ${overlayId}`);
        return true;
    }

    function closeOverlay(id, closeOptions = {}) {
        const overlayId = typeof id === "string" ? id : id && id.id;
        const index = getOverlayIndex(overlayId);
        if (index < 0) return false;

        const [entry] = overlayStack.splice(index, 1);
        applyOverlayVisibility(entry.element, false, entry.options);
        restoreScrollIfIdle();
        actualizarUiFlotantePorOverlays();

        const shouldRestoreFocus = closeOptions.restoreFocus !== false && entry.options.restoreFocus !== false;
        const returnTarget = closeOptions.returnFocus || entry.options.returnFocus || entry.previousFocus;
        if (shouldRestoreFocus && returnTarget && document.contains(returnTarget)) {
            window.requestAnimationFrame(() => returnTarget.focus({ preventScroll: true }));
        }

        if (window.CG_LOG) window.CG_LOG.log("OVERLAY", `close ${overlayId}`);
        return true;
    }

    function closeTopOverlay() {
        const top = overlayStack[overlayStack.length - 1];
        if (!top) return false;
        if (typeof top.options.onEscape === "function") {
            top.options.onEscape();
            return true;
        }
        return closeOverlay(top.id);
    }

    function hayOverlayActivo() {
        if (overlayStack.length > 0) return true;

        const idsOverlayDisplay = ["charModal", "secretModal", "mitsukiOverlay", "arcadeContainer"];
        const overlayPorDisplay = idsOverlayDisplay.some((id) => {
            const el = document.getElementById(id);
            return el && el.style.display === "flex";
        });

        const galleryModal = document.getElementById("galleryModal");
        const infoImageModal = document.getElementById("infoImageModal");
        const overlayPorClase = [galleryModal, infoImageModal].some((el) => el && el.classList.contains("is-open"));

        return overlayPorDisplay || overlayPorClase;
    }

    function actualizarUiFlotantePorOverlays() {
        setFloatingUiHidden(hayOverlayActivo());
    }

    function getResponsiveAssetUrl(url) {
        if (!window.matchMedia || !window.matchMedia("(max-width: 768px)").matches) return url;
        return url.replace(/\/([^/]+\.webp)$/i, "/mobile/$1");
    }

    function setupSidebarState() {
        const sidebar = document.getElementById("sidebarNav");
        const toggle = document.getElementById("sidebarToggle");

        if (!sidebar || !toggle) return;

        sidebar.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
    }

    function toggleSidebar() {
        const sidebar = document.getElementById("sidebarNav");
        const toggle = document.getElementById("sidebarToggle");
        const main = document.getElementById("mainContent");

        if (!sidebar || !toggle) return;

        const isOpen = sidebar.classList.toggle("is-open");
        toggle.classList.toggle("is-open", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));

        if (main) {
            main.classList.toggle("sidebar-open", isOpen);
        }
    }

    window.setFloatingUiHidden = setFloatingUiHidden;
    window.hayOverlayActivo = hayOverlayActivo;
    window.actualizarUiFlotantePorOverlays = actualizarUiFlotantePorOverlays;
    window.getResponsiveAssetUrl = getResponsiveAssetUrl;
    window.toggleSidebar = toggleSidebar;
    window.CG = window.CG || {};
    window.CG.overlay = Object.freeze({
        open: openOverlay,
        close: closeOverlay,
        closeTop: closeTopOverlay,
        isActive: hayOverlayActivo
    });
    window.CGOverlay = window.CG.overlay;

    document.addEventListener("DOMContentLoaded", setupSidebarState);
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (closeTopOverlay()) event.preventDefault();
    });
})();
