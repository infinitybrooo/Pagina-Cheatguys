        // =====================================================
        // AUDIO MANAGER GLOBAL — controlado desde la barra lateral.
        // =====================================================
        const AudioManager = window.AudioManager;
        const CG_CONFIG = window.CG_CONFIG || {};
        const CG_LOG = window.CG_LOG || null;

        // =====================================================
        // GUERRILLA MIXER // previews promocionales de iTunes
        // =====================================================
        function crearPlaylistDesdeTexto(lista) {
            return lista.trim().split(/\r?\n/).map((linea) => {
                const separador = linea.indexOf(" - ");
                return {
                    artist: linea.slice(0, separador).trim(),
                    track: linea.slice(separador + 3).trim()
                };
            }).filter((cancion) => cancion.artist && cancion.track);
        }

        const playlistsMuestra = {
            akane: crearPlaylistDesdeTexto(`
Ado - Gira Gira
Ado - Usseewa
Ado - Odo
Ado - Readymade
Ado - Eien no Akuruhi
YOASOBI - Yoru ni Kakeru
YOASOBI - Ano Yume o Nazotte
YOASOBI - Sangenshoku
YOASOBI - Tabun
Yorushika - Hitchcock
Yorushika - Itte
Yorushika - Nautilus
Yorushika - Haru Dorobou
ZUTOMAYO - Study Me
ZUTOMAYO - Ham
ZUTOMAYO - Kan Saete Kuyashiiwa
ZUTOMAYO - Byoushin wo Kamu
Aimer - Ref:rain
Aimer - Kataomoi
Aimer - Brave Shine
RADWIMPS - Nandemonaiya
RADWIMPS - Is There Still Anything That Love Can Do?
Kenshi Yonezu - Lemon
Kenshi Yonezu - Shunrai
Kenshi Yonezu - Flamingo
TUYU - Compared Child
TUYU - Under Kids
MAISONdes - Cheers feat. Kaede, Yama
Eve - Kaikai Kitan
Eve - Dramaturgy
King Gnu - Hakujitsu
Mrs. GREEN APPLE - Ao to Natsu
Official HIGE DANDism - Pretender
Official HIGE DANDism - Subtitle
DAZBEE - Niji no Muko ni
Ichiko Aoba - Asleep Among Endives
Lamp - For Lovers
Lamp - Last Train At 25 O'Clock
Clairo - Bags
Clairo - Sofia
beabadoobee - Glue Song
beabadoobee - The Perfect Pair
Rex Orange County - Sunflower
Phoebe Bridgers - Scott Street
Phoebe Bridgers - Motion Sickness
The Marías - Cariño
Men I Trust - Show Me How
Weyes Blood - Andromeda
Mitski - First Love / Late Spring
The Cranberries - Dreams
            `),
            rika: crearPlaylistDesdeTexto(`
Queen - Stone Cold Crazy
David Bowie - Rebel Rebel
The Rolling Stones - Paint It, Black
Led Zeppelin - Immigrant Song
Black Sabbath - Paranoid
Deep Purple - Highway Star
The Who - Baba O'Riley
The Clash - London Calling
Blondie - One Way or Another
Joan Jett & The Blackhearts - Bad Reputation
Pat Benatar - Heartbreaker
The Runaways - Cherry Bomb
Heart - Barracuda
Billy Idol - Rebel Yell
Motörhead - Ace of Spades
Ramones - Blitzkrieg Bop
Sex Pistols - Pretty Vacant
Nirvana - Breed
Pixies - Where Is My Mind?
Hole - Celebrity Skin
Garbage - I Think I'm Paranoid
Yeah Yeah Yeahs - Maps
Yeah Yeah Yeahs - Heads Will Roll
The White Stripes - Seven Nation Army
The White Stripes - Fell in Love with a Girl
The Strokes - Reptilia
The Strokes - Last Nite
Arctic Monkeys - Brianstorm
Arctic Monkeys - R U Mine?
Franz Ferdinand - Take Me Out
The Killers - Mr. Brightside
Muse - Hysteria
Muse - Plug In Baby
Paramore - Misery Business
Paramore - That's What You Get
My Chemical Romance - Dead!
My Chemical Romance - Na Na Na (Na Na Na Na Na Na Na Na Na)
Green Day - Basket Case
The Smashing Pumpkins - Zero
Foo Fighters - Monkey Wrench
Royal Blood - Figure It Out
The Black Keys - Lonely Boy
Wolf Alice - Yuk Foo
The Last Dinner Party - Nothing Matters
The Pillows - Ride on Shooting Star
SCANDAL - Shunkan Sentimental
BAND-MAID - Choose me
The Warning - CHOKE
The Warning - MONEY
Wet Leg - Chaise Longue
            `),
            momo: crearPlaylistDesdeTexto(`
Miki Matsubara - Mayonaka no Door / Stay With Me
Mariya Takeuchi - Plastic Love
Anri - Remember Summer Days
Anri - Last Summer Whisper
Taeko Ohnuki - 4:00 A.M.
Meiko Nakahara - Fantasy
Junko Ohashi - Telephone Number
Seiko Matsuda - Sweet Memories
Tomoko Aran - I'm in Love
Tomoko Aran - Midnight Pretenders
Momoko Kikuchi - Adventure
Yurie Kokubu - Just a Joke
Minako Yoshida - Town
Miho Nakayama - You're My Only Shinin' Star
Kaoru Akimoto - Dress Down
Hikaru Utada - First Love
Hikaru Utada - Flavor Of Life -Ballad Version-
Aimer - Kataomoi
Aimer - Ref:rain
aimyon - Marigold
YUI - CHE.R.RY
YUI - Good-bye days
Kana Nishino - Darling
Kana Nishino - Best Friend
eill - SPOTLIGHT
iri - Sparkle
Yuika - Sukidakara
Ryokuoushoku Shakai - Mela!
Ikimonogakari - Kimi ga Iru
Shiina Ringo - Marunouchi Sadistic
Taylor Swift - Lover
Taylor Swift - Enchanted (Taylor's Version)
Taylor Swift - Daylight
Taylor Swift - Delicate (Taylor's Version)
Taylor Swift - You Belong With Me (Taylor's Version)
Ariana Grande - pov
Ariana Grande - moonlight
Ariana Grande - obvious
Ariana Grande - Into You
Billie Eilish - Ocean Eyes
Billie Eilish - BIRDS OF A FEATHER
Billie Eilish - everything i wanted
Billie Eilish - L'AMOUR DE MA VIE
Sabrina Carpenter - Feather
Laufey - From The Start
Clairo - Sofia
beabadoobee - Glue Song
The Marías - Cariño
Carly Rae Jepsen - Run Away With Me
Kero Kero Bonito - Flamingo
            `),
            jun: crearPlaylistDesdeTexto(`
Steely Dan - Peg
Steely Dan - Do It Again
Toto - Rosanna
Rush - Tom Sawyer
Rush - Limelight
Led Zeppelin - Fool in the Rain
The Police - Walking on the Moon
The Police - Roxanne
Genesis - Turn It On Again
Phil Collins - In the Air Tonight
Talking Heads - Crosseyed and Painless
Talking Heads - Once in a Lifetime
David Bowie - Fame
King Crimson - Elephant Talk
The Clash - Rock the Casbah
Jamiroquai - Virtual Insanity
Jamiroquai - Canned Heat
Vulfpeck - Dean Town
Cory Wong - Golden
Snarky Puppy - Lingus
Weather Report - Birdland
Santana - Oye Como Va
Santana - Black Magic Woman / Gypsy Queen
Fito Páez - Mariposa Tecknicolor
Soda Stereo - De Música Ligera
Soda Stereo - En la Ciudad de la Furia
Gustavo Cerati - Crimen
Gustavo Cerati - Puente
Caifanes - Viento
Caifanes - No Dejes Que...
Zoé - Nada
Zoé - Labios Rotos
Enanitos Verdes - Lamento Boliviano
Los Bunkers - Miño
Los Prisioneros - Estrechez de corazón
Café Tacvba - Eres
Café Tacvba - Las Flores
Molotov - Frijolero
Maná - Oye Mi Amor
Los Fabulosos Cadillacs - Matador
Los Fabulosos Cadillacs - Mal Bicho
Andrés Calamaro - Flaca
Charly García - Nos Siguen Pegando Abajo
Luis Alberto Spinetta - Seguir Viviendo Sin Tu Amor
Los Tres - Déjate Caer
Juan Luis Guerra 4.40 - La Bilirrubina
Rubén Blades - Pedro Navaja
Willie Colón & Rubén Blades - Plastico
Calle 13 - Atrévete-Te-Te
Bomba Estéreo - Fuego
            `)
        };

        const mixerShuffleBags = Object.create(null);
        const mixerLastTrackIndex = Object.create(null);

        function barajarIndices(cantidad) {
            const indices = Array.from({ length: cantidad }, (_, indice) => indice);
            for (let indice = indices.length - 1; indice > 0; indice--) {
                const intercambio = Math.floor(Math.random() * (indice + 1));
                [indices[indice], indices[intercambio]] = [indices[intercambio], indices[indice]];
            }
            return indices;
        }

        function elegirCancionPseudoaleatoria(personaje) {
            const playlist = playlistsMuestra[personaje];
            if (!playlist || !playlist.length) return null;

            let bolsa = mixerShuffleBags[personaje];
            if (!bolsa || !bolsa.length) {
                bolsa = barajarIndices(playlist.length);
                const ultimoIndice = mixerLastTrackIndex[personaje];
                const siguienteIndice = bolsa[bolsa.length - 1];

                if (bolsa.length > 1 && siguienteIndice === ultimoIndice) {
                    [bolsa[0], bolsa[bolsa.length - 1]] = [bolsa[bolsa.length - 1], bolsa[0]];
                }
                mixerShuffleBags[personaje] = bolsa;
            }

            const indiceElegido = bolsa.pop();
            mixerLastTrackIndex[personaje] = indiceElegido;
            return playlist[indiceElegido];
        }

        let previewAudio = new Audio();
        let mixerRequestController = null;
        let mixerJsonpCancel = null;
        let mixerRequestId = 0;
        let mixerLastTrigger = null;
        const MIXER_AUDIO_UNLOCK_SRC = "data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";

        previewAudio.preload = "none";
        previewAudio.volume = 0.5;

        function getMixerElements() {
            return {
                window: document.getElementById("mixerWindow"),
                cover: document.getElementById("mixerCoverArt"),
                title: document.getElementById("mixerTrackTitle"),
                visualizer: document.getElementById("mixerVisualizer"),
                status: document.getElementById("mixerStatus"),
                storeLink: document.getElementById("mixerStoreLink")
            };
        }

        function clearMixerAudio() {
            previewAudio.onended = null;
            previewAudio.pause();
            previewAudio.removeAttribute("src");
            previewAudio.load();
        }

        function cancelMixerRequest() {
            if (mixerRequestController) {
                mixerRequestController.abort();
                mixerRequestController = null;
            }
            if (mixerJsonpCancel) {
                mixerJsonpCancel();
                mixerJsonpCancel = null;
            }
        }

        function requestItunesJsonp(apiUrl, signal) {
            return new Promise((resolve, reject) => {
                const callbackName = `cgItunesCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
                const script = document.createElement("script");
                let settled = false;

                const cleanup = () => {
                    window.clearTimeout(timeoutId);
                    script.remove();
                    delete window[callbackName];
                    if (signal) signal.removeEventListener("abort", abortRequest);
                    if (mixerJsonpCancel === abortRequest) mixerJsonpCancel = null;
                };

                const finish = (handler, value) => {
                    if (settled) return;
                    settled = true;
                    cleanup();
                    handler(value);
                };

                const abortRequest = () => {
                    finish(reject, new DOMException("Solicitud cancelada", "AbortError"));
                };

                const timeoutId = window.setTimeout(() => {
                    finish(reject, new Error("iTunes no respondió a tiempo"));
                }, 8000);

                window[callbackName] = (data) => finish(resolve, data);
                script.onerror = () => finish(reject, new Error("No se pudo consultar iTunes"));
                script.src = `${apiUrl}&callback=${encodeURIComponent(callbackName)}`;
                script.referrerPolicy = "no-referrer";

                if (signal) signal.addEventListener("abort", abortRequest, { once: true });
                mixerJsonpCancel = abortRequest;
                document.head.appendChild(script);
            });
        }

        async function searchItunesTrack(apiUrl, signal) {
            const fetchRequest = (async () => {
                const response = await fetch(apiUrl, { signal, headers: { Accept: "application/json" } });
                if (!response.ok) throw new Error(`iTunes respondió ${response.status}`);
                return await response.json();
            })();

            // El endpoint histórico puede bloquear CORS. Se conserva el fetch solicitado y se
            // ejecuta su fallback JSONP oficial en paralelo para no agotar el gesto de usuario.
            return Promise.any([
                fetchRequest,
                requestItunesJsonp(apiUrl, signal)
            ]);
        }

        async function activarMixerPreview(personaje) {
            const playlist = playlistsMuestra[personaje];
            const elements = getMixerElements();
            if (!playlist || !playlist.length || !elements.window) return;

            mixerLastTrigger = document.activeElement;
            const currentRequestId = ++mixerRequestId;
            cancelMixerRequest();
            clearMixerAudio();
            AudioManager.pauseCurrent();

            // Desbloquea este elemento durante el clic; el fetch asíncrono no conserva siempre
            // la activación de usuario que exige la política de autoplay del navegador.
            previewAudio.src = MIXER_AUDIO_UNLOCK_SRC;
            previewAudio.volume = 0;
            let mixerAudioUnlockError = null;
            const mixerAudioUnlock = previewAudio.play().catch((error) => {
                mixerAudioUnlockError = error;
            });

            const cancion = elegirCancionPseudoaleatoria(personaje);
            if (!cancion) return;
            const term = encodeURIComponent(cancion.track + " " + cancion.artist);
            const apiUrl = `https://itunes.apple.com/search?term=${term}&limit=1&entity=musicTrack`;

            if (window.CGOverlay) {
                window.CGOverlay.open("mixerWindow", {
                    mode: "hidden",
                    openClass: "is-open",
                    focusElement: elements.window.querySelector(".mixer-close"),
                    returnFocus: mixerLastTrigger,
                    closeOthers: false,
                    onEscape: detenerMixerPreview
                });
            } else {
                elements.window.hidden = false;
                elements.window.setAttribute("aria-hidden", "false");
                elements.window.classList.add("is-open");
            }
            elements.window.classList.remove("is-error");
            elements.window.classList.add("is-loading");
            elements.window.dataset.character = personaje;
            elements.visualizer.classList.remove("is-playing");
            elements.cover.removeAttribute("src");
            elements.cover.alt = "Portada del preview seleccionado";
            elements.title.textContent = `${cancion.track.toUpperCase()} // ${cancion.artist.toUpperCase()}`;
            elements.status.textContent = "SEARCHING_ITUNES_DATABASE...";
            elements.storeLink.hidden = true;
            elements.storeLink.removeAttribute("href");

            mixerRequestController = new AbortController();

            try {
                const data = await searchItunesTrack(apiUrl, mixerRequestController.signal);
                if (currentRequestId !== mixerRequestId) return;

                const result = Array.isArray(data.results)
                    ? data.results.find((item) => item.previewUrl)
                    : null;
                if (!result) throw new Error("Preview no disponible");

                const trackName = result.trackName || cancion.track;
                const artistName = result.artistName || cancion.artist;
                const artworkUrl = result.artworkUrl100
                    ? result.artworkUrl100.replace("100x100bb", "600x600bb")
                    : "";

                elements.title.textContent = `${trackName.toUpperCase()} // ${artistName.toUpperCase()}`;
                if (artworkUrl) {
                    elements.cover.src = artworkUrl;
                    elements.cover.alt = `Portada de ${trackName} por ${artistName}`;
                    elements.cover.onerror = () => elements.cover.removeAttribute("src");
                }

                if (result.trackViewUrl) {
                    elements.storeLink.href = result.trackViewUrl;
                    elements.storeLink.hidden = false;
                }

                await mixerAudioUnlock;
                if (mixerAudioUnlockError) throw mixerAudioUnlockError;
                previewAudio.pause();
                previewAudio.src = result.previewUrl;
                previewAudio.volume = 0.5;
                await previewAudio.play();
                if (currentRequestId !== mixerRequestId) {
                    clearMixerAudio();
                    return;
                }

                elements.window.classList.remove("is-loading");
                elements.visualizer.classList.add("is-playing");
                elements.status.textContent = "STREAMING // ITUNES_PREVIEW";

                previewAudio.onended = () => {
                    elements.visualizer.classList.remove("is-playing");
                    elements.status.textContent = "PREVIEW_COMPLETE // LOBBY_RESUMED";
                    if (AudioManager.enabled) AudioManager.resumeLobby();
                };
            } catch (error) {
                if (error.name === "AbortError" || currentRequestId !== mixerRequestId) return;

                clearMixerAudio();
                elements.window.classList.remove("is-loading");
                elements.window.classList.add("is-error");
                elements.visualizer.classList.remove("is-playing");
                if (CG_LOG) CG_LOG.error("AUDIO", "CG-AUDIO-001", "No se pudo reproducir el preview.", error);
                if (error.name === "NotAllowedError") {
                    elements.status.textContent = "AUDIO_BLOCKED // PRESS_PREVIEW_TO_RETRY";
                } else {
                    elements.title.textContent = "PREVIEW_NO_DISPONIBLE";
                    elements.status.textContent = "NETWORK_ERROR // PRESS_PREVIEW_TO_RETRY";
                }
                if (AudioManager.enabled) AudioManager.resumeLobby();
            } finally {
                if (currentRequestId === mixerRequestId) mixerRequestController = null;
            }
        }

        function detenerMixerPreview() {
            const elements = getMixerElements();
            ++mixerRequestId;
            cancelMixerRequest();
            clearMixerAudio();

            if (elements.visualizer) elements.visualizer.classList.remove("is-playing");
            if (elements.window) {
                elements.window.classList.remove("is-loading", "is-error");
                if (window.CGOverlay) {
                    window.CGOverlay.close("mixerWindow", { returnFocus: mixerLastTrigger });
                } else {
                    elements.window.classList.remove("is-open");
                    elements.window.setAttribute("aria-hidden", "true");
                    elements.window.hidden = true;
                }
            }

            if (AudioManager.enabled) AudioManager.resumeLobby();
            if (mixerLastTrigger && document.contains(mixerLastTrigger)) mixerLastTrigger.focus();
            mixerLastTrigger = null;
        }

        document.addEventListener("keydown", (event) => {
            const mixerWindow = document.getElementById("mixerWindow");
            if (event.key === "Escape" && mixerWindow && !mixerWindow.hidden) {
                event.preventDefault();
                detenerMixerPreview();
            }
        });

        // Animación Inicial al Entrar
        document.addEventListener("DOMContentLoaded", () => {
            if (window.CGLobbyStart) {
                window.CGLobbyStart.setup({ showToast });
            }
            setupLobbyControls();
        });

        function setupLobbyControls() {
            document.querySelectorAll("[data-cg-character]").forEach((button) => {
                button.addEventListener("click", () => abrirFichaPersonaje(button.dataset.cgCharacter));
            });

            document.querySelectorAll("[data-cg-mixer]").forEach((button) => {
                button.addEventListener("click", () => activarMixerPreview(button.dataset.cgMixer));
            });

            document.querySelectorAll("[data-cg-mixer-close]").forEach((button) => {
                button.addEventListener("click", detenerMixerPreview);
            });

            document.querySelectorAll("[data-cg-secret-trigger]").forEach((button) => {
                button.addEventListener("click", registrarClic);
            });

            document.querySelectorAll("[data-cg-secret-back]").forEach((button) => {
                button.addEventListener("click", backToSecretList);
            });
        }

        // --- FUNCIÓN GLOBAL DE PANTALLA DE CARGA ---
        function showLoadingScreen(callback) {
            if (window.CGLobbyStart) {
                window.CGLobbyStart.showLoadingScreen(callback);
            } else if (callback) {
                callback();
            }
        }
        window.showLoadingScreen = showLoadingScreen;

        // --- SISTEMA FICHAS DE PERSONAJE ---
        const charData = window.CGLobbyData?.characters || {};

        function abrirFichaPersonaje(charId) {
            showLoadingScreen(() => {
                // Parar lobby, poner música de ficha
                AudioManager.playBg('bgMusicChar');
                const data = charData[charId];
                if (!data) {
                    if (CG_LOG) CG_LOG.error("LOBBY", "CG-LOBBY-001", "Ficha no disponible.", { charId });
                    showToast("SYSTEM: Ficha no disponible por ahora.");
                    return;
                }
                document.getElementById('modalTitle').innerHTML = data.name + ' <span class="cursor-blink">█</span>';
                document.getElementById('modalRole').innerText = data.role;
                document.getElementById('modalDesc').innerHTML = data.desc;
                document.getElementById('modalHeader').style.borderBottomColor = data.color;
                document.getElementById('modalImg').src = getResponsiveAssetUrl(data.imgUrl);
                if (window.CGOverlay) {
                    window.CGOverlay.open("charModal", {
                        mode: "display",
                        display: "flex",
                        focusElement: document.querySelector("#charModal .close-btn"),
                        closeOthers: false,
                        onEscape: () => closeModal(null, "charModal")
                    });
                } else {
                    document.getElementById('charModal').style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                    setFloatingUiHidden(true);
                }
            });
        }

        function closeModal(e, id) {
            if (e && e.target.id !== id) return;
            if (window.CGOverlay) {
                window.CGOverlay.close(id);
            } else {
                document.getElementById(id).style.display = 'none';
                document.body.style.overflow = 'auto';
                actualizarUiFlotantePorOverlays();
            }
            // Volver al lobby al cerrar ficha
            AudioManager.resumeLobby();
        }

        // --- SISTEMA EASTER EGG ---
        let clicsConsecutivos = 0; let ultimoClicTiempo = 0; const TIEMPO_MAXIMO = 1500; let toastTimeout;
        function showToast(message) {
            const toast = document.getElementById('systemToast'); toast.innerText = message; toast.classList.add('show');
            clearTimeout(toastTimeout); toastTimeout = setTimeout(() => { toast.classList.remove('show'); }, 2500);
        }
        window.showToast = showToast;
        
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

        const secretData = window.CGLobbyData?.secrets || [];

        function iniciarSecuenciaArchivosSecretos() {
            showLoadingScreen(() => {
                AudioManager.playBg('bgMusicSecret');
                const list = document.getElementById('secretFileList'); list.innerHTML = '';
                secretData.forEach((file, index) => {
                    const item = document.createElement('div');
                    item.className = 'file-item';
                    item.addEventListener("click", () => viewSecretFile(index));
                    item.innerHTML = `<span class="file-icon">IMG</span><span class="file-name">${file.name}</span>`;
                    list.appendChild(item);
                });
                document.getElementById('secretFileList').style.display = 'flex'; 
                document.getElementById('secretViewer').style.display = 'none';
                if (window.CGOverlay) {
                    window.CGOverlay.open("secretModal", {
                        mode: "display",
                        display: "flex",
                        focusElement: document.querySelector("#secretModal .close-btn"),
                        closeOthers: false,
                        onEscape: () => closeSecretModal()
                    });
                } else {
                    document.getElementById('secretModal').style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                    setFloatingUiHidden(true);
                }
            });
        }

        function closeSecretModal(e) {
            if (e && e.target.id !== 'secretModal') return;
            if (window.CGOverlay) {
                window.CGOverlay.close("secretModal");
            } else {
                document.getElementById('secretModal').style.display = 'none';
                document.body.style.overflow = 'auto';
                actualizarUiFlotantePorOverlays();
            }
            AudioManager.resumeLobby();
        }
        function viewSecretFile(i) { const data = secretData[i]; document.getElementById('secretFileList').style.display = 'none'; document.getElementById('secretViewerImg').src = getResponsiveAssetUrl(data.url); document.getElementById('secretViewerDesc').innerHTML = data.desc; document.getElementById('secretViewer').style.display = 'flex'; }
        function backToSecretList() { document.getElementById('secretViewer').style.display = 'none'; document.getElementById('secretFileList').style.display = 'flex'; }
