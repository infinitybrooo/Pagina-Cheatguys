// =====================================================
// CHEATGUYS! - Configuracion compartida
// =====================================================
(function () {
    "use strict";

    const config = {
        systemName: "CheatGuys!",
        osName: "Infinity OS",
        routes: {
            home: "index.html",
            gallery: "galeria.html",
            arcade: "minijuego.html",
            productionBible: "biblia-produccion.html",
            pdf: "assets/pdf/pitch-bible.pdf",
            chatFunction: "/.netlify/functions/chat"
        },
        storageKeys: {
            startIntroSeen: "cheatguys.startIntroSeen.v1",
            masterVolume: "cgMasterVolume",
            musicEnabled: "cgMusicEnabled"
        },
        breakpoints: {
            mobile: 768,
            laptopCompact: 620
        },
        chat: {
            allowedCharacters: ["akane", "rika", "momo", "jun"],
            maxMessageLength: 500,
            maxHistoryItems: 8,
            requestTimeoutMs: 12000
        },
        pdf: {
            url: "assets/pdf/pitch-bible.pdf",
            pdfJsUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.7.284/build/pdf.min.mjs",
            workerUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs"
        }
    };

    window.CG = window.CG || {};
    window.CG.config = Object.freeze(config);
    window.CG_CONFIG = window.CG.config;
})();
