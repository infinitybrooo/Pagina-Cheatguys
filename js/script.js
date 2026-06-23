        // --- SISTEMA DEL MINIJUEGO ARCADE ---
        (function () {
        const arcadeContainer = document.getElementById('arcadeContainer');
        const screenStart = document.getElementById('arcadeStartScreen');
        const screenGame = document.getElementById('arcadeGameScreen');
        const screenOver = document.getElementById('arcadeGameOverScreen');
        const canvas = document.getElementById('spaceInvadersCanvas');

        if (!arcadeContainer || !screenStart || !screenGame || !screenOver || !canvas) {
            window.iniciarSecuenciaArcade = function() {
                window.location.href = 'minijuego.html';
            };
            return;
        }

        const ctx = canvas.getContext('2d');

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
            if (typeof AudioManager !== 'undefined') {
                AudioManager.playBg(id);
            } else {
                localArcadeAudio.playBg(id);
            }
        }

        function exitArcadeAudio() {
            if (typeof AudioManager !== 'undefined') {
                AudioManager.resumeLobby();
            } else {
                localArcadeAudio.stopAll();
            }
        }

        function runArcadeLoading(callback) {
            if (typeof showLoadingScreen !== 'undefined' && document.getElementById('globalLoader')) {
                showLoadingScreen(callback);
            } else {
                callback();
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            const arcadeVolume = document.getElementById('arcadeVolumeSlider');
            if (arcadeVolume) {
                localArcadeAudio.setVolume(parseFloat(arcadeVolume.value));
                arcadeVolume.addEventListener('input', (event) => {
                    localArcadeAudio.setVolume(parseFloat(event.target.value));
                });
            }

            if (document.body.classList.contains('arcade-page')) {
                arcadeContainer.style.display = 'flex';
                showScreen('start');
            }
        });

        let animationId;
        let isGameRunning = false;
        let score = 0;
        let powerLevel = 1; 
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

        // Nave de Akane
        const player = { x: 180, y: 460, width: 40, height: 15, speed: 5, color: '#8A2BE2', dx: 0 };
        let bullets = [];
        let enemyBullets = [];
        let enemies = [];
        let barricadas = [];
        let enemyDirection = 1;
        let enemySpeed = 0.5;
        let edgeCooldown = 0; // evita doble-inversión de dirección en frames consecutivos
        
        const keys = { ArrowLeft: false, ArrowRight: false, Space: false };
        let canShoot = true; 
        let touchLeft = false;
        let touchRight = false;

        // Puntos por fila: fila 0 (superior)=100, fila 1 (media)=20, fila 2+ (inferior)=10
        function puntajeEnemigo(enemy) {
            if (enemy.isUFO) return 500;
            if (enemy.isRedShooter) return 150;
            if (enemy.row === 0) return 100;
            if (enemy.row === 1) return 20;
            return 10;
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
            if(screen === 'start') screenStart.classList.add('active');
            if(screen === 'game') screenGame.classList.add('active');
            if(screen === 'over') screenOver.classList.add('active');
        }

        function iniciarJuegoArcade() {
            showScreen('game');
            resetGameData();
            crearOleada();
            playArcadeBg('bgMusicArcade');
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);
            isGameRunning = true;
            loop();
        }
        window.iniciarJuegoArcade = iniciarJuegoArcade;

        function detenerJuego() {
            isGameRunning = false;
            cancelAnimationFrame(animationId);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            keys.ArrowLeft = false; keys.ArrowRight = false; keys.Space = false;
            touchLeft = false; touchRight = false;
        }

        function gameOver() {
            detenerJuego();
            playArcadeBg('bgMusicGameOver');
            document.getElementById('finalScoreText').innerText = `PUNTUACIÓN FINAL: ${score}`;
            showScreen('over');
        }

        function resetGameData() {
            score = 0;
            powerLevel = 1;
            waveCount = 0;
            lives = 3;
            suddenDeath = false;
            invulnerable = false;
            invulnTimer = 0;
            ufo = null;
            ufoTimer = 0;
            particles = [];
            actualizarScore();
            player.x = canvas.width / 2 - player.width / 2;
            bullets = [];
            enemyBullets = [];
            enemies = [];
            barricadas = crearBarricadas();
            enemySpeed = 0.5;
            edgeCooldown = 0;
        }

        function crearOleada() {
            waveCount++;
            enemies = [];
            enemyBullets = [];
            ufo = null;
            particles = [];
            const rows = 3;
            const cols = 6;
            const enemyWidth = 30;
            const enemyHeight = 22;
            const padX = 15;
            const padY = 18;
            const offsetX = 28;
            const offsetY = 30;

            let formationType = waveCount % 4;
            let extraEnemies = Math.min(10, Math.floor(score / 1000));
            let totalAdded = 0;

            for (let r = 0; r < rows + 3; r++) {
                for (let c = 0; c < cols; c++) {
                    let shouldAdd = true;
                    if (r < rows) {
                        if (formationType === 2) {
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

                        enemies.push({ 
                            x: offsetX + c * (enemyWidth + padX), 
                            baseY: offsetY + r * (enemyHeight + padY),
                            yOffset: 0,
                            width: enemyWidth, 
                            height: enemyHeight, 
                            color: color,
                            row: r,
                            isRedShooter: false,
                            isUFO: false,
                            flashTimer: 0
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
                        yOffset: 0,
                        width: enemyWidth,
                        height: enemyHeight,
                        color: '#FF0000',
                        row: rowR,
                        isRedShooter: true,
                        isUFO: false,
                        flashTimer: 0
                    });
                }
            }

            enemySpeed += 0.15;
            if (suddenDeath) enemySpeed *= 1.2;
            enemyDirection = 1;
        }

        // --- BARRICADAS ---
        function crearBarricadas() {
            const numBarricadas = 4;
            const bW = 48; const bH = 32;
            const bY = canvas.height - 85;
            const totalW = numBarricadas * bW + (numBarricadas - 1) * 18;
            const startX = (canvas.width - totalW) / 2;
            const result = [];
            for (let i = 0; i < numBarricadas; i++) {
                let bx = startX + i * (bW + 18);
                // Cada barricada tiene una cuadrícula de bloques 6x4
                let bloques = [];
                const cols = 6; const rows = 4;
                const blkW = Math.floor(bW / cols);
                const blkH = Math.floor(bH / rows);
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        // Recorte de esquinas para forma arqueada
                        if ((r === 0 && (c === 0 || c === cols-1)) ||
                            (r === rows-1 && (c === 0 || c === cols-1))) continue;
                        bloques.push({
                            x: bx + c * blkW,
                            y: bY + r * blkH,
                            w: blkW - 1,
                            h: blkH - 1,
                            hp: 3   // 3 impactos para destruir
                        });
                    }
                }
                result.push(bloques);
            }
            return result.flat(); // Un array plano de bloques
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
            if (e.code === 'ArrowLeft') keys.ArrowLeft = true;
            if (e.code === 'ArrowRight') keys.ArrowRight = true;
            if (e.code === 'Space' && canShoot) { disparar(); canShoot = false; }
            if (['ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
        }

        function handleKeyUp(e) {
            if (e.code === 'ArrowLeft') keys.ArrowLeft = false;
            if (e.code === 'ArrowRight') keys.ArrowRight = false;
            if (e.code === 'Space') canShoot = true;
        }

        window.mueveI = function(estado) { touchLeft = estado; }
        window.mueveD = function(estado) { touchRight = estado; }
        window.disparaTouch = function(e) { 
            e.preventDefault(); 
            if(isGameRunning) disparar(); 
        }

        function disparar() {
            // Power extra: 1 cañón base, +1 por cada 2000 puntos
            let numBullets = 1 + Math.floor(score / 2000);
            if (numBullets > 4) numBullets = 4;
            // En sudden death volvemos a 1 cañón
            if (suddenDeath) numBullets = 1;
            let spacing = 10;
            let startX = (player.x + player.width / 2) - ((numBullets - 1) * spacing) / 2;
            for (let i = 0; i < numBullets; i++) {
                bullets.push({ 
                    x: startX + (i * spacing) - 2, 
                    y: player.y, 
                    width: 4, height: 15, speed: 7, 
                    color: '#FF69B4' 
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
                heartImg.className = 'heart-icon';
                heartImg.src = 'assets/Corazon-Lleno.webp';
                heartImg.style.filter = 'hue-rotate(180deg) drop-shadow(0 0 4px red)';
                livesContainer.appendChild(heartImg);
            } else {
                for (let i = 0; i < 3; i++) {
                    const heartImg = document.createElement('img');
                    heartImg.className = 'heart-icon';
                    heartImg.src = (i < lives)
                        ? 'assets/Corazon-Lleno.webp'
                        : 'assets/corazon-vacio.webp';
                    livesContainer.appendChild(heartImg);
                }
            }
        }

        function recibirDanio() {
            if (invulnerable) return;
            if (suddenDeath) {
                // Sudden death: un golpe = game over
                gameOver();
                return;
            }
            lives--;
            actualizarScore();
            if (lives <= 0) {
                // Si tenemos más de 1 cañón activamos sudden death
                let cañonesActuales = 1 + Math.floor(score / 2000);
                if (cañonesActuales > 4) cañonesActuales = 4;
                if (cañonesActuales > 1) {
                    // Activar sudden death: reemplaza música del arcade
                    suddenDeath = true;
                    enemySpeed *= 1.2;
                    playArcadeBg('bgMusicSuddenDeath');
                } else {
                    gameOver();
                    return;
                }
            }
            // Invulnerabilidad 2 segundos (120 frames a 60fps)
            invulnerable = true;
            invulnTimer = 120;
        }

        function update() {
            if (keys.ArrowLeft || touchLeft) player.dx = -player.speed;
            else if (keys.ArrowRight || touchRight) player.dx = player.speed;
            else player.dx = 0;

            player.x += player.dx;
            if (player.x < 0) player.x = 0;
            if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

            // Invulnerabilidad
            if (invulnerable) {
                invulnTimer--;
                if (invulnTimer <= 0) invulnerable = false;
            }

            // Balas del jugador
            for (let i = bullets.length - 1; i >= 0; i--) {
                bullets[i].y -= bullets[i].speed;
                if (bullets[i].y < 0) bullets.splice(i, 1);
            }

            // UFO: spawn periódico
            ufoTimer++;
            let ufoInterval = score >= 2000 ? 420 : 600; // aparece más seguido con puntuación alta
            if (!ufo && ufoTimer >= ufoInterval) {
                ufoTimer = 0;
                ufo = { x: -40, y: 18, width: 38, height: 16, speed: 2.2, color: '#FFD700', isUFO: true, row: -1, isRedShooter: false, flashTimer: 0, baseY: 18, yOffset: 0 };
            }
            if (ufo) {
                ufo.x += ufo.speed;
                if (ufo.x > canvas.width + 50) ufo = null;
            }

            // Disparo de enemigos rojos Y naranjas
            for (let i = 0; i < enemies.length; i++) {
                let enemy = enemies[i];
                // Rojos: disparan más seguido desde 2000 pts
                if (enemy.isRedShooter && score >= 2000 && Math.random() < 0.004) {
                    let realY = enemy.baseY + enemy.yOffset;
                    enemyBullets.push({
                        x: enemy.x + enemy.width / 2 - 2,
                        y: realY + enemy.height,
                        width: 4, height: 10, speed: 4, color: '#FF4444'
                    });
                }
                // Naranjas (fila inferior, row>=2): disparan esporádicamente siempre
                if (!enemy.isRedShooter && enemy.row >= 2 && Math.random() < 0.002) {
                    let realY = enemy.baseY + enemy.yOffset;
                    enemyBullets.push({
                        x: enemy.x + enemy.width / 2 - 2,
                        y: realY + enemy.height,
                        width: 3, height: 8, speed: 3, color: '#FF8C00'
                    });
                }
                if (enemy.flashTimer > 0) enemy.flashTimer--;
            }

            // Balas enemigas vs Jugador y Barricadas
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                let bullet = enemyBullets[i];
                bullet.y += bullet.speed;
                if (bullet.y > canvas.height) {
                    enemyBullets.splice(i, 1); continue;
                }
                // Colisión con barricadas
                let hitBarricada = false;
                for (let bi = barricadas.length - 1; bi >= 0; bi--) {
                    let blk = barricadas[bi];
                    if (bullet.x < blk.x + blk.w && bullet.x + bullet.width > blk.x &&
                        bullet.y < blk.y + blk.h && bullet.y + bullet.height > blk.y) {
                        blk.hp--;
                        if (blk.hp <= 0) {
                            spawnParticles(blk.x + blk.w/2, blk.y + blk.h/2, '#00FF99', 4);
                            barricadas.splice(bi, 1);
                        }
                        enemyBullets.splice(i, 1);
                        hitBarricada = true;
                        break;
                    }
                }
                if (hitBarricada) continue;
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

            if (edgeCooldown > 0) edgeCooldown--;

            for (let i = 0; i < enemies.length; i++) {
                let enemy = enemies[i];
                enemy.x += enemySpeed * enemyDirection;
                enemy.yOffset = isChaosMode ? Math.sin(time + i * 0.7) * 12 : 0;
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
                    // Clamp: corrige el overshoot para que ninguna nave quede
                    // fuera de los límites del canvas tras la inversión
                    if (enemies[i].x < 0) enemies[i].x = 0;
                    if (enemies[i].x + enemies[i].width > canvas.width) enemies[i].x = canvas.width - enemies[i].width;
                    enemies[i].baseY += 18;
                    if (enemies[i].baseY + enemies[i].yOffset + enemies[i].height >= player.y) {
                        gameOver();
                        return;
                    }
                }
            }

            // Colisiones: balas del jugador vs barricadas, enemigos + UFO
            for (let bi = bullets.length - 1; bi >= 0; bi--) {
                let bullet = bullets[bi];
                let hit = false;

                // Chequear barricadas primero (la bala las puede destruir)
                for (let bri = barricadas.length - 1; bri >= 0; bri--) {
                    let blk = barricadas[bri];
                    if (bullet.x < blk.x + blk.w && bullet.x + bullet.width > blk.x &&
                        bullet.y < blk.y + blk.h && bullet.y + bullet.height > blk.y) {
                        blk.hp--;
                        if (blk.hp <= 0) {
                            spawnParticles(blk.x + blk.w/2, blk.y + blk.h/2, '#00FF99', 4);
                            barricadas.splice(bri, 1);
                        }
                        bullets.splice(bi, 1);
                        hit = true;
                        break;
                    }
                }
                if (hit) continue;

                // Chequear UFO
                if (ufo) {
                    if (bullet.x < ufo.x + ufo.width && bullet.x + bullet.width > ufo.x &&
                        bullet.y < ufo.y + ufo.height && bullet.y + bullet.height > ufo.y) {
                        spawnParticles(ufo.x + ufo.width/2, ufo.y + ufo.height/2, '#FFD700', 16);
                        score += 500;
                        actualizarScore();
                        ufo = null;
                        bullets.splice(bi, 1);
                        hit = true;
                    }
                }
                if (hit) continue;

                for (let ei = enemies.length - 1; ei >= 0; ei--) {
                    let enemy = enemies[ei];
                    let realY = enemy.baseY + enemy.yOffset;
                    if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x &&
                        bullet.y < realY + enemy.height && bullet.y + bullet.height > realY) {
                        
                        bullets.splice(bi, 1);
                        let pts = puntajeEnemigo(enemy);
                        score += pts;
                        actualizarScore();

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
                                if (dist < 65) {
                                    score += puntajeEnemigo(other);
                                    actualizarScore();
                                    spawnParticles(ocx, ocy, other.color, 8);
                                    enemies.splice(k, 1);
                                    if (k < ei) ei--;
                                }
                            }
                        } else {
                            spawnParticles(enemy.x + enemy.width/2, enemy.baseY + enemy.yOffset + enemy.height/2, enemy.color, 8);
                        }
                        enemies.splice(ei, 1);
                        hit = true;
                        break;
                    }
                }
            }

            // Actualizar partículas
            for (let i = particles.length - 1; i >= 0; i--) {
                let p = particles[i];
                p.x += p.dx;
                p.y += p.dy;
                p.dy += 0.1; // gravedad suave
                p.life--;
                if (p.life <= 0) particles.splice(i, 1);
            }

            if (enemies.length === 0) { crearOleada(); }
        }

        // Dibuja una nave enemiga pixel-art según su tipo
        function drawEnemy(ctx, enemy) {
            let ex = Math.floor(enemy.x);
            let ey = Math.floor(enemy.baseY + enemy.yOffset);
            let w = enemy.width;
            let h = enemy.height;
            let c = (enemy.flashTimer > 0 && enemy.flashTimer % 4 < 2) ? '#FFFFFF' : enemy.color;
            let cx = ex + w/2;

            if (enemy.isRedShooter) {
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

        function draw() {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

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
                let numBullets = suddenDeath ? 1 : Math.min(4, 1 + Math.floor(score / 2000));
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

            // --- BARRICADAS ---
            barricadas.forEach(blk => {
                // Color según HP: verde brillante → verde oscuro → amarillo → naranja
                let ratio = blk.hp / 3;
                let r, g, b;
                if (ratio > 0.66) {       // hp=3: verde neón
                    r=0; g=220; b=100;
                } else if (ratio > 0.33) { // hp=2: verde apagado
                    r=0; g=140; b=60;
                } else {                   // hp=1: amarillo-naranja (casi destruido)
                    r=200; g=120; b=0;
                }
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(blk.x, blk.y, blk.w, blk.h);
                // Borde pixelado
                ctx.strokeStyle = `rgba(${r+40},${g+40},${b+40},0.6)`;
                ctx.lineWidth = 1;
                ctx.strokeRect(blk.x + 0.5, blk.y + 0.5, blk.w - 1, blk.h - 1);
            });

            // --- ENEMIGOS ---
            enemies.forEach(enemy => drawEnemy(ctx, enemy));

            // --- PARTÍCULAS ---
            particles.forEach(p => {
                ctx.globalAlpha = p.life / 50;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
            });
            ctx.globalAlpha = 1;
        }

        function loop() {
            if (!isGameRunning) return;
            update();
            draw();
            animationId = requestAnimationFrame(loop);
        }
        })();
