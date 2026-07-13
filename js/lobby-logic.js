        // =====================================================
        // AUDIO MANAGER GLOBAL — controlado desde la barra lateral.
        // =====================================================
        const AudioManager = window.AudioManager;
        const START_INTRO_SESSION_KEY = "cheatguys.startIntroSeen.v1";

        function hasSeenStartIntro() {
            try {
                return sessionStorage.getItem(START_INTRO_SESSION_KEY) === "1";
            } catch (_) {
                return false;
            }
        }

        function rememberStartIntro() {
            try {
                sessionStorage.setItem(START_INTRO_SESSION_KEY, "1");
            } catch (_) {
                // La introduccion sigue funcionando aunque el almacenamiento este bloqueado.
            }
        }

        // Animación Inicial al Entrar
        document.addEventListener("DOMContentLoaded", () => {
            document.body.style.overflow = 'hidden';
            setupStartWindow();

            // Interceptor de Links
            document.querySelectorAll('a').forEach(link => {
                const linkUrl = new URL(link.href, window.location.href);
                const isSamePageHash = linkUrl.hash && linkUrl.origin === window.location.origin && linkUrl.pathname === window.location.pathname;
                if (link.href && !link.href.startsWith('javascript') && !link.getAttribute('href')?.startsWith('#') && !isSamePageHash) {
                    link.addEventListener('click', function(e) {
                        if (this.classList.contains('btn-patreon')) {
                            e.preventDefault();
                            showToast("SYSTEM: Función 'Patreon Guild' Coming Soon...");
                            return;
                        }
                        e.preventDefault();
                        const url = this.href;
                        const target = this.target;
                        if (url.startsWith('mailto:')) { window.location.href = url; return; }
                        showLoadingScreen(() => {
                            if (target === '_blank') window.open(url, '_blank');
                            else window.location.href = url;
                        });
                    });
                }
            });
        });

        function setupStartWindow() {
            const startWindow = document.getElementById('startWindow');
            const pressStartBtn = document.getElementById('pressStartBtn');

            if (hasSeenStartIntro()) {
                if (startWindow) startWindow.remove();
                showLoadingScreen(() => {
                    document.body.style.overflow = 'auto';
                    document.body.classList.remove('start-window-active');
                    document.body.classList.add('page-loaded');
                });
                return;
            }

            if (!startWindow || !pressStartBtn) {
                showLoadingScreen(() => {
                    document.body.style.overflow = 'auto';
                    document.body.classList.add('page-loaded');
                });
                return;
            }

            document.body.classList.add('start-window-active');
            window.setTimeout(() => startWindow.classList.add('is-booted'), 1250);
            window.setTimeout(() => {
                startWindow.classList.add('is-ready');
                pressStartBtn.focus({ preventScroll: true });
            }, 2250);

            const startLobby = () => {
                pressStartBtn.disabled = true;
                document.removeEventListener('keydown', startOnKey);
                rememberStartIntro();
                startWindow.classList.add('is-finished');
                showLoadingScreen(() => {
                    document.body.style.overflow = 'auto';
                    document.body.classList.remove('start-window-active');
                    document.body.classList.add('page-loaded');
                    startWindow.remove();
                });
            };

            const startOnKey = (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    pressStartBtn.click();
                }
            };

            pressStartBtn.addEventListener('click', startLobby, { once: true });
            document.addEventListener('keydown', startOnKey);
        }

        // --- FUNCIÓN GLOBAL DE PANTALLA DE CARGA ---
        function showLoadingScreen(callback) {
            const loader = document.getElementById('globalLoader');
            loader.style.display = 'flex';
            void loader.offsetWidth;
            loader.style.opacity = '1';
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                    if (callback) callback();
                }, 400);
            }, 900);
        }

        // --- SISTEMA FICHAS DE PERSONAJE ---
        const charData = {
            akane: {
                name: "AKANE HOSHIZORA",
                role: "Fundadora, Vocalista Principal y Guitarra Rítmica (Lvl. 15)",
                desc: "<div class='char-stat-grid'><span>COLOR: VIOLETA</span><span>APODO: LA DEMONIO DEL ARCADE</span><span>BUILD: HUD_SOCIAL_JRPG</span></div><p><strong>Akane no quería ser protagonista de nada.</strong> Es introvertida, silenciosa y socialmente torpe; su ansiedad convierte cualquier interacción en un menú de opciones tipo videojuego, con consecuencias que su cerebro exagera al 300%.</p><p>Detrás de su expresión neutral vive una mente brillante, observadora y creativa. Se estresa por pedir salsa extra, pero puede cantar en un escenario si alguien importante la necesita. Es el núcleo emocional de CheatGuys!, aunque ella siga intentando pasar desapercibida.</p><ul class='char-lore-list'><li>Canta con una profundidad enorme cuando se siente segura.</li><li>Toca guitarra rítmica con precisión emocional.</li><li>Tiene los puntajes más altos del arcade del colegio bajo seudónimo.</li><li>Su lugar seguro es el garaje convertido en cuartel de la banda.</li></ul>",
                color: "var(--akane-color)",
                imgUrl: "assets/characters/cards/ficha-akane.webp"
            },
            rika: {
                name: "RIKA TANAKA",
                role: "Guitarra Principal, Compositora y Musicalización (Lvl. 16)",
                desc: "<div class='char-stat-grid'><span>COLOR: NARANJA</span><span>APODOS: MANDARINA / TERROR TANAKA</span><span>BUILD: VOLUME_MAX</span></div><p><strong>Rika es una bomba emocional con guitarra.</strong> Extrovertida, intensa, impulsiva y profundamente pasional; vive en volumen alto y no tiene filtro, ni ganas de conseguir uno.</p><p>Su caos viene con talento real: toca de oído, improvisa riffs únicos y arrastra a la gente a sus ideas aunque tengan la estabilidad de una mesa con tres patas. Con Akane funciona como escudo, motor y guitarra gemela, normalmente gritando.</p><ul class='char-lore-list'><li>Virtuosa de la guitarra eléctrica e instinto escénico natural.</li><li>Compone desde la emoción pura, sin pedir permiso.</li><li>Admira a Kaede Ayase y teme no estar a la altura.</li><li>Su ropa cambia según su estado de ánimo.</li></ul>",
                color: "var(--rika-color)",
                imgUrl: "assets/characters/cards/ficha-rika.webp"
            },
            momo: {
                name: "MOMO FUJIWARA",
                role: "Bajista, Encargada Estética y Corista (Lvl. 15)",
                desc: "<div class='char-stat-grid'><span>COLOR: ROSA MEXICANO</span><span>APODO: PULGA</span><span>BUILD: SOFT_BASS_HEALER</span></div><p><strong>Momo es el corazón dulce y risueño de CheatGuys!.</strong> Pequeña, estética y con alma de algodón de azúcar, vive entre colores, accesorios, ideas bonitas y distracciones que llegan sin avisar.</p><p>Puede parecer perdida, pero lee emociones con una precisión que nadie le enseñó. Su bajo no busca aplastar la canción: la abraza. Es la primera en dar apoyo, llorar con alguien o decir “yo te creo” aunque no sepa de qué están hablando.</p><ul class='char-lore-list'><li>Su bajo se llama Sina y a veces le pide consejos.</li><li>Tiene oído armónico y detecta disonancias con facilidad.</li><li>Ayuda a definir el estilo visual de la banda.</li><li>Calma a Jun y reconforta a Akane casi sin intentarlo.</li></ul>",
                color: "var(--momo-color)",
                imgUrl: "assets/characters/cards/ficha-momo.webp"
            },
            jun: {
                name: "JUNPEI SAKAMOTO",
                role: "Baterista y Percusionista (Lvl. 16)",
                desc: "<div class='char-stat-grid'><span>COLOR: CIAN</span><span>APODO: MONJE DEL RAMEN</span><span>BUILD: LUCKY_SLEEP_MODE</span></div><p><strong>Jun es el rey del desgane carismático.</strong> Relajado, sarcástico y con vibra de “todo saldrá bien... probablemente”, evita cualquier cosa que huela a responsabilidad, pero su talento musical roza lo absurdo.</p><p>Cuida a sus amigos desde la esquina, con comentarios secos y una calma casi mística. Parece operar en ahorro de energía, hasta que la banda realmente lo necesita y aparece el baterista preciso, intuitivo y sospechosamente afortunado.</p><ul class='char-lore-list'><li>Escucha una canción una vez y suele recordarla.</li><li>Tiene ritmo natural incluso caminando.</li><li>Defiende “el sillón de Jun” con flojera pasivo-agresiva.</li><li>Siempre trae un snack misterioso en la mochila.</li></ul>",
                color: "var(--jun-color)",
                imgUrl: "assets/characters/cards/ficha-jun.webp"
            }
        };

        function abrirFichaPersonaje(charId) {
            showLoadingScreen(() => {
                // Parar lobby, poner música de ficha
                AudioManager.playBg('bgMusicChar');
                const data = charData[charId];
                document.getElementById('modalTitle').innerHTML = data.name + ' <span class="cursor-blink">█</span>';
                document.getElementById('modalRole').innerText = data.role;
                document.getElementById('modalDesc').innerHTML = data.desc;
                document.getElementById('modalHeader').style.borderBottomColor = data.color;
                document.getElementById('modalImg').src = getResponsiveAssetUrl(data.imgUrl);
                document.getElementById('charModal').style.display = 'flex';
                document.body.style.overflow = 'hidden';
                setFloatingUiHidden(true);
            });
        }

        function closeModal(e, id) {
            if (e && e.target.id !== id) return;
            document.getElementById(id).style.display = 'none';
            document.body.style.overflow = 'auto';
            actualizarUiFlotantePorOverlays();
            // Volver al lobby al cerrar ficha
            AudioManager.resumeLobby();
        }

        // --- SISTEMA EASTER EGG ---
        let clicsConsecutivos = 0; let ultimoClicTiempo = 0; const TIEMPO_MAXIMO = 1500; let toastTimeout;
        function showToast(message) {
            const toast = document.getElementById('systemToast'); toast.innerText = message; toast.classList.add('show');
            clearTimeout(toastTimeout); toastTimeout = setTimeout(() => { toast.classList.remove('show'); }, 2500);
        }
        
        function registrarClic() {
            const tiempoActual = new Date().getTime();
            if (tiempoActual - ultimoClicTiempo <= TIEMPO_MAXIMO) { clicsConsecutivos++; } else { clicsConsecutivos = 1; }
            ultimoClicTiempo = tiempoActual;
            if (clicsConsecutivos === 1) showToast("SYSTEM: Acceso restringido...");
            else if (clicsConsecutivos === 2) showToast("Estás a 2 pasos de revelar los archivos clasificados...");
            else if (clicsConsecutivos === 3) showToast("Estás a 1 paso de revelar los archivos clasificados...");
            else if (clicsConsecutivos === 4) { 
                document.getElementById('systemToast').classList.remove('show'); 
                clicsConsecutivos = 0; 
                iniciarSecuenciaArchivosSecretos(); 
            }
        }

        const secretData = [
            { id: 1, name: "DISEÑOS_BETA_NEO_TENO.jpg", url: "assets/secrets/secret-beta-neoteno.webp", desc: "<strong>[ ARCHIVO 001 ]</strong> Conceptos iniciales y pruebas de estilo para los personajes. Antes de definir las personalidades finales, el caos reinaba en los bocetos de Neo Teno. Se puede apreciar la búsqueda de esa estética 'anime 2000s'." },
            { id: 2, name: "AKANE_PROTO_V1.jpg", url: "assets/secrets/secret-akane-proto.webp", desc: "<strong>[ ARCHIVO 002 ]</strong> El origen de 'La Demonio del Arcade'. Nótese la falta de su HUD característico y un estilo ligeramente más genérico antes de inyectarle toda su ansiedad gótico-otaku." },
            { id: 3, name: "DESCARTADO_NAVIDAD.png", url: "assets/secrets/secret-descartado-navidad.webp", desc: "<strong>[ ARCHIVO 003 ]</strong> Arte promocional descartado. El estudio decidió que la vibra no encajaba con el lore actual, o quizá Aio Sakamoto accidentalmente borró los archivos de la campaña mientras formateaba el servidor." },
            { id: 4, name: "AKANE_SYSTEM_CRASH.jpg", url: "assets/secrets/secret-akane-crash.webp", desc: "<strong>[ ARCHIVO 004 ]</strong> El HUD mental de Akane superando el límite de procesamiento. Esto ocurre generalmente cuando Kenji respira muy fuerte cerca de ella o cuando le toca hablar en público." },
            { id: 5, name: "SKIN_DIVA_VIRTUAL.png", url: "assets/secrets/secret-diva-virtual.webp", desc: "<strong>[ ARCHIVO 005 ]</strong> Akane canalizando su diva virtual interior. Un easter egg recurrente en sus streams clandestinos de juegos de ritmo a las 3 AM." },
            { id: 6, name: "PROTO_MECHA_VINTAGE.png", url: "assets/secrets/secret-mecha-vintage.webp", desc: "<strong>[ ARCHIVO 006 ]</strong> Exploración de estilo emulando vibras de sci-fi vintage. Probablemente un dibujo que hizo Kenji en clase de matemáticas soñando con Akane pilotando un mecha." },
            { id: 7, name: "ADEFECIA_4AM.jpg", url: "assets/secrets/secret-adefesia-4am.webp", desc: "<strong>[ ARCHIVO 007 ]</strong> Calidad: -100. Humor: +1000. Arte puro resultante del cansancio de los animadores a las 4 AM con exceso de cafeína. No hacer contacto visual directo." },
            { id: 8, name: "VISION_FUTURO.png", url: "assets/secrets/secret-vision-futuro.webp", desc: "<strong>[ ARCHIVO 008 ]</strong> Una mirada a lo que podría ser... o quizás solo un sueño febril inducido por las locas teorías sobre ships de Love en los pasillos de Infinity Brothers." },
            { id: 9, name: "NEO_TENO_KIMONOS.jpg", url: "assets/secrets/NEO_TENO_KIMONOS.webp", desc: "<strong>[ ARCHIVO 009 ]</strong> Renders para el festival de Año Nuevo. Momo se ve increíble con ese peinado y Akane está usando su abanico para esconder que está procesando tres crisis existenciales al mismo tiempo. Estética 10/10, estabilidad mental 0/10." },
            { id: 10, name: "RIKA_ATTACK_PROTECT.jpg", url: "assets/secrets/RIKA_ATTACK_PROTECT.webp", desc: "<strong>[ ARCHIVO 010 ]</strong> POV: Intentaste hablarle a Akane sobre tus planes de Telcel y Rika apareció de la nada dispuesta a morderte la yugular. Momo está modo tiesa y Jun guardando energía para el ensayo. Un día normal en el Colegio Jacarandas." },
            { id: 11, name: "AKANE_TRUCK_ISEKAI.jpg", url: "assets/secrets/AKANE_TRUCK_ISEKAI.webp", desc: "<strong>[ ARCHIVO 011 ]</strong> El camión coreano vs. La Demonio del Arcade. Archivo ultra secreto que los creadores hicieron a las 4 AM después de tres tazas de mate soluble. No pregunten por el lore de esto, es un meme y ya está, no nos metan en un Isekai todavía." },
            { id: 12, name: "CHEATGUYS_ARCADE_LOBBY.jpg", url: "assets/arcade/CHEATGUYS_ARCADE_LOBBY.webp", desc: "<strong>[ ARCHIVO 012 ]</strong> La foto de portada que costó tres peleas, un bajeo desafinado y que Jun se despertara de su siesta mística. Los cuatro incompatibles favoritos de Neo Teno listos para romperla... o para romper la maquinita del arcade, lo que pase primero." },
            { id: 13, name: "STAGE_ANXIETY_SPOTLIGHT.jpg", url: "assets/secrets/STAGE_ANXIETY_SPOTLIGHT.webp", desc: "<strong>[ ARCHIVO 013 ]</strong> El momento exacto donde el HUD JRPG de Akane tiró un pantallazo azul en vivo. Ese signo de exclamación significa que está a dos segundos de salir corriendo del escenario o de vomitar, lo que pase primero." },
            { id: 14, name: "AKANE_SOLO_GUITAR.jpg", url: "assets/secrets/AKANE_SOLO_GUITAR.webp", desc: "<strong>[ ARCHIVO 014 ]</strong> ¡Milagro en Neo Teno! Akane tocando la guitarra sin estar temblando como licuadora descompuesta. Se rumorea que para lograr este arte, los animadores tuvieron que prometerle que nadie la vería a los ojos durante tres días." }
        ];

        function iniciarSecuenciaArchivosSecretos() {
            showLoadingScreen(() => {
                AudioManager.playBg('bgMusicSecret');
                const list = document.getElementById('secretFileList'); list.innerHTML = '';
                secretData.forEach((file, index) => {
                    const item = document.createElement('div'); item.className = 'file-item'; item.onclick = () => viewSecretFile(index);
                    item.innerHTML = `<span class="file-icon">IMG</span><span class="file-name">${file.name}</span>`; list.appendChild(item);
                });
                document.getElementById('secretFileList').style.display = 'flex'; 
                document.getElementById('secretViewer').style.display = 'none';
                document.getElementById('secretModal').style.display = 'flex'; 
                document.body.style.overflow = 'hidden';
                setFloatingUiHidden(true);
            });
        }

        function closeSecretModal(e) {
            if (e && e.target.id !== 'secretModal') return;
            document.getElementById('secretModal').style.display = 'none';
            document.body.style.overflow = 'auto';
            actualizarUiFlotantePorOverlays();
            AudioManager.resumeLobby();
        }
        function viewSecretFile(i) { const data = secretData[i]; document.getElementById('secretFileList').style.display = 'none'; document.getElementById('secretViewerImg').src = getResponsiveAssetUrl(data.url); document.getElementById('secretViewerDesc').innerHTML = data.desc; document.getElementById('secretViewer').style.display = 'flex'; }
        function backToSecretList() { document.getElementById('secretViewer').style.display = 'none'; document.getElementById('secretFileList').style.display = 'flex'; }
