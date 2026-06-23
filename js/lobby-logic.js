        // =====================================================
        // AUDIO MANAGER GLOBAL — controlado desde la barra lateral.
        // =====================================================
        const AudioManager = window.AudioManager;

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
            { id: 8, name: "VISION_FUTURO.png", url: "assets/secret-vision-futuro.webp", desc: "<strong>[ ARCHIVO 008 ]</strong> Una mirada a lo que podría ser... o quizás solo un sueño febril inducido por las locas teorías sobre ships de Love en los pasillos de Infinity Brothers." },
            { id: 9, name: "NEO_TENO_KIMONOS.jpg", url: "assets/NEO_TENO_KIMONOS.webp", desc: "<strong>[ ARCHIVO 009 ]</strong> Renders para el festival de Año Nuevo. Momo se ve increíble con ese peinado y Akane está usando su abanico para esconder que está procesando tres crisis existenciales al mismo tiempo. Estética 10/10, estabilidad mental 0/10." },
            { id: 10, name: "RIKA_ATTACK_PROTECT.jpg", url: "assets/RIKA_ATTACK_PROTECT.webp", desc: "<strong>[ ARCHIVO 010 ]</strong> POV: Intentaste hablarle a Akane sobre tus planes de Telcel y Rika apareció de la nada dispuesta a morderte la yugular. Momo está modo tiesa y Jun guardando energía para el ensayo. Un día normal en el Colegio Jacarandas." },
            { id: 11, name: "AKANE_TRUCK_ISEKAI.jpg", url: "assets/AKANE_TRUCK_ISEKAI.webp", desc: "<strong>[ ARCHIVO 011 ]</strong> El camión coreano vs. La Demonio del Arcade. Archivo ultra secreto que los creadores hicieron a las 4 AM después de tres tazas de mate soluble. No pregunten por el lore de esto, es un meme y ya está, no nos metan en un Isekai todavía." },
            { id: 12, name: "CHEATGUYS_ARCADE_LOBBY.jpg", url: "assets/CHEATGUYS_ARCADE_LOBBY.webp", desc: "<strong>[ ARCHIVO 012 ]</strong> La foto de portada que costó tres peleas, un bajeo desafinado y que Jun se despertara de su siesta mística. Los cuatro incompatibles favoritos de Neo Teno listos para romperla... o para romper la maquinita del arcade, lo que pase primero." },
            { id: 13, name: "STAGE_ANXIETY_SPOTLIGHT.jpg", url: "assets/STAGE_ANXIETY_SPOTLIGHT.webp", desc: "<strong>[ ARCHIVO 013 ]</strong> El momento exacto donde el HUD JRPG de Akane tiró un pantallazo azul en vivo. Ese signo de exclamación significa que está a dos segundos de salir corriendo del escenario o de vomitar, lo que pase primero." },
            { id: 14, name: "AKANE_SOLO_GUITAR.jpg", url: "assets/AKANE_SOLO_GUITAR.webp", desc: "<strong>[ ARCHIVO 014 ]</strong> ¡Milagro en Neo Teno! Akane tocando la guitarra sin estar temblando como licuadora descompuesta. Se rumorea que para lograr este arte, los animadores tuvieron que prometerle que nadie la vería a los ojos durante tres días." }
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
