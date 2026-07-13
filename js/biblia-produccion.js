import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.7.284/build/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs";

const PDF_URL = "assets/pdf/pitch-bible.pdf";
const LOADING_MESSAGES = [
    "Inicializando visor...",
    "Leyendo documento...",
    "Cargando páginas...",
    "Acceso concedido..."
];

const state = {
    document: null,
    page: 1,
    zoom: 1,
    renderTask: null,
    renderVersion: 0,
    resizeTimer: null
};

const elements = {
    fileWindow: document.getElementById("fileWindow"),
    fileDetails: document.getElementById("fileDetails"),
    fileLoading: document.getElementById("fileLoading"),
    loadingMessage: document.getElementById("loadingMessage"),
    openButton: document.getElementById("openBibleButton"),
    viewerWindow: document.getElementById("pdfViewerWindow"),
    stage: document.getElementById("pdfStage"),
    canvas: document.getElementById("pdfCanvas"),
    renderStatus: document.getElementById("pageRenderStatus"),
    currentPage: document.getElementById("currentPage"),
    totalPages: document.getElementById("totalPages"),
    previousButton: document.getElementById("previousPageButton"),
    nextButton: document.getElementById("nextPageButton"),
    zoomOutButton: document.getElementById("zoomOutButton"),
    zoomInButton: document.getElementById("zoomInButton"),
    zoomLevel: document.getElementById("zoomLevel"),
    fullscreenButton: document.getElementById("fullscreenButton")
};

