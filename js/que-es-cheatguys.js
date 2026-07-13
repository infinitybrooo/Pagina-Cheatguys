// =====================================================
// QUE ES CHEATGUYS - Interacciones ligeras de la pagina
// =====================================================

(function () {
    let scrollMeterFrame = null;

    function updateScrollMeter() {
        const meter = document.getElementById("infoScrollMeter");
        if (!meter) return;

        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
        meter.style.width = Math.max(0, Math.min(progress, 100)) + "%";
    }

    function requestScrollMeterUpdate() {
        if (scrollMeterFrame) return;

        scrollMeterFrame = window.requestAnimationFrame(() => {
            scrollMeterFrame = null;
            updateScrollMeter();
        });
    }

    function setupReveal() {
        const items = document.querySelectorAll(".cg-info-reveal");

        if (!("IntersectionObserver" in window)) {
            items.forEach((item) => item.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.16 });

        items.forEach((item) => observer.observe(item));
    }

    function setupImageModal() {
        document.querySelectorAll(".info-image-card").forEach((card) => {
            card.addEventListener("click", () => {
                abrirInfoImageModal(card.dataset.full, card.dataset.title || "IMAGE_VIEWER");
            });
        });

        document.addEventListener("keydown", (event) => {
            if (!window.CGOverlay && event.key === "Escape") cerrarInfoImageModal();
        });
    }

    window.abrirInfoImageModal = function abrirInfoImageModal(src, title) {
        const modal = document.getElementById("infoImageModal");
        const image = document.getElementById("infoImageModalImg");
        const heading = document.getElementById("infoImageModalTitle");

        if (!modal || !image || !heading || !src) return;

        image.src = src;
        image.alt = title;
        heading.innerHTML = title + ' <span class="cursor-blink">█</span>';
        if (window.CGOverlay) {
            window.CGOverlay.open("infoImageModal", {
                mode: "class",
                openClass: "is-open",
                focusElement: modal.querySelector(".info-modal-close"),
                closeOthers: false,
                onEscape: () => cerrarInfoImageModal()
            });
        } else {
            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");

            if (typeof setFloatingUiHidden === "function") {
                setFloatingUiHidden(true);
            }
        }
    };

    window.cerrarInfoImageModal = function cerrarInfoImageModal(event) {
        if (event && event.target && event.target.id !== "infoImageModal") return;

        const modal = document.getElementById("infoImageModal");
        const image = document.getElementById("infoImageModalImg");

        if (!modal) return;

        if (window.CGOverlay) {
            window.CGOverlay.close("infoImageModal");
        } else {
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
        }

        if (image) {
            image.removeAttribute("src");
            image.alt = "";
        }

        if (!window.CGOverlay) {
            if (typeof actualizarUiFlotantePorOverlays === "function") {
                actualizarUiFlotantePorOverlays();
            } else if (typeof setFloatingUiHidden === "function") {
                setFloatingUiHidden(false);
            }
        }
    };

    document.addEventListener("DOMContentLoaded", () => {
        setupReveal();
        setupImageModal();
        updateScrollMeter();
    });

    window.addEventListener("scroll", requestScrollMeterUpdate, { passive: true });
    window.addEventListener("resize", requestScrollMeterUpdate);
})();
