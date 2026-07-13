(() => {
    const COLS = 19;
    const ROWS = 23;
    const TILE = 20;
    const TUNNEL_ROW = 11;
    const PLAYER_SPEED = 5.1;
    const AKANE_SCORE = window.ArcadeRecords?.AKANE_SCORE || 99999;
    const POWER_SFX = window.CG_CONFIG?.sfx?.powerUp || "assets/audio/later/powerup_minijuego.wav";
    const DIRECTIONS = Object.freeze({
        left: { x: -1, y: 0, name: "left" },
        right: { x: 1, y: 0, name: "right" },
        up: { x: 0, y: -1, name: "up" },
        down: { x: 0, y: 1, name: "down" }
    });
    const DIRECTION_LIST = Object.values(DIRECTIONS);
    const KEY_DIRECTIONS = {
        ArrowLeft: DIRECTIONS.left,
        KeyA: DIRECTIONS.left,
        ArrowRight: DIRECTIONS.right,
        KeyD: DIRECTIONS.right,
        ArrowUp: DIRECTIONS.up,
        KeyW: DIRECTIONS.up,
        ArrowDown: DIRECTIONS.down,
        KeyS: DIRECTIONS.down
    };
    const GHOST_TYPES = ["red", "pink", "blue", "orange"];
    const SPRITE_PATH = "assets/arcade/pacman/sprites/";
    const assets = {
        akaneRight: loadImage(`${SPRITE_PATH}akane-right.png`),
        akaneLeft: loadImage(`${SPRITE_PATH}akane-left.png`),
        akaneUp: loadImage(`${SPRITE_PATH}akane-up.png`),
        akaneDown: loadImage(`${SPRITE_PATH}akane-down.png`),
        orange: loadImage(`${SPRITE_PATH}ghost-orange.png`),
        red: loadImage(`${SPRITE_PATH}ghost-red.png`),
        pink: loadImage(`${SPRITE_PATH}ghost-pink.png`),
        blue: loadImage(`${SPRITE_PATH}ghost-blue.png`),
        frightened: loadImage(`${SPRITE_PATH}ghost-frightened.png`),
        note: loadImage(`${SPRITE_PATH}note.png`),
        energy: loadImage(`${SPRITE_PATH}energy-can.png`),
        gameboy: loadImage(`${SPRITE_PATH}gameboy-color.png`),
        wall: loadImage("assets/arcade/pacman/maze-wall.png")
    };
    const assetsReady = Promise.all(Object.values(assets));

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.decoding = "async";
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = src;
        });
    }

    function seededRandom(seed) {
        let value = seed >>> 0;
        return () => {
            value += 0x6D2B79F5;
            let result = value;
            result = Math.imul(result ^ (result >>> 15), result | 1);
            result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
            return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
        };
    }

    function cellKey(cell) {
        return `${cell.c},${cell.r}`;
    }

    function sameDirection(a, b) {
        return Boolean(a && b && a.x === b.x && a.y === b.y);
    }

    function isReverse(a, b) {
        return Boolean(a && b && a.x === -b.x && a.y === -b.y);
    }

    function create(canvas, callbacks = {}) {
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        const offsetX = Math.floor((canvas.width - COLS * TILE) / 2);
        const offsetY = Math.floor((canvas.height - ROWS * TILE) / 2);
        let grid = [];
        let random = Math.random;
        let floorCells = [];
        let notes = new Set();
        let energy = new Set();
        let totalCollectibles = 0;
        let score = 0;
        let lives = 3;
        let level = 1;
        let player = null;
        let ghosts = [];
        let playerStart = null;
        let ghostStarts = [];
        let ghostHouse = [];
        let pressedDirection = null;
        let frightenedTimer = 0;
        let frightenedChain = 0;
        let readyTimer = 0;
        let transitionTimer = 0;
        let bonus = null;
        let bonusSpawned = false;
        let animationId = null;
        let running = false;
        let paused = false;
        let lastTime = 0;
        let lastStatusSecond = -1;
        let startToken = 0;

        function generateMaze() {
            random = seededRandom(0xA6A6E + level * 0x9E3779B1);
            grid = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
            const stack = [{ c: 1, r: 1 }];
            grid[1][1] = 0;

            while (stack.length) {
                const current = stack[stack.length - 1];
                const options = DIRECTION_LIST
                    .map((direction) => ({
                        c: current.c + direction.x * 2,
                        r: current.r + direction.y * 2,
                        wallC: current.c + direction.x,
                        wallR: current.r + direction.y
                    }))
                    .filter((cell) => cell.c > 0 && cell.c < COLS - 1 && cell.r > 0 && cell.r < ROWS - 1 && grid[cell.r][cell.c] === 1);

                if (!options.length) {
                    stack.pop();
                    continue;
                }

                const next = options[Math.floor(random() * options.length)];
                grid[next.wallR][next.wallC] = 0;
                grid[next.r][next.c] = 0;
                stack.push({ c: next.c, r: next.r });
            }

            const loopBudget = 12 + Math.min(level, 24);
            let opened = 0;
            for (let attempt = 0; attempt < 500 && opened < loopBudget; attempt += 1) {
                const c = 1 + Math.floor(random() * (COLS - 2));
                const r = 1 + Math.floor(random() * (ROWS - 2));
                if (grid[r][c] === 0) continue;
                const horizontal = grid[r][c - 1] === 0 && grid[r][c + 1] === 0;
                const vertical = grid[r - 1][c] === 0 && grid[r + 1][c] === 0;
                if (horizontal || vertical) {
                    grid[r][c] = 0;
                    opened += 1;
                }
            }

            const houseCenter = { c: Math.floor(COLS / 2), r: Math.floor(ROWS / 2) };
            ghostHouse = [];
            for (let r = houseCenter.r - 1; r <= houseCenter.r + 1; r += 1) {
                for (let c = houseCenter.c - 2; c <= houseCenter.c + 2; c += 1) {
                    if (r <= 0 || r >= ROWS - 1 || c <= 0 || c >= COLS - 1) continue;
                    grid[r][c] = 0;
                    ghostHouse.push({ c, r });
                }
            }
            [
                { c: houseCenter.c, r: houseCenter.r - 2 },
                { c: houseCenter.c, r: houseCenter.r + 2 },
                { c: houseCenter.c - 3, r: houseCenter.r },
                { c: houseCenter.c + 3, r: houseCenter.r }
            ].forEach((door) => {
                if (door.r > 0 && door.r < ROWS - 1 && door.c > 0 && door.c < COLS - 1) grid[door.r][door.c] = 0;
            });

            grid[TUNNEL_ROW][0] = 0;
            grid[TUNNEL_ROW][1] = 0;
            grid[TUNNEL_ROW][COLS - 2] = 0;
            grid[TUNNEL_ROW][COLS - 1] = 0;

            floorCells = [];
            for (let r = 0; r < ROWS; r += 1) {
                for (let c = 0; c < COLS; c += 1) {
                    if (grid[r][c] === 0) floorCells.push({ c, r });
                }
            }

            playerStart = closestFloor({ c: Math.floor(COLS / 2), r: ROWS - 2 });
            ghostStarts = [
                { c: houseCenter.c - 1, r: houseCenter.r },
                { c: houseCenter.c, r: houseCenter.r },
                { c: houseCenter.c + 1, r: houseCenter.r },
                { c: houseCenter.c, r: houseCenter.r + 1 }
            ];

            const blocked = new Set([cellKey(playerStart), ...ghostStarts.map(cellKey)]);
            notes = new Set();
            floorCells.forEach((cell) => {
                if (blocked.has(cellKey(cell))) return;
                if (distanceManhattan(cell, playerStart) < 3) return;
                if (isGhostHouseCell(cell) || ghostStarts.some((spawn) => distanceManhattan(cell, spawn) < 2)) return;
                notes.add(cellKey(cell));
            });

            energy = new Set();
            const corners = [
                { c: 1, r: 1 },
                { c: COLS - 2, r: 1 },
                { c: 1, r: ROWS - 2 },
                { c: COLS - 2, r: ROWS - 2 }
            ];
            corners.forEach((corner) => {
                const cell = closestFloor(corner, (candidate) => !blocked.has(cellKey(candidate)));
                if (!cell) return;
                const key = cellKey(cell);
                notes.delete(key);
                energy.add(key);
            });

            totalCollectibles = notes.size + energy.size;
            bonus = null;
            bonusSpawned = false;
        }

        function closestFloor(target, predicate = () => true) {
            return floorCells
                .filter(predicate)
                .reduce((best, cell) => {
                    if (!best) return cell;
                    return distanceManhattan(cell, target) < distanceManhattan(best, target) ? cell : best;
                }, null);
        }

        function distanceManhattan(a, b) {
            return Math.abs(a.c - b.c) + Math.abs(a.r - b.r);
        }

        function isGhostHouseCell(cell) {
            return ghostHouse.some((houseCell) => houseCell.c === cell.c && houseCell.r === cell.r);
        }

        function isPassable(c, r) {
            if (r === TUNNEL_ROW && (c === -1 || c === COLS)) return true;
            return r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c] === 0;
        }

        function neighbor(cell, direction) {
            let c = cell.c + direction.x;
            const r = cell.r + direction.y;
            if (r === TUNNEL_ROW && c < 0) c = COLS - 1;
            if (r === TUNNEL_ROW && c >= COLS) c = 0;
            return { c, r };
        }

        function targetFor(cell, direction) {
            return { c: cell.c + direction.x, r: cell.r + direction.y };
        }

        function createMover(start, direction, extra = {}) {
            return {
                cell: { ...start },
                target: null,
                progress: 0,
                direction,
                nextDirection: direction,
                ...extra
            };
        }

        function resetEntities() {
            player = createMover(playerStart, null);
            pressedDirection = null;
            ghosts = GHOST_TYPES.map((type, index) => createMover(
                ghostStarts[index],
                index % 2 ? DIRECTIONS.right : DIRECTIONS.left,
                { type, index, respawnTimer: 0.7 + index * 0.65 }
            ));
            frightenedChain = 0;
            readyTimer = 1.25;
        }

        function setDirection(direction) {
            if (!direction || !player) return;
            pressedDirection = direction;
            player.nextDirection = direction;

            if (player.target && isReverse(direction, player.direction)) {
                const oldCell = player.cell;
                player.cell = normalizeTunnelCell(player.target);
                player.target = oldCell;
                player.progress = 1 - player.progress;
                player.direction = direction;
            }
        }

        function releaseDirection(direction) {
            if (!direction || !sameDirection(pressedDirection, direction)) return;
            pressedDirection = null;
            if (player) player.nextDirection = null;
        }

        function normalizeTunnelCell(cell) {
            if (cell.r !== TUNNEL_ROW) return { ...cell };
            if (cell.c < 0) return { c: COLS - 1, r: cell.r };
            if (cell.c >= COLS) return { c: 0, r: cell.r };
            return { ...cell };
        }

        function choosePlayerDirection(entity) {
            if (pressedDirection && isPassable(entity.cell.c + pressedDirection.x, entity.cell.r + pressedDirection.y)) {
                entity.direction = pressedDirection;
            }
            if (!pressedDirection || !entity.direction || !sameDirection(entity.direction, pressedDirection) || !isPassable(entity.cell.c + entity.direction.x, entity.cell.r + entity.direction.y)) {
                return null;
            }
            return entity.direction;
        }

        function chooseGhostDirection(ghost) {
            let choices = DIRECTION_LIST.filter((direction) => isPassable(
                ghost.cell.c + direction.x,
                ghost.cell.r + direction.y
            ));
            const withoutReverse = choices.filter((direction) => !isReverse(direction, ghost.direction));
            if (withoutReverse.length) choices = withoutReverse;
            if (!choices.length) return null;

            if (frightenedTimer > 0 || random() < Math.max(0.04, 0.2 - level * 0.006)) {
                return choices[Math.floor(random() * choices.length)];
            }

            const target = getGhostTarget(ghost);
            return choices
                .map((direction) => ({ direction, distance: pathDistance(neighbor(ghost.cell, direction), target) }))
                .sort((a, b) => a.distance - b.distance || directionPriority(a.direction) - directionPriority(b.direction))[0].direction;
        }

        function directionPriority(direction) {
            return [DIRECTIONS.up, DIRECTIONS.left, DIRECTIONS.down, DIRECTIONS.right].indexOf(direction);
        }

        function getGhostTarget(ghost) {
            const playerPosition = moverPosition(player);
            const playerCell = { c: Math.round(playerPosition.c), r: Math.round(playerPosition.r) };
            const direction = player.direction || DIRECTIONS.left;

            if (ghost.type === "pink") {
                return closestFloor({ c: playerCell.c + direction.x * 4, r: playerCell.r + direction.y * 4 }) || playerCell;
            }
            if (ghost.type === "blue") {
                const red = ghosts.find((item) => item.type === "red");
                const redCell = red ? red.cell : playerCell;
                const pivot = { c: playerCell.c + direction.x * 2, r: playerCell.r + direction.y * 2 };
                return closestFloor({ c: pivot.c * 2 - redCell.c, r: pivot.r * 2 - redCell.r }) || playerCell;
            }
            if (ghost.type === "orange" && distanceManhattan(ghost.cell, playerCell) < 7) {
                return closestFloor({ c: 1, r: ROWS - 2 }) || playerCell;
            }
            return closestFloor(playerCell) || playerCell;
        }

        function pathDistance(start, rawTarget) {
            const target = closestFloor(rawTarget) || rawTarget;
            const queue = [{ cell: start, distance: 0 }];
            const visited = new Set([cellKey(start)]);

            while (queue.length) {
                const current = queue.shift();
                if (current.cell.c === target.c && current.cell.r === target.r) return current.distance;
                for (const direction of DIRECTION_LIST) {
                    const next = neighbor(current.cell, direction);
                    const key = cellKey(next);
                    if (visited.has(key) || !isPassable(next.c, next.r)) continue;
                    visited.add(key);
                    queue.push({ cell: next, distance: current.distance + 1 });
                }
            }
            return 9999;
        }

        function moveEntity(entity, speed, deltaSeconds, chooser, onEnter) {
            if (entity === player && !pressedDirection) return;
            let distance = speed * deltaSeconds;
            let guard = 0;
            while (distance > 0 && guard < 8) {
                guard += 1;
                if (!entity.target) {
                    const direction = chooser(entity);
                    if (!direction) return;
                    entity.direction = direction;
                    entity.target = targetFor(entity.cell, direction);
                }

                const remaining = 1 - entity.progress;
                const step = Math.min(distance, remaining);
                entity.progress += step;
                distance -= step;

                if (entity.progress >= 0.9999) {
                    entity.cell = normalizeTunnelCell(entity.target);
                    entity.target = null;
                    entity.progress = 0;
                    onEnter?.(entity.cell, entity);
                }
            }
        }

        function moverPosition(entity) {
            if (!entity?.target) return { c: entity?.cell.c || 0, r: entity?.cell.r || 0 };
            let targetC = entity.target.c;
            let cellC = entity.cell.c;
            if (entity.cell.r === TUNNEL_ROW) {
                if (entity.target.c < 0) targetC = -1;
                if (entity.target.c >= COLS) targetC = COLS;
                if (entity.cell.c === COLS - 1 && entity.target.c === 0 && entity.direction.x > 0) targetC = COLS;
                if (entity.cell.c === 0 && entity.target.c === COLS - 1 && entity.direction.x < 0) cellC = COLS;
            }
            return {
                c: cellC + (targetC - cellC) * entity.progress,
                r: entity.cell.r + (entity.target.r - entity.cell.r) * entity.progress
            };
        }

        function collectAt(cell) {
            const key = cellKey(cell);
            let changed = false;
            if (notes.delete(key)) {
                score += 10;
                changed = true;
            }
            if (energy.delete(key)) {
                score += 50;
                frightenedTimer = Math.max(4.25, 9 - level * 0.16);
                frightenedChain = 0;
                changed = true;
                playPickupSfx(0.42);
            }
            if (bonus && bonus.key === key) {
                score += Math.min(5000, 1000 + level * 125);
                bonus = null;
                changed = true;
                playPickupSfx(0.58);
            }

            if (changed) {
                saveAndEmit();
                maybeSpawnBonus();
            }

            if (notes.size + energy.size === 0 && transitionTimer <= 0) {
                score += level * 1000;
                saveAndEmit();
                transitionTimer = 1.8;
            }
        }

        function maybeSpawnBonus() {
            const remaining = notes.size + energy.size;
            if (bonusSpawned || totalCollectibles <= 0 || remaining > totalCollectibles * 0.55) return;
            const occupied = new Set([cellKey(player.cell), ...ghosts.map((ghost) => cellKey(ghost.cell))]);
            const candidates = floorCells.filter((cell) => !occupied.has(cellKey(cell)) && !energy.has(cellKey(cell)));
            if (!candidates.length) return;
            const cell = candidates[Math.floor(random() * candidates.length)];
            bonus = { key: cellKey(cell), cell, timer: 11 };
            bonusSpawned = true;
            emitState();
        }

        function playPickupSfx(volume) {
            if (window.AudioManager?.playSfx) {
                window.AudioManager.playSfx(POWER_SFX, { volume });
                return;
            }
            const audio = new Audio(POWER_SFX);
            audio.volume = volume;
            audio.play().catch(() => {});
        }

        function saveAndEmit() {
            window.ArcadeRecords?.record(window.ArcadeRecords.GAME_IDS.MAZE, score);
            emitState();
        }

        function emitState() {
            callbacks.onState?.({
                score,
                lives,
                level,
                notesRemaining: notes.size + energy.size,
                frightenedSeconds: Math.max(0, Math.ceil(frightenedTimer)),
                bonusVisible: Boolean(bonus),
                beatAkane: score >= AKANE_SCORE
            });
        }

        function update(deltaSeconds) {
            if (readyTimer > 0) {
                readyTimer = Math.max(0, readyTimer - deltaSeconds);
                return;
            }
            if (transitionTimer > 0) {
                transitionTimer = Math.max(0, transitionTimer - deltaSeconds);
                if (transitionTimer === 0) {
                    level += 1;
                    generateMaze();
                    resetEntities();
                    emitState();
                }
                return;
            }

            frightenedTimer = Math.max(0, frightenedTimer - deltaSeconds);
            if (bonus) {
                bonus.timer -= deltaSeconds;
                if (bonus.timer <= 0) {
                    bonus = null;
                    emitState();
                }
            }

            moveEntity(player, PLAYER_SPEED, deltaSeconds, choosePlayerDirection, collectAt);
            const ghostSpeed = Math.min(4.65, 2.55 + Math.log2(level + 1) * 0.28);
            ghosts.forEach((ghost) => {
                if (ghost.respawnTimer > 0) {
                    ghost.respawnTimer = Math.max(0, ghost.respawnTimer - deltaSeconds);
                    return;
                }
                const speed = frightenedTimer > 0 ? ghostSpeed * 0.72 : ghostSpeed;
                moveEntity(ghost, speed, deltaSeconds, chooseGhostDirection);
            });

            checkCollisions();
            const statusSecond = Math.ceil(frightenedTimer);
            if (statusSecond !== lastStatusSecond) {
                lastStatusSecond = statusSecond;
                emitState();
            }
        }

        function checkCollisions() {
            const playerPosition = moverPosition(player);
            for (const ghost of ghosts) {
                if (ghost.respawnTimer > 0) continue;
                const ghostPosition = moverPosition(ghost);
                let deltaC = Math.abs(playerPosition.c - ghostPosition.c);
                if (player.cell.r === TUNNEL_ROW && ghost.cell.r === TUNNEL_ROW) {
                    deltaC = Math.min(deltaC, COLS - deltaC);
                }
                const distance = Math.hypot(deltaC, playerPosition.r - ghostPosition.r);
                if (distance > 0.62) continue;

                if (frightenedTimer > 0) {
                    frightenedChain += 1;
                    const points = 200 * Math.pow(2, Math.min(frightenedChain - 1, 3));
                    score += points;
                    ghost.cell = { ...ghostStarts[ghost.index] };
                    ghost.target = null;
                    ghost.progress = 0;
                    ghost.respawnTimer = 1.8;
                    saveAndEmit();
                    return;
                }

                lives -= 1;
                emitState();
                if (lives <= 0) {
                    window.ArcadeRecords?.record(window.ArcadeRecords.GAME_IDS.MAZE, score);
                    stop();
                    callbacks.onGameOver?.({ score, level });
                    return;
                }
                resetEntities();
                return;
            }
        }

        function drawSprite(name, x, y, width, height, options = {}) {
            const image = getResolvedImage(assets[name]);
            if (!image) return;
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            ctx.globalAlpha = options.alpha ?? 1;
            ctx.drawImage(image, x, y, width, height);
            ctx.restore();
        }

        function getResolvedImage(promise) {
            return promise.__image || null;
        }

        function draw() {
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            ctx.fillStyle = "#030008";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = "rgba(0,255,255,0.06)";
            ctx.lineWidth = 1;
            for (let x = 0; x <= canvas.width; x += 20) {
                ctx.beginPath();
                ctx.moveTo(x + 0.5, 0);
                ctx.lineTo(x + 0.5, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y <= canvas.height; y += 20) {
                ctx.beginPath();
                ctx.moveTo(0, y + 0.5);
                ctx.lineTo(canvas.width, y + 0.5);
                ctx.stroke();
            }

            drawMaze();
            drawGhostHouse();
            drawCollectibles();
            drawActors();
            drawOverlayMessage();
            ctx.restore();
        }

        function drawMaze() {
            const wallImage = getResolvedImage(assets.wall);
            if (!wallImage) return;
            for (let r = 0; r < ROWS; r += 1) {
                for (let c = 0; c < COLS; c += 1) {
                    if (grid[r][c] !== 1) continue;
                    ctx.drawImage(
                        wallImage,
                        205,
                        165,
                        850,
                        850,
                        offsetX + c * TILE,
                        offsetY + r * TILE,
                        TILE,
                        TILE
                    );
                }
            }
        }

        function drawGhostHouse() {
            if (!ghostHouse.length) return;
            const minC = Math.min(...ghostHouse.map((cell) => cell.c));
            const maxC = Math.max(...ghostHouse.map((cell) => cell.c));
            const minR = Math.min(...ghostHouse.map((cell) => cell.r));
            const maxR = Math.max(...ghostHouse.map((cell) => cell.r));
            const x = offsetX + minC * TILE + 2;
            const y = offsetY + minR * TILE + 2;
            const width = (maxC - minC + 1) * TILE - 4;
            const height = (maxR - minR + 1) * TILE - 4;
            ctx.fillStyle = "rgba(255, 105, 180, 0.08)";
            ctx.fillRect(x, y, width, height);
            ctx.strokeStyle = "#ff69b4";
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
            ctx.fillStyle = "#00ffff";
            ctx.fillRect(offsetX + Math.floor(COLS / 2) * TILE + 5, y - 2, TILE - 10, 4);
        }

        function drawCollectibles() {
            notes.forEach((key) => {
                const [c, r] = key.split(",").map(Number);
                const x = offsetX + c * TILE + TILE / 2;
                const y = offsetY + r * TILE + TILE / 2;
                drawSprite("note", x - 5, y - 6, 10, 12);
            });
            energy.forEach((key) => {
                const [c, r] = key.split(",").map(Number);
                const x = offsetX + c * TILE + TILE / 2;
                const y = offsetY + r * TILE + TILE / 2;
                drawSprite("energy", x - 8, y - 10, 16, 20);
            });
            if (bonus) {
                const pulse = 1 + Math.sin(Date.now() / 120) * 0.08;
                const width = 20 * pulse;
                const height = 23 * pulse;
                const x = offsetX + bonus.cell.c * TILE + TILE / 2;
                const y = offsetY + bonus.cell.r * TILE + TILE / 2;
                drawSprite("gameboy", x - width / 2, y - height / 2, width, height);
            }
        }

        function drawActors() {
            if (!player) return;
            const playerPosition = moverPosition(player);
            const playerX = offsetX + playerPosition.c * TILE + TILE / 2;
            const playerY = offsetY + playerPosition.r * TILE + TILE / 2;
            const bob = Math.sin(Date.now() / 90) * 1.2;
            const directionName = player.direction?.name || "down";
            const akaneSprite = `akane${directionName.charAt(0).toUpperCase()}${directionName.slice(1)}`;
            drawSprite(akaneSprite, playerX - 14, playerY - 17 + bob, 28, 34);

            ghosts.forEach((ghost) => {
                if (ghost.respawnTimer > 0 && Math.floor(ghost.respawnTimer * 8) % 2 === 0) return;
                const position = moverPosition(ghost);
                const x = offsetX + position.c * TILE + TILE / 2;
                const y = offsetY + position.r * TILE + TILE / 2;
                const sprite = frightenedTimer > 0 ? "frightened" : ghost.type;
                drawSprite(sprite, x - 12, y - 13, 24, 26, {
                    alpha: ghost.respawnTimer > 0 ? 0.55 : 1
                });
            });
        }

        function drawOverlayMessage() {
            let message = "";
            if (transitionTimer > 0) message = `LEVEL ${String(level).padStart(2, "0")} CLEAR`;
            else if (readyTimer > 0) message = `LEVEL ${String(level).padStart(2, "0")} // READY`;
            if (!message) return;

            ctx.fillStyle = "rgba(3,0,8,0.78)";
            ctx.fillRect(48, canvas.height / 2 - 28, canvas.width - 96, 56);
            ctx.strokeStyle = "#00ffff";
            ctx.lineWidth = 2;
            ctx.strokeRect(48.5, canvas.height / 2 - 27.5, canvas.width - 97, 55);
            ctx.fillStyle = "#ffffff";
            ctx.font = "24px VT323, monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(message, canvas.width / 2, canvas.height / 2);
        }

        function drawLoading() {
            ctx.fillStyle = "#030008";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#00ffff";
            ctx.font = "24px VT323, monospace";
            ctx.textAlign = "center";
            ctx.fillText("LOADING AKANE_MAZE...", canvas.width / 2, canvas.height / 2);
        }

        function loop(timestamp) {
            if (!running || paused) return;
            if (!lastTime) lastTime = timestamp;
            const deltaSeconds = Math.min((timestamp - lastTime) / 1000, 0.05);
            lastTime = timestamp;
            update(deltaSeconds || 1 / 60);
            draw();
            if (running && !paused) animationId = requestAnimationFrame(loop);
        }

        function handleKeyDown(event) {
            const direction = KEY_DIRECTIONS[event.code];
            if (direction) {
                event.preventDefault();
                setDirection(direction);
                return;
            }
            if (event.code === "Escape" || event.code === "KeyP") {
                event.preventDefault();
                callbacks.onTogglePause?.();
            }
        }

        function handleKeyUp(event) {
            const direction = KEY_DIRECTIONS[event.code];
            if (!direction) return;
            event.preventDefault();
            releaseDirection(direction);
        }

        async function start() {
            const token = ++startToken;
            stop(false);
            running = true;
            paused = false;
            drawLoading();
            try {
                const images = await assetsReady;
                Object.keys(assets).forEach((key, index) => {
                    assets[key].__image = images[index];
                });
            } catch (_error) {
                running = false;
                callbacks.onAssetError?.();
                return;
            }
            if (token !== startToken || !running) return;

            score = 0;
            lives = 3;
            level = 1;
            frightenedTimer = 0;
            transitionTimer = 0;
            lastStatusSecond = -1;
            generateMaze();
            resetEntities();
            emitState();
            document.addEventListener("keydown", handleKeyDown);
            document.addEventListener("keyup", handleKeyUp);
            lastTime = 0;
            animationId = requestAnimationFrame(loop);
        }

        function stop(invalidate = true) {
            if (invalidate) startToken += 1;
            running = false;
            paused = false;
            if (animationId) cancelAnimationFrame(animationId);
            animationId = null;
            lastTime = 0;
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("keyup", handleKeyUp);
        }

        function pause() {
            if (!running || paused) return false;
            paused = true;
            if (animationId) cancelAnimationFrame(animationId);
            animationId = null;
            draw();
            return true;
        }

        function resume() {
            if (!running || !paused) return false;
            paused = false;
            lastTime = 0;
            animationId = requestAnimationFrame(loop);
            return true;
        }

        return Object.freeze({
            start,
            stop,
            pause,
            resume,
            setDirection(name) {
                setDirection(typeof name === "string" ? DIRECTIONS[name] : name);
            },
            releaseDirection(name) {
                releaseDirection(typeof name === "string" ? DIRECTIONS[name] : name);
            },
            isPaused() {
                return paused;
            },
            isRunning() {
                return running;
            },
            getDebugState() {
                return {
                    player: moverPosition(player),
                    pressedDirection: pressedDirection?.name || null,
                    score,
                    level,
                    notesRemaining: notes.size + energy.size,
                    ghostHouse: ghostHouse.map((cell) => ({ ...cell }))
                };
            },
            draw() {
                draw();
            }
        });
    }

    async function drawPreview(canvas) {
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = "#030008";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        try {
            const images = await assetsReady;
            Object.keys(assets).forEach((key, index) => {
                assets[key].__image = images[index];
            });
            const wallImage = getResolvedImage(assets.wall);

            const cell = 18;
            const pattern = [
                "1111111111111111",
                "1000010000100001",
                "1011010110101101",
                "1000000000000001",
                "1010111011101011",
                "1000100000010001",
                "1110101111010111",
                "1000001001000001",
                "1011100000011101",
                "1000001111000001",
                "1111111111111111"
            ];
            const startX = Math.floor((canvas.width - pattern[0].length * cell) / 2);
            const startY = Math.floor((canvas.height - pattern.length * cell) / 2);
            pattern.forEach((row, r) => {
                [...row].forEach((value, c) => {
                    if (value !== "1") return;
                    ctx.drawImage(wallImage, 205, 165, 850, 850, startX + c * cell, startY + r * cell, cell, cell);
                });
            });

            const drawPreviewSprite = (name, c, r, width, height) => {
                const image = getResolvedImage(assets[name]);
                if (!image) return;
                const x = startX + c * cell + cell / 2 - width / 2;
                const y = startY + r * cell + cell / 2 - height / 2;
                ctx.drawImage(image, x, y, width, height);
            };
            [[2, 3], [5, 1], [10, 3], [13, 8], [3, 8], [8, 5]].forEach(([c, r]) => drawPreviewSprite("note", c, r, 10, 12));
            drawPreviewSprite("akaneDown", 8, 7, 32, 36);
            drawPreviewSprite("orange", 2, 1, 27, 28);
            drawPreviewSprite("red", 13, 1, 27, 28);
            drawPreviewSprite("pink", 2, 9, 27, 28);
            drawPreviewSprite("blue", 13, 9, 27, 28);
            drawPreviewSprite("energy", 11, 5, 18, 23);
            drawPreviewSprite("gameboy", 7, 9, 19, 24);
        } catch (_error) {
            ctx.fillStyle = "#00ffff";
            ctx.font = "20px VT323, monospace";
            ctx.textAlign = "center";
            ctx.fillText("AKANE_MAZE", canvas.width / 2, canvas.height / 2);
        }
    }

    window.AkaneMazeGame = Object.freeze({ create, drawPreview, DIRECTIONS });
})();
