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
        const FRAME_MS = 1000 / 60;
        const MAX_FRAME_DELTA = 2.4;
        const SHOOT_SFX_POOL_SIZE = 5;
        const SHOOT_SFX_MIN_INTERVAL = 38;
        const SHOOT_SFX_BASE_VOLUME = 0.2;
        const AKANE_MAX_SCORE = 590990;
        const shootSfxPool = [];
        let shootSfxIndex = 0;
        let lastShootSfxTime = 0;

        function chancePerFrame(baseChance, deltaFrames) {
            return Math.random() < Math.min(baseChance * deltaFrames, 0.95);
        }

        const localArcadeAudio = {
            _current: null,
            _volume: 0.45,
            setVolume(value) {
                this._volume = value;
                ['bgMusicArcade', 'bgMusicSuddenDeath', 'bgMusicGameOver'].forEach((id) => {
                    const el = document.getElementById(id);
                    if (el) el.volume = Math.min(value * (id === 'bgMusicArcade' ? 1.35 : 1.1), 1);
                });
            },
            playBg(id) {
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
                next.play().catch(() => {});
            },
            stopAll() {
                ['bgMusicArcade', 'bgMusicSuddenDeath', 'bgMusicGameOver'].forEach((id) => {
                    const el = document.getElementById(id);
                    if (el) el.pause();
                });
            }
        };

        function playArcadeBg(id) {
            if (window.AudioManager) {
                window.AudioManager.playBg(id);
            } else {
                localArcadeAudio.playBg(id);
            }
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
        let shieldTimer = 0;
        let powerDoubleTimer = 0;
        let powerSlowTimer = 0;
        let powerPierceTimer = 0;
        const POINT_SHOT_STEP = 2000;
        const MAX_POINT_SHOTS = 2;
        const SHIELD_DURATION_FRAMES = 20 * 60;
        const PLAYER_MIN_Y = 318;
        const POWERUP_TYPES = [
            { type: 'double', label: 'DOUBLE', color: '#FF69B4' },
            { type: 'shield', label: 'SHIELD', color: '#00FFFF' },
            { type: 'slow', label: 'SLOW', color: '#FFD700' },
            { type: 'pierce', label: 'PIERCE', color: '#AA44FF' },
            { type: 'heart', label: 'HEART', color: '#00FF99' }
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
        const joystick = { active: false, pointerId: null, x: 0, y: 0 };

        // Puntos por fila: fila 0 (superior)=100, fila 1 (media)=20, fila 2+ (inferior)=10
        function puntajeEnemigo(enemy) {
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
            if (shieldTimer > 0) active.push(`SHIELD ${Math.ceil(shieldTimer / 60)}s`);
            if (comboCount > 1 && comboTimer > 0) active.push(`COMBO x${comboCount}`);
            statusLine.innerText = message || `WAVE ${String(Math.max(waveCount, 1)).padStart(2, '0')} // ${active.length ? active.join(' // ') : 'READY'}`;
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
            if(screen === 'start') screenStart.classList.add('active');
            if(screen === 'game') screenGame.classList.add('active');
            if(screen === 'over') screenOver.classList.add('active');
            if(screen === 'win') screenWin.classList.add('active');
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
            Object.keys(keys).forEach((key) => { keys[key] = false; });
            canShoot = true;
            resetJoystick();
            document.querySelectorAll('[data-arcade-action].is-pressed').forEach((button) => {
                button.classList.remove('is-pressed');
            });
        }

        function gameOver() {
            detenerJuego();
            playArcadeBg('bgMusicGameOver');
            document.getElementById('finalScoreText').innerText = `PUNTUACIÓN FINAL: ${score}`;
            showScreen('over');
        }

        function gameWin() {
            score = Math.max(score, AKANE_MAX_SCORE);
            actualizarScore();
            detenerJuego();
            playArcadeBg('bgMusicGameOver');
            showScreen('win');
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
            shieldTimer = 0;
            powerDoubleTimer = 0;
            powerSlowTimer = 0;
            powerPierceTimer = 0;
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

        function crearOleada() {
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

            // Agregar 1-2 naves rojas especiales si score >= 2000
            if (score >= 2000) {
                let numReds = 1 + Math.floor(Math.random() * 2); // 1 o 2
                for (let i = 0; i < numReds; i++) {
                    let col = Math.floor(Math.random() * cols);
                    let rowR = rows - 1;
                        enemies.push({
                            x: offsetX + col * (enemyWidth + padX),
                            baseY: offsetY + rowR * (enemyHeight + padY) + (i * (enemyHeight + padY)),
                            homeX: offsetX + col * (enemyWidth + padX),
                            homeY: offsetY + rowR * (enemyHeight + padY) + (i * (enemyHeight + padY)),
                            yOffset: 0,
                            width: enemyWidth,
                            height: enemyHeight,
                        color: '#FF0000',
                            row: rowR,
                            isRedShooter: true,
                            isUFO: false,
                            flashTimer: 0,
                            state: 'formation',
                            diveCooldown: 120 + Math.random() * 160,
                            diveProgress: 0
                        });
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
            if (Object.prototype.hasOwnProperty.call(keys, e.code)) keys[e.code] = true;
            if (e.code === 'Space' && canShoot) { disparar(); canShoot = false; }
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS', 'Space'].includes(e.code)) e.preventDefault();
        }

        function handleKeyUp(e) {
            if (Object.prototype.hasOwnProperty.call(keys, e.code)) keys[e.code] = false;
            if (e.code === 'Space') canShoot = true;
        }

        window.disparaTouch = function(e) { 
            e.preventDefault(); 
            if(isGameRunning) disparar(); 
        }

        function resetJoystick() {
            joystick.active = false;
            joystick.pointerId = null;
            joystick.x = 0;
            joystick.y = 0;
            const joystickEl = document.querySelector('[data-arcade-joystick]');
            const knob = joystickEl?.querySelector('.arcade-joystick-knob');
            joystickEl?.classList.remove('is-active');
            if (knob) knob.style.transform = 'translate(-50%, -50%)';
        }

        function updateJoystickFromEvent(event, joystickEl) {
            const rect = joystickEl.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const maxDistance = Math.min(rect.width, rect.height) * 0.34;
            const rawX = event.clientX - centerX;
            const rawY = event.clientY - centerY;
            const distance = Math.hypot(rawX, rawY);
            const clampedDistance = Math.min(distance, maxDistance);
            const angle = Math.atan2(rawY, rawX);
            const knobX = Math.cos(angle) * clampedDistance;
            const knobY = Math.sin(angle) * clampedDistance;
            const knob = joystickEl.querySelector('.arcade-joystick-knob');

            joystick.x = maxDistance ? knobX / maxDistance : 0;
            joystick.y = maxDistance ? knobY / maxDistance : 0;
            if (distance < 7) {
                joystick.x = 0;
                joystick.y = 0;
            }
            if (knob) knob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
        }

        function bindMobileControls() {
            document.querySelectorAll('[data-arcade-action]').forEach((button) => {
                const action = button.dataset.arcadeAction;

                button.addEventListener('contextmenu', (event) => event.preventDefault());

                button.addEventListener('pointerdown', (event) => {
                    event.preventDefault();
                    button.setPointerCapture?.(event.pointerId);
                    button.classList.add('is-pressed');

                    if (action === 'shoot' && isGameRunning) disparar();
                });

                const release = (event) => {
                    event.preventDefault();
                    button.classList.remove('is-pressed');
                };

                button.addEventListener('pointerup', release);
                button.addEventListener('pointercancel', release);
                button.addEventListener('lostpointercapture', () => {
                    button.classList.remove('is-pressed');
                });
            });

            const joystickEl = document.querySelector('[data-arcade-joystick]');
            if (joystickEl) {
                joystickEl.addEventListener('contextmenu', (event) => event.preventDefault());
                joystickEl.addEventListener('pointerdown', (event) => {
                    event.preventDefault();
                    joystick.active = true;
                    joystick.pointerId = event.pointerId;
                    joystickEl.setPointerCapture?.(event.pointerId);
                    joystickEl.classList.add('is-active');
                    updateJoystickFromEvent(event, joystickEl);
                });
                joystickEl.addEventListener('pointermove', (event) => {
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
            document.getElementById('currentScore').innerText = `SCORE: ${score}`;
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

        function recibirDanio() {
            if (invulnerable) return;
            if (shieldTimer > 0) {
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
                ? POWERUP_TYPES.find((item) => item.type === forcedType)
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

        function applyPowerUp(powerUp) {
            if (powerUp.type === 'double') powerDoubleTimer = 620;
            if (powerUp.type === 'slow') powerSlowTimer = 520;
            if (powerUp.type === 'pierce') powerPierceTimer = 520;
            if (powerUp.type === 'shield') shieldTimer = SHIELD_DURATION_FRAMES;
            if (powerUp.type === 'heart' && !suddenDeath) lives = Math.min(lives + 1, 3);

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
            if (score >= AKANE_MAX_SCORE) {
                gameWin();
                return;
            }
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

            let moveX = joystick.x;
            let moveY = joystick.y;
            if (keys.ArrowLeft || keys.KeyA) moveX -= 1;
            if (keys.ArrowRight || keys.KeyD) moveX += 1;
            if (keys.ArrowUp || keys.KeyW) moveY -= 1;
            if (keys.ArrowDown || keys.KeyS) moveY += 1;
            const moveLength = Math.hypot(moveX, moveY);
            if (moveLength > 1) {
                moveX /= moveLength;
                moveY /= moveLength;
            }

            player.dx = moveX * player.speed;
            player.dy = moveY * player.speed;
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
            ufoTimer += deltaFrames;
            let ufoInterval = score >= 2000 ? 420 : 600; // aparece más seguido con puntuación alta
            if (!ufo && ufoTimer >= ufoInterval) {
                ufoTimer = 0;
                ufo = { x: -40, y: 18, width: 38, height: 16, speed: 2.2, color: '#FFD700', isUFO: true, row: -1, isRedShooter: false, flashTimer: 0, baseY: 18, yOffset: 0 };
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
                if (!invulnerable &&
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
                if (enemy.isEscort) {
                    updateEscortMovement(enemy, i, deltaFrames, time);
                    if (enemy.isDiving && !invulnerable && overlap({
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
                    if (enemy.state === 'diving' && !invulnerable && overlap({
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
                            spawnParticles(hitX, hitY, '#FF69B4', 34);
                            spawnPowerUp(hitX - 20, hitY, 'shield');
                            spawnPowerUp(hitX + 20, hitY, 'double');
                            enemies.splice(ei, 1);
                            hit = true;
                            break;
                        }
                        registerKill(enemy, pts, hitX, hitY);

                        // Si es nave roja: explotar a los enemigos cercanos
                        if (enemy.isRedShooter) {
                            let cx = enemy.x + enemy.width / 2;
                            let cy = enemy.baseY + enemy.yOffset + enemy.height / 2;
                            spawnParticles(cx, cy, '#FF0000', 20);
                            // Radio de explosión: matar/dañar a enemigos a 60px
                            for (let k = enemies.length - 1; k >= 0; k--) {
                                if (k === ei) continue;
                                let other = enemies[k];
                                let ocx = other.x + other.width / 2;
                                let ocy = other.baseY + other.yOffset + other.height / 2;
                                let dist = Math.sqrt((cx-ocx)**2 + (cy-ocy)**2);
                                if (!other.isBoss && dist < 65) {
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
                        maybeSpawnPowerUp(hitX, hitY, enemy.isGlitch ? 0.22 : 0.12);
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

            if (enemies.length === 0) { crearOleada(); }
            refreshStatusLine();
        }

        // Dibuja una nave enemiga pixel-art según su tipo
        function drawEnemy(ctx, enemy) {
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
                ctx.beginPath();
                ctx.ellipse(ufo.x + ufo.width/2, ufo.y + ufo.height/2, ufo.width*0.6, ufo.height*0.8, 0, 0, Math.PI*2);
                ctx.fill();
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
                // Luces
                ctx.fillStyle = '#FF0000';
                ctx.beginPath(); ctx.arc(ufo.x + 8, ufo.y + ufo.height*0.65, 2, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#00FF00';
                ctx.beginPath(); ctx.arc(ufo.x + ufo.width - 8, ufo.y + ufo.height*0.65, 2, 0, Math.PI*2); ctx.fill();
            }

            // --- NAVE DE AKANE ---
            let drawPlayer = !invulnerable || (Math.floor(invulnTimer / 5) % 2 === 0);
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

                if (shieldTimer > 0) {
                    const radiusPulse = 1.5 + Math.sin(Date.now() / 110) * 1.5;
                    ctx.strokeStyle = '#00FFFF';
                    ctx.lineWidth = 2;
                    ctx.shadowColor = '#00FFFF';
                    ctx.shadowBlur = 12;
                    ctx.strokeRect(player.x - 10 - radiusPulse, player.y - 8 - radiusPulse, player.width + 20 + radiusPulse * 2, player.height + 18 + radiusPulse * 2);
                    ctx.shadowBlur = 0;
                }

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
                ctx.fillStyle = bullet.color;
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            });

            // --- BALAS ENEMIGAS ---
            enemyBullets.forEach(bullet => {
                ctx.fillStyle = bullet.color;
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
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

        function loop(timestamp) {
            if (!isGameRunning) return;
            if (!lastFrameTime) lastFrameTime = timestamp;
            const deltaFrames = Math.min((timestamp - lastFrameTime) / FRAME_MS, MAX_FRAME_DELTA);
            lastFrameTime = timestamp;

            update(deltaFrames || 1);
            draw();
            animationId = requestAnimationFrame(loop);
        }
        })();
