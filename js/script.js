        // --- SISTEMA DEL MINIJUEGO ARCADE ---
        (function () {
        const arcadeContainer = document.getElementById('arcadeContainer');
        const screenStart = document.getElementById('arcadeStartScreen');
        const screenGame = document.getElementById('arcadeGameScreen');
        const screenOver = document.getElementById('arcadeGameOverScreen');
        const screenWin = document.getElementById('arcadeWinScreen');
        const canvas = document.getElementById('spaceInvadersCanvas');

        if (!arcadeContainer || !screenStart || !screenGame || !screenOver || !screenWin || !canvas) {
            window.iniciarSecuenciaArcade = function() {
                window.location.href = 'minijuego.html';
            };
            return;
        }

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        const FRAME_MS = 1000 / 60;
        const MAX_FRAME_DELTA = 2.4;
        const SHOOT_SFX_POOL_SIZE = 5;
        const SHOOT_SFX_MIN_INTERVAL = 38;
        const SHOOT_SFX_BASE_VOLUME = 0.2;
        const AKANE_MAX_SCORE = window.ArcadeRecords?.AKANE_SCORE || 99999;
        const ARCADE_TRACK_IDS = ["bgMusicArcade", "bgMusicPacman", "bgMusicSuddenDeath", "bgMusicGameOver", "bgMusicVictory"];
        const POWERUP_SFX_URL = window.CG_CONFIG?.sfx?.powerUp || 'assets/audio/later/powerup_minijuego.wav';
        const shootSfxPool = [];
        let shootSfxIndex = 0;
        let lastShootSfxTime = 0;

        function chancePerFrame(baseChance, deltaFrames) {
            return Math.random() < Math.min(baseChance * deltaFrames, 0.95);
        }

        const SPRITE_BASE_PATH = 'assets/arcade/sprites/';
        const ARCADE_SPRITE_FILES = {
            akaneShip: 'custom-akane.png',
            enemyBlue: 'custom-jun.png',
            enemyPink: 'custom-momo.png',
            enemyOrange: 'custom-rika.png',
            enemyRed: 'custom-nave-roja-hoshi.png',
            bossMini: 'boss-mini.png',
            bossFull: 'boss-full.png',
            bossMiniAnxiety: 'boss-mini-anxiety-sheet.png',
            bossFullAnxiety: 'boss-full-anxiety-sheet.png',
            ufoGold: 'ufo-gold.png',
            powerDouble: 'power-double.png',
            powerShield: 'power-shield.png',
            powerSlow: 'power-slow.png',
            powerPierce: 'power-pierce.png',
            powerHeart: 'power-heart.png',
            powerInvincible: 'power-invincible.png',
            tractorBeam: 'tractor-beam-sheet.png',
            challengeTarget: 'challenge-target.png',
            bulletPlayer: 'bullet-player.png',
            bulletPierce: 'bullet-pierce.png',
            bulletEnemyOrange: 'bullet-enemy-orange.png',
            bulletEnemyPurple: 'bullet-enemy-purple.png',
            shieldRing: 'shield-ring.png',
            invincibleAura: 'invincible-aura.png'
        };
        const arcadeSprites = {};
        const POWERUP_SPRITES = {
            double: 'powerDouble',
            shield: 'powerShield',
            slow: 'powerSlow',
            pierce: 'powerPierce',
            heart: 'powerHeart',
            invincible: 'powerInvincible'
        };

        Object.entries(ARCADE_SPRITE_FILES).forEach(([key, file]) => {
            const image = new Image();
            image.decoding = 'async';
            image.src = `${SPRITE_BASE_PATH}${file}`;
            arcadeSprites[key] = image;
        });

        function isSpriteReady(key) {
            const image = arcadeSprites[key];
            return Boolean(image && image.complete && image.naturalWidth > 0);
        }

        function drawSprite(key, x, y, width, height, options = {}) {
            if (!isSpriteReady(key)) return false;
            const image = arcadeSprites[key];
            const frames = options.frames || 1;
            const frame = options.frame || 0;
            const sourceWidth = image.naturalWidth / frames;
            const sourceX = Math.floor(frame % frames) * sourceWidth;
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            if (options.alpha !== undefined) ctx.globalAlpha = options.alpha;
            ctx.drawImage(
                image,
                sourceX,
                0,
                sourceWidth,
                image.naturalHeight,
                Math.floor(x),
                Math.floor(y),
                Math.floor(width),
                Math.floor(height)
            );
            ctx.restore();
            return true;
        }

        const localArcadeAudio = {
            _current: null,
            _volume: 0.45,
            setVolume(value) {
                this._volume = value;
                ARCADE_TRACK_IDS.forEach((id) => {
                    const el = document.getElementById(id);
                    if (el) el.volume = Math.min(value, 1);
                });
            },
            playBg(id, options = {}) {
                const next = document.getElementById(id);
                if (!next) return;
                if (this._current && this._current !== id) {
                    const prev = document.getElementById(this._current);
                    if (prev) {
                        prev.pause();
                        prev.currentTime = 0;
                    }
                }
                this._current = id;
                if (options.restart) next.currentTime = 0;
                if (next.readyState === 0) next.load();
                next.play().catch(() => {});
            },
            stopAll() {
                ARCADE_TRACK_IDS.forEach((id) => {
                    const el = document.getElementById(id);
                    if (el) el.pause();
                });
            }
        };

        function playArcadeBg(id, options = {}) {
            const track = document.getElementById(id);
            if (track && options.restart) track.currentTime = 0;
            if (track && track.readyState === 0) track.load();
            if (window.AudioManager) {
                window.AudioManager.playBg(id);
            } else {
                localArcadeAudio.playBg(id, options);
            }
        }

        function playVictoryMusic() {
            playArcadeBg("bgMusicVictory", { restart: true });
        }

        function exitArcadeAudio() {
            if (window.AudioManager) {
                window.AudioManager.resumeLobby();
            } else {
                localArcadeAudio.stopAll();
            }
        }

        function getCurrentArcadeVolume() {
            const globalVolume = document.getElementById('pageVolumeSlider');
            return globalVolume ? parseFloat(globalVolume.value || '0.45') : 0.45;
        }

        function initShootSfxPool() {
            if (shootSfxPool.length) return;
            const source = document.getElementById('arcadeShootSfx');
            if (!source || !source.src) return;
            for (let i = 0; i < SHOOT_SFX_POOL_SIZE; i++) {
                const audio = i === 0 ? source : new Audio(source.src);
                audio.preload = 'auto';
                audio.volume = SHOOT_SFX_BASE_VOLUME * getCurrentArcadeVolume();
                shootSfxPool.push(audio);
            }
        }

        function playShootSfx() {
            initShootSfxPool();
            const now = performance.now();
            if (!shootSfxPool.length || now - lastShootSfxTime < SHOOT_SFX_MIN_INTERVAL) return;
            lastShootSfxTime = now;

            const audio = shootSfxPool[shootSfxIndex];
            shootSfxIndex = (shootSfxIndex + 1) % shootSfxPool.length;
            audio.volume = SHOOT_SFX_BASE_VOLUME * getCurrentArcadeVolume();
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }

        function playPowerUpSfx() {
            if (window.AudioManager?.playSfx) {
                window.AudioManager.playSfx(POWERUP_SFX_URL, { volume: 0.55 });
                return;
            }

            const audio = new Audio(POWERUP_SFX_URL);
            audio.volume = Math.min(getCurrentArcadeVolume() * 0.55, 1);
            audio.play().catch(() => {});
        }

        function runArcadeLoading(callback) {
            if (typeof showLoadingScreen !== 'undefined' && document.getElementById('globalLoader')) {
                showLoadingScreen(callback);
            } else {
                callback();
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            const globalVolume = document.getElementById('pageVolumeSlider');
            if (!window.AudioManager && globalVolume) {
                localArcadeAudio.setVolume(parseFloat(globalVolume.value));
                globalVolume.addEventListener('input', (event) => {
                    localArcadeAudio.setVolume(parseFloat(event.target.value));
                });
            }

            if (document.body.classList.contains('arcade-page')) {
                arcadeContainer.style.display = 'flex';
                showScreen('start');
                if (new URLSearchParams(window.location.search).has('win-preview')) {
                    showWinPreview();
                }
            }

            bindMobileControls();
        });

        let animationId;
        let lastFrameTime = 0;
        let isGameRunning = false;
        let score = 0;
        let waveCount = 0;
        let lives = 3;
        // Sudden Death: se activa al perder todas las vidas con power > 1
        let suddenDeath = false;
        // Invulnerabilidad temporal tras recibir daño
        let invulnerable = false;
        let invulnTimer = 0;
        // UFO
        let ufo = null;
        let ufoTimer = 0;
        // Partículas de explosión
        let particles = [];
        let powerUps = [];
        let floatingTexts = [];
        let stars = [];
        let waveBanner = null;
        let screenShake = 0;
        let comboCount = 0;
        let comboTimer = 0;
        let newRecordReached = false;
        let isGamePaused = false;
        let resumeCountdown = 0;
        let shieldTimer = 0;
        let powerDoubleTimer = 0;
        let powerSlowTimer = 0;
        let powerPierceTimer = 0;
        let invincibleTimer = 0;
        let pendingChallengeStage = false;
        let challengeStage = null;
        const POINT_SHOT_STEP = 10000;
        const MAX_POINT_SHOTS = 2;
        const SHIELD_DURATION_FRAMES = 20 * 60;
        const INVINCIBLE_DURATION_FRAMES = 10 * 60;
        const TRACTOR_BEAM_DURATION_FRAMES = 4 * 60;
        const TRACTOR_BEAM_COOLDOWN_FRAMES = 280;
        const PLAYER_MIN_Y = 318;
        const POWERUP_TYPES = [
            { type: 'double', label: 'DOUBLE', color: '#FF69B4' },
            { type: 'shield', label: 'SHIELD', color: '#00FFFF' },
            { type: 'slow', label: 'SLOW', color: '#FFD700' },
            { type: 'pierce', label: 'PIERCE', color: '#AA44FF' },
            { type: 'heart', label: 'HEART', color: '#00FF99' }
        ];
        const UNIQUE_POWERUP_TYPES = [
            { type: 'invincible', label: 'INVINCIBLE', color: '#FFD32A' }
        ];

        // Nave de Akane
        const player = { x: 180, y: 460, width: 40, height: 15, speed: 4.6, color: '#8A2BE2', dx: 0, dy: 0 };
        let bullets = [];
        let enemyBullets = [];
        let enemies = [];
        let enemyDirection = 1;
        let enemySpeed = 0.5;
        let edgeCooldown = 0; // evita doble-inversión de dirección en frames consecutivos
        
        const keys = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false, KeyA: false, KeyD: false, KeyW: false, KeyS: false, Space: false };
        let canShoot = true; 
        let mobileFireTimer = null;
        const joystick = { active: false, pointerId: null, x: 0, y: 0 };
        const pointerMove = { active: false, pointerId: null, hasTarget: false, x: 0, y: 0 };
        const inputRects = { canvas: null, joystick: null };
        let inputFramePending = false;
        let pendingJoystickInput = null;
        let pendingPointerMoveInput = null;

        // Puntos por fila: fila 0 (superior)=100, fila 1 (media)=20, fila 2+ (inferior)=10
        function puntajeEnemigo(enemy) {
            if (enemy.isChallengeTarget) return 280;
            if (enemy.isUFO) return 500;
            if (enemy.isMajorBoss) return 3000;
            if (enemy.isBoss) return 1200;
            if (enemy.isEscort) return 180;
            if (enemy.isRedShooter) return 150;
            let base = 10;
            if (enemy.row === 0) base = 100;
            else if (enemy.row === 1) base = 20;
            return enemy.state === 'diving' ? base * 2 : base;
        }

        function overlap(a, b) {
            return a.x < b.x + b.width && a.x + a.width > b.x &&
                a.y < b.y + b.height && a.y + a.height > b.y;
        }

        function getEnemyY(enemy) {
            return enemy.baseY + (enemy.yOffset || 0);
        }

        function getBaseShotCount() {
            if (suddenDeath) return 1;
            return Math.min(MAX_POINT_SHOTS, 1 + Math.floor(score / POINT_SHOT_STEP));
        }

        function getShotCount() {
            const baseShots = getBaseShotCount();
            return powerDoubleTimer > 0 && !suddenDeath ? Math.min(baseShots * 2, 4) : baseShots;
        }

        function getPowerUpDropChance(baseChance) {
            if (suddenDeath) return 0;
            const waveDropFactor = Math.max(0.24, 1 - Math.max(waveCount - 1, 0) * 0.045);
            return baseChance * waveDropFactor;
        }

        function getPowerUpConfig(type) {
            return [...POWERUP_TYPES, ...UNIQUE_POWERUP_TYPES].find((item) => item.type === type);
        }

        function isPlayerProtected() {
            return invulnerable || invincibleTimer > 0;
        }

        function getActiveTractorEnemy() {
            return enemies.find((enemy) => enemy.isRedShooter && enemy.tractorActive && enemy.tractorTimer > 0);
        }

        function getTractorSlowFactor() {
            return getActiveTractorEnemy() ? 0.38 : 1;
        }

        function addFloatingText(text, x, y, color = '#FFFFFF', size = 18) {
            floatingTexts.push({
                text,
                x,
                y,
                dy: -0.45,
                life: 75,
                color,
                size
            });
        }

        function showWaveBanner(text, color = '#00FFFF') {
            waveBanner = { text, color, life: 150 };
        }

        function initStarfield() {
            stars = [];
            for (let i = 0; i < 54; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    speed: 0.18 + Math.random() * 0.65,
                    size: Math.random() < 0.18 ? 2 : 1,
                    color: Math.random() < 0.5 ? '#3D1A7A' : '#003F6B'
                });
            }
        }

        function refreshStatusLine(message) {
            const statusLine = document.getElementById('arcadeStatusLine');
            if (!statusLine) return;
            let active = [];
            if (powerDoubleTimer > 0) active.push('DOUBLE');
            if (powerSlowTimer > 0) active.push('SLOW');
            if (powerPierceTimer > 0) active.push('PIERCE');
            if (invincibleTimer > 0) active.push(`INVINCIBLE ${Math.ceil(invincibleTimer / 60)}s`);
            if (getActiveTractorEnemy()) active.push('TRACTOR LOCK');
            if (shieldTimer > 0) active.push(`SHIELD ${Math.ceil(shieldTimer / 60)}s`);
            if (comboCount > 1 && comboTimer > 0) active.push(`COMBO x${comboCount}`);
            const label = challengeStage?.active ? 'BONUS' : `WAVE ${String(Math.max(waveCount, 1)).padStart(2, '0')}`;
            statusLine.innerText = message || `${label} // ${active.length ? active.join(' // ') : 'READY'}`;
        }

        function setPauseMenuVisible(visible) {
            const pauseMenu = document.getElementById('arcadePauseMenu');
            if (!pauseMenu) return;
            pauseMenu.classList.toggle('is-active', visible);
            pauseMenu.setAttribute('aria-hidden', visible ? 'false' : 'true');
        }

        function canUseGameplayInput() {
            return isGameRunning && !isGamePaused && resumeCountdown <= 0;
        }

        function capturePointer(element, pointerId) {
            try {
                element?.setPointerCapture?.(pointerId);
            } catch (_error) {
                // Some synthetic/WebView pointer events do not expose an active pointer capture target.
            }
        }

        function pauseGameplayControls() {
            stopMobileFire();
            resetJoystick();
            resetPointerMove();
            Object.keys(keys).forEach((key) => { keys[key] = false; });
            canShoot = true;
            document.querySelectorAll('[data-arcade-action].is-pressed').forEach((button) => {
                button.classList.remove('is-pressed');
            });
        }

        function updateNewRecordState() {
            if (!newRecordReached && isVictoryScore(score)) {
                newRecordReached = true;
                showWaveBanner('NUEVO RECORD // SIGUE VIVO', '#FFD32A');
                addFloatingText('NUEVO RECORD', canvas.width / 2, 286, '#FFD32A', 26);
            }
            const badge = document.getElementById('newRecordBadge');
            if (badge) badge.classList.toggle('is-visible', newRecordReached);
        }

        window.iniciarSecuenciaArcade = function() {
            if (!document.body.classList.contains('arcade-page')) {
                window.location.href = 'minijuego.html';
                return;
            }

            runArcadeLoading(() => {
                arcadeContainer.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                showScreen('start');
                playArcadeBg('bgMusicArcade');
                if (typeof setFloatingUiHidden === 'function') setFloatingUiHidden(true);
            });
        }

        window.cerrarArcade = function() {
            detenerJuego();
            if (document.body.classList.contains('arcade-page')) {
                window.location.href = 'index.html';
                return;
            }
            arcadeContainer.style.display = 'none';
            document.body.style.overflow = 'auto';
            exitArcadeAudio();
            if (typeof actualizarUiFlotantePorOverlays === 'function') {
                actualizarUiFlotantePorOverlays();
            } else if (typeof setFloatingUiHidden === 'function') {
                setFloatingUiHidden(false);
            }
        }

        function showScreen(screen) {
            screenStart.classList.remove('active');
            screenGame.classList.remove('active');
            screenOver.classList.remove('active');
            screenWin.classList.remove('active');
            if (screen !== 'game') setPauseMenuVisible(false);
            if(screen === 'start') screenStart.classList.add('active');
            if(screen === 'game') screenGame.classList.add('active');
            if(screen === 'over') screenOver.classList.add('active');
            if(screen === 'win') {
                screenWin.classList.add('active');
                playVictoryMusic();
            }
        }

        function isVictoryScore(value) {
            return Number(value || 0) >= AKANE_MAX_SCORE;
        }

        function iniciarJuegoArcade() {
            detenerJuego();
            showScreen('game');
            resetGameData();
            crearOleada();
            playArcadeBg('bgMusicArcade');
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);
            isGameRunning = true;
            lastFrameTime = 0;
            animationId = requestAnimationFrame(loop);
        }
        window.iniciarJuegoArcade = iniciarJuegoArcade;

        function detenerJuego() {
            isGameRunning = false;
            if (animationId) cancelAnimationFrame(animationId);
            animationId = null;
            lastFrameTime = 0;
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            isGamePaused = false;
            resumeCountdown = 0;
            setPauseMenuVisible(false);
            pauseGameplayControls();
        }

        function gameOver() {
            detenerJuego();
            window.ArcadeRecords?.record(window.ArcadeRecords.GAME_IDS.SPACE, score);
            if (isVictoryScore(score)) {
                showScreen('win');
                return;
            }
            playArcadeBg('bgMusicGameOver');
            const formattedScore = window.ArcadeRecords?.format(score) || String(score);
            document.getElementById('finalScoreText').innerText = `PUNTUACIÓN FINAL: ${formattedScore}`;
            const modeLabel = document.getElementById('arcadeGameOverMode');
            if (modeLabel) modeLabel.innerText = `SPACE INVADERS // WAVE ${String(Math.max(waveCount, 1)).padStart(2, '0')}`;
            const copy = document.getElementById('arcadeGameOverCopy');
            if (copy) copy.innerText = isVictoryScore(score)
                ? 'Akane ya vio tu record. Ahora intentara recuperarlo.'
                : 'La Demonio del Arcade sigue invicta.';
            showScreen('over');
        }

        function showWinPreview() {
            score = AKANE_MAX_SCORE;
            actualizarScore();
            showScreen('win');
        }

        function resetGameData() {
            score = 0;
            waveCount = 0;
            lives = 3;
            suddenDeath = false;
            invulnerable = false;
            invulnTimer = 0;
            ufo = null;
            ufoTimer = 0;
            particles = [];
            powerUps = [];
            floatingTexts = [];
            waveBanner = null;
            screenShake = 0;
            comboCount = 0;
            comboTimer = 0;
            newRecordReached = false;
            isGamePaused = false;
            resumeCountdown = 0;
            setPauseMenuVisible(false);
            shieldTimer = 0;
            powerDoubleTimer = 0;
            powerSlowTimer = 0;
            powerPierceTimer = 0;
            invincibleTimer = 0;
            pendingChallengeStage = false;
            challengeStage = null;
            initStarfield();
            actualizarScore();
            refreshStatusLine('WAVE 01 // READY');
            player.x = canvas.width / 2 - player.width / 2;
            player.y = 460;
            player.dx = 0;
            player.dy = 0;
            bullets = [];
            enemyBullets = [];
            enemies = [];
            enemySpeed = 0.5;
            edgeCooldown = 0;
            canShoot = true;
        }

        window.pausarJuegoArcade = function() {
            if (!isGameRunning || isGamePaused || resumeCountdown > 0) return;
            isGamePaused = true;
            if (animationId) cancelAnimationFrame(animationId);
            animationId = null;
            pauseGameplayControls();
            setPauseMenuVisible(true);
            refreshStatusLine('PAUSE // TAKE A BREATH');
            draw();
        }

        window.reanudarJuegoArcade = function() {
            if (!isGameRunning || !isGamePaused) return;
            isGamePaused = false;
            resumeCountdown = 3 * 60;
            lastFrameTime = 0;
            setPauseMenuVisible(false);
            refreshStatusLine('RESUME IN 3...');
            animationId = requestAnimationFrame(loop);
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden && isGameRunning && !isGamePaused) {
                window.pausarJuegoArcade();
            }
        });

        function createBossEnemy(isMajorBoss) {
            const hp = isMajorBoss
                ? 46 + Math.floor(waveCount / 15) * 10
                : 16 + Math.floor(waveCount / 5) * 4;
            const width = isMajorBoss ? 118 : 88;
            const height = isMajorBoss ? 54 : 42;
            return {
                x: canvas.width / 2 - width / 2,
                baseY: isMajorBoss ? 42 : 46,
                yOffset: 0,
                width,
                height,
                color: isMajorBoss ? '#6D17C8' : '#8A2BE2',
                row: -2,
                hp,
                maxHp: hp,
                isBoss: true,
                isMajorBoss,
                isRedShooter: false,
                isUFO: false,
                flashTimer: 0,
                shootTimer: 0
            };
        }

        function createBossEscort(homeX, homeY, color, row, index) {
            return {
                x: homeX,
                baseY: homeY,
                homeX,
                homeY,
                escortOffsetX: homeX + 14 - canvas.width / 2,
                escortOffsetY: homeY - 42,
                yOffset: 0,
                width: 28,
                height: 21,
                color,
                row,
                isEscort: true,
                isRedShooter: false,
                isUFO: false,
                flashTimer: 0,
                diveCooldown: 80 + index * 28,
                diveProgress: 0,
                diveSeed: index * 1.3,
                diveStartX: homeX,
                diveStartY: homeY,
                diveTargetX: homeX,
                isDiving: false
            };
        }

        function addMajorBossEscorts() {
            const centerX = canvas.width / 2;
            const escortRows = [
                { y: 104, spread: 118, color: '#003080', row: 0 },
                { y: 132, spread: 82, color: '#FF69B4', row: 1 },
                { y: 160, spread: 128, color: '#FF4500', row: 2 }
            ];
            let index = 0;
            escortRows.forEach((line) => {
                [-1, 1].forEach((side) => {
                    enemies.push(createBossEscort(
                        centerX + side * line.spread - 14,
                        line.y,
                        line.color,
                        line.row,
                        index
                    ));
                    index++;
                });
            });
        }

        function createChallengeTarget(index) {
            const side = index % 2 === 0 ? -1 : 1;
            const lane = index % 6;
            const group = Math.floor(index / 6);
            return {
                x: side < 0 ? -48 - lane * 18 : canvas.width + 22 + lane * 18,
                baseY: 74 + group * 54,
                yOffset: 0,
                width: 30,
                height: 22,
                color: '#FFD32A',
                row: 0,
                isChallengeTarget: true,
                isRedShooter: false,
                isUFO: false,
                flashTimer: 0,
                state: 'challenge',
                challengeProgress: -index * 0.07,
                challengePath: index % 3,
                challengeSide: side,
                challengeSeed: index * 0.8
            };
        }

        function createChallengingStage() {
            pendingChallengeStage = false;
            challengeStage = {
                active: true,
                total: 18,
                killed: 0,
                escaped: 0
            };
            enemies = [];
            enemyBullets = [];
            powerUps = [];
            ufo = null;
            for (let i = 0; i < challengeStage.total; i++) {
                enemies.push(createChallengeTarget(i));
            }
            enemyDirection = 1;
            showWaveBanner('CHALLENGING STAGE // BONUS', '#FFD32A');
            refreshStatusLine('BONUS STAGE // HIT THE PARADE');
        }

        function createRedTractorEnemy(index, cols, enemyWidth, enemyHeight, options = {}) {
            const fromLeft = options.fromLeft ?? ((index + waveCount) % 2 === 0);
            const startX = options.startX ?? (fromLeft ? -62 - index * 18 : canvas.width + 34 + index * 18);
            const targetY = options.targetY ?? (86 + index * 38);
            return {
                x: startX,
                baseY: options.startY ?? (-32 - index * 18),
                homeX: startX,
                homeY: targetY,
                yOffset: 0,
                width: enemyWidth,
                height: enemyHeight,
                color: '#FF0000',
                row: 2,
                hp: 4,
                maxHp: 4,
                isRedShooter: true,
                isUFO: false,
                flashTimer: 0,
                state: 'hunting',
                diveCooldown: 0,
                diveProgress: 0,
                huntTargetY: targetY,
                huntSeed: index * 1.7,
                tractorCooldown: options.tractorCooldown ?? (45 + index * 35),
                tractorTimer: 0,
                tractorActive: false,
                tractorRewardReady: false
            };
        }

        function addBossRedEscorts(isMajorBoss) {
            const count = isMajorBoss ? 2 : 1;
            const enemyWidth = 30;
            const enemyHeight = 22;
            for (let i = 0; i < count; i++) {
                const side = i % 2 === 0 ? -1 : 1;
                enemies.push(createRedTractorEnemy(i, 6, enemyWidth, enemyHeight, {
                    fromLeft: side < 0,
                    startX: canvas.width / 2 + side * (isMajorBoss ? 96 : 76) - enemyWidth / 2,
                    startY: isMajorBoss ? 122 + i * 30 : 112,
                    targetY: isMajorBoss ? 104 + i * 34 : 118,
                    tractorCooldown: isMajorBoss ? 95 + i * 45 : 120
                }));
            }
        }

        function updateChallengeTarget(enemy, deltaFrames) {
            enemy.challengeProgress += deltaFrames / 140;
            if (enemy.challengeProgress < 0) return false;
            const t = enemy.challengeProgress;
            const direction = enemy.challengeSide;
            const travel = canvas.width + 96;
            enemy.x = direction < 0
                ? -46 + travel * t
                : canvas.width + 16 - travel * t;

            if (enemy.challengePath === 0) {
                enemy.baseY = 82 + Math.sin(t * Math.PI * 2 + enemy.challengeSeed) * 34;
            } else if (enemy.challengePath === 1) {
                enemy.baseY = 132 + Math.sin(t * Math.PI * 3 + enemy.challengeSeed) * 52;
            } else {
                enemy.baseY = 190 + Math.sin(t * Math.PI * 2.4 + enemy.challengeSeed) * 46;
            }
            enemy.yOffset = Math.sin(t * Math.PI * 8 + enemy.challengeSeed) * 4;

            const offscreen = direction < 0
                ? enemy.x > canvas.width + 44
                : enemy.x + enemy.width < -44;
            if (offscreen) {
                challengeStage.escaped++;
                return true;
            }
            return false;
        }

        function finishChallengingStage() {
            if (!challengeStage?.active) return;
            const perfect = challengeStage.killed === challengeStage.total;
            const bonus = perfect ? 3000 : challengeStage.killed * 80;
            if (bonus > 0) {
                score += bonus;
                actualizarScore();
                addFloatingText(`BONUS +${bonus}`, canvas.width / 2, 248, perfect ? '#FFD32A' : '#00FFFF', 24);
            }
            showWaveBanner(perfect ? 'PERFECT BONUS!' : 'BONUS CLEAR', perfect ? '#FFD32A' : '#00FFFF');
            challengeStage = null;
        }

        function crearOleada() {
            if (pendingChallengeStage) {
                createChallengingStage();
                return;
            }
            waveCount++;
            enemies = [];
            enemyBullets = [];
            ufo = null;
            particles = [];
            powerUps = [];
            const isMajorBossWave = waveCount > 1 && waveCount % 15 === 0;
            const isBossWave = waveCount > 1 && waveCount % 5 === 0;
            const isGlitchWave = !isBossWave && waveCount % 4 === 0;

            if (isBossWave) {
                enemies.push(createBossEnemy(isMajorBossWave));
                if (isMajorBossWave) addMajorBossEscorts();
                addBossRedEscorts(isMajorBossWave);
                enemySpeed += isMajorBossWave ? 0.28 : 0.2;
                enemyDirection = 1;
                showWaveBanner(
                    isMajorBossWave ? 'FULL BOSS // AKANE HAIR STORM' : 'BOSS WAVE // DEMONIO DEL ARCADE',
                    isMajorBossWave ? '#AA44FF' : '#FF69B4'
                );
                refreshStatusLine(`WAVE ${String(waveCount).padStart(2, '0')} // ${isMajorBossWave ? 'FULL BOSS' : 'BOSS'}`);
                return;
            }

            const rows = 3;
            const cols = 6;
            const enemyWidth = 30;
            const enemyHeight = 22;
            const padX = 15;
            const padY = 18;
            const offsetX = 28;
            const offsetY = 30;

            let formationType = isGlitchWave ? 4 : waveCount % 4;
            let extraEnemies = Math.min(10, Math.floor(score / 1000));
            let totalAdded = 0;

            for (let r = 0; r < rows + 3; r++) {
                for (let c = 0; c < cols; c++) {
                    let shouldAdd = true;
                    if (r < rows) {
                        if (formationType === 4) {
                            if (r === 1 && c % 2 === 0) shouldAdd = false;
                            if (r === 2 && c % 2 !== 0) shouldAdd = false;
                        } else if (formationType === 2) {
                            if ((r + c) % 2 !== 0) shouldAdd = false;
                        } else if (formationType === 3) {
                            if (r < Math.abs(c - 2.5) - 0.5) shouldAdd = false;
                        } else if (formationType === 0) {
                            if ((r === 1) && (c === 2 || c === 3)) shouldAdd = false;
                        }
                    } else {
                        if (totalAdded >= (rows * cols + extraEnemies)) shouldAdd = false;
                    }

                    if (shouldAdd && totalAdded < (rows * cols + extraEnemies)) {
                        // Color según fila: azul marino (fila 0/superior), rosa (fila 1/media), naranja (fila 2+/inferior)
                        let color;
                        if (r === 0) color = '#003080';       // Azul marino — fila superior (100pts)
                        else if (r === 1) color = '#FF69B4';  // Rosa — fila media (20pts)
                        else color = '#FF4500';               // Naranja — fila inferior (10pts)

                        const homeX = offsetX + c * (enemyWidth + padX);
                        const homeY = offsetY + r * (enemyHeight + padY);
                        const fromLeft = (c + r + waveCount) % 2 === 0;
                        enemies.push({ 
                            x: fromLeft ? -70 - c * 12 : canvas.width + 40 + c * 12,
                            baseY: -44 - r * 18,
                            homeX,
                            homeY,
                            entryStartX: fromLeft ? -70 - c * 12 : canvas.width + 40 + c * 12,
                            entryStartY: -44 - r * 18,
                            enterProgress: -totalAdded * 0.055,
                            entrySeed: (r + 1) * (c + 2),
                            state: 'entering',
                            diveCooldown: 170 + Math.random() * 230 + r * 22,
                            diveProgress: 0,
                            yOffset: 0,
                            width: enemyWidth, 
                            height: enemyHeight, 
                            color: color,
                            row: r,
                            isRedShooter: false,
                            isUFO: false,
                            flashTimer: 0,
                            isGlitch: isGlitchWave
                        });
                        totalAdded++;
                    }
                }
            }

            // Rojas cazadoras: 1-2 cada 3 oleadas para que invencibilidad no se acumule.
            if (score >= 2000 && waveCount % 3 === 0) {
                let numReds = 1 + Math.floor(Math.random() * 2); // 1 o 2
                for (let i = 0; i < numReds; i++) {
                    enemies.push(createRedTractorEnemy(i, cols, enemyWidth, enemyHeight));
                }
            }

            enemySpeed += 0.15;
            if (isGlitchWave) {
                enemySpeed += 0.22;
                showWaveBanner('GLITCH WAVE // MOVE FAST', '#00FFFF');
            } else {
                showWaveBanner(`WAVE ${String(waveCount).padStart(2, '0')}`, '#00FFFF');
            }
            if (suddenDeath) enemySpeed *= 1.2;
            enemyDirection = 1;
            refreshStatusLine(`WAVE ${String(waveCount).padStart(2, '0')} // ${isGlitchWave ? 'GLITCH' : 'READY'}`);
        }

        function spawnParticles(x, y, color, count) {
            for (let i = 0; i < count; i++) {
                let angle = (Math.PI * 2 / count) * i + (Math.random() * 0.5);
                let speed = 1.5 + Math.random() * 3;
                particles.push({
                    x: x, y: y,
                    dx: Math.cos(angle) * speed,
                    dy: Math.sin(angle) * speed,
                    color: color,
                    life: 30 + Math.floor(Math.random() * 20),
                    size: 2 + Math.random() * 3
                });
            }
        }

        function handleKeyDown(e) {
            if (e.code === 'Escape' || e.code === 'KeyP') {
                e.preventDefault();
                if (isGamePaused) window.reanudarJuegoArcade();
                else window.pausarJuegoArcade();
                return;
            }
            if (Object.prototype.hasOwnProperty.call(keys, e.code)) keys[e.code] = true;
            if (e.code === 'Space' && canShoot && canUseGameplayInput()) { disparar(); canShoot = false; }
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS', 'Space'].includes(e.code)) e.preventDefault();
        }

        function handleKeyUp(e) {
            if (Object.prototype.hasOwnProperty.call(keys, e.code)) keys[e.code] = false;
            if (e.code === 'Space') canShoot = true;
        }

        window.disparaTouch = function(e) { 
            e.preventDefault(); 
            if(canUseGameplayInput()) disparar(); 
        }

        function startMobileFire(button) {
            if (!canUseGameplayInput()) return;
            stopMobileFire();
            disparar();
            mobileFireTimer = window.setInterval(() => {
                if (!canUseGameplayInput()) {
                    stopMobileFire();
                    return;
                }
                disparar();
            }, 185);
            button?.classList.add('is-pressed');
        }

        function stopMobileFire() {
            if (mobileFireTimer) {
                window.clearInterval(mobileFireTimer);
                mobileFireTimer = null;
            }
        }

        function resetJoystick() {
            joystick.active = false;
            joystick.pointerId = null;
            joystick.x = 0;
            joystick.y = 0;
            pendingJoystickInput = null;
            const joystickEl = document.querySelector('[data-arcade-joystick]');
            const knob = joystickEl?.querySelector('.arcade-joystick-knob');
            joystickEl?.classList.remove('is-active');
            if (knob) knob.style.transform = 'translate(-50%, -50%)';
        }

        function resetPointerMove() {
            pointerMove.active = false;
            pointerMove.pointerId = null;
            pointerMove.hasTarget = false;
            pendingPointerMoveInput = null;
        }

        function clearInputRects() {
            inputRects.canvas = null;
            inputRects.joystick = null;
        }

        function getCanvasInputRect() {
            if (!inputRects.canvas) inputRects.canvas = canvas.getBoundingClientRect();
            return inputRects.canvas;
        }

        function getJoystickInputRect(joystickEl) {
            if (!inputRects.joystick) inputRects.joystick = joystickEl.getBoundingClientRect();
            return inputRects.joystick;
        }

        function cacheInputRects(joystickEl) {
            inputRects.canvas = canvas.getBoundingClientRect();
            if (joystickEl) inputRects.joystick = joystickEl.getBoundingClientRect();
        }

        function toPointerPoint(event) {
            return {
                clientX: event.clientX,
                clientY: event.clientY,
                pointerId: event.pointerId,
                pointerType: event.pointerType
            };
        }

        function scheduleInputFlush() {
            if (inputFramePending) return;
            inputFramePending = true;
            window.requestAnimationFrame(() => {
                inputFramePending = false;
                if (pendingJoystickInput) {
                    applyJoystickInput(pendingJoystickInput.point, pendingJoystickInput.joystickEl);
                    pendingJoystickInput = null;
                }
                if (pendingPointerMoveInput) {
                    applyPointerMoveTarget(pendingPointerMoveInput);
                    pendingPointerMoveInput = null;
                }
            });
        }

        function applyPointerMoveTarget(point) {
            const rect = getCanvasInputRect();
            pointerMove.x = (point.clientX - rect.left) * (canvas.width / rect.width);
            pointerMove.y = (point.clientY - rect.top) * (canvas.height / rect.height);
            pointerMove.hasTarget = true;
        }

        function updatePointerMoveTarget(event, immediate = false) {
            const point = toPointerPoint(event);
            if (immediate) {
                applyPointerMoveTarget(point);
                return;
            }
            pendingPointerMoveInput = point;
            scheduleInputFlush();
        }

        function getPointerMoveVector() {
            if (!pointerMove.hasTarget) return { x: 0, y: 0 };
            const targetX = pointerMove.x - player.width / 2;
            const targetY = pointerMove.y - player.height / 2;
            const dx = targetX - player.x;
            const dy = targetY - player.y;
            const distance = Math.hypot(dx, dy);
            if (distance < 4) return { x: 0, y: 0 };
            const response = Math.min(distance / 34, 1);
            return {
                x: (dx / distance) * response,
                y: (dy / distance) * response
            };
        }

        function applyJoystickInput(point, joystickEl) {
            const rect = getJoystickInputRect(joystickEl);
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const visualDistance = Math.min(rect.width, rect.height) * 0.34;
            const inputDistance = Math.min(rect.width, rect.height) * 0.18;
            const rawX = point.clientX - centerX;
            const rawY = point.clientY - centerY;
            const distance = Math.hypot(rawX, rawY);
            const clampedDistance = Math.min(distance, visualDistance);
            const angle = Math.atan2(rawY, rawX);
            const knobX = Math.cos(angle) * clampedDistance;
            const knobY = Math.sin(angle) * clampedDistance;
            const knob = joystickEl.querySelector('.arcade-joystick-knob');

            joystick.x = inputDistance ? Math.max(-1, Math.min(1, rawX / inputDistance)) : 0;
            joystick.y = inputDistance ? Math.max(-1, Math.min(1, rawY / inputDistance)) : 0;
            if (knob) knob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
        }

        function updateJoystickFromEvent(event, joystickEl, immediate = false) {
            const point = toPointerPoint(event);
            if (immediate) {
                applyJoystickInput(point, joystickEl);
                return;
            }
            pendingJoystickInput = { point, joystickEl };
            scheduleInputFlush();
        }

        function bindMobileControls() {
            document.querySelectorAll('[data-arcade-action]').forEach((button) => {
                const action = button.dataset.arcadeAction;

                button.addEventListener('contextmenu', (event) => event.preventDefault());

                button.addEventListener('pointerdown', (event) => {
                    event.preventDefault();
                    capturePointer(button, event.pointerId);
                    button.classList.add('is-pressed');

                    if (action === 'shoot') startMobileFire(button);
                });

                const release = (event) => {
                    event.preventDefault();
                    button.classList.remove('is-pressed');
                    if (action === 'shoot') stopMobileFire();
                };

                button.addEventListener('pointerup', release);
                button.addEventListener('pointercancel', release);
                button.addEventListener('lostpointercapture', () => {
                    button.classList.remove('is-pressed');
                    if (action === 'shoot') stopMobileFire();
                });
            });

            const joystickEl = document.querySelector('[data-arcade-joystick]');
            if (joystickEl) {
                joystickEl.addEventListener('contextmenu', (event) => event.preventDefault());
                joystickEl.addEventListener('pointerdown', (event) => {
                    if (!canUseGameplayInput()) return;
                    event.preventDefault();
                    cacheInputRects(joystickEl);
                    joystick.active = true;
                    joystick.pointerId = event.pointerId;
                    capturePointer(joystickEl, event.pointerId);
                    joystickEl.classList.add('is-active');
                    updateJoystickFromEvent(event, joystickEl, true);
                });
                joystickEl.addEventListener('pointermove', (event) => {
                    if (!joystick.active || joystick.pointerId !== event.pointerId) return;
                    event.preventDefault();
                    updateJoystickFromEvent(event, joystickEl);
                });
                joystickEl.addEventListener('pointerrawupdate', (event) => {
                    if (!joystick.active || joystick.pointerId !== event.pointerId) return;
                    event.preventDefault();
                    updateJoystickFromEvent(event, joystickEl);
                });
                const releaseJoystick = (event) => {
                    event.preventDefault();
                    resetJoystick();
                };
                joystickEl.addEventListener('pointerup', releaseJoystick);
                joystickEl.addEventListener('pointercancel', releaseJoystick);
                joystickEl.addEventListener('lostpointercapture', resetJoystick);
            }

            canvas.addEventListener('contextmenu', (event) => event.preventDefault());
            canvas.addEventListener('pointerdown', (event) => {
                if (!canUseGameplayInput() || event.pointerType === 'mouse') return;
                event.preventDefault();
                cacheInputRects(joystickEl);
                pointerMove.active = true;
                pointerMove.pointerId = event.pointerId;
                capturePointer(canvas, event.pointerId);
                updatePointerMoveTarget(event, true);
            });
            canvas.addEventListener('pointermove', (event) => {
                if (!canUseGameplayInput()) return;
                if (event.pointerType === 'mouse') {
                    updatePointerMoveTarget(event);
                    return;
                }
                if (!pointerMove.active || pointerMove.pointerId !== event.pointerId) return;
                event.preventDefault();
                updatePointerMoveTarget(event);
            });
            canvas.addEventListener('pointerrawupdate', (event) => {
                if (!canUseGameplayInput() || event.pointerType === 'mouse') return;
                if (!pointerMove.active || pointerMove.pointerId !== event.pointerId) return;
                event.preventDefault();
                updatePointerMoveTarget(event);
            });
            const releasePointerMove = (event) => {
                if (pointerMove.pointerId !== event.pointerId) return;
                event.preventDefault();
                resetPointerMove();
            };
            canvas.addEventListener('pointerup', releasePointerMove);
            canvas.addEventListener('pointercancel', releasePointerMove);
            canvas.addEventListener('pointerleave', (event) => {
                if (event.pointerType === 'mouse') resetPointerMove();
            });
            canvas.addEventListener('lostpointercapture', resetPointerMove);
            window.addEventListener('resize', clearInputRects, { passive: true });
            window.addEventListener('orientationchange', clearInputRects);
        }

        function disparar() {
            const numBullets = getShotCount();
            playShootSfx();
            let spacing = 10;
            let startX = (player.x + player.width / 2) - ((numBullets - 1) * spacing) / 2;
            for (let i = 0; i < numBullets; i++) {
                bullets.push({ 
                    x: startX + (i * spacing) - 2, 
                    y: player.y, 
                    width: 4, height: 15, speed: 7, 
                    color: powerPierceTimer > 0 ? '#AA44FF' : '#FF69B4',
                    pierce: powerPierceTimer > 0 ? 2 : 0
                });
            }
        }

        function actualizarScore() {
            window.ArcadeRecords?.record(window.ArcadeRecords.GAME_IDS.SPACE, score);
            const formattedScore = window.ArcadeRecords?.format(score) || String(score);
            document.getElementById('currentScore').innerText = `SCORE: ${formattedScore}`;
            updateNewRecordState();
            const livesContainer = document.getElementById('livesDisplay');
            livesContainer.innerHTML = '';
            // Si sudden death solo mostramos 1 corazon rojo parpadeante
            if (suddenDeath) {
                const heartImg = document.createElement('img');
                heartImg.className = 'heart-icon sudden-death-heart';
                heartImg.src = 'assets/icons/Corazon-Lleno.webp';
                heartImg.style.filter = 'hue-rotate(180deg) saturate(1.8) drop-shadow(0 0 6px #ff1b4b)';
                livesContainer.appendChild(heartImg);
            } else {
                for (let i = 0; i < 3; i++) {
                    const heartImg = document.createElement('img');
                    heartImg.className = 'heart-icon';
                    heartImg.src = (i < lives)
                        ? 'assets/icons/Corazon-Lleno.webp'
                        : 'assets/icons/corazon-vacio.webp';
                    livesContainer.appendChild(heartImg);
                }
            }
        }

        function recibirDanio(options = {}) {
            if (invulnerable || invincibleTimer > 0) return;
            if (shieldTimer > 0 && !options.bypassShield) {
                shieldTimer = 0;
                invulnerable = true;
                invulnTimer = 42;
                screenShake = 8;
                spawnParticles(player.x + player.width / 2, player.y, '#00FFFF', 14);
                addFloatingText('SHIELD SAVE', player.x + player.width / 2, player.y - 16, '#00FFFF', 18);
                refreshStatusLine();
                return;
            }
            if (suddenDeath) {
                // Sudden death: un golpe = game over
                gameOver();
                return;
            }
            lives--;
            actualizarScore();
            if (lives <= 0) {
                suddenDeath = true;
                powerUps = [];
                powerDoubleTimer = 0;
                powerSlowTimer = 0;
                powerPierceTimer = 0;
                clearTractorBeams();
                shieldTimer = 0;
                enemySpeed *= 1.2;
                playArcadeBg('bgMusicSuddenDeath');
                showWaveBanner('SUDDEN DEATH // NO MODS', '#FF4444');
            }
            // Invulnerabilidad 2 segundos (120 frames a 60fps)
            invulnerable = true;
            invulnTimer = 120;
            comboCount = 0;
            comboTimer = 0;
            screenShake = 10;
            refreshStatusLine();
        }

        function spawnPowerUp(x, y, forcedType) {
            if (suddenDeath) return;
            const config = forcedType
                ? getPowerUpConfig(forcedType)
                : POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
            if (!config) return;
            powerUps.push({
                x: x - 8,
                y: y - 8,
                width: 16,
                height: 16,
                speed: 1.35,
                type: config.type,
                label: config.label,
                color: config.color,
                spin: 0
            });
        }

        function maybeSpawnPowerUp(x, y, chance = 0.13) {
            const scaledChance = getPowerUpDropChance(chance);
            if (scaledChance > 0 && Math.random() < scaledChance) spawnPowerUp(x, y);
        }

        function clearTractorBeams() {
            enemies.forEach((enemy) => {
                if (!enemy.isRedShooter) return;
                enemy.tractorActive = false;
                enemy.tractorTimer = 0;
                enemy.tractorRewardReady = false;
                enemy.tractorCooldown = TRACTOR_BEAM_COOLDOWN_FRAMES;
            });
        }

        function startTractorBeam(enemy) {
            if (suddenDeath || challengeStage?.active || invincibleTimer > 0) return;
            enemy.tractorActive = true;
            enemy.tractorTimer = TRACTOR_BEAM_DURATION_FRAMES;
            enemy.tractorRewardReady = true;
            enemy.tractorCooldown = TRACTOR_BEAM_COOLDOWN_FRAMES;
            enemy.state = 'beaming';
            enemy.yOffset = 0;
            showWaveBanner('TRACTOR BEAM // ROMPE EL ROJO', '#FF2E6D');
            addFloatingText('TRACTOR!', player.x + player.width / 2, player.y - 20, '#FF2E6D', 18);
        }

        function updateRedHunterMovement(enemy, deltaFrames) {
            if (!enemy.isRedShooter || challengeStage?.active) return false;

            if (enemy.tractorActive) {
                updateTractorBeam(enemy, deltaFrames);
                return true;
            }

            if (invulnerable || invincibleTimer > 0) {
                enemy.tractorCooldown = Math.max(enemy.tractorCooldown || 0, 45);
            } else {
                enemy.tractorCooldown = Math.max(0, (enemy.tractorCooldown || 0) - deltaFrames);
            }

            const desiredX = player.x + player.width / 2 - enemy.width / 2;
            const desiredY = Math.max(56, player.y - 128);
            const chaseSpeed = 2.2 + Math.min(waveCount, 12) * 0.05;
            const dx = desiredX - enemy.x;
            const dy = desiredY - enemy.baseY;
            const distance = Math.hypot(dx, dy);

            if (distance > 1) {
                const step = Math.min(distance, chaseSpeed * deltaFrames);
                enemy.x += (dx / distance) * step;
                enemy.baseY += (dy / distance) * step;
            }

            enemy.yOffset = Math.sin(Date.now() / 115 + enemy.huntSeed) * 4;
            if (enemy.x < 2) enemy.x = 2;
            if (enemy.x + enemy.width > canvas.width - 2) enemy.x = canvas.width - enemy.width - 2;
            if (enemy.baseY < 42) enemy.baseY = 42;
            if (enemy.baseY > PLAYER_MIN_Y - 82) enemy.baseY = PLAYER_MIN_Y - 82;

            const aligned = Math.abs((enemy.x + enemy.width / 2) - (player.x + player.width / 2)) < 13;
            const aboveAkane = enemy.baseY + enemy.height < player.y - 48;
            if (enemy.tractorCooldown === 0 && aligned && aboveAkane) {
                startTractorBeam(enemy);
            }
            return true;
        }

        function updateTractorBeam(enemy, deltaFrames) {
            if (!enemy.isRedShooter || challengeStage?.active) return;
            if (enemy.tractorActive) {
                if (invincibleTimer > 0) {
                    enemy.tractorActive = false;
                    enemy.tractorRewardReady = false;
                    enemy.tractorTimer = 0;
                    enemy.state = 'hunting';
                    return;
                }
                enemy.tractorTimer -= deltaFrames;
                enemy.x += (player.x + player.width / 2 - (enemy.x + enemy.width / 2)) * 0.028 * deltaFrames;
                enemy.baseY += (Math.max(56, player.y - 128) - enemy.baseY) * 0.016 * deltaFrames;
                enemy.yOffset = Math.sin(Date.now() / 70 + enemy.huntSeed) * 3;
                if (enemy.tractorTimer <= 0) {
                    enemy.tractorActive = false;
                    enemy.tractorRewardReady = false;
                    enemy.tractorTimer = 0;
                    enemy.state = 'hunting';
                    spawnParticles(player.x + player.width / 2, player.y + player.height / 2, '#FF2E6D', 18);
                    addFloatingText('TRACTOR HIT', player.x + player.width / 2, player.y - 18, '#FF2E6D', 18);
                    recibirDanio({ bypassShield: true });
                }
                return;
            }
        }

        function applyPowerUp(powerUp) {
            playPowerUpSfx();
            if (powerUp.type === 'double') powerDoubleTimer = 620;
            if (powerUp.type === 'slow') powerSlowTimer = 520;
            if (powerUp.type === 'pierce') powerPierceTimer = 520;
            if (powerUp.type === 'shield') shieldTimer = SHIELD_DURATION_FRAMES;
            if (powerUp.type === 'heart' && !suddenDeath) lives = Math.min(lives + 1, 3);
            if (powerUp.type === 'invincible') {
                invincibleTimer = INVINCIBLE_DURATION_FRAMES;
                invulnerable = false;
                invulnTimer = 0;
                clearTractorBeams();
            }

            actualizarScore();
            refreshStatusLine(`${powerUp.label} GET!`);
            addFloatingText(powerUp.label, player.x + player.width / 2, player.y - 22, powerUp.color, 20);
            spawnParticles(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, powerUp.color, 16);
        }

        function registerKill(enemy, pts, x, y) {
            comboCount = comboTimer > 0 ? comboCount + 1 : 1;
            comboTimer = 150;
            const comboBonus = comboCount > 1 ? Math.min(comboCount * 5, 80) : 0;
            score += pts + comboBonus;
            actualizarScore();
            addFloatingText(`+${pts + comboBonus}`, x, y, enemy.color || '#FFFFFF', 16);
            if (comboCount > 1) {
                addFloatingText(`COMBO x${comboCount}`, x, y - 15, '#00FFFF', 18);
            }
            screenShake = Math.min(10, 3 + comboCount);
            refreshStatusLine();
        }

        function updateEscortMovement(enemy, index, deltaFrames, time) {
            const majorBoss = enemies.find((item) => item.isMajorBoss);
            if (majorBoss && !enemy.isDiving) {
                enemy.homeX = majorBoss.x + majorBoss.width / 2 + enemy.escortOffsetX - enemy.width / 2;
                enemy.homeY = majorBoss.baseY + enemy.escortOffsetY;
            }

            if (!enemy.isDiving) {
                enemy.diveCooldown -= deltaFrames;
                if (enemy.diveCooldown <= 0) {
                    enemy.isDiving = true;
                    enemy.diveProgress = 0;
                    enemy.diveStartX = enemy.x;
                    enemy.diveStartY = enemy.baseY;
                    enemy.diveTargetX = player.x + player.width / 2 - enemy.width / 2;
                }
            }

            if (enemy.isDiving) {
                enemy.diveProgress += deltaFrames / 105;
                const t = Math.min(enemy.diveProgress, 1);
                const arc = Math.sin(t * Math.PI);
                enemy.x = enemy.diveStartX + (enemy.diveTargetX - enemy.diveStartX) * t +
                    Math.sin(t * Math.PI * 4 + enemy.diveSeed) * 34 * arc;
                enemy.baseY = enemy.diveStartY + arc * 315;
                enemy.yOffset = Math.sin(t * Math.PI * 5) * 8;

                if (t >= 1) {
                    enemy.isDiving = false;
                    enemy.x = enemy.homeX;
                    enemy.baseY = enemy.homeY;
                    enemy.yOffset = 0;
                    enemy.diveCooldown = 170 + Math.random() * 130;
                }
            } else {
                enemy.x = enemy.homeX + Math.sin(time + enemy.diveSeed) * 10;
                enemy.baseY = enemy.homeY + Math.cos(time * 1.2 + enemy.diveSeed) * 6;
                enemy.yOffset = Math.sin(time * 1.8 + index) * 5;
            }

            if (enemy.x < 2) enemy.x = 2;
            if (enemy.x + enemy.width > canvas.width - 2) enemy.x = canvas.width - enemy.width - 2;
        }

        function startEnemyDive(enemy) {
            enemy.state = 'diving';
            enemy.diveProgress = 0;
            enemy.diveStartX = enemy.x;
            enemy.diveStartY = enemy.baseY;
            enemy.diveTargetX = player.x + player.width / 2 - enemy.width / 2;
            enemy.returnX = enemy.homeX ?? enemy.x;
            enemy.returnY = enemy.homeY ?? enemy.baseY;
        }

        function updateGalagaEnemyMovement(enemy, index, deltaFrames, time) {
            if (enemy.isBoss || enemy.isEscort || enemy.isUFO) return false;
            if (enemy.isRedShooter) return updateRedHunterMovement(enemy, deltaFrames);

            if (enemy.state === 'entering') {
                enemy.enterProgress += deltaFrames / 78;
                if (enemy.enterProgress < 0) return true;
                const t = Math.min(enemy.enterProgress, 1);
                const ease = 1 - Math.pow(1 - t, 3);
                const sway = Math.sin(t * Math.PI * 2 + enemy.entrySeed) * 38 * (1 - t);
                enemy.x = enemy.entryStartX + (enemy.homeX - enemy.entryStartX) * ease + sway;
                enemy.baseY = enemy.entryStartY + (enemy.homeY - enemy.entryStartY) * ease;
                enemy.yOffset = Math.sin(t * Math.PI + enemy.entrySeed) * 10 * (1 - t);
                if (t >= 1) {
                    enemy.state = 'formation';
                    enemy.x = enemy.homeX;
                    enemy.baseY = enemy.homeY;
                    enemy.yOffset = 0;
                }
                return true;
            }

            if (enemy.state === 'diving') {
                enemy.diveProgress += deltaFrames / (enemy.isRedShooter ? 78 : 96);
                const t = Math.min(enemy.diveProgress, 1);
                const arc = Math.sin(t * Math.PI);
                const sideCurve = Math.sin(t * Math.PI * (enemy.row === 1 ? 4 : 3) + enemy.entrySeed) * (enemy.row === 0 ? 46 : 32) * arc;
                enemy.x = enemy.diveStartX + (enemy.diveTargetX - enemy.diveStartX) * t + sideCurve;
                enemy.baseY = enemy.diveStartY + arc * (enemy.row === 0 ? 330 : 290);
                enemy.yOffset = Math.sin(t * Math.PI * 5) * 7;
                if (t >= 1) {
                    enemy.state = 'returning';
                    enemy.diveProgress = 0;
                    enemy.returnStartX = enemy.x;
                    enemy.returnStartY = enemy.baseY;
                }
                return true;
            }

            if (enemy.state === 'returning') {
                enemy.diveProgress += deltaFrames / 58;
                const t = Math.min(enemy.diveProgress, 1);
                const ease = 1 - Math.pow(1 - t, 2);
                enemy.x = enemy.returnStartX + ((enemy.homeX ?? enemy.returnX) - enemy.returnStartX) * ease;
                enemy.baseY = enemy.returnStartY + ((enemy.homeY ?? enemy.returnY) - enemy.returnStartY) * ease;
                enemy.yOffset = Math.sin(t * Math.PI) * -18;
                if (t >= 1) {
                    enemy.state = 'formation';
                    enemy.x = enemy.homeX ?? enemy.returnX;
                    enemy.baseY = enemy.homeY ?? enemy.returnY;
                    enemy.yOffset = 0;
                    enemy.diveCooldown = 170 + Math.random() * 260;
                }
                return true;
            }

            if (enemy.state === 'formation') {
                enemy.homeX = enemy.x;
                enemy.homeY = enemy.baseY;
                enemy.diveCooldown -= deltaFrames * (waveCount >= 4 ? 1.2 : 1);
                if (waveCount >= 2 && enemy.diveCooldown <= 0 && Math.random() < 0.018) {
                    startEnemyDive(enemy);
                    return true;
                }
            }

            return false;
        }

        function update(deltaFrames) {
            const enemySpeedFactor = powerSlowTimer > 0 ? 0.55 : 1;
            const playerSpeedFactor = getTractorSlowFactor();

            let moveX = 0;
            let moveY = 0;
            if (joystick.active) {
                moveX = joystick.x;
                moveY = joystick.y;
            } else if (pointerMove.hasTarget) {
                const pointerVector = getPointerMoveVector();
                moveX = pointerVector.x;
                moveY = pointerVector.y;
            } else {
                if (keys.ArrowLeft || keys.KeyA) moveX -= 1;
                if (keys.ArrowRight || keys.KeyD) moveX += 1;
                if (keys.ArrowUp || keys.KeyW) moveY -= 1;
                if (keys.ArrowDown || keys.KeyS) moveY += 1;
            }
            const moveLength = Math.hypot(moveX, moveY);
            if (moveLength > 1) {
                moveX /= moveLength;
                moveY /= moveLength;
            }

            player.dx = moveX * player.speed * playerSpeedFactor;
            player.dy = moveY * player.speed * playerSpeedFactor;
            player.x += player.dx * deltaFrames;
            player.y += player.dy * deltaFrames;
            if (player.x < 0) player.x = 0;
            if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
            if (player.y < PLAYER_MIN_Y) player.y = PLAYER_MIN_Y;
            if (player.y + player.height > canvas.height - 8) player.y = canvas.height - player.height - 8;

            // Invulnerabilidad
            if (invulnerable) {
                invulnTimer -= deltaFrames;
                if (invulnTimer <= 0) invulnerable = false;
            }

            if (shieldTimer > 0) shieldTimer = Math.max(0, shieldTimer - deltaFrames);
            if (powerDoubleTimer > 0) powerDoubleTimer = Math.max(0, powerDoubleTimer - deltaFrames);
            if (powerSlowTimer > 0) powerSlowTimer = Math.max(0, powerSlowTimer - deltaFrames);
            if (powerPierceTimer > 0) powerPierceTimer = Math.max(0, powerPierceTimer - deltaFrames);
            if (invincibleTimer > 0) invincibleTimer = Math.max(0, invincibleTimer - deltaFrames);
            if (comboTimer > 0) {
                comboTimer = Math.max(0, comboTimer - deltaFrames);
                if (comboTimer === 0) comboCount = 0;
            }
            if (waveBanner) {
                waveBanner.life -= deltaFrames;
                if (waveBanner.life <= 0) waveBanner = null;
            }
            if (screenShake > 0) screenShake = Math.max(0, screenShake - deltaFrames);

            // Balas del jugador
            for (let i = bullets.length - 1; i >= 0; i--) {
                bullets[i].y -= bullets[i].speed * deltaFrames;
                if (bullets[i].y < 0) bullets.splice(i, 1);
            }

            // UFO: spawn periódico
            if (!challengeStage?.active) {
                ufoTimer += deltaFrames;
                let ufoInterval = score >= 2000 ? 420 : 600; // aparece más seguido con puntuación alta
                if (!ufo && ufoTimer >= ufoInterval) {
                    ufoTimer = 0;
                    ufo = { x: -40, y: 18, width: 38, height: 16, speed: 2.2, color: '#FFD700', isUFO: true, row: -1, isRedShooter: false, flashTimer: 0, baseY: 18, yOffset: 0 };
                }
            }
            if (ufo) {
                ufo.x += ufo.speed * deltaFrames;
                if (ufo.x > canvas.width + 50) ufo = null;
            }

            // Disparo de enemigos rojos Y naranjas
            for (let i = 0; i < enemies.length; i++) {
                let enemy = enemies[i];
                if (enemy.isBoss) {
                    enemy.shootTimer += deltaFrames;
                    if (enemy.shootTimer >= (enemy.isMajorBoss ? 54 : 62)) {
                        enemy.shootTimer = 0;
                        const offsets = enemy.isMajorBoss ? [-32, -12, 12, 32] : [-18, 0, 18];
                        offsets.forEach((offset) => {
                            enemyBullets.push({
                                x: enemy.x + enemy.width / 2 + offset - 2,
                                y: getEnemyY(enemy) + enemy.height,
                                width: 4,
                                height: enemy.isMajorBoss ? 13 : 11,
                                speed: enemy.isMajorBoss ? 3.5 : 3.2,
                                color: '#AA44FF'
                            });
                        });
                    }
                }
                if (enemy.isEscort && chancePerFrame(enemy.isDiving ? 0.008 : 0.003, deltaFrames)) {
                    let realY = enemy.baseY + enemy.yOffset;
                    enemyBullets.push({
                        x: enemy.x + enemy.width / 2 - 2,
                        y: realY + enemy.height,
                        width: 4,
                        height: 9,
                        speed: enemy.isDiving ? 4.5 : 3.5,
                        color: enemy.color
                    });
                }
                if (enemy.state === 'diving' && chancePerFrame(0.006, deltaFrames)) {
                    let realY = enemy.baseY + enemy.yOffset;
                    enemyBullets.push({
                        x: enemy.x + enemy.width / 2 - 2,
                        y: realY + enemy.height,
                        width: 4,
                        height: 9,
                        speed: 4.2,
                        color: enemy.color
                    });
                }
                // Rojos: disparan más seguido desde 2000 pts
                if (enemy.isRedShooter && score >= 2000 && chancePerFrame(0.004, deltaFrames)) {
                    let realY = enemy.baseY + enemy.yOffset;
                    enemyBullets.push({
                        x: enemy.x + enemy.width / 2 - 2,
                        y: realY + enemy.height,
                        width: 4, height: 10, speed: 4, color: '#FF4444'
                    });
                }
                // Naranjas (fila inferior, row>=2): disparan esporádicamente siempre
                if (!enemy.isRedShooter && enemy.row >= 2 && chancePerFrame(0.002, deltaFrames)) {
                    let realY = enemy.baseY + enemy.yOffset;
                    enemyBullets.push({
                        x: enemy.x + enemy.width / 2 - 2,
                        y: realY + enemy.height,
                        width: 3, height: 8, speed: 3, color: '#FF8C00'
                    });
                }
                if (enemy.flashTimer > 0) enemy.flashTimer -= deltaFrames;
            }

            // Power-ups
            const playerBox = { x: player.x - 8, y: player.y - 6, width: player.width + 16, height: player.height + 16 };
            for (let i = powerUps.length - 1; i >= 0; i--) {
                const powerUp = powerUps[i];
                powerUp.y += powerUp.speed * deltaFrames;
                powerUp.spin += 0.12 * deltaFrames;
                if (powerUp.y > canvas.height + 20) {
                    powerUps.splice(i, 1);
                    continue;
                }
                if (overlap(powerUp, playerBox)) {
                    applyPowerUp(powerUp);
                    powerUps.splice(i, 1);
                }
            }

            // Balas enemigas vs Jugador
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                let bullet = enemyBullets[i];
                bullet.y += bullet.speed * deltaFrames;
                if (bullet.y > canvas.height) {
                    enemyBullets.splice(i, 1); continue;
                }
                // Colisión con el jugador
                if (!isPlayerProtected() &&
                    bullet.x < player.x + player.width && bullet.x + bullet.width > player.x &&
                    bullet.y < player.y + player.height && bullet.y + bullet.height > player.y) {
                    enemyBullets.splice(i, 1);
                    spawnParticles(player.x + player.width/2, player.y, '#8A2BE2', 8);
                    recibirDanio();
                }
            }

            // Movimiento de invasores
            let hitEdge = false;
            let time = Date.now() / 200;
            let isChaosMode = score >= 1000;

            if (edgeCooldown > 0) edgeCooldown = Math.max(0, edgeCooldown - deltaFrames);

            for (let i = 0; i < enemies.length; i++) {
                let enemy = enemies[i];
                if (enemy.isChallengeTarget) {
                    if (updateChallengeTarget(enemy, deltaFrames)) {
                        enemies.splice(i, 1);
                        i--;
                    }
                    continue;
                }
                if (enemy.isEscort) {
                    updateEscortMovement(enemy, i, deltaFrames, time);
                    if (enemy.isDiving && !isPlayerProtected() && overlap({
                        x: enemy.x,
                        y: getEnemyY(enemy),
                        width: enemy.width,
                        height: enemy.height
                    }, player)) {
                        spawnParticles(enemy.x + enemy.width / 2, getEnemyY(enemy) + enemy.height / 2, enemy.color, 18);
                        enemies.splice(i, 1);
                        i--;
                        recibirDanio();
                        if (!isGameRunning) return;
                    }
                    continue;
                }

                if (updateGalagaEnemyMovement(enemy, i, deltaFrames, time)) {
                    if (enemy.state === 'diving' && !isPlayerProtected() && overlap({
                        x: enemy.x,
                        y: getEnemyY(enemy),
                        width: enemy.width,
                        height: enemy.height
                    }, player)) {
                        spawnParticles(enemy.x + enemy.width / 2, getEnemyY(enemy) + enemy.height / 2, enemy.color, 16);
                        enemies.splice(i, 1);
                        i--;
                        recibirDanio();
                        if (!isGameRunning) return;
                    }
                    continue;
                }

                enemy.x += enemySpeed * enemyDirection * deltaFrames * enemySpeedFactor;
                enemy.yOffset = isChaosMode || enemy.isGlitch
                    ? Math.sin(time + i * (enemy.isBoss ? 0.3 : 0.7)) * (enemy.isBoss ? 8 : 12)
                    : 0;
                // Solo permitimos detectar un nuevo "toque de borde" si el cooldown
                // ya expiró; esto evita que el overshoot del frame anterior
                // dispare una segunda inversión consecutiva (causaba el "tirón").
                if (edgeCooldown === 0 && (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width)) {
                    hitEdge = true;
                }
            }

            if (hitEdge) {
                enemyDirection *= -1;
                edgeCooldown = 12; // ~0.2s a 60fps: tiempo mínimo antes de poder invertir de nuevo
                for (let i = 0; i < enemies.length; i++) {
                    if (enemies[i].isEscort) continue;
                    // Clamp: corrige el overshoot para que ninguna nave quede
                    // fuera de los límites del canvas tras la inversión
                    if (enemies[i].x < 0) enemies[i].x = 0;
                    if (enemies[i].x + enemies[i].width > canvas.width) enemies[i].x = canvas.width - enemies[i].width;
                    enemies[i].baseY += enemies[i].isBoss ? 10 : 18;
                    if (enemies[i].baseY + enemies[i].yOffset + enemies[i].height >= player.y) {
                        spawnParticles(enemies[i].x + enemies[i].width / 2, getEnemyY(enemies[i]) + enemies[i].height / 2, enemies[i].color, 16);
                        enemies.splice(i, 1);
                        recibirDanio();
                        return;
                    }
                }
            }

            // Colisiones: balas del jugador vs enemigos + UFO
            for (let bi = bullets.length - 1; bi >= 0; bi--) {
                let bullet = bullets[bi];
                let hit = false;

                // Chequear UFO
                if (ufo) {
                    if (bullet.x < ufo.x + ufo.width && bullet.x + bullet.width > ufo.x &&
                        bullet.y < ufo.y + ufo.height && bullet.y + bullet.height > ufo.y) {
                        spawnParticles(ufo.x + ufo.width/2, ufo.y + ufo.height/2, '#FFD700', 16);
                        registerKill(ufo, 500, ufo.x + ufo.width / 2, ufo.y + ufo.height / 2);
                        maybeSpawnPowerUp(ufo.x + ufo.width / 2, ufo.y + ufo.height / 2, 0.45);
                        ufo = null;
                        if (bullet.pierce > 0) bullet.pierce--;
                        else bullets.splice(bi, 1);
                        hit = true;
                    }
                }
                if (hit) continue;

                for (let ei = enemies.length - 1; ei >= 0; ei--) {
                    let enemy = enemies[ei];
                    let realY = enemy.baseY + enemy.yOffset;
                    if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x &&
                        bullet.y < realY + enemy.height && bullet.y + bullet.height > realY) {
                        
                        let pts = puntajeEnemigo(enemy);
                        const hitX = enemy.x + enemy.width / 2;
                        const hitY = enemy.baseY + enemy.yOffset + enemy.height / 2;

                        if (bullet.pierce > 0) bullet.pierce--;
                        else bullets.splice(bi, 1);

                        if (enemy.isChallengeTarget) {
                            challengeStage.killed++;
                            registerKill(enemy, pts, hitX, hitY);
                            spawnParticles(hitX, hitY, '#FFD32A', 16);
                            enemies.splice(ei, 1);
                            hit = true;
                            break;
                        }

                        if (enemy.isRedShooter) {
                            enemy.hp = Math.max(0, (enemy.hp || 1) - 1);
                            enemy.flashTimer = 8;
                            spawnParticles(hitX, hitY, '#FF2E6D', 6);
                            addFloatingText(`${enemy.hp}/${enemy.maxHp || 4}`, hitX, hitY - 10, '#FF2E6D', 13);
                            if (enemy.hp > 0) {
                                hit = true;
                                break;
                            }
                        }

                        if (enemy.isBoss) {
                            enemy.hp--;
                            enemy.flashTimer = 8;
                            spawnParticles(hitX, hitY, '#AA44FF', 5);
                            addFloatingText('HIT', hitX, hitY - 10, '#AA44FF', 14);
                            if (enemy.hp > 0) {
                                hit = true;
                                break;
                            }
                            registerKill(enemy, pts, hitX, hitY);
                            if (enemy.isMajorBoss) pendingChallengeStage = true;
                            spawnParticles(hitX, hitY, '#FF69B4', 34);
                            spawnPowerUp(hitX - 20, hitY, 'shield');
                            spawnPowerUp(hitX + 20, hitY, 'double');
                            enemies.splice(ei, 1);
                            hit = true;
                            break;
                        }
                        registerKill(enemy, pts, hitX, hitY);
                        let handledPowerDrop = false;

                        // Si es nave roja: explotar a los enemigos cercanos
                        if (enemy.isRedShooter) {
                            let cx = enemy.x + enemy.width / 2;
                            let cy = enemy.baseY + enemy.yOffset + enemy.height / 2;
                            spawnParticles(cx, cy, '#FF0000', 20);
                            if (enemy.tractorRewardReady && enemy.tractorTimer > 0) {
                                spawnPowerUp(cx, cy, 'invincible');
                                addFloatingText('INVINCIBLE DROP', cx, cy - 18, '#FFD32A', 16);
                                handledPowerDrop = true;
                            }
                            // Radio de explosión: matar/dañar a enemigos a 60px
                            for (let k = enemies.length - 1; k >= 0; k--) {
                                if (k === ei) continue;
                                let other = enemies[k];
                                let ocx = other.x + other.width / 2;
                                let ocy = other.baseY + other.yOffset + other.height / 2;
                                let dist = Math.sqrt((cx-ocx)**2 + (cy-ocy)**2);
                                if (!other.isBoss && !other.isRedShooter && dist < 65) {
                                    registerKill(other, puntajeEnemigo(other), ocx, ocy);
                                    spawnParticles(ocx, ocy, other.color, 8);
                                    maybeSpawnPowerUp(ocx, ocy, 0.08);
                                    enemies.splice(k, 1);
                                    if (k < ei) ei--;
                                }
                            }
                        } else {
                            spawnParticles(enemy.x + enemy.width/2, enemy.baseY + enemy.yOffset + enemy.height/2, enemy.color, 8);
                        }
                        if (!handledPowerDrop) maybeSpawnPowerUp(hitX, hitY, enemy.isGlitch ? 0.22 : 0.12);
                        enemies.splice(ei, 1);
                        hit = true;
                        break;
                    }
                }
            }

            // Actualizar partículas
            for (let i = particles.length - 1; i >= 0; i--) {
                let p = particles[i];
                p.x += p.dx * deltaFrames;
                p.y += p.dy * deltaFrames;
                p.dy += 0.1 * deltaFrames; // gravedad suave
                p.life -= deltaFrames;
                if (p.life <= 0) particles.splice(i, 1);
            }

            for (let i = floatingTexts.length - 1; i >= 0; i--) {
                const item = floatingTexts[i];
                item.y += item.dy * deltaFrames;
                item.life -= deltaFrames;
                if (item.life <= 0) floatingTexts.splice(i, 1);
            }

            for (let i = 0; i < stars.length; i++) {
                const star = stars[i];
                star.y += star.speed * deltaFrames * (powerSlowTimer > 0 ? 0.45 : 1);
                if (star.y > canvas.height) {
                    star.y = -4;
                    star.x = Math.random() * canvas.width;
                }
            }

            if (enemies.length === 0) {
                if (challengeStage?.active) finishChallengingStage();
                if (isGameRunning) crearOleada();
            }
            refreshStatusLine();
        }

        function getEnemySpriteKey(enemy) {
            if (enemy.isChallengeTarget) return 'challengeTarget';
            if (enemy.isBoss) return enemy.isMajorBoss ? 'bossFullAnxiety' : 'bossMiniAnxiety';
            if (enemy.isRedShooter) return 'enemyRed';
            if (enemy.row === 0) return 'enemyBlue';
            if (enemy.row === 1) return 'enemyPink';
            return 'enemyOrange';
        }

        function drawBossHpBar(enemy, ex, ey, w) {
            const hpRatio = Math.max(enemy.hp, 0) / enemy.maxHp;
            ctx.fillStyle = 'rgba(0,0,0,0.72)';
            ctx.fillRect(ex, ey - 10, w, 5);
            ctx.fillStyle = '#FF69B4';
            ctx.fillRect(ex, ey - 10, w * hpRatio, 5);
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.strokeRect(ex + 0.5, ey - 9.5, w - 1, 4);
        }

        function drawEnemy(ctx, enemy) {
            const ex = Math.floor(enemy.x);
            const ey = Math.floor(enemy.baseY + enemy.yOffset);
            const w = enemy.width;
            const h = enemy.height;
            const key = getEnemySpriteKey(enemy);

            if (enemy.isBoss) {
                const frames = key.includes('Anxiety') ? 4 : 1;
                const frame = Math.floor(Date.now() / 135) % frames;
                const spriteW = enemy.isMajorBoss ? w + 66 : w + 44;
                const spriteH = enemy.isMajorBoss ? h + 56 : h + 34;
                const spriteX = ex + w / 2 - spriteW / 2;
                const spriteY = ey + h / 2 - spriteH / 2 - (enemy.isMajorBoss ? 8 : 5);

                if (drawSprite(key, spriteX, spriteY, spriteW, spriteH, { frames, frame })) {
                    if (enemy.flashTimer > 0 && enemy.flashTimer % 4 < 2) {
                        ctx.fillStyle = 'rgba(255,255,255,0.45)';
                        ctx.fillRect(spriteX, spriteY, spriteW, spriteH);
                    }
                    drawBossHpBar(enemy, ex, ey, w);
                    return;
                }
            } else {
                const spriteW = enemy.isRedShooter ? 38 : (enemy.isEscort ? 34 : 36);
                const spriteH = enemy.isRedShooter ? 36 : (enemy.isEscort ? 30 : 30);
                const spriteX = ex + w / 2 - spriteW / 2;
                const spriteY = ey + h / 2 - spriteH / 2;
                if (drawSprite(key, spriteX, spriteY, spriteW, spriteH)) {
                    if (enemy.flashTimer > 0 && enemy.flashTimer % 4 < 2) {
                        ctx.fillStyle = 'rgba(255,255,255,0.5)';
                        ctx.fillRect(spriteX, spriteY, spriteW, spriteH);
                    }
                    if (enemy.isRedShooter && enemy.maxHp > 1) {
                        const hpY = spriteY - 5;
                        ctx.fillStyle = 'rgba(0,0,0,0.65)';
                        ctx.fillRect(spriteX + 4, hpY, spriteW - 8, 3);
                        ctx.fillStyle = '#FF2E6D';
                        ctx.fillRect(spriteX + 4, hpY, (spriteW - 8) * Math.max(enemy.hp, 0) / enemy.maxHp, 3);
                    }
                    return;
                }
            }

            drawEnemyFallback(ctx, enemy);
        }

        // Dibuja una nave enemiga pixel-art según su tipo
        function drawEnemyFallback(ctx, enemy) {
            let ex = Math.floor(enemy.x);
            let ey = Math.floor(enemy.baseY + enemy.yOffset);
            let w = enemy.width;
            let h = enemy.height;
            let c = (enemy.flashTimer > 0 && enemy.flashTimer % 4 < 2) ? '#FFFFFF' : enemy.color;
            let cx = ex + w/2;

            if (enemy.isBoss) {
                const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 120);
                ctx.fillStyle = `rgba(138, 43, 226, ${0.18 + pulse * 0.14})`;
                ctx.beginPath();
                ctx.ellipse(cx, ey + h / 2, w * 0.62, h * 0.72, 0, 0, Math.PI * 2);
                ctx.fill();

                const tailWidth = enemy.isMajorBoss ? 14 : 10;
                const tailHeight = enemy.isMajorBoss ? h - 12 : h - 15;
                ctx.fillStyle = '#2A083F';
                ctx.fillRect(ex, ey + 8, tailWidth + 3, tailHeight + 3);
                ctx.fillRect(ex + w - tailWidth - 3, ey + 8, tailWidth + 3, tailHeight + 3);
                ctx.fillStyle = enemy.isMajorBoss ? '#C047FF' : '#AA44FF';
                ctx.fillRect(ex + 2, ey + 6, tailWidth, tailHeight);
                ctx.fillRect(ex + w - tailWidth - 2, ey + 6, tailWidth, tailHeight);
                ctx.fillStyle = '#5E1AA8';
                ctx.fillRect(ex + 2, ey + 6 + tailHeight - 7, tailWidth, 7);
                ctx.fillRect(ex + w - tailWidth - 2, ey + 6 + tailHeight - 7, tailWidth, 7);

                ctx.fillStyle = c;
                ctx.fillRect(ex + 16, ey + 12, w - 32, h - 12);
                ctx.fillRect(ex + 7, ey + 20, 14, 13);
                ctx.fillRect(ex + w - 21, ey + 20, 14, 13);
                ctx.beginPath();
                ctx.moveTo(cx, ey);
                ctx.lineTo(ex + w - 14, ey + 16);
                ctx.lineTo(ex + 14, ey + 16);
                ctx.closePath();
                ctx.fill();

                ctx.font = `bold ${enemy.isMajorBoss ? 18 : 15}px VT323, monospace`;
                ctx.textAlign = 'center';
                ctx.fillStyle = '#00B7FF';
                ctx.shadowColor = '#00B7FF';
                ctx.shadowBlur = 8;
                ctx.fillText('>///<', cx, ey + (enemy.isMajorBoss ? 34 : 31));
                ctx.shadowBlur = 0;
                ctx.textAlign = 'left';

                const hpRatio = Math.max(enemy.hp, 0) / enemy.maxHp;
                ctx.fillStyle = 'rgba(0,0,0,0.72)';
                ctx.fillRect(ex, ey - 10, w, 5);
                ctx.fillStyle = '#FF69B4';
                ctx.fillRect(ex, ey - 10, w * hpRatio, 5);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1;
                ctx.strokeRect(ex + 0.5, ey - 9.5, w - 1, 4);
            } else if (enemy.isRedShooter) {
                // Nave roja: forma de diamante agresivo con llama
                ctx.fillStyle = c;
                // Cuerpo central
                ctx.beginPath();
                ctx.moveTo(cx, ey);
                ctx.lineTo(ex + w - 4, ey + h * 0.55);
                ctx.lineTo(cx, ey + h);
                ctx.lineTo(ex + 4, ey + h * 0.55);
                ctx.closePath();
                ctx.fill();
                // Alas laterales
                ctx.fillStyle = '#CC0000';
                ctx.fillRect(ex, ey + h*0.3, 6, 8);
                ctx.fillRect(ex + w - 6, ey + h*0.3, 6, 8);
                // Ojo central brillante
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(cx - 3, ey + h*0.35, 6, 5);
            } else if (enemy.row === 0) {
                // Nave superior: azul marino, forma de caza espacial con dos alas
                ctx.fillStyle = c;
                // Cuerpo
                ctx.fillRect(cx - 5, ey + 2, 10, h - 4);
                // Nariz puntiaguda
                ctx.beginPath();
                ctx.moveTo(cx, ey);
                ctx.lineTo(cx - 5, ey + 5);
                ctx.lineTo(cx + 5, ey + 5);
                ctx.closePath();
                ctx.fill();
                // Alas
                ctx.fillRect(ex, ey + h * 0.3, w * 0.35, 6);
                ctx.fillRect(ex + w * 0.65, ey + h * 0.3, w * 0.35, 6);
                // Cabina
                ctx.fillStyle = '#00AAFF';
                ctx.fillRect(cx - 3, ey + 5, 6, 5);
                // Motor trasero
                ctx.fillStyle = '#001850';
                ctx.fillRect(cx - 4, ey + h - 5, 8, 5);
            } else if (enemy.row === 1) {
                // Nave media: rosa, forma redondeada con antenas
                ctx.fillStyle = c;
                // Cuerpo elipsoide
                ctx.beginPath();
                ctx.ellipse(cx, ey + h*0.6, w*0.42, h*0.38, 0, 0, Math.PI*2);
                ctx.fill();
                // Cúpula
                ctx.fillStyle = '#FF99CC';
                ctx.beginPath();
                ctx.ellipse(cx, ey + h*0.38, w*0.25, h*0.28, 0, 0, Math.PI*2);
                ctx.fill();
                // Antenas
                ctx.fillStyle = '#FF69B4';
                ctx.fillRect(cx - 8, ey, 2, 6);
                ctx.fillRect(cx + 6, ey, 2, 6);
                ctx.fillRect(cx - 9, ey - 2, 4, 3);
                ctx.fillRect(cx + 5, ey - 2, 4, 3);
                // Ojos/luces
                ctx.fillStyle = '#FFF';
                ctx.fillRect(cx - 6, ey + h*0.52, 4, 4);
                ctx.fillRect(cx + 2, ey + h*0.52, 4, 4);
            } else {
                // Nave inferior: naranja, estilo cangrejo/invasor clásico reinterpretado
                ctx.fillStyle = c;
                // Cuerpo
                ctx.fillRect(ex + 4, ey + 4, w - 8, h - 6);
                // Cabeza abombada
                ctx.beginPath();
                ctx.arc(cx, ey + 6, w*0.3, Math.PI, 0);
                ctx.fill();
                // Patas/propulsores bajos
                ctx.fillRect(ex, ey + h - 7, 7, 7);
                ctx.fillRect(ex + w - 7, ey + h - 7, 7, 7);
                // Ojos
                ctx.fillStyle = '#FFAA00';
                ctx.fillRect(cx - 7, ey + 6, 5, 5);
                ctx.fillRect(cx + 2, ey + 6, 5, 5);
                // Boca
                ctx.fillStyle = '#CC3300';
                ctx.fillRect(cx - 4, ey + h - 9, 8, 3);
            }
        }

        function drawArcadeBackground() {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach((star) => {
                ctx.fillStyle = star.color;
                ctx.globalAlpha = 0.5 + Math.sin((Date.now() / 300) + star.x) * 0.2;
                ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
            });
            ctx.globalAlpha = 1;

            const gridOffset = (Date.now() / 45) % 28;
            ctx.strokeStyle = 'rgba(138, 43, 226, 0.12)';
            ctx.lineWidth = 1;
            for (let y = 90 + gridOffset; y < canvas.height; y += 28) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
            for (let x = 20; x < canvas.width; x += 36) {
                ctx.beginPath();
                ctx.moveTo(x, 100);
                ctx.lineTo(x + 34, canvas.height);
                ctx.stroke();
            }

            const glow = 0.25 + 0.14 * Math.sin(Date.now() / 500);
            ctx.fillStyle = `rgba(0, 255, 255, ${glow})`;
            ctx.fillRect(0, canvas.height - 3, canvas.width, 1);

            ctx.strokeStyle = `rgba(0, 255, 255, ${0.08 + glow * 0.12})`;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.moveTo(18, PLAYER_MIN_Y - 8);
            ctx.lineTo(canvas.width - 18, PLAYER_MIN_Y - 8);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        function drawPowerUp(powerUp) {
            const px = Math.floor(powerUp.x);
            const py = Math.floor(powerUp.y);
            const bob = Math.sin(powerUp.spin) * 2;
            const spriteKey = POWERUP_SPRITES[powerUp.type];
            const visualSize = 26;
            if (drawSprite(
                spriteKey,
                px + powerUp.width / 2 - visualSize / 2,
                py + bob + powerUp.height / 2 - visualSize / 2,
                visualSize,
                visualSize
            )) {
                return;
            }

            ctx.fillStyle = 'rgba(0,0,0,0.66)';
            ctx.fillRect(px - 2, py + bob - 2, powerUp.width + 4, powerUp.height + 4);
            ctx.strokeStyle = powerUp.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(px - 2.5, py + bob - 2.5, powerUp.width + 5, powerUp.height + 5);
            ctx.fillStyle = powerUp.color;
            ctx.fillRect(px + 3, py + bob + 3, 10, 10);
            ctx.fillStyle = '#05000a';
            ctx.font = 'bold 10px VT323, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(powerUp.label[0], px + 8, py + bob + 12);
            ctx.textAlign = 'left';
        }

        function drawFloatingTexts() {
            floatingTexts.forEach((item) => {
                ctx.globalAlpha = Math.max(item.life / 75, 0);
                ctx.font = `bold ${item.size}px VT323, monospace`;
                ctx.textAlign = 'center';
                ctx.fillStyle = item.color;
                ctx.shadowColor = item.color;
                ctx.shadowBlur = 8;
                ctx.fillText(item.text, item.x, item.y);
                ctx.shadowBlur = 0;
            });
            ctx.globalAlpha = 1;
            ctx.textAlign = 'left';
        }

        function drawWaveBanner() {
            if (!waveBanner) return;
            const alpha = Math.min(1, waveBanner.life / 35);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
            ctx.fillRect(28, 216, canvas.width - 56, 42);
            ctx.strokeStyle = waveBanner.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(31, 219, canvas.width - 62, 36);
            ctx.font = 'bold 23px VT323, monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = waveBanner.color;
            ctx.shadowColor = waveBanner.color;
            ctx.shadowBlur = 10;
            ctx.fillText(waveBanner.text, canvas.width / 2, 244);
            ctx.shadowBlur = 0;
            ctx.textAlign = 'left';
            ctx.globalAlpha = 1;
        }

        function drawTractorBeams() {
            enemies.forEach((enemy) => {
                if (!enemy.isRedShooter || !enemy.tractorActive || enemy.tractorTimer <= 0) return;
                const ex = enemy.x + enemy.width / 2;
                const ey = getEnemyY(enemy) + enemy.height;
                const px = player.x + player.width / 2;
                const py = player.y + player.height / 2;
                const progress = 1 - enemy.tractorTimer / TRACTOR_BEAM_DURATION_FRAMES;
                const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 70);
                const beamWidth = 26 + pulse * 10 + progress * 10;
                const frame = Math.floor(Date.now() / 90) % 4;

                ctx.save();
                ctx.globalAlpha = 0.58 + pulse * 0.22;
                ctx.fillStyle = 'rgba(255, 46, 93, 0.28)';
                ctx.beginPath();
                ctx.moveTo(ex - 8, ey);
                ctx.lineTo(ex + 8, ey);
                ctx.lineTo(px + beamWidth / 2, py + 11);
                ctx.lineTo(px - beamWidth / 2, py + 11);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = '#FF2E6D';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo(ex, ey);
                ctx.lineTo(px, py);
                ctx.stroke();
                ctx.setLineDash([]);

                drawSprite(
                    'tractorBeam',
                    px - beamWidth / 2,
                    ey,
                    beamWidth,
                    Math.max(38, py - ey + 16),
                    { frames: 4, frame, alpha: 0.72 }
                );
                ctx.restore();
            });
        }

        function draw() {
            ctx.save();
            if (screenShake > 0) {
                const shakeX = (Math.random() - 0.5) * screenShake;
                const shakeY = (Math.random() - 0.5) * screenShake;
                ctx.translate(shakeX, shakeY);
            }

            drawArcadeBackground();

            // --- SUDDEN DEATH: fondo rojo pulsante ---
            if (suddenDeath) {
                let alpha = 0.08 + 0.06 * Math.sin(Date.now() / 150);
                ctx.fillStyle = `rgba(255,0,0,${alpha})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Texto SUDDEN DEATH arriba
                ctx.font = 'bold 20px VT323, monospace';
                ctx.fillStyle = `rgba(255, 50, 50, ${0.7 + 0.3 * Math.sin(Date.now()/200)})`;
                ctx.textAlign = 'center';
                ctx.fillText('⚠ SUDDEN DEATH ⚠', canvas.width / 2, 20);
                ctx.textAlign = 'left';
            }

            // --- UFO ---
            if (ufo) {
                let glow = 0.5 + 0.5 * Math.sin(Date.now() / 100);
                ctx.fillStyle = `rgba(255, 215, 0, ${0.3 + glow * 0.3})`;
                ctx.fillRect(ufo.x - 8, ufo.y + 2, ufo.width + 16, ufo.height + 7);
                const ufoVisualW = 58;
                const ufoVisualH = 36;
                if (!drawSprite(
                    'ufoGold',
                    ufo.x + ufo.width / 2 - ufoVisualW / 2,
                    ufo.y + ufo.height / 2 - ufoVisualH / 2,
                    ufoVisualW,
                    ufoVisualH
                )) {
                    // Cuerpo
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.ellipse(ufo.x + ufo.width/2, ufo.y + ufo.height*0.65, ufo.width*0.5, ufo.height*0.35, 0, 0, Math.PI*2);
                    ctx.fill();
                    // Cúpula
                    ctx.fillStyle = '#FFFAAA';
                    ctx.beginPath();
                    ctx.ellipse(ufo.x + ufo.width/2, ufo.y + ufo.height*0.35, ufo.width*0.22, ufo.height*0.3, 0, 0, Math.PI*2);
                    ctx.fill();
                }
            }

            drawTractorBeams();

            // --- NAVE DE AKANE ---
            let drawPlayer = invincibleTimer > 0 || !invulnerable || (Math.floor(invulnTimer / 5) % 2 === 0);
            if (drawPlayer) {
                if (suddenDeath) {
                    const dangerPulse = 0.5 + 0.5 * Math.sin(Date.now() / 95);
                    ctx.strokeStyle = `rgba(255, 28, 76, ${0.55 + dangerPulse * 0.35})`;
                    ctx.lineWidth = 2;
                    ctx.shadowColor = '#FF1B4B';
                    ctx.shadowBlur = 16;
                    ctx.strokeRect(player.x - 13 - dangerPulse * 3, player.y - 12 - dangerPulse * 3, player.width + 26 + dangerPulse * 6, player.height + 25 + dangerPulse * 6);
                    ctx.shadowBlur = 0;
                }

                if (invincibleTimer > 0) {
                    const invPulse = 0.5 + 0.5 * Math.sin(Date.now() / 85);
                    ctx.shadowColor = '#FFD32A';
                    ctx.shadowBlur = 18;
                    const auraW = 62 + invPulse * 4;
                    const auraH = 44 + invPulse * 3;
                    if (!drawSprite(
                        'invincibleAura',
                        player.x + player.width / 2 - auraW / 2,
                        player.y + player.height / 2 - auraH / 2 + 2,
                        auraW,
                        auraH,
                        { alpha: 0.86 + invPulse * 0.12 }
                    )) {
                        ctx.strokeStyle = `rgba(255, 211, 42, ${0.62 + invPulse * 0.28})`;
                        ctx.lineWidth = 2;
                        ctx.strokeRect(player.x - 15 - invPulse * 3, player.y - 13 - invPulse * 2, player.width + 30 + invPulse * 6, player.height + 27 + invPulse * 4);
                        ctx.fillStyle = `rgba(255, 211, 42, ${0.08 + invPulse * 0.08})`;
                        ctx.fillRect(player.x - 12, player.y - 10, player.width + 24, player.height + 22);
                    }
                    ctx.shadowBlur = 0;
                }

                if (shieldTimer > 0) {
                    const radiusPulse = 1.5 + Math.sin(Date.now() / 110) * 1.5;
                    const shieldW = 74 + radiusPulse * 2;
                    const shieldH = 55 + radiusPulse * 2;
                    ctx.shadowColor = '#00FFFF';
                    ctx.shadowBlur = 12;
                    if (!drawSprite(
                        'shieldRing',
                        player.x + player.width / 2 - shieldW / 2,
                        player.y + player.height / 2 - shieldH / 2,
                        shieldW,
                        shieldH
                    )) {
                        ctx.strokeStyle = '#00FFFF';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(player.x - 10 - radiusPulse, player.y - 8 - radiusPulse, player.width + 20 + radiusPulse * 2, player.height + 18 + radiusPulse * 2);
                    }
                    ctx.shadowBlur = 0;
                }

                const playerVisualW = 54;
                const playerVisualH = 40;
                const playerSpriteDrawn = drawSprite(
                    'akaneShip',
                    player.x + player.width / 2 - playerVisualW / 2,
                    player.y + player.height / 2 - playerVisualH / 2 + 2,
                    playerVisualW,
                    playerVisualH
                );

                if (!playerSpriteDrawn) {
                    ctx.fillStyle = player.color;
                    // Cuerpo principal
                    ctx.fillRect(player.x + 5, player.y + 4, player.width - 10, player.height - 4);
                    // Nariz
                    ctx.beginPath();
                    ctx.moveTo(player.x + player.width/2, player.y);
                    ctx.lineTo(player.x + player.width/2 - 7, player.y + 8);
                    ctx.lineTo(player.x + player.width/2 + 7, player.y + 8);
                    ctx.closePath();
                    ctx.fill();
                    // Alas
                    ctx.fillRect(player.x, player.y + 6, 7, player.height - 4);
                    ctx.fillRect(player.x + player.width - 7, player.y + 6, 7, player.height - 4);
                    // "Coletas" laterales
                    ctx.fillStyle = '#AA44FF';
                    ctx.fillRect(player.x - 8, player.y + 6, 8, 8);
                    ctx.fillRect(player.x + player.width, player.y + 6, 8, 8);
                    // Cabina
                    ctx.fillStyle = '#DDB0FF';
                    ctx.fillRect(player.x + player.width/2 - 4, player.y + 4, 8, 5);
                }

                // Cañones según nivel de disparo
                let numBullets = getShotCount();
                ctx.fillStyle = '#FFF';
                if (numBullets === 1) {
                    ctx.fillRect(player.x + player.width/2 - 3, player.y - 4, 6, 5);
                } else if (numBullets === 2) {
                    ctx.fillRect(player.x + 6, player.y - 4, 5, 5);
                    ctx.fillRect(player.x + player.width - 11, player.y - 4, 5, 5);
                } else if (numBullets === 3) {
                    ctx.fillRect(player.x + 3, player.y - 4, 4, 5);
                    ctx.fillRect(player.x + player.width/2 - 3, player.y - 4, 6, 5);
                    ctx.fillRect(player.x + player.width - 7, player.y - 4, 4, 5);
                } else {
                    ctx.fillRect(player.x, player.y - 4, 4, 5);
                    ctx.fillRect(player.x + 10, player.y - 4, 4, 5);
                    ctx.fillRect(player.x + player.width - 14, player.y - 4, 4, 5);
                    ctx.fillRect(player.x + player.width - 4, player.y - 4, 4, 5);
                }
            }

            // --- BALAS DEL JUGADOR ---
            bullets.forEach(bullet => {
                const bulletKey = bullet.pierce > 0 ? 'bulletPierce' : 'bulletPlayer';
                if (!drawSprite(bulletKey, bullet.x - 3, bullet.y - 2, 10, 20)) {
                    ctx.fillStyle = bullet.color;
                    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                }
            });

            // --- BALAS ENEMIGAS ---
            enemyBullets.forEach(bullet => {
                const bulletKey = bullet.color === '#AA44FF' ? 'bulletEnemyPurple' : 'bulletEnemyOrange';
                if (!drawSprite(bulletKey, bullet.x - 2, bullet.y - 2, 8, 16)) {
                    ctx.fillStyle = bullet.color;
                    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                }
            });

            // --- POWER-UPS ---
            powerUps.forEach(drawPowerUp);

            // --- ENEMIGOS ---
            enemies.forEach(enemy => drawEnemy(ctx, enemy));

            // --- PARTÍCULAS ---
            particles.forEach(p => {
                ctx.globalAlpha = p.life / 50;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
            });
            ctx.globalAlpha = 1;

            drawFloatingTexts();
            drawWaveBanner();
            ctx.restore();
        }

        function drawResumeCountdown() {
            if (resumeCountdown <= 0) return;
            const seconds = Math.max(1, Math.ceil(resumeCountdown / 60));
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 3;
            ctx.strokeRect(82, 198, canvas.width - 164, 98);
            ctx.font = 'bold 24px VT323, monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#DDB9FF';
            ctx.shadowColor = '#8A2BE2';
            ctx.shadowBlur = 12;
            ctx.fillText('PREPARATE', canvas.width / 2, 232);
            ctx.font = 'bold 48px VT323, monospace';
            ctx.fillStyle = '#00FFFF';
            ctx.shadowColor = '#00FFFF';
            ctx.fillText(String(seconds), canvas.width / 2, 272);
            ctx.shadowBlur = 0;
            ctx.textAlign = 'left';
            ctx.restore();
        }

        function loop(timestamp) {
            if (!isGameRunning) return;
            if (!lastFrameTime) lastFrameTime = timestamp;
            const elapsed = timestamp - lastFrameTime;
            if (elapsed < FRAME_MS - 0.5) {
                animationId = requestAnimationFrame(loop);
                return;
            }
            const deltaFrames = Math.min(elapsed / FRAME_MS, MAX_FRAME_DELTA);
            lastFrameTime = timestamp;

            if (isGamePaused) {
                draw();
                animationId = null;
                return;
            }

            if (resumeCountdown > 0) {
                resumeCountdown = Math.max(0, resumeCountdown - (deltaFrames || 1));
                draw();
                drawResumeCountdown();
                if (resumeCountdown === 0) {
                    lastFrameTime = 0;
                    refreshStatusLine();
                }
                animationId = requestAnimationFrame(loop);
                return;
            }

            update(deltaFrames || 1);
            draw();
            animationId = requestAnimationFrame(loop);
        }
        })();