function wait(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function runLoadingSequence() {
    for (const message of LOADING_MESSAGES) {
        elements.loadingMessage.textContent = message;
        await wait(400);
    }
}

function updateControls() {
    const total = state.document ? state.document.numPages : 9;
    elements.currentPage.textContent = String(state.page);
    elements.totalPages.textContent = String(total);
    elements.zoomLevel.textContent = `${Math.round(state.zoom * 100)}%`;
    elements.previousButton.disabled = state.page <= 1;
    elements.nextButton.disabled = state.page >= total;
    elements.zoomOutButton.disabled = state.zoom <= 0.6;
    elements.zoomInButton.disabled = state.zoom >= 2.4;
}

async function renderPage() {
    if (!state.document || elements.viewerWindow.hidden) return;

    const renderVersion = ++state.renderVersion;
    elements.renderStatus.hidden = false;

    if (state.renderTask) {
        state.renderTask.cancel();
        state.renderTask = null;
    }

    try {
        const page = await state.document.getPage(state.page);
        if (renderVersion !== state.renderVersion) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(elements.stage.clientWidth - 30, 220);
        const availableHeight = Math.max(elements.stage.clientHeight - 30, 180);
        const fitScale = Math.min(
            availableWidth / baseViewport.width,
            availableHeight / baseViewport.height
        );
        const viewport = page.getViewport({ scale: fitScale * state.zoom });
        const outputScale = Math.min(window.devicePixelRatio || 1, 2);
        const context = elements.canvas.getContext("2d", { alpha: false });

        elements.canvas.width = Math.floor(viewport.width * outputScale);
        elements.canvas.height = Math.floor(viewport.height * outputScale);
        elements.canvas.style.width = `${Math.floor(viewport.width)}px`;
        elements.canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = outputScale === 1
            ? null
            : [outputScale, 0, 0, outputScale, 0, 0];

        state.renderTask = page.render({
            canvasContext: context,
            transform,
            viewport
        });

        await state.renderTask.promise;
        state.renderTask = null;

        if (renderVersion === state.renderVersion) {
            elements.stage.scrollTo({ top: 0, left: 0 });
            elements.renderStatus.hidden = true;
        }
    } catch (error) {
        if (error?.name === "RenderingCancelledException") return;
        console.error("INFINITY_OS // PDF_RENDER_ERROR", error);
        elements.renderStatus.textContent = "ERROR_AL_CARGAR_PÁGINA";
        elements.renderStatus.hidden = false;
    }
}

async function openDocument() {
    elements.openButton.disabled = true;
    elements.fileDetails.hidden = true;
    elements.fileLoading.hidden = false;

    try {
        const loadingTask = pdfjsLib.getDocument(PDF_URL);
        const [pdfDocument] = await Promise.all([
            loadingTask.promise,
            runLoadingSequence()
        ]);

        state.document = pdfDocument;
        state.page = 1;
        state.zoom = 1;
        updateControls();

        elements.fileWindow.hidden = true;
        elements.viewerWindow.hidden = false;

        await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
        await renderPage();
        elements.stage.focus({ preventScroll: true });
    } catch (error) {
        console.error("INFINITY_OS // PDF_ACCESS_ERROR", error);
        elements.loadingMessage.textContent = "No se pudo abrir el archivo. Reintenta la conexión.";
        elements.openButton.disabled = false;
    }
}

function changePage(offset) {
    if (!state.document) return;
    const nextPage = Math.min(Math.max(state.page + offset, 1), state.document.numPages);
    if (nextPage === state.page) return;
    state.page = nextPage;
    updateControls();
    renderPage();
}

function changeZoom(offset) {
    const nextZoom = Math.min(Math.max(Number((state.zoom + offset).toFixed(1)), 0.6), 2.4);
    if (nextZoom === state.zoom) return;
    state.zoom = nextZoom;
    updateControls();
    renderPage();
}

async function toggleFullscreen() {
    if (elements.viewerWindow.classList.contains("is-fullscreen-fallback")) {
        elements.viewerWindow.classList.remove("is-fullscreen-fallback");
        document.body.classList.remove("bible-fallback-fullscreen");
        elements.fullscreenButton.textContent = "[ PANTALLA COMPLETA ]";
        window.setTimeout(renderPage, 80);
        return;
    }

    try {
        if (document.fullscreenElement === elements.viewerWindow) {
            await document.exitFullscreen();
        } else {
            await elements.viewerWindow.requestFullscreen();
        }
    } catch (error) {
        elements.viewerWindow.classList.add("is-fullscreen-fallback");
        document.body.classList.add("bible-fallback-fullscreen");
        elements.fullscreenButton.textContent = "[ SALIR DE PANTALLA COMPLETA ]";
        window.setTimeout(renderPage, 80);
    }
}

elements.openButton.addEventListener("click", openDocument);
elements.previousButton.addEventListener("click", () => changePage(-1));
elements.nextButton.addEventListener("click", () => changePage(1));
elements.zoomOutButton.addEventListener("click", () => changeZoom(-0.2));
elements.zoomInButton.addEventListener("click", () => changeZoom(0.2));
elements.fullscreenButton.addEventListener("click", toggleFullscreen);

elements.stage.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        changePage(-1);
    } else if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        changePage(1);
    } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        changeZoom(0.2);
    } else if (event.key === "-") {
        event.preventDefault();
        changeZoom(-0.2);
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.viewerWindow.classList.contains("is-fullscreen-fallback")) {
        elements.viewerWindow.classList.remove("is-fullscreen-fallback");
        document.body.classList.remove("bible-fallback-fullscreen");
        elements.fullscreenButton.textContent = "[ PANTALLA COMPLETA ]";
        window.setTimeout(renderPage, 80);
    }
});

document.addEventListener("fullscreenchange", () => {
    const isFullscreen = document.fullscreenElement === elements.viewerWindow;
    elements.fullscreenButton.textContent = isFullscreen
        ? "[ SALIR DE PANTALLA COMPLETA ]"
        : "[ PANTALLA COMPLETA ]";
    window.setTimeout(renderPage, 80);
});

window.addEventListener("resize", () => {
    window.clearTimeout(state.resizeTimer);
    state.resizeTimer = window.setTimeout(renderPage, 140);
});

updateControls();
