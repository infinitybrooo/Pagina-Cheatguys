        // =====================================================
        // AUDIO MANAGER — Una sola pista de fondo a la vez.
        // Cada contexto tiene su propia pista exclusiva.
        // Lobby siempre reanuda desde donde se pausó.
        // =====================================================
        let hasMusicStarted = false;
        let musicEnabled = true;

        const AudioManager = {
            _current: null,   // id de la pista actualmente activa
            _cache: {},       // referencias DOM cacheadas

            _el(id) {
                if (!this._cache[id]) this._cache[id] = document.getElementById(id);
                return this._cache[id];
            },

            // Multiplicadores de volumen por pista
            _mult: {
                bgMusicPage:        1.0,
                bgMusicArcade:      1.4,
                bgMusicSecret:      1.0,
                bgMusicChar:        0.9,
                bgMusicSuddenDeath: 1.3,
                bgMusicGameOver:    1.2,
            },

            // Aplica volumen del slider × multiplicador de pista
            setVolume(masterVol) {
                for (const [id, mult] of Object.entries(this._mult)) {
                    const el = this._el(id);
                    if (el) el.volume = Math.min(masterVol * mult, 1.0);
                }
            },

            // Detiene la pista anterior y arranca la nueva desde el principio
            playBg(id) {
                if (!musicEnabled) return;
                if (this._current && this._current !== id) {
                    const prev = this._el(this._current);
                    if (prev) { prev.pause(); prev.currentTime = 0; }
                }
                this._current = id;
                const el = this._el(id);
                if (el) el.play().catch(() => {});
            },

            // Solo pausa sin resetear — para preservar posición del lobby
            pauseCurrent() {
                const el = this._el(this._current);
                if (el) el.pause();
            },

            // Vuelve al lobby: detiene todo lo demás, reanuda bgMusicPage
            // donde se quedó (no reinicia currentTime)
            resumeLobby() {
                if (!musicEnabled) return;
                if (this._current && this._current !== 'bgMusicPage') {
                    const prev = this._el(this._current);
                    if (prev) { prev.pause(); prev.currentTime = 0; }
                }
                this._current = 'bgMusicPage';
                const el = this._el('bgMusicPage');
                if (el) el.play().catch(() => {});
            },

            // Silencia todo (toggle OFF)
            muteAll() {
                for (const id of Object.keys(this._mult)) {
                    const el = this._el(id);
                    if (el) el.pause();
                }
            }
        };

        // =====================================================
        // UI FLOTANTE — Oculta botones/paneles externos mientras
        // hay un modal/overlay abierto (ficha, secretos, mitsuki, arcade, galería)
        // =====================================================
        function setFloatingUiHidden(hidden) {
            document.body.classList.toggle('overlay-open', hidden);
        }

        function hayOverlayActivo() {
            const idsOverlayDisplay = ['charModal', 'secretModal', 'mitsukiOverlay', 'arcadeContainer'];
            const overlayPorDisplay = idsOverlayDisplay.some((id) => {
                const el = document.getElementById(id);
                return el && el.style.display === 'flex';
            });
            const galleryModal = document.getElementById('galleryModal');
            const overlayPorClase = !!(galleryModal && galleryModal.classList.contains('is-open'));
            return overlayPorDisplay || overlayPorClase;
        }

        function actualizarUiFlotantePorOverlays() {
            setFloatingUiHidden(hayOverlayActivo());
        }

        // Animación Inicial al Entrar
        document.addEventListener("DOMContentLoaded", () => {
            const volSlider = document.getElementById('pageVolumeSlider');
            const musicBtn  = document.getElementById('musicToggleBtn');

            // Volumen inicial
            AudioManager.setVolume(parseFloat(volSlider.value));

            // Slider de volumen
            volSlider.addEventListener('input', (e) => {
                AudioManager.setVolume(parseFloat(e.target.value));
            });

            // Toggle música ON/OFF
            window.toggleMusic = function() {
                musicEnabled = !musicEnabled;
                if (musicEnabled) {
                    musicBtn.textContent = '🎵';
                    musicBtn.classList.remove('music-off');
                    if (hasMusicStarted) AudioManager.resumeLobby();
                } else {
                    musicBtn.textContent = '🔇';
                    musicBtn.classList.add('music-off');
                    AudioManager.muteAll();
                }
            };

            // Desbloqueo de audio en primer gesto (bypass autoplay)
            const tryStartMusic = () => {
                if (!hasMusicStarted && musicEnabled) {
                    AudioManager._el('bgMusicPage').play().then(() => {
                        hasMusicStarted = true;
                        AudioManager._current = 'bgMusicPage';
                        document.removeEventListener('click',    tryStartMusic, true);
                        document.removeEventListener('touchend', tryStartMusic, true);
                        document.removeEventListener('keydown',  tryStartMusic, true);
                    }).catch(() => {});
                }
            };
            document.addEventListener('click',    tryStartMusic, true);
            document.addEventListener('touchend', tryStartMusic, { capture: true, passive: true });
            document.addEventListener('keydown',  tryStartMusic, true);

            document.body.style.overflow = 'hidden';
            showLoadingScreen(() => {
                document.body.style.overflow = 'auto';
                document.body.classList.add('page-loaded');
            });

            // Interceptor de Links
            document.querySelectorAll('a').forEach(link => {
                if (link.href && !link.href.startsWith('javascript') && !link.href.startsWith('#')) {
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
            }, 2000);
        }

        // --- SISTEMA FICHAS DE PERSONAJE ---
        const charData = {
            akane: { name: "AKANE HOSHIZORA", role: "Vocalista y Guitarra Rítmica (Lvl. 15)", desc: "<p><strong>«La Demonio del Arcade».</strong> Introvertida, con un severo cuadro de ansiedad social y un HUD mental estilo JRPG clásico que se satura a la menor provocación. Su estética fusiona la ternura con toques gótico-otaku.</p><p>Es el núcleo emocional y creativo de la banda. Posee una motricidad fina increíble y una precisión quirúrgica heredada de romper récords en maquinitas clandestinas. Aunque lidera temblando en el escenario, su genialidad musical radica en una honestidad brutal que no puede esconderse tras distorsiones ruidosas.</p>", color: "var(--akane-color)", imgUrl: "assets/ficha-akane.webp" },
            rika: { name: "RIKA TANAKA", role: "Guitarra Principal y Compositora (Lvl. 16)", desc: "<p><strong>«La Naranja Mecánica».</strong> Una bomba de tiempo punk-metal: pasional, impulsiva, sumamente expresiva y con una complexión atlética armada para el ataque directo.</p><p>Es el escudo físico y protector de Akane. Rika no es un prodigio de nacimiento; toca de forma brillante porque sangra sobre la guitarra, ensaya con intensidad salvaje en su ESP Horizon y arrastra a las masas con su agresividad escénica. Actúa como el motor de energía que obliga a la party a no quedarse estancada.</p>", color: "var(--rika-color)", imgUrl: "assets/ficha-rika.webp" },
            momo: { name: "MOMO FUJIWARA", role: "Bajista y Encargada Estética (Lvl. 15)", desc: "<p><strong>«La Pulga».</strong> El corazón suave y armónico del grupo. Vive metida en un universo rosa pastel, pero esconde un trasfondo clásico al dominar el violonchelo, un instrumento elegante e inútil para el garage rock de la banda.</p><p>Al ser la más petite y empática del grupo, su rol es vital: su bajeo constante con su bajo 'Sina' no busca la velocidad destructiva, sino 'abrazar' el sonido para equilibrar las fricciones de la banda. Evita que el caos de los chicos se rompa en el intento, siendo el pegamento que mantiene unida a la party.</p>", color: "var(--momo-color)", imgUrl: "assets/ficha-momo.webp" },
            jun: { name: "JUNPEI SAKAMOTO", role: "Baterista y Percusionista (Lvl. 16)", desc: "<p><strong>«El Maestro del Desgane Carismático».</strong> Flojo, sarcástico, de silueta alargada y con un sistema operativo que corre estrictamente en modo de ahorro de energía extrema. Tiene apellido de japonés pero alma de latino al dominar la percusión urbana de la metrópoli.</p><p>Es el protector silencioso del grupo y el verdadero monstruo del talento natural absurdo. Jun no necesita practicar ocho horas; asimila el tempo de forma subconsciente y perfecta. Aunque habitualmente opera al 1% por pura pereza mística, cuando activa su modo serio es una bestia rítmica implacable capaz de callarle la boca a cualquiera a puros baquetazos.</p>", color: "var(--jun-color)", imgUrl: "assets/ficha-jun.webp" }
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
                document.getElementById('modalImg').src = data.imgUrl;
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
            { id: 1, name: "DISEÑOS_BETA_NEO_TENO.jpg", url: "assets/secret-beta-neoteno.webp", desc: "<strong>[ ARCHIVO 001 ]</strong> Conceptos iniciales y pruebas de estilo para los personajes. Antes de definir las personalidades finales, el caos reinaba en los bocetos de Neo Teno. Se puede apreciar la búsqueda de esa estética 'anime 2000s'." },
            { id: 2, name: "AKANE_PROTO_V1.jpg", url: "assets/secret-akane-proto.webp", desc: "<strong>[ ARCHIVO 002 ]</strong> El origen de 'La Demonio del Arcade'. Nótese la falta de su HUD característico y un estilo ligeramente más genérico antes de inyectarle toda su ansiedad gótico-otaku." },
            { id: 3, name: "DESCARTADO_NAVIDAD.png", url: "assets/secret-descartado-navidad.webp", desc: "<strong>[ ARCHIVO 003 ]</strong> Arte promocional descartado. El estudio decidió que la vibra no encajaba con el lore actual, o quizá Aio Sakamoto accidentalmente borró los archivos de la campaña mientras formateaba el servidor." },
            { id: 4, name: "AKANE_SYSTEM_CRASH.jpg", url: "assets/secret-akane-crash.webp", desc: "<strong>[ ARCHIVO 004 ]</strong> El HUD mental de Akane superando el límite de procesamiento. Esto ocurre generalmente cuando Kenji respira muy fuerte cerca de ella o cuando le toca hablar en público." },
            { id: 5, name: "SKIN_DIVA_VIRTUAL.png", url: "assets/secret-diva-virtual.webp", desc: "<strong>[ ARCHIVO 005 ]</strong> Akane canalizando su diva virtual interior. Un easter egg recurrente en sus streams clandestinos de juegos de ritmo a las 3 AM." },
            { id: 6, name: "PROTO_MECHA_VINTAGE.png", url: "assets/secret-mecha-vintage.webp", desc: "<strong>[ ARCHIVO 006 ]</strong> Exploración de estilo emulando vibras de sci-fi vintage. Probablemente un dibujo que hizo Kenji en clase de matemáticas soñando con Akane pilotando un mecha." },
            { id: 7, name: "ADEFECIA_4AM.jpg", url: "assets/secret-adefesia-4am.webp", desc: "<strong>[ ARCHIVO 007 ]</strong> Calidad: -100. Humor: +1000. Arte puro resultante del cansancio de los animadores a las 4 AM con exceso de cafeína. No hacer contacto visual directo." },
            { id: 8, name: "VISION_FUTURO.png", url: "assets/secret-vision-futuro.webp", desc: "<strong>[ ARCHIVO 008 ]</strong> Una mirada a lo que podría ser... o quizás solo un sueño febril inducido por las locas teorías sobre ships de Love en los pasillos de Infinity Brothers." }
        ];

        function iniciarSecuenciaArchivosSecretos() {
            showLoadingScreen(() => {
                AudioManager.playBg('bgMusicSecret');
                const list = document.getElementById('secretFileList'); list.innerHTML = '';
                secretData.forEach((file, index) => {
                    const item = document.createElement('div'); item.className = 'file-item'; item.onclick = () => viewSecretFile(index);
                    item.innerHTML = `<span class="file-icon">🖼️</span><span class="file-name">${file.name}</span>`; list.appendChild(item);
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
        function viewSecretFile(i) { const data = secretData[i]; document.getElementById('secretFileList').style.display = 'none'; document.getElementById('secretViewerImg').src = data.url; document.getElementById('secretViewerDesc').innerHTML = data.desc; document.getElementById('secretViewer').style.display = 'flex'; }
        function backToSecretList() { document.getElementById('secretViewer').style.display = 'none'; document.getElementById('secretFileList').style.display = 'flex'; }


