// =====================================================
// GALERIA INTERACTIVA - CheatGuys!
// =====================================================

const GALLERY_BASE_PATH = "assets/images/gallery/";
const GALLERY_THUMB_FOLDER = "thumbs/";
const AUTO_SLIDE_MS = 4000;
const CATEGORIES = ["clothes", "thurn", "sketch"];

const galleryData = {
    akane: {
        clothes: [1, 2, 3, 4, 5, 6],
        thurn: [1, 2, 3, 4],
        sketch: [1, 2, 3, 4, 5, 7]
    },
    rika: {
        clothes: [1, 2, 3, 4, 5],
        thurn: [1, 2, 3],
        sketch: [1, 2, 3, 4, 5]
    },
    momo: {
        clothes: [1, 2, 3, 4, 5],
        thurn: [1, 2, 3, 4],
        sketch: [1, 2, 3, 4, 5]
    },
    jun: {
        clothes: [1, 2, 3, 4],
        thurn: [1, 2, 3],
        sketch: [1, 2, 3, 4, 5]
    }
};

const categoryFilePrefix = {
    clothes: "Clothes",
    thurn: "Thurn",
    sketch: "Sketch"
};

const categoryLabels = {
    clothes: "VESTIMENTAS",
    thurn: "TURNAROUNDS",
    sketch: "BOCETOS"
};

let personajeActual = "akane";

// =====================================================
// UI FLOTANTE — Oculta botones externos mientras hay un overlay abierto.
// Si lobby-logic.js ya definió esta función (ej. en index.html), no se
// sobreescribe; en galeria.html (standalone) queda definida aquí.
// =====================================================
if (typeof setFloatingUiHidden === "undefined") {
    window.setFloatingUiHidden = function setFloatingUiHidden(hidden) {
        document.body.classList.toggle("overlay-open", hidden);
    };
}

if (typeof actualizarUiFlotantePorOverlays === "undefined") {
    window.actualizarUiFlotantePorOverlays = function actualizarUiFlotantePorOverlays() {
        const idsOverlayDisplay = ["charModal", "secretModal", "mitsukiOverlay", "arcadeContainer"];
        const overlayPorDisplay = idsOverlayDisplay.some((id) => {
            const el = document.getElementById(id);
            return el && el.style.display === "flex";
        });
        const galleryModal = document.getElementById("galleryModal");
        const overlayPorClase = !!(galleryModal && galleryModal.classList.contains("is-open"));
        setFloatingUiHidden(overlayPorDisplay || overlayPorClase);
    };
}

const carouselState = {
    clothes: { index: 0, timer: null },
    thurn: { index: 0, timer: null },
    sketch: { index: 0, timer: null }
};

document.addEventListener("DOMContentLoaded", () => {
    setupSidebarState();

    if (document.querySelector(".gallery-main")) {
        seleccionarPersonaje("akane");
        setupGalleryModalKeyboard();
    }
});

// =====================================================
// BARRA LATERAL COLAPSABLE
// =====================================================
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

// =====================================================
// SELECTOR DE PERSONAJES
// =====================================================
function seleccionarPersonaje(personaje) {
    if (!galleryData[personaje]) return;

    personajeActual = personaje;
    document.body.dataset.character = personaje;

    document.querySelectorAll(".char-select-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.character === personaje);
    });

    renderizarGaleria();
}

// =====================================================
// RENDERIZADO
// =====================================================
function renderizarGaleria() {
    CATEGORIES.forEach((categoria) => {
        const track = document.getElementById("track-" + categoria);
        if (!track) return;

        const ventana = track.closest(".carousel-window");
        const numeros = galleryData[personajeActual][categoria] || [];
        const prefijo = categoryFilePrefix[categoria];

        detenerTemporizador(categoria);
        carouselState[categoria].index = 0;
        track.innerHTML = "";

        numeros.forEach((num, index) => {
            const img = document.createElement("img");
            img.src = buildImagePath(personajeActual, categoria, num, { thumb: true });
            img.alt = `${categoryLabels[categoria]} ${personajeActual} ${num}`;
            img.className = "carousel-item";
            img.loading = index === 0 ? "eager" : "lazy";
            img.dataset.fullSrc = buildImagePath(personajeActual, categoria, num);
            img.dataset.category = categoria;
            img.dataset.index = String(index);
            img.addEventListener("click", () => abrirModalSiEsCentral(categoria, index));
            track.appendChild(img);
        });

        actualizarCarrusel(categoria);
        reiniciarTemporizador(categoria);

        if (ventana) {
            ventana.classList.remove("gallery-glitch-in");
            void ventana.offsetWidth;
            ventana.classList.add("gallery-glitch-in");
        }
    });
}

