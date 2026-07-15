        // =====================================================
        // AUDIO MANAGER GLOBAL — controlado desde la barra lateral.
        // =====================================================
        const AudioManager = window.AudioManager;
        const CG_CONFIG = window.CG_CONFIG || {};
        const CG_LOG = window.CG_LOG || null;

        function applyActiveLanguage(root) {
            if (window.CGLanguage && typeof window.CGLanguage.refresh === "function") {
                window.CGLanguage.refresh(root);
            } else if (window.CGLanguage && typeof window.CGLanguage.apply === "function") {
                window.CGLanguage.apply(root);
            }
        }

        function translateUiText(text) {
            if (window.CGLanguage && typeof window.CGLanguage.translate === "function") {
                return window.CGLanguage.translate(text);
            }
            return text;
        }

        // =====================================================
        // GARAGE MIXER // previews promocionales de iTunes
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
        let mixerFadeTimer = null;
        let mixerFadeInterval = null;
        const MIXER_PREVIEW_VOLUME = 0.5;
        const MIXER_FADE_DURATION_MS = 2600;
        const MIXER_AUDIO_UNLOCK_SRC = "data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";

        previewAudio.preload = "none";
        previewAudio.volume = MIXER_PREVIEW_VOLUME;

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
            clearMixerFade();
            previewAudio.onended = null;
            previewAudio.pause();
            previewAudio.removeAttribute("src");
            previewAudio.load();
        }

        function clearMixerFade() {
            if (mixerFadeTimer) {
                window.clearTimeout(mixerFadeTimer);
                mixerFadeTimer = null;
            }
            if (mixerFadeInterval) {
                window.clearInterval(mixerFadeInterval);
                mixerFadeInterval = null;
            }
        }

        function startMixerFadeOut() {
            clearMixerFade();
            const startVolume = previewAudio.volume || MIXER_PREVIEW_VOLUME;
            const startedAt = performance.now();

            const fadeStep = () => {
                if (previewAudio.paused || !previewAudio.src) return;
                const timestamp = performance.now();
                const progress = Math.min((timestamp - startedAt) / MIXER_FADE_DURATION_MS, 1);
                previewAudio.volume = Math.max(startVolume * (1 - progress), 0);
                if (progress >= 1 && mixerFadeInterval) {
                    window.clearInterval(mixerFadeInterval);
                    mixerFadeInterval = null;
                }
            };

            fadeStep();
            mixerFadeInterval = window.setInterval(fadeStep, 80);
        }

        function scheduleMixerFadeOut() {
            clearMixerFade();
            if (!Number.isFinite(previewAudio.duration) || previewAudio.duration <= 0) {
                previewAudio.addEventListener("loadedmetadata", scheduleMixerFadeOut, { once: true });
                return;
            }
            const remainingMs = Math.max((previewAudio.duration - previewAudio.currentTime) * 1000, 0);
            const fadeDelay = Math.max(remainingMs - MIXER_FADE_DURATION_MS, 0);
            mixerFadeTimer = window.setTimeout(startMixerFadeOut, fadeDelay);
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
                previewAudio.volume = MIXER_PREVIEW_VOLUME;
                await previewAudio.play();
                if (currentRequestId !== mixerRequestId) {
                    clearMixerAudio();
                    return;
                }
                scheduleMixerFadeOut();

                elements.window.classList.remove("is-loading");
                elements.visualizer.classList.add("is-playing");
                elements.status.textContent = "STREAMING // ITUNES_PREVIEW";

                previewAudio.onended = () => {
                    clearMixerFade();
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

        const xFeedState = {
            postsLoaded: false,
            requestPromise: null,
            lastTrigger: null,
            mobileQuery: window.matchMedia ? window.matchMedia("(max-width: 1379px)") : null
        };

        function getXFeedElements() {
            return {
                window: document.getElementById("xFeedWindow"),
                container: document.querySelector("[data-cg-x-feed-container]"),
                frameShell: document.querySelector(".x-feed-frame"),
                posts: document.querySelector("[data-cg-x-feed-posts]"),
                updated: document.querySelector("[data-cg-x-feed-updated]"),
                openButton: document.querySelector("[data-cg-x-feed-open]"),
                closeButton: document.querySelector("[data-cg-x-feed-close]")
            };
        }

        function isXFeedMobileMode() {
            return Boolean(xFeedState.mobileQuery && xFeedState.mobileQuery.matches);
        }

        function showXFeedFallback() {
            const elements = getXFeedElements();
            if (!elements.frameShell || xFeedState.postsLoaded) return;
            elements.frameShell.classList.remove("is-loading");
            elements.frameShell.classList.add("is-fallback");
        }

        function createXFeedPost(post) {
            const article = document.createElement("article");
            article.className = "x-feed-post";

            const meta = document.createElement("div");
            meta.className = "x-feed-post-meta";

            const tag = document.createElement("span");
            tag.className = "x-feed-post-tag";
            tag.textContent = post.tag || "X_SIGNAL";

            const date = document.createElement("time");
            date.className = "x-feed-post-date";
            date.dateTime = post.date || "";
            date.textContent = post.date || "LIVE";

            const title = document.createElement("strong");
            title.className = "x-feed-post-title";
            title.textContent = post.title || "POST_BUFFER";

            const text = document.createElement("p");
            text.className = "x-feed-post-text";
            text.textContent = post.text || "";

            const media = document.createElement("img");
            media.className = "x-feed-post-media";
            media.loading = "lazy";
            media.decoding = "async";
            media.src = post.image || "";
            media.alt = post.imageAlt || "";
            media.hidden = !post.image;

            const link = document.createElement("a");
            link.className = "x-feed-post-link";
            link.href = post.url || "https://x.com/infinitybrooo";
            link.target = "_blank";
            link.rel = "noopener";
            link.textContent = "[ OPEN_POST ]";

            meta.append(tag, date);
            article.append(meta, title, text);
            if (post.image) article.append(media);
            article.append(link);
            return article;
        }

        function renderXFeed(data) {
            const elements = getXFeedElements();
            const posts = Array.isArray(data?.posts) ? data.posts : [];
            if (!elements.frameShell || !elements.posts || posts.length === 0) {
                showXFeedFallback();
                return;
            }

            elements.posts.replaceChildren(...posts.map(createXFeedPost));
            elements.frameShell.classList.remove("is-loading", "is-fallback");
            elements.frameShell.classList.add("is-loaded");
            xFeedState.postsLoaded = true;

            if (elements.updated && data.updatedLabel) {
                elements.updated.textContent = `X/TWITTER SIGNAL // ${data.updatedLabel}`;
            }
        }

        function loadXFeedPosts() {
            const elements = getXFeedElements();
            if (!elements.frameShell) return Promise.resolve();
            if (xFeedState.postsLoaded) return Promise.resolve();

            elements.frameShell.classList.add("is-loading");
            elements.frameShell.classList.remove("is-loaded", "is-fallback");

            if (!xFeedState.requestPromise) {
                xFeedState.requestPromise = fetch("assets/data/x-feed.json", {
                    cache: "no-store",
                    headers: { Accept: "application/json" }
                })
                    .then((response) => {
                        if (!response.ok) throw new Error(`Feed manual respondio ${response.status}`);
                        return response.json();
                    })
                    .then(renderXFeed)
                    .catch((error) => {
                        if (CG_LOG) CG_LOG.warn("X_FEED", "No se pudo cargar el feed manual.", error);
                        showXFeedFallback();
                    });
            }

            return xFeedState.requestPromise;
        }

        function syncXFeedMode() {
            const elements = getXFeedElements();
            if (!elements.window) return;

            const mobile = isXFeedMobileMode();
            if (!mobile) {
                elements.window.classList.remove("is-open");
                elements.window.setAttribute("aria-hidden", "false");
                elements.window.inert = false;
                window.setTimeout(loadXFeedPosts, 900);
                return;
            }

            const isOpen = elements.window.classList.contains("is-open");
            elements.window.setAttribute("aria-hidden", String(!isOpen));
            elements.window.inert = !isOpen;
        }

        function openXFeedWindow() {
            const elements = getXFeedElements();
            if (!elements.window) return;

            xFeedState.lastTrigger = document.activeElement;
            loadXFeedPosts();

            if (window.CGOverlay && isXFeedMobileMode()) {
                window.CGOverlay.open("xFeedWindow", {
                    mode: "class",
                    openClass: "is-open",
                    focusElement: elements.closeButton,
                    returnFocus: xFeedState.lastTrigger,
                    closeOthers: false,
                    onEscape: closeXFeedWindow
                });
                elements.window.inert = false;
            } else {
                elements.window.classList.add("is-open");
                elements.window.setAttribute("aria-hidden", "false");
                elements.window.inert = false;
            }
        }

        function closeXFeedWindow() {
            const elements = getXFeedElements();
            if (!elements.window || !isXFeedMobileMode()) return;

            if (window.CGOverlay) {
                window.CGOverlay.close("xFeedWindow", { returnFocus: xFeedState.lastTrigger });
                elements.window.inert = true;
            } else {
                elements.window.classList.remove("is-open");
                elements.window.setAttribute("aria-hidden", "true");
                elements.window.inert = true;
                if (xFeedState.lastTrigger && document.contains(xFeedState.lastTrigger)) {
                    xFeedState.lastTrigger.focus({ preventScroll: true });
                }
            }
            xFeedState.lastTrigger = null;
        }

        function setupXFeedWindow() {
            const elements = getXFeedElements();
            if (!elements.window) return;

            elements.openButton?.addEventListener("click", openXFeedWindow);
            elements.closeButton?.addEventListener("click", closeXFeedWindow);

            if (xFeedState.mobileQuery) {
                if (typeof xFeedState.mobileQuery.addEventListener === "function") {
                    xFeedState.mobileQuery.addEventListener("change", syncXFeedMode);
                } else if (typeof xFeedState.mobileQuery.addListener === "function") {
                    xFeedState.mobileQuery.addListener(syncXFeedMode);
                }
            }

            syncXFeedMode();
        }

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

            setupXFeedWindow();

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
                applyActiveLanguage(document.getElementById('charModal'));
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
            const toast = document.getElementById('systemToast'); toast.innerText = translateUiText(message); toast.classList.add('show');
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
                applyActiveLanguage(document.getElementById('secretModal'));
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
        function viewSecretFile(i) { const data = secretData[i]; document.getElementById('secretFileList').style.display = 'none'; document.getElementById('secretViewerImg').src = getResponsiveAssetUrl(data.url); document.getElementById('secretViewerDesc').innerHTML = data.desc; document.getElementById('secretViewer').style.display = 'flex'; applyActiveLanguage(document.getElementById('secretViewer')); }
        function backToSecretList() { document.getElementById('secretViewer').style.display = 'none'; document.getElementById('secretFileList').style.display = 'flex'; applyActiveLanguage(document.getElementById('secretModal')); }
