(() => {
    const STORAGE_KEY = "cheatguys.arcade.records.v1";
    const AKANE_SCORE = 99999;
    const GAME_IDS = Object.freeze({
        SPACE: "space-invaders",
        MAZE: "akane-maze"
    });

    function emptyState() {
        return {
            version: 1,
            overall: { score: 0, game: null },
            games: {
                [GAME_IDS.SPACE]: 0,
                [GAME_IDS.MAZE]: 0
            }
        };
    }

    function normalizeScore(value) {
        const score = Number(value);
        return Number.isFinite(score) ? Math.max(0, Math.floor(score)) : 0;
    }

    function read() {
        const fallback = emptyState();
        try {
            const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
            if (!saved || typeof saved !== "object") return fallback;

            const spaceScore = normalizeScore(saved.games?.[GAME_IDS.SPACE]);
            const mazeScore = normalizeScore(saved.games?.[GAME_IDS.MAZE]);
            const overallScore = Math.max(normalizeScore(saved.overall?.score), spaceScore, mazeScore);
            const overallGame = saved.overall?.game === GAME_IDS.MAZE || saved.overall?.game === GAME_IDS.SPACE
                ? saved.overall.game
                : (mazeScore > spaceScore ? GAME_IDS.MAZE : (spaceScore > 0 ? GAME_IDS.SPACE : null));

            return {
                version: 1,
                overall: { score: overallScore, game: overallGame },
                games: {
                    [GAME_IDS.SPACE]: spaceScore,
                    [GAME_IDS.MAZE]: mazeScore
                }
            };
        } catch (_error) {
            return fallback;
        }
    }

    function write(state) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (_error) {
            // The game remains playable when storage is blocked or full.
        }
    }

    function emit(state) {
        window.dispatchEvent(new CustomEvent("cheatguys:arcade-record", {
            detail: getSnapshot(state)
        }));
    }

    function getSnapshot(source = read()) {
        return {
            akaneScore: AKANE_SCORE,
            overall: { ...source.overall },
            games: { ...source.games },
            beatAkane: source.overall.score >= AKANE_SCORE
        };
    }

    function record(game, value) {
        if (game !== GAME_IDS.SPACE && game !== GAME_IDS.MAZE) return getSnapshot();

        const score = normalizeScore(value);
        const state = read();
        const previousGameBest = state.games[game] || 0;
        const previousOverallBest = state.overall.score || 0;

        if (score <= previousGameBest && score <= previousOverallBest) {
            return getSnapshot(state);
        }

        state.games[game] = Math.max(previousGameBest, score);
        if (score > previousOverallBest) {
            state.overall = { score, game };
        }

        write(state);
        emit(state);
        return getSnapshot(state);
    }

    window.ArcadeRecords = Object.freeze({
        AKANE_SCORE,
        GAME_IDS,
        STORAGE_KEY,
        format(value) {
            return normalizeScore(value).toLocaleString("en-US");
        },
        get() {
            return getSnapshot();
        },
        record
    });
})();
