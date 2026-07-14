// =====================================================
// AUDIO GLOBAL - Control unico desde la barra lateral
// =====================================================
(function () {
    const CONFIG = window.CG_CONFIG || {};
    const STORAGE_VOLUME = CONFIG.storageKeys?.masterVolume || "cgMasterVolume";
    const STORAGE_ENABLED = CONFIG.storageKeys?.musicEnabled || "cgMusicEnabled";
    const SFX_CONFIG = CONFIG.sfx || {};
    const DEFAULT_VOLUME = 0.4;

    let currentTrack = null;
    const activeSfx = new Set();
    let musicEnabled = safeGetStorage(STORAGE_ENABLED) !== "false";
    let masterVolume = Number.parseFloat(safeGetStorage(STORAGE_VOLUME) || String(DEFAULT_VOLUME));
    if (!Number.isFinite(masterVolume)) masterVolume = DEFAULT_VOLUME;

    const multipliers = {
        bgMusicPage: 1,
        bgMusicArcade: 1,
        bgMusicPacman: 1,
        bgMusicSecret: 1,
        bgMusicChar: 1,
        bgMusicStart: 1,
        bgMusicSuddenDeath: 1,
        bgMusicGameOver: 1,
        bgMusicVictory: 1
    };

    function getAudio(id) {
        return document.getElementById(id);
    }

    function safeGetStorage(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    }

    function safeSetStorage(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch (error) {
            // La preferencia simplemente no se persiste si el navegador bloquea almacenamiento.
        }
    }

    function applyVolume() {
        Object.entries(multipliers).forEach(([id, mult]) => {
            const audio = getAudio(id);
            if (audio) audio.volume = Math.min(masterVolume * mult, 1);
        });
        activeSfx.forEach((entry) => {
            entry.audio.volume = Math.min(masterVolume * entry.multiplier, 1);
        });
    }

    function updateButton(button) {
        if (!button) return;
        button.textContent = musicEnabled ? "\u266b" : "\u{1F507}";
        button.classList.toggle("music-off", !musicEnabled);
        button.setAttribute("aria-pressed", String(musicEnabled));
    }

    function pauseAudio(id, reset = false) {
        const audio = getAudio(id);
        if (!audio) return;
        audio.pause();
        if (reset) audio.currentTime = 0;
    }

    const manager = {
        get volume() {
            return masterVolume;
        },

        get enabled() {
            return musicEnabled;
        },

        registerMultipliers(extraMultipliers) {
            Object.assign(multipliers, extraMultipliers || {});
            applyVolume();
        },

        setVolume(value) {
            const parsed = Number.parseFloat(value);
            if (!Number.isFinite(parsed)) return;
            masterVolume = Math.max(0, Math.min(parsed, 1));
            safeSetStorage(STORAGE_VOLUME, String(masterVolume));
            applyVolume();
        },

        playBg(id) {
            if (!musicEnabled || !id) return;
            const next = getAudio(id);
            if (!next) return;

            if (currentTrack && currentTrack !== id) {
                pauseAudio(currentTrack, true);
            }

            currentTrack = id;
            applyVolume();
            next.play().catch(() => {});
        },

        playSfx(url, options = {}) {
            if (!musicEnabled || !url) return null;
            const audio = new Audio(url);
            const entry = {
                audio,
                multiplier: Number.isFinite(options.volume) ? options.volume : 1
            };
            activeSfx.add(entry);
            audio.preload = "auto";
            audio.volume = Math.min(masterVolume * entry.multiplier, 1);
            const release = () => activeSfx.delete(entry);
            audio.addEventListener("ended", release, { once: true });
            audio.addEventListener("error", release, { once: true });
            audio.play().catch(release);
            return audio;
        },

        stopSfx() {
            activeSfx.forEach((entry) => {
                entry.audio.pause();
                entry.audio.currentTime = 0;
            });
            activeSfx.clear();
        },

        playUiButton() {
            this.playSfx(SFX_CONFIG.uiButton, { volume: 0.45 });
        },

        pauseCurrent() {
            if (currentTrack) pauseAudio(currentTrack, false);
        },

        resumeLobby() {
            if (getAudio("bgMusicPage")) {
                this.playBg("bgMusicPage");
            }
        },

        muteAll() {
            Object.keys(multipliers).forEach((id) => pauseAudio(id, false));
            this.stopSfx();
        },

        setEnabled(enabled) {
            musicEnabled = Boolean(enabled);
            safeSetStorage(STORAGE_ENABLED, String(musicEnabled));
            updateButton(document.getElementById("musicToggleBtn"));

            if (!musicEnabled) {
                this.muteAll();
                return;
            }

            if (currentTrack && getAudio(currentTrack)) {
                this.playBg(currentTrack);
            } else if (getAudio("bgMusicPage")) {
                this.playBg("bgMusicPage");
            }
        }
    };

    window.AudioManager = manager;
    window.toggleMusic = function toggleMusic() {
        manager.setEnabled(!manager.enabled);
    };

    document.addEventListener("DOMContentLoaded", () => {
        const slider = document.getElementById("pageVolumeSlider");
        const button = document.getElementById("musicToggleBtn");

        if (slider) {
            slider.value = String(masterVolume);
            slider.addEventListener("input", (event) => manager.setVolume(event.target.value));
        }

        updateButton(button);
        applyVolume();

        const getDefaultTrack = () => {
            if (document.body.classList.contains("arcade-page")) return null;
            const startWindow = document.getElementById("startWindow");
            if (startWindow && document.getElementById("bgMusicStart")) return "bgMusicStart";
            return "bgMusicPage";
        };

        const unlockAudio = () => {
            const defaultTrack = getDefaultTrack();
            if (musicEnabled && defaultTrack && getAudio(defaultTrack)) {
                manager.playBg(defaultTrack);
            }
            document.removeEventListener("click", unlockAudio, true);
            document.removeEventListener("touchend", unlockAudio, true);
            document.removeEventListener("keydown", unlockAudio, true);
        };

        document.addEventListener("click", unlockAudio, true);
        document.addEventListener("touchend", unlockAudio, { capture: true, passive: true });
        document.addEventListener("keydown", unlockAudio, true);

        document.addEventListener("click", (event) => {
            const control = event.target.closest?.("button, a, [role='button']");
            if (!control || control.disabled || control.getAttribute("aria-disabled") === "true") return;
            manager.playUiButton();
        }, true);
    });
})();