function buildImagePath(personaje, categoria, numero, options = {}) {
    const prefijo = categoryFilePrefix[categoria];
    const variantFolder = options.thumb ? GALLERY_THUMB_FOLDER : "";
    return `${GALLERY_BASE_PATH}${personaje}/${variantFolder}${prefijo}-${personaje}-${numero}.webp`;
}

// =====================================================
// CARRUSEL 3D INFINITO
// =====================================================
function moverCarrusel(categoria, direccion, manual = false) {
    const total = getCarouselTotal(categoria);
    if (!total) return;

    carouselState[categoria].index = wrapIndex(carouselState[categoria].index + direccion, total);
    actualizarCarrusel(categoria);

    if (manual) {
        reiniciarTemporizador(categoria);
    }
}

function actualizarCarrusel(categoria) {
    const track = document.getElementById("track-" + categoria);
    if (!track) return;

    const items = Array.from(track.children);
    const total = items.length;
    if (!total) return;

    const currentIndex = wrapIndex(carouselState[categoria].index, total);
    const prevIndex = wrapIndex(currentIndex - 1, total);
    const nextIndex = wrapIndex(currentIndex + 1, total);

    items.forEach((item, index) => {
        item.classList.remove("is-prev", "is-active", "is-next", "is-hidden");

        if (index === currentIndex) {
            item.classList.add("is-active");
        } else if (index === prevIndex) {
            item.classList.add("is-prev");
        } else if (index === nextIndex) {
            item.classList.add("is-next");
        } else {
            item.classList.add("is-hidden");
        }
    });
}

function reiniciarTemporizador(categoria) {
    detenerTemporizador(categoria);
    carouselState[categoria].timer = window.setInterval(() => {
        moverCarrusel(categoria, 1, false);
    }, AUTO_SLIDE_MS);
}

function detenerTemporizador(categoria) {
    if (carouselState[categoria].timer) {
        window.clearInterval(carouselState[categoria].timer);
        carouselState[categoria].timer = null;
    }
}

function getCarouselTotal(categoria) {
    const track = document.getElementById("track-" + categoria);
    return track ? track.children.length : 0;
}

function wrapIndex(index, total) {
    return ((index % total) + total) % total;
}

// =====================================================
// MODAL RETRO
// =====================================================
function abrirModalSiEsCentral(categoria, index) {
    if (carouselState[categoria].index !== index) return;

    const track = document.getElementById("track-" + categoria);
    const img = track && track.children[index];
    if (!img) return;

    abrirModalGaleria(img.dataset.fullSrc || img.src, img.alt);
}

function abrirModalGaleria(src, alt) {
    const modal = document.getElementById("galleryModal");
    const modalImg = document.getElementById("galleryModalImg");
    const modalTitle = document.getElementById("galleryModalTitle");

    if (!modal || !modalImg || !modalTitle) return;

    modalImg.src = src;
    modalImg.alt = alt;
    modalTitle.innerHTML = `${alt.toUpperCase()} <span class="cursor-blink">█</span>`;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    setFloatingUiHidden(true);
}

function cerrarModalGaleria(event) {
    if (event && event.target && event.target.id !== "galleryModal") return;

    const modal = document.getElementById("galleryModal");
    const modalImg = document.getElementById("galleryModalImg");

    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    actualizarUiFlotantePorOverlays();

    if (modalImg) {
        modalImg.removeAttribute("src");
        modalImg.alt = "";
    }
}

function setupGalleryModalKeyboard() {
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            cerrarModalGaleria();
        }
    });
}
