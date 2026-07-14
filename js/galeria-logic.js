// =====================================================
// VISUAL_ARCHIVE - Galeria interactiva de CheatGuys!
// =====================================================

(() => {
    "use strict";

    const GALLERY_BASE_PATH = "assets/images/gallery/";
    const GALLERY_THUMB_FOLDER = "thumbs/";
    const AUTO_SLIDE_MS = 6500;
    const CATEGORIES = ["clothes", "thurn", "sketch"];
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

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

    const characterMeta = {
        akane: {
            name: "Akane Hoshizora",
            systemName: "AKANE_HOSHIZORA",
            color: "VIOLETA // #8A2BE2",
            status: "ANXIETY_RENDERED_SUCCESSFULLY",
            dialog: {
                default: "Esos bocetos todavía no estaban terminados…",
                clothes: "No abras el archivo que dice outfit_final_final.",
                thurn: "¿Era necesario verme desde todos los ángulos?",
                sketch: "Esos bocetos todavía no estaban terminados…"
            }
        },
        rika: {
            name: "Rika Tanaka",
            systemName: "RIKA_TANAKA",
            color: "NARANJA // #FF4500",
            status: "ORANGE_LEVELS_OVER_LIMIT",
            dialog: {
                default: "¡Abre el outfit cuatro! Ese tiene presencia.",
                clothes: "¡Abre el outfit cuatro! Ese tiene presencia.",
                thurn: "La pose también cuenta como argumento.",
                sketch: "Ese trazo necesitaba más energía. Y naranja."
            }
        },
        momo: {
            name: "Momo Fujiwara",
            systemName: "MOMO_FUJIWARA",
            color: "ROSA // #FF69B4",
            status: "CUTE_FILENAMES_VALIDATED",
            dialog: {
                default: "Guardé algunos con nombres bonitos.",
                clothes: "Este directorio combina sorprendentemente bien.",
                thurn: "Giré despacito para que no se mareara el archivo.",
                sketch: "Guardé algunos con nombres bonitos."
            }
        },
        jun: {
            name: "Jun Sakamoto",
            systemName: "JUN_SAKAMOTO",
            color: "CIAN // #00BFFF",
            status: "SIMILAR_FILES_DETECTED",
            dialog: {
                default: "Hay tres casi iguales. No preguntes.",
                clothes: "Sí, son distintos. Técnicamente.",
                thurn: "La rotación terminó. Yo no.",
                sketch: "Hay tres casi iguales. No preguntes."
            }
        }
    };

    const categoryMeta = {
        clothes: {
            label: "VESTIMENTAS",
            filePrefix: "Clothes",
            type: "CLOTHING_TEST"
        },
        thurn: {
            label: "TURNAROUNDS",
            filePrefix: "Thurn",
            type: "MODEL_SHEET"
        },
        sketch: {
            label: "BOCETOS",
            filePrefix: "Sketch",
            type: "ROUGH_SKETCH"
        }
    };

    let personajeActual = "akane";
    let modalState = null;
    let lastFocusedElement = null;

    const swipeSuppressUntil = {
        clothes: 0,
        thurn: 0,
        sketch: 0
    };

    const carouselVisibility = {
        clothes: true,
        thurn: true,
        sketch: true
    };

    const carouselState = {
        clothes: { index: 0, timer: null, paused: false },
        thurn: { index: 0, timer: null, paused: false },
        sketch: { index: 0, timer: null, paused: false }
    };

    document.addEventListener("DOMContentLoaded", initGallery);

    function initGallery() {
        if (!document.querySelector(".gallery-main")) return;

        setupCharacterSelector();
        setupCarouselControls();
        setupGalleryModal();
        setupGalleryVisibilityHandling();
        seleccionarPersonaje("akane", { announce: false });
    }

    // =====================================================
    // SELECTOR Y CONSOLA DE PERSONAJE
    // =====================================================
    function setupCharacterSelector() {
        document.querySelectorAll(".char-select-btn").forEach((button) => {
            button.addEventListener("click", () => {
                seleccionarPersonaje(button.dataset.character);
            });
        });
    }

    function seleccionarPersonaje(personaje, options = {}) {
        if (!galleryData[personaje]) return;

        personajeActual = personaje;
        document.body.dataset.character = personaje;

        document.querySelectorAll(".char-select-btn").forEach((button) => {
            const isActive = button.dataset.character === personaje;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-pressed", String(isActive));

            const state = button.querySelector(".char-select-state");
            if (state) state.textContent = isActive ? "ACTIVE" : "READY";
        });

        updateArchiveConsole(personaje, options.announce !== false);
        renderGallery();
    }

    function updateArchiveConsole(personaje, announce = true) {
        const meta = characterMeta[personaje];
        const totalFiles = CATEGORIES.reduce((total, category) => {
            return total + galleryData[personaje][category].length;
        }, 0);

        setText("archiveCharacterName", meta.systemName);
        setText("archiveColor", meta.color);
        setText("archiveFileCount", String(totalFiles).padStart(2, "0"));
        setText("archiveStatus", meta.status);

        if (announce) {
            setMicrodialog(personaje, "default");
        } else {
            setText("galleryMicrodialog", `“${meta.dialog.default}”`);
        }
    }

    function setMicrodialog(personaje, category) {
        const line = characterMeta[personaje].dialog[category] || characterMeta[personaje].dialog.default;
        const output = document.getElementById("galleryMicrodialog");
        if (!output) return;

        output.classList.remove("is-updating");
        void output.offsetWidth;
        output.textContent = `“${line}”`;
        output.classList.add("is-updating");
    }

    // =====================================================
    // RENDER DE ARCHIVOS
    // =====================================================
    function renderGallery() {
        CATEGORIES.forEach((category) => {
            const track = document.getElementById(`track-${category}`);
            const numbers = galleryData[personajeActual][category] || [];
            if (!track) return;

            stopTimer(category);
            carouselState[category].index = 0;
            track.replaceChildren();

            const fragment = document.createDocumentFragment();
            numbers.forEach((number, index) => {
                fragment.appendChild(createFileCard(category, number, index, numbers.length));
            });
            track.appendChild(fragment);

            buildPositionPixels(category, numbers.length);
            updateCarousel(category);
            restartTimer(category);

            const windowElement = track.closest(".carousel-window");
            if (windowElement && !reducedMotionQuery.matches) {
                windowElement.classList.remove("gallery-glitch-in");
                void windowElement.offsetWidth;
                windowElement.classList.add("gallery-glitch-in");
            }
        });
    }

    function createFileCard(category, number, index, total) {
        const fileName = buildDisplayFileName(personajeActual, category, number);
        const card = document.createElement("button");
        card.type = "button";
        card.className = "gallery-file-card";
        card.dataset.thumbSrc = buildImagePath(personajeActual, category, number, true);
        card.dataset.fullSrc = buildImagePath(personajeActual, category, number, false);
        card.dataset.category = category;
        card.dataset.index = String(index);
        card.dataset.fileName = fileName;
        card.setAttribute("aria-label", `${categoryMeta[category].label} de ${characterMeta[personajeActual].name}, archivo ${index + 1} de ${total}: ${fileName}`);

        const preview = document.createElement("span");
        preview.className = "gallery-file-preview";

        const image = document.createElement("img");
        image.alt = `${categoryMeta[category].label.toLowerCase()} de ${characterMeta[personajeActual].name}, archivo ${index + 1}`;
        image.loading = index === 0 ? "eager" : "lazy";
        image.decoding = "async";
        image.width = 320;
        image.height = 320;
        preview.appendChild(image);

        const metadata = document.createElement("span");
        metadata.className = "gallery-file-metadata";
        metadata.innerHTML = `<span>TYPE: ${categoryMeta[category].type}</span><strong>${fileName}</strong><small>STATUS: ARCHIVED</small>`;

        card.append(preview, metadata);
        card.addEventListener("click", () => onFileCardClick(category, index));
        return card;
    }

    function buildImagePath(personaje, category, number, isThumb) {
        const folder = isThumb ? GALLERY_THUMB_FOLDER : "";
        const prefix = categoryMeta[category].filePrefix;
        return `${GALLERY_BASE_PATH}${personaje}/${folder}${prefix}-${personaje}-${number}.webp`;
    }

    function buildDisplayFileName(personaje, category, number) {
        const prefix = categoryMeta[category].filePrefix.toUpperCase();
        return `${prefix}_${personaje.toUpperCase()}_${String(number).padStart(2, "0")}.WEBP`;
    }

    // =====================================================
    // CARRUSELES 3D INFINITOS
    // =====================================================
    function setupCarouselControls() {
        document.querySelectorAll(".carousel-arrow").forEach((button) => {
            button.addEventListener("click", () => {
                moverCarrusel(button.dataset.category, Number(button.dataset.direction), true);
            });
        });

        document.querySelectorAll(".carousel-window").forEach((windowElement) => {
            const category = windowElement.dataset.category;
            let pointerStartX = null;

            windowElement.addEventListener("keydown", (event) => {
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                    event.preventDefault();
                    moverCarrusel(category, event.key === "ArrowLeft" ? -1 : 1, true);
                }
            });

            windowElement.addEventListener("pointerdown", (event) => {
                if (!event.isPrimary) return;
                pointerStartX = event.clientX;
                pauseCarousel(category);
            });

            windowElement.addEventListener("pointerup", (event) => {
                if (pointerStartX === null || !event.isPrimary) return;
                const distance = event.clientX - pointerStartX;
                pointerStartX = null;

                if (Math.abs(distance) >= 42) {
                    swipeSuppressUntil[category] = Date.now() + 300;
                    moverCarrusel(category, distance < 0 ? 1 : -1, true);
                } else {
                    resumeCarousel(category);
                }
            });

            windowElement.addEventListener("pointercancel", () => {
                pointerStartX = null;
                resumeCarousel(category);
            });

            windowElement.addEventListener("mouseenter", () => pauseCarousel(category));
            windowElement.addEventListener("mouseleave", () => resumeCarousel(category));
            windowElement.addEventListener("focusin", () => pauseCarousel(category));
            windowElement.addEventListener("focusout", () => {
                window.setTimeout(() => {
                    if (!windowElement.contains(document.activeElement)) resumeCarousel(category);
                }, 0);
            });
        });
    }

    function onFileCardClick(category, index) {
        if (Date.now() < swipeSuppressUntil[category]) return;

        if (carouselState[category].index !== index) {
            carouselState[category].index = index;
            updateCarousel(category);
            restartTimer(category);
            setMicrodialog(personajeActual, category);
            return;
        }

        openGalleryModal(category, index);
    }

    function moverCarrusel(category, direction, manual = false) {
        const total = getCarouselTotal(category);
        if (!total || !carouselState[category]) return;

        carouselState[category].index = wrapIndex(carouselState[category].index + direction, total);
        updateCarousel(category);

        if (manual) {
            setMicrodialog(personajeActual, category);
            restartTimer(category);
        }
    }

    function updateCarousel(category) {
        const track = document.getElementById(`track-${category}`);
        if (!track) return;

        const items = Array.from(track.children);
        const total = items.length;
        if (!total) return;

        const currentIndex = wrapIndex(carouselState[category].index, total);
        carouselState[category].index = currentIndex;
        const prevIndex = wrapIndex(currentIndex - 1, total);
        const nextIndex = wrapIndex(currentIndex + 1, total);

        items.forEach((item, index) => {
            item.classList.remove("is-prev", "is-active", "is-next", "is-hidden");
            item.setAttribute("aria-current", index === currentIndex ? "true" : "false");
            item.tabIndex = index === currentIndex ? 0 : -1;

            if (index === currentIndex) {
                item.classList.add("is-active");
                loadCarouselThumbnail(item);
            } else if (index === prevIndex) {
                item.classList.add("is-prev");
                loadCarouselThumbnail(item);
            } else if (index === nextIndex) {
                item.classList.add("is-next");
                loadCarouselThumbnail(item);
            } else {
                item.classList.add("is-hidden");
            }
        });

        updateCarouselChrome(category, items[currentIndex], currentIndex, total);
    }

    function loadCarouselThumbnail(card) {
        const image = card && card.querySelector("img");
        if (!image || image.getAttribute("src")) return;

        image.src = card.dataset.thumbSrc;
        image.addEventListener("load", () => card.classList.add("is-loaded"), { once: true });
    }

    function updateCarouselChrome(category, activeCard, currentIndex, total) {
        setText(`count-${category}`, String(total).padStart(2, "0"));
        setText(`position-${category}`, `${String(currentIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`);
        setText(`filename-${category}`, activeCard.dataset.fileName);

        const dots = document.getElementById(`dots-${category}`);
        if (dots) {
            Array.from(dots.children).forEach((dot, index) => {
                dot.classList.toggle("is-active", index === currentIndex);
            });
        }
    }

    function buildPositionPixels(category, total) {
        const dots = document.getElementById(`dots-${category}`);
        if (!dots) return;

        const fragment = document.createDocumentFragment();
        for (let index = 0; index < total; index += 1) {
            const dot = document.createElement("i");
            fragment.appendChild(dot);
        }
        dots.replaceChildren(fragment);
    }

    function pauseCarousel(category) {
        carouselState[category].paused = true;
        stopTimer(category);
    }

    function resumeCarousel(category) {
        carouselState[category].paused = false;
        restartTimer(category);
    }

    function restartTimer(category) {
        stopTimer(category);
        const modal = document.getElementById("galleryModal");
        const modalOpen = modal && modal.classList.contains("is-open");
        if (
            reducedMotionQuery.matches
            || document.hidden
            || modalOpen
            || carouselState[category].paused
            || carouselVisibility[category] === false
        ) return;

        carouselState[category].timer = window.setInterval(() => {
            moverCarrusel(category, 1, false);
        }, AUTO_SLIDE_MS);
    }

    function stopTimer(category) {
        if (!carouselState[category].timer) return;
        window.clearInterval(carouselState[category].timer);
        carouselState[category].timer = null;
    }

    function restartAllTimers() {
        CATEGORIES.forEach(restartTimer);
    }

    function stopAllTimers() {
        CATEGORIES.forEach(stopTimer);
    }

    function getCarouselTotal(category) {
        const track = document.getElementById(`track-${category}`);
        return track ? track.children.length : 0;
    }

    function wrapIndex(index, total) {
        return ((index % total) + total) % total;
    }

    // =====================================================
    // VISOR DE PRODUCCION
    // =====================================================
    function setupGalleryModal() {
        const modal = document.getElementById("galleryModal");
        const closeButton = modal && modal.querySelector(".gallery-modal-close");
        const previousButton = modal && modal.querySelector(".gallery-modal-prev");
        const nextButton = modal && modal.querySelector(".gallery-modal-next");
        if (!modal || !closeButton || !previousButton || !nextButton) return;

        modal.addEventListener("click", (event) => {
            if (event.target === modal) closeGalleryModal();
        });
        closeButton.addEventListener("click", closeGalleryModal);
        previousButton.addEventListener("click", () => navigateModal(-1));
        nextButton.addEventListener("click", () => navigateModal(1));
        document.addEventListener("keydown", handleModalKeyboard);
    }

    function openGalleryModal(category, index) {
        const track = document.getElementById(`track-${category}`);
        const card = track && track.children[index];
        if (!card) return;

        lastFocusedElement = document.activeElement;
        modalState = { category, index };
        updateModalContent();

        const modal = document.getElementById("galleryModal");
        const closeButton = modal.querySelector(".gallery-modal-close");
        document.body.classList.add("gallery-modal-open");
        stopAllTimers();

        if (window.CGOverlay) {
            window.CGOverlay.open("galleryModal", {
                mode: "class",
                openClass: "is-open",
                focusElement: closeButton,
                returnFocus: lastFocusedElement,
                closeOthers: false,
                onEscape: closeGalleryModal
            });
        } else {
            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");
            if (typeof window.setFloatingUiHidden === "function") {
                window.setFloatingUiHidden(true);
            }
            window.requestAnimationFrame(() => closeButton.focus());
        }
    }

    function updateModalContent() {
        if (!modalState) return;

        const { category } = modalState;
        const track = document.getElementById(`track-${category}`);
        const total = track ? track.children.length : 0;
        if (!total) return;

        modalState.index = wrapIndex(modalState.index, total);
        carouselState[category].index = modalState.index;
        updateCarousel(category);

        const card = track.children[modalState.index];
        const image = document.getElementById("galleryModalImg");
        const figure = document.querySelector(".gallery-modal-figure");
        const fileName = card.dataset.fileName;

        setText("galleryModalCharacter", characterMeta[personajeActual].systemName);
        setText("galleryModalFile", fileName);
        setText("galleryModalCategory", `TYPE: ${categoryMeta[category].type}`);
        setText("galleryModalCounter", `${String(modalState.index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`);

        if (figure) figure.classList.add("is-loading");
        image.alt = `${categoryMeta[category].label.toLowerCase()} de ${characterMeta[personajeActual].name}, archivo ${modalState.index + 1} de ${total}`;
        image.onload = () => {
            if (figure) figure.classList.remove("is-loading");
        };
        image.src = card.dataset.fullSrc;
    }

    function navigateModal(direction) {
        if (!modalState) return;
        modalState.index += direction;
        updateModalContent();
    }

    function closeGalleryModal() {
        const modal = document.getElementById("galleryModal");
        const image = document.getElementById("galleryModalImg");
        if (!modal || !modal.classList.contains("is-open")) return;

        const returnTarget = modalState
            ? document.querySelector(`#track-${modalState.category} .gallery-file-card.is-active`)
            : lastFocusedElement;

        if (window.CGOverlay) {
            window.CGOverlay.close("galleryModal", { returnFocus: returnTarget });
        } else {
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
        }
        document.body.classList.remove("gallery-modal-open");
        modalState = null;

        image.removeAttribute("src");
        image.alt = "";
        image.onload = null;

        if (!window.CGOverlay && typeof window.actualizarUiFlotantePorOverlays === "function") {
            window.actualizarUiFlotantePorOverlays();
        }

        if (!document.hidden) restartAllTimers();

        if (!window.CGOverlay && returnTarget && document.contains(returnTarget)) {
            returnTarget.focus();
        }
    }

    function handleModalKeyboard(event) {
        const modal = document.getElementById("galleryModal");
        if (!modal || !modal.classList.contains("is-open")) return;

        if (event.key === "Escape") {
            event.preventDefault();
            closeGalleryModal();
            return;
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            navigateModal(event.key === "ArrowLeft" ? -1 : 1);
            return;
        }
        if (event.key === "Tab") trapModalFocus(event, modal);
    }

    function trapModalFocus(event, modal) {
        const focusable = Array.from(modal.querySelectorAll("button:not([disabled])"));
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    // =====================================================
    // ESTADO GLOBAL
    // =====================================================
    function setupGalleryVisibilityHandling() {
        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    const category = entry.target.dataset.category;
                    if (!category || !carouselState[category]) return;

                    carouselVisibility[category] = entry.isIntersecting;
                    if (entry.isIntersecting) restartTimer(category);
                    else stopTimer(category);
                });
            }, { rootMargin: "120px 0px", threshold: 0.08 });

            document.querySelectorAll(".carousel-window").forEach((windowElement) => {
                observer.observe(windowElement);
            });
        }

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                stopAllTimers();
            } else {
                restartAllTimers();
            }
        });

        const onReducedMotionChange = () => {
            if (reducedMotionQuery.matches) stopAllTimers();
            else restartAllTimers();
        };

        if (typeof reducedMotionQuery.addEventListener === "function") {
            reducedMotionQuery.addEventListener("change", onReducedMotionChange);
        } else if (typeof reducedMotionQuery.addListener === "function") {
            reducedMotionQuery.addListener(onReducedMotionChange);
        }
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    // Compatibilidad con la API global anterior de la pagina.
    window.seleccionarPersonaje = seleccionarPersonaje;
    window.moverCarrusel = moverCarrusel;
    window.cerrarModalGaleria = closeGalleryModal;
})();
