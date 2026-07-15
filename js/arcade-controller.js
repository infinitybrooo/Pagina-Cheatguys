(() => {
    const records = window.ArcadeRecords;
    const games = records?.GAME_IDS || {
        SPACE: "space-invaders",
        MAZE: "akane-maze"
    };
    const akaneScore = records?.AKANE_SCORE || 99999;
    const originalStartSpace = window.iniciarJuegoArcade;
    const originalPauseSpace = window.pausarJuegoArcade;
    const originalResumeSpace = window.reanudarJuegoArcade;
    const originalCloseArcade = window.cerrarArcade;
    let selectedGame = null;
    let maze = null;

    function formatScore(value) {
        return records?.format(value) || Number(value || 0).toLocaleString("en-US");
    }

    function byId(id) {
        return document.getElementById(id);
    }

    function playArcadeTrack(id, options = {}) {
        const track = byId(id);
        if (track && options.restart) track.currentTime = 0;
        if (track && track.readyState === 0) track.load();
        if (window.AudioManager?.playBg) {
            window.AudioManager.playBg(id);
            return;
        }
        track?.play?.().catch(() => {});
    }

    function playVictoryMusic() {
        playArcadeTrack("bgMusicVictory", { restart: true });
    }

    function setScreen(name) {
        const screens = {
            start: byId("arcadeStartScreen"),
            game: byId("arcadeGameScreen"),
            over: byId("arcadeGameOverScreen"),
            win: byId("arcadeWinScreen")
        };
        Object.values(screens).forEach((screen) => screen?.classList.remove("active"));
        screens[name]?.classList.add("active");
        if (name !== "game") setPauseVisible(false);
        if (name === "win") playVictoryMusic();
    }

    function setPauseVisible(visible) {
        const menu = byId("arcadePauseMenu");
        if (!menu) return;
        menu.classList.toggle("is-active", visible);
        menu.setAttribute("aria-hidden", visible ? "false" : "true");
    }

    function capturePointer(element, pointerId) {
        try {
            element?.setPointerCapture?.(pointerId);
        } catch (_error) {
            // Synthetic/WebView pointer events can lack an active capture target.
        }
    }

    function updateRecords() {
        const snapshot = records?.get() || {
            overall: { score: 0 },
            games: { [games.SPACE]: 0, [games.MAZE]: 0 },
            beatAkane: false
        };
        const recordText = formatScore(snapshot.overall.score);
        document.querySelectorAll("[data-arcade-overall-record]").forEach((element) => {
            element.textContent = recordText;
            element.classList.toggle("is-akane-beaten", snapshot.beatAkane);
        });
        document.querySelectorAll("[data-arcade-game-record]").forEach((element) => {
            element.textContent = formatScore(snapshot.games[element.dataset.arcadeGameRecord] || 0);
        });
        const selectedRecord = byId("arcadeSelectedGameRecord");
        if (selectedRecord) selectedRecord.textContent = formatScore(snapshot.games[selectedGame] || 0);

        const status = byId("arcadeRecordStatus");
        if (status) {
            status.textContent = snapshot.beatAkane ? "TU RECORD SUPERA A AKANE" : "AKANE SIGUE ARRIBA";
            status.classList.toggle("is-akane-beaten", snapshot.beatAkane);
        }

        const highScore = byId("akaneHighScore");
        if (highScore) {
            const best = Math.max(akaneScore, snapshot.overall.score);
            highScore.textContent = `${snapshot.beatAkane ? "RECORD" : "AKANE"}: ${formatScore(best)}`;
        }
    }

    function isVictoryScore(value) {
        return Number(value || 0) >= akaneScore;
    }

    function updateSelection(game) {
        selectedGame = game === games.MAZE || game === games.SPACE ? game : null;
        document.querySelectorAll("[data-arcade-game]").forEach((option) => {
            const selected = option.dataset.arcadeGame === selectedGame;
            option.classList.toggle("is-selected", selected);
            option.setAttribute("aria-pressed", selected ? "true" : "false");
        });
        const selection = byId("arcadeSelectedGame");
        if (selection) selection.hidden = !selectedGame;
        const name = byId("arcadeSelectedGameName");
        if (name) name.textContent = selectedGame === games.MAZE ? "AKANE MAZE" : selectedGame === games.SPACE ? "SPACE INVADERS" : "";
        const mode = byId("arcadeSelectedMode");
        if (mode) mode.textContent = selectedGame === games.MAZE ? "ENDLESS MAZE" : selectedGame === games.SPACE ? "PURPLE RUN" : "";
        updateRecords();
    }

    function setGameplayMode(game) {
        const isMaze = game === games.MAZE;
        const spaceCanvas = byId("spaceInvadersCanvas");
        const mazeCanvas = byId("akaneMazeCanvas");
        const spaceControls = document.querySelector("[data-space-controls]");
        const mazeControls = document.querySelector("[data-maze-controls]");
        if (spaceCanvas) spaceCanvas.hidden = isMaze;
        if (mazeCanvas) mazeCanvas.hidden = !isMaze;
        if (spaceControls) spaceControls.hidden = isMaze;
        if (mazeControls) mazeControls.hidden = !isMaze;
        byId("arcadeGameScreen")?.setAttribute("data-active-game", isMaze ? "maze" : "space");
        if (!isMaze) byId("arcadeGameScreen")?.classList.remove("is-maze-sudden-death");
    }

    function renderLives(lives) {
        const container = byId("livesDisplay");
        if (!container) return;
        container.innerHTML = "";
        for (let index = 0; index < 3; index += 1) {
            const image = document.createElement("img");
            image.className = "heart-icon";
            image.src = index < lives ? "assets/icons/Corazon-Lleno.webp" : "assets/icons/corazon-vacio.webp";
            image.alt = "";
            container.appendChild(image);
        }
    }

    function updateMazeState(state) {
        const currentScore = byId("currentScore");
        if (currentScore) currentScore.textContent = `SCORE: ${formatScore(state.score)}`;
        renderLives(state.lives);

        const badge = byId("newRecordBadge");
        badge?.classList.toggle("is-visible", state.beatAkane);

        const minutes = Math.floor(state.timeRemaining / 60);
        const seconds = String(state.timeRemaining % 60).padStart(2, "0");
        const parts = [
            `LEVEL ${String(state.level).padStart(2, "0")}`,
            `TIME ${minutes}:${seconds}`,
            `NOTES ${state.notesCollected}/${state.totalNotes} ${state.notePercent}%`
        ];
        if (state.frightenedSeconds > 0) parts.push(`ENERGY ${state.frightenedSeconds}s`);
        if (state.bonusVisible) parts.push("GAME BOY ONLINE");
        if (state.comboLabel) parts.push(state.comboLabel);
        if (state.suddenDeath) parts.push("SUDDEN DEATH");
        const statusLine = byId("arcadeStatusLine");
        if (statusLine) statusLine.textContent = parts.join(" // ");
        byId("arcadeGameScreen")?.classList.toggle("is-maze-sudden-death", state.suddenDeath);
        updateRecords();
    }

    function pulseArcadeClass(className, duration = 620) {
        const screen = byId("arcadeGameScreen");
        if (!screen) return;
        screen.classList.remove(className);
        void screen.offsetWidth;
        screen.classList.add(className);
        window.setTimeout(() => screen.classList.remove(className), duration);
    }

    function handleMazePickup(event) {
        if (event.type === "energy") pulseArcadeClass("is-maze-energy-pickup", 760);
        else if (event.type === "bonus") pulseArcadeClass("is-maze-bonus-pickup", 920);
        else if (event.type === "ghost") pulseArcadeClass("is-maze-ghost-eaten", 680);
        else if (event.type === "line") pulseArcadeClass("is-maze-line-combo", 760);
    }

    function handleMazeDeath() {
        pulseArcadeClass("is-maze-death", 1320);
    }

    function handleMazeSuddenDeath() {
        byId("arcadeGameScreen")?.classList.add("is-maze-sudden-death");
        window.AudioManager?.playBg("bgMusicSuddenDeath");
    }

    function handleMazeGameOver(result) {
        records?.record(games.MAZE, result.score);
        if (isVictoryScore(result.score)) {
            updateRecords();
            setScreen("win");
            return;
        }
        const finalScore = byId("finalScoreText");
        const finalCopy = byId("arcadeGameOverCopy");
        const finalMode = byId("arcadeGameOverMode");
        if (finalScore) finalScore.textContent = `PUNTUACION FINAL: ${formatScore(result.score)}`;
        if (finalCopy) finalCopy.textContent = isVictoryScore(result.score)
            ? "Akane ya vio tu record. Ahora intentara recuperarlo."
            : "La Demonio del Arcade sigue invicta.";
        if (finalMode) finalMode.textContent = `AKANE MAZE // LEVEL ${String(result.level).padStart(2, "0")}`;
        updateRecords();
        setScreen("over");
        playArcadeTrack("bgMusicGameOver", { restart: true });
    }

    function handleMazeAssetError() {
        const finalScore = byId("finalScoreText");
        const finalCopy = byId("arcadeGameOverCopy");
        if (finalScore) finalScore.textContent = "ERROR: SPRITES NO DISPONIBLES";
        if (finalCopy) finalCopy.textContent = "No se pudo cargar AKANE MAZE. Recarga la pagina para intentarlo de nuevo.";
        setScreen("over");
    }

    async function startSelectedGame() {
        if (!selectedGame) return;
        setPauseVisible(false);
        if (selectedGame === games.SPACE) {
            maze?.stop();
            setGameplayMode(games.SPACE);
            originalStartSpace?.();
            return;
        }

        setGameplayMode(games.MAZE);
        setScreen("game");
        window.AudioManager?.playBg("bgMusicPacman");
        await maze?.start();
    }

    function pauseSelectedGame() {
        if (selectedGame === games.MAZE) {
            if (maze?.pause()) setPauseVisible(true);
            return;
        }
        originalPauseSpace?.();
    }

    function resumeSelectedGame() {
        if (selectedGame === games.MAZE) {
            if (maze?.resume()) setPauseVisible(false);
            return;
        }
        originalResumeSpace?.();
    }

    function closeArcade() {
        maze?.stop();
        originalCloseArcade?.();
    }

    function returnToGameMenu() {
        maze?.stop();
        setPauseVisible(false);
        setScreen("start");
        updateRecords();
        playArcadeTrack("bgMusicArcade");
    }

    function setup() {
        const mazeCanvas = byId("akaneMazeCanvas");
        if (!mazeCanvas || !window.AkaneMazeGame) return;
        maze = window.AkaneMazeGame.create(mazeCanvas, {
            onState: updateMazeState,
            onGameOver: handleMazeGameOver,
            onPickup: handleMazePickup,
            onDeath: handleMazeDeath,
            onSuddenDeath: handleMazeSuddenDeath,
            onAssetError: handleMazeAssetError,
            onTogglePause() {
                if (maze?.isPaused()) resumeSelectedGame();
                else pauseSelectedGame();
            }
        });
        if (["127.0.0.1", "localhost"].includes(window.location.hostname)) {
            window.__akaneMazeDebugState = () => maze?.getDebugState();
            window.__akaneMazeDebugKill = () => maze?.debugTriggerDeath();
            window.__akaneMazeDebugGhostEyes = (index) => maze?.debugTriggerGhostEyes(index);
            window.__akaneMazeDebugFrightened = () => maze?.debugTriggerFrightened();
            window.__akaneMazeDebugSuddenDeath = () => maze?.debugTriggerSuddenDeath();
            window.__akaneMazeDebugLevelOutcome = (ratio) => maze?.debugSetLevelOutcome(ratio);
        }

        document.querySelectorAll("[data-arcade-game]").forEach((option) => {
            option.addEventListener("click", () => updateSelection(option.dataset.arcadeGame));
        });
        document.querySelectorAll("[data-maze-direction]").forEach((button) => {
            const direction = button.dataset.mazeDirection;
            const chooseDirection = (event) => {
                event.preventDefault();
                maze?.setDirection(direction);
                button.classList.add("is-pressed");
                capturePointer(button, event.pointerId);
            };
            const release = () => {
                maze?.releaseDirection(direction);
                button.classList.remove("is-pressed");
            };
            button.addEventListener("pointerdown", chooseDirection);
            button.addEventListener("pointerup", release);
            button.addEventListener("pointercancel", release);
            button.addEventListener("pointerleave", release);
        });

        const requestedGame = new URLSearchParams(window.location.search).get("game");
        updateSelection(requestedGame === "maze" ? games.MAZE : requestedGame === "space" ? games.SPACE : null);
        updateRecords();
        window.addEventListener("cheatguys:arcade-record", updateRecords);
        document.addEventListener("visibilitychange", () => {
            if (document.hidden && selectedGame === games.MAZE && maze?.isRunning() && !maze.isPaused()) {
                pauseSelectedGame();
            }
        });
    }

    window.seleccionarJuegoArcade = updateSelection;
    window.iniciarJuegoSeleccionado = startSelectedGame;
    window.reiniciarJuegoArcade = startSelectedGame;
    window.volverMenuArcade = returnToGameMenu;
    window.pausarJuegoArcade = pauseSelectedGame;
    window.reanudarJuegoArcade = resumeSelectedGame;
    window.cerrarArcade = closeArcade;

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup);
    else setup();
})();
