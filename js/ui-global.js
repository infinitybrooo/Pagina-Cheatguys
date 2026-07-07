// =====================================================
// UI GLOBAL - Sidebar, overlays y helpers responsivos
// =====================================================
(function () {
    function setFloatingUiHidden(hidden) {
        document.body.classList.toggle("overlay-open", hidden);
    }

    function hayOverlayActivo() {
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

    document.addEventListener("DOMContentLoaded", setupSidebarState);
})();
