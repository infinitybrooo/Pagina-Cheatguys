// =====================================================
// CHEATGUYS! - Diagnostico, logs y errores legibles
// =====================================================
(function () {
    "use strict";

    const PREFIXES = {
        AUDIO: "[CG:AUDIO]",
        OVERLAY: "[CG:OVERLAY]",
        GALLERY: "[CG:GALLERY]",
        PDF: "[CG:PDF]",
        ARCADE: "[CG:ARCADE]",
        LAPTOP: "[CG:LAPTOP]",
        LOBBY: "[CG:LOBBY]"
    };

    function getPrefix(moduleName) {
        return PREFIXES[String(moduleName || "").toUpperCase()] || "[CG:SYSTEM]";
    }

    function log(moduleName, message, details) {
        if (details !== undefined) {
            console.info(getPrefix(moduleName), message, details);
        } else {
            console.info(getPrefix(moduleName), message);
        }
    }

    function warn(moduleName, message, details) {
        if (details !== undefined) {
            console.warn(getPrefix(moduleName), message, details);
        } else {
            console.warn(getPrefix(moduleName), message);
        }
    }

    function error(moduleName, code, publicMessage, details) {
        const safeCode = code || "CG-SYSTEM-000";
        console.error(getPrefix(moduleName), safeCode, details || publicMessage);
        return {
            code: safeCode,
            message: publicMessage || "Algo fallo en Infinity OS. Intenta de nuevo."
        };
    }

    function notifyUser(message) {
        if (typeof window.showToast === "function") {
            window.showToast(message);
        }
    }

    window.CG = window.CG || {};
    window.CG.log = Object.freeze({
        prefixes: Object.freeze(PREFIXES),
        log,
        warn,
        error,
        notifyUser
    });
    window.CG_LOG = window.CG.log;
})();
