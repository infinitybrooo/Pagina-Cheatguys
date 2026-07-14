// =====================================================
// I18N - Selector de idioma persistente para Infinity OS
// =====================================================
(function () {
    "use strict";

    const STORAGE_KEY = "cgLanguageMode";
    const MODES = ["mixed", "es", "en"];
    const textOriginals = new WeakMap();
    const attrOriginals = new WeakMap();
    let currentMode = "mixed";
    let observer = null;
    let scheduled = false;
    let applying = false;
    let originalTitle = "";

    const COMMON_ES = {
        "Home": "Inicio",
        "Who are we?": "¿Quiénes somos?",
        "What is CheatGuys!?": "¿Qué es CheatGuys!?",
        "Minigames": "Minijuegos",
        "Gallery": "Galería",
        "Production Bible": "Biblia de Producción",
        "Music ON/OFF": "Música ON/OFF",
        "Turn music on or off": "Activar o desactivar música",
        "Main menu": "Menú principal",
        "Open/close menu": "Abrir/cerrar menú",
        "LANG_SYS": "IDIOMA_SYS",
        "MIX": "MIX",
        "ES": "ES",
        "EN": "EN",
        "Mixed": "Mixto",
        "Spanish": "Español",
        "English": "Inglés",
        "Language": "Idioma",
        "CheatGuys! is a series owned by Infinity Brothers Studios TM. All artwork, descriptions, documents, characters, music, and story are the property of the studio and are protected by copyright.": "CheatGuys! es una serie propiedad de Infinity Brothers Studios TM. Todo el arte, descripciones, documentos, personajes, música e historia pertenecen al estudio y están protegidos por derechos de autor.",
        "Interactive components (including character chat simulations) utilize experimental AI for entertainment and narrative purposes only. Leaderboard submissions are stored locally for gameplay experience.": "Los componentes interactivos, incluidas las simulaciones de chat con personajes, usan IA experimental solo con fines narrativos y de entretenimiento. Los registros de puntuación se guardan localmente para la experiencia de juego.",
        "CheatGuys! © 2026 Infinity Brothers Studios TM. All rights reserved": "CheatGuys! © 2026 Infinity Brothers Studios TM. Todos los derechos reservados"
    };

    const ES = {
        ...COMMON_ES,
        "CheatGuys! - Multiplayer Lobby": "CheatGuys! - Lobby Multijugador",
        "PRESS START": "PRESIONA START",
        "INSERT COIN // BUILD 2026": "INSERTA MONEDA // BUILD 2026",
        "PLAYER ONE": "JUGADOR UNO",
        "READY": "LISTO",
        "STATUS: WAITING": "ESTADO: ESPERANDO",
        "INPUT: KEYBOARD / TOUCH": "ENTRADA: TECLADO / TÁCTIL",
        "CHECKING CREATIVE_CORE...": "REVISANDO_NUCLEO_CREATIVO...",
        "LOADING GARAGE_DRIVERS...": "CARGANDO_DRIVERS_DEL_GARAJE...",
        "SYNCING AKANE_INPUT...": "SINCRONIZANDO_INPUT_DE_AKANE...",
        "SYSTEM_LOADING": "CARGANDO_SISTEMA",
        "ALERTA_DE_INTRUSO // NÚCLEO_CREATIVO": "ALERTA_DE_INTRUSO // NÚCLEO_CREATIVO",
        "Estás dentro del centro de operaciones secreto de CheatGuys!. 0 perfección, 100% emoción. Selecciona tu personaje para desplegar sus fichas tácticas, desplázate por el menú para revisar nuestro inventario de stickers o toca el póster de la banda si tienes las agallas para revelar los archivos prohibidos del Garaje.": "Estás dentro del centro de operaciones secreto de CheatGuys!. 0 perfección, 100% emoción. Selecciona tu personaje para desplegar sus fichas tácticas, desplázate por el menú para revisar nuestro inventario de stickers o toca el póster de la banda si tienes las agallas para revelar los archivos prohibidos del Garaje.",
        "SELECCIONA_TU_PERSONAJE.EXE": "SELECCIONA_TU_PERSONAJE.EXE",
        "SYSTEM_FILES": "ARCHIVOS_DEL_SISTEMA",
        "Official Pitch Bible": "Biblia oficial de presentación",
        "READ_PRODUCTION_DECK.EXE": "LEER_DOSSIER_DE_PRODUCCION.EXE",
        "Infinity Brothers on X": "Infinity Brothers en X",
        "FOLLOW_STUDIO_UPDATES": "SEGUIR_ACTUALIZACIONES_DEL_ESTUDIO",
        "TikTok Animatics": "Animatics en TikTok",
        "BEHIND_THE_SCENES_VIDEO": "VIDEO_DETRAS_DE_CAMARAS",
        "INVENTORY: STICKERS": "INVENTARIO: STICKERS",
        "WhatsApp Sticker Pack": "Paquete de stickers para WhatsApp",
        "EQUIP: AKANE'S ANXIETY": "EQUIPAR: ANSIEDAD_DE_AKANE",
        "Discord Emotes": "Emotes de Discord",
        "COMING_SOON.EXE": "PROXIMAMENTE.EXE",
        "MERCHANT_SHOP": "TIENDA_DEL_MERCADER",
        "Patreon Guild": "Gremio de Patreon",
        "Mitsuki's Coffee": "Café de Mitsuki",
        "BUY_HER_A_COFFEE_FOR_THE_TEACHER": "COMPRALE_UN_CAFE_A_LA_MAESTRA",
        "PayPal Donations": "Donaciones por PayPal",
        "SUPPORT_INDIE_ANIMATION": "APOYA_LA_ANIMACION_INDIE",
        "SOUND_TEST_MENU": "MENU_DE_PRUEBA_DE_AUDIO",
        "Akane: Noise I Can't Say Out Loud": "Akane: Ruido que no puedo decir en voz alta",
        "Rika: Volume First, Consequences Later": "Rika: Volumen primero, consecuencias después",
        "Momo: Pink City Lights": "Momo: Luces rosas de ciudad",
        "Jun: Sleepy Groove, Sharp Timing": "Jun: Ritmo somnoliento, precisión afilada",
        "COMMUNICATIONS": "COMUNICACIONES",
        "Send System Mail": "Enviar correo del sistema",
        "WhatsApp Business": "WhatsApp Business",
        "DIRECT_CHAT_WITH_STUDIO": "CHAT_DIRECTO_CON_EL_ESTUDIO",
        "NOW_PREVIEWING // 30_SEC": "REPRODUCIENDO_PREVIEW // 30_SEG",
        "WAITING_FOR_INPUT": "ESPERANDO_ENTRADA",
        "SELECCIONANDO...": "SELECCIONANDO...",
        "PREVIEW PROVIDED COURTESY OF ITUNES // STREAM_ONLY": "PREVIEW CORTESIA DE ITUNES // SOLO_STREAM",
        "LIVE_TRANSMISSION // @INFINITYBROOO": "TRANSMISION_EN_VIVO // @INFINITYBROOO",
        "No se pudo cargar el feed manual.": "No se pudo cargar el feed manual.",
        "[ OPEN_X_PROFILE ]": "[ ABRIR_PERFIL_X ]",
        "[ OPEN_POST ]": "[ ABRIR_POST ]",
        "[ OPEN_X_FEED ]": "[ ABRIR_X_FEED ]",
        "X/TWITTER SIGNAL // MANUAL_SYNC": "SEÑAL_X/TWITTER // SINCRONIA_MANUAL",
        "NO PRESIONAR": "NO PRESIONAR",
        "NAME": "NOMBRE",
        "Role": "Rol",
        "SECRET_ARCHIVES_MENU": "MENU_DE_ARCHIVOS_SECRETOS",
        "[ < VOLVER_A_LISTA ]": "[ < VOLVER_A_LISTA ]",
        "MITSUKI_SYSTEM": "SISTEMA_MITSUKI",
        "[ CONTINUAR ]": "[ CONTINUAR ]",
        "Omitir la introduccion y continuar al lobby": "Omitir la introducción y continuar al lobby",
        "[ OMITIR_INTRO.EXE ]": "[ OMITIR_INTRO.EXE ]",

        "¿QUIÉNES SOMOS?": "¿QUIÉNES SOMOS?",
        "Infinity Brothers Studios es el búnker creativo detrás de CheatGuys!: un espacio donde avatares caóticos, narrativa visual y animación tradicional chocan para construir universos excéntricos con alma emocional propia.": "Infinity Brothers Studios es el búnker creativo detrás de CheatGuys!: un espacio donde avatares caóticos, narrativa visual y animación tradicional chocan para construir universos excéntricos con alma emocional propia.",
        "El ecosistema meta": "El ecosistema meta",
        "Las mascotas del estudio operan desde el metaverso con distintos niveles de caos creativo.": "Las mascotas del estudio operan desde el metaverso con distintos niveles de caos creativo.",
        "La escritora compulsiva": "La escritora compulsiva",
        "Una flor cósmica excéntrica, impredecible y con una energía caótica desbordada.": "Una flor cósmica excéntrica, impredecible y con una energía caótica desbordada.",
        "Es la fuente mayor de ideas y la mente detrás de los conceptos más puros del estudio. Tiene un corazón enorme bajo sus capas de creatividad y locura.": "Es la fuente mayor de ideas y la mente detrás de los conceptos más puros del estudio. Tiene un corazón enorme bajo sus capas de creatividad y locura.",
        "El arquitecto del caos": "El arquitecto del caos",
        "Un agujero negro personificado en una sudadera viva: reservado, analítico y poco fan de las multitudes.": "Un agujero negro personificado en una sudadera viva: reservado, analítico y poco fan de las multitudes.",
        "Convierte el caos de Sally en cimientos sólidos mediante worldbuilding, líneas de tiempo y escaletas narrativas.": "Convierte el caos de Sally en cimientos sólidos mediante construcción de mundos, líneas de tiempo y escaletas narrativas.",
        "La reina del desgane": "La reina del desgane",
        "Una nebulosa flotante y diseñadora de personajes oficial, con talento gráfico monumental y energía física cuestionable.": "Una nebulosa flotante y diseñadora de personajes oficial, con talento gráfico monumental y energía física cuestionable.",
        "Tras su somnolencia mística vive una personalidad dulce, tierna y apasionada por ilustrar, diseñar y discutir sus ships favoritos.": "Tras su somnolencia mística vive una personalidad dulce, tierna y apasionada por ilustrar, diseñar y discutir sus ships favoritos.",
        "Las personas detrás del estudio": "Las personas detrás del estudio",
        "Detrás de los avatares coloridos existe una estructura real: Infinity Brothers Studios somos dos hermanos originarios de Jalisco, México.": "Detrás de los avatares coloridos existe una estructura real: Infinity Brothers Studios somos dos hermanos originarios de Jalisco, México.",
        "Nos mueve el poder de la narrativa visual y el lenguaje de la animación tradicional. Fundamos este espacio para convertirlo en la cuna de proyectos excéntricos, sorprendentes y con un alma emocional única para cada universo.": "Nos mueve el poder de la narrativa visual y el lenguaje de la animación tradicional. Fundamos este espacio para convertirlo en la cuna de proyectos excéntricos, sorprendentes y con un alma emocional única para cada universo.",
        "Roles de producción": "Roles de producción",
        "El lado humano del búnker: arte visual, escritura, continuidad y dirección creativa.": "El lado humano del búnker: arte visual, escritura, continuidad y dirección creativa.",
        "Director de Arte & Diseño Visual": "Director de Arte y Diseño Visual",
        "Responsable del universo estético y la identidad visual de la productora.": "Responsable del universo estético y la identidad visual de la productora.",
        "Diseño de personajes y consistencia estilística en 2D.": "Diseño de personajes y consistencia estilística en 2D.",
        "Conceptos de fondos, turnarounds e ilustración promocional.": "Conceptos de fondos, hojas de giro e ilustración promocional.",
        "Showrunner & Lead Writer": "Showrunner y Guionista Principal",
        "Responsable de la arquitectura conceptual, el desarrollo literario y la continuidad de los proyectos.": "Responsable de la arquitectura conceptual, el desarrollo literario y la continuidad de los proyectos.",
        "Guiones cinematográficos, estructuras narrativas y biblias de producción.": "Guiones cinematográficos, estructuras narrativas y biblias de producción.",
        "Worldbuilding, backstory y mitologías internas de cada universo.": "Construcción de mundos, trasfondo y mitologías internas de cada universo.",
        "Un estudio pequeño con hambre de universo.": "Un estudio pequeño con hambre de universo.",
        "Infinity Brothers Studios combina diseño, guion, worldbuilding y una terquedad enorme por contar historias con identidad propia.": "Infinity Brothers Studios combina diseño, guion, construcción de mundos y una terquedad enorme por contar historias con identidad propia.",
        "Si CheatGuys! suena raro, colorido y emocional, es porque el estudio también funciona así.": "Si CheatGuys! suena raro, colorido y emocional, es porque el estudio también funciona así.",
        "Historias infinitas. Mundos infinitos.": "Historias infinitas. Mundos infinitos.",

        "¿QUÉ ES CHEATGUYS!?": "¿QUÉ ES CHEATGUYS!?",
        "Una comedia animada sobre una chica con ansiedad social que intenta hacer amigos de la forma más lógica y menos lógica posible: formando una banda de rock.": "Una comedia animada sobre una chica con ansiedad social que intenta hacer amigos de la forma más lógica y menos lógica posible: formando una banda de rock.",
        "Premisa desbloqueada": "Premisa desbloqueada",
        "Akane Hoshizora solo quería sobrevivir su último año de secundaria, jugar videojuegos, tocar guitarra y no tener que hablar con demasiada gente.": "Akane Hoshizora solo quería sobrevivir su último año de secundaria, jugar videojuegos, tocar guitarra y no tener que hablar con demasiada gente.",
        "Su plan para hacer amigos salió demasiado bien: sus carteles mal hechos atrajeron a adolescentes intensos, raros y completamente incompatibles.": "Su plan para hacer amigos salió demasiado bien: sus carteles mal hechos atrajeron a adolescentes intensos, raros y completamente incompatibles.",
        "Resultado: una banda, un garaje invadido, demasiadas emociones desbloqueadas y cero puntos en habilidades sociales.": "Resultado: una banda, un garaje invadido, demasiadas emociones desbloqueadas y cero puntos en habilidades sociales.",
        "La fórmula CheatGuys!": "La fórmula CheatGuys!",
        "Comedia absurda, música, ansiedad adolescente y corazón DIY.": "Comedia absurda, música, ansiedad adolescente y corazón hazlo-tú-mismo.",
        "Comedia absurda": "Comedia absurda",
        "Ensayos caóticos, reacciones exageradas, decisiones terribles y humor meta con alma de cartoon.": "Ensayos caóticos, reacciones exageradas, decisiones terribles y humor meta con alma de caricatura.",
        "Banda escolar": "Banda escolar",
        "Una banda que intenta sonar bien mientras aprende a convivir sin explotar emocionalmente.": "Una banda que intenta sonar bien mientras aprende a convivir sin explotar emocionalmente.",
        "Anime con picante": "Anime con picante",
        "Estética 2000s, HUDs mentales, chiptune, J-Rock y caos mexicano con neones saturados.": "Estética dosmilera, interfaces mentales, chiptune, J-Rock y caos mexicano con neones saturados.",
        "Una amistad mal calibrada": "Una amistad mal calibrada",
        "CheatGuys! habla de crecer cuando no encajas, fallar en público, hacer arte con pocos recursos y descubrir que la amistad no siempre se ve bonita.": "CheatGuys! habla de crecer cuando no encajas, fallar en público, hacer arte con pocos recursos y descubrir que la amistad no siempre se ve bonita.",
        "A veces suena desafinada, grita mucho, ocupa tu sillón favorito y aun así termina siendo justo lo que necesitabas.": "A veces suena desafinada, grita mucho, ocupa tu sillón favorito y aun así termina siendo justo lo que necesitabas.",
        "Neo Teno: el mapa del desastre": "Neo Teno: el mapa del desastre",
        "Donde el manga, el mariachi, el karaoke y los tianguis tecnológicos conviven en hora pico.": "Donde el manga, el mariachi, el karaoke y los tianguis tecnológicos conviven en hora pico.",
        "México niponizado": "México niponizado",
        "La historia ocurre en una versión alternativa del Valle de México donde Japón y México se mezclaron hasta crear una ciudad multicolor, intensa y profundamente rara.": "La historia ocurre en una versión alternativa del Valle de México donde Japón y México se mezclaron hasta crear una ciudad multicolor, intensa y profundamente rara.",
        "Templos sintoístas junto a puestos de tamales.": "Templos sintoístas junto a puestos de tamales.",
        "Trenes bala pasando frente a mercados de artesanías.": "Trenes bala pasando frente a mercados de artesanías.",
        "Pantallas LED anunciando tacos, karaoke y bandas escolares.": "Pantallas LED anunciando tacos, karaoke y bandas escolares.",
        "Arcades clandestinos con olor a fritura y gloria digital.": "Arcades clandestinos con olor a fritura y gloria digital.",
        "No es otro anime de banda.": "No es otro anime de banda.",
        "Es una historia ruidosa, colorida y emocionalmente honesta sobre adolescentes raros tratando de funcionar juntos.": "Es una historia ruidosa, colorida y emocionalmente honesta sobre adolescentes raros tratando de funcionar juntos.",
        "Nadie es perfecto, nadie sabe muy bien qué está haciendo y aun así todos siguen tocando.": "Nadie es perfecto, nadie sabe muy bien qué está haciendo y aun así todos siguen tocando.",
        "0 PERFECCIÓN. +100 EMOCIÓN.": "0 PERFECCIÓN. +100 EMOCIÓN.",
        "Laptop de Akane": "Laptop de Akane",
        "Abre una app de la banda y conversa directo desde el bunker de Neo Teno.": "Abre una app de la banda y conversa directo desde el búnker de Neo Teno.",
        "ESCRITORIO": "ESCRITORIO",
        "Cerrar app": "Cerrar app",
        "Escribe un mensaje...": "Escribe un mensaje...",
        "Enviar": "Enviar",

        "GALERÍA": "GALERÍA",
        "ARCHIVO_VISUAL // CHEATGUYS!": "ARCHIVO_VISUAL // CHEATGUYS!",
        "Esos bocetos todavía no estaban terminados…": "Esos bocetos todavía no estaban terminados…",
        "ACTIVE": "ACTIVO",
        "FILES": "ARCHIVOS",
        "VESTIMENTAS": "VESTIMENTAS",
        "TURNAROUNDS": "HOJAS_DE_GIRO",
        "BOCETOS": "BOCETOS",
        "COLOR_ID": "ID_COLOR",
        "FILES_FOUND": "ARCHIVOS_ENCONTRADOS",
        "STATUS:": "ESTADO:",

        "BIBLIA DE PRODUCCIÓN": "BIBLIA DE PRODUCCIÓN",
        "INFINITY OS // FILE MANAGER": "INFINITY OS // ADMINISTRADOR_DE_ARCHIVOS",
        "Autor:": "Autor:",
        "Versión:": "Versión:",
        "Estado:": "Estado:",
        "CONFIDENCIAL": "CONFIDENCIAL",
        "[ ABRIR ARCHIVO ]": "[ ABRIR_ARCHIVO ]",
        "Inicializando visor...": "Inicializando visor...",
        "PÁGINA": "PÁGINA",
        "[ ◀ ANTERIOR ]": "[ ◀ ANTERIOR ]",
        "[ SIGUIENTE ▶ ]": "[ SIGUIENTE ▶ ]",
        "[ PANTALLA COMPLETA ]": "[ PANTALLA_COMPLETA ]",
        "[ DESCARGAR PDF ]": "[ DESCARGAR_PDF ]",

        "ARCADE STAGE": "ESCENARIO ARCADE",
        "¿Crees que puedas superar la máxima puntuación de la Demonio del Arcade? ¡Inténtalo!... Si te atreves...": "¿Crees que puedas superar la máxima puntuación de la Demonio del Arcade? ¡Inténtalo!... Si te atreves...",
        "TU RECORD:": "TU RÉCORD:",
        "AKANE SIGUE ARRIBA": "AKANE SIGUE ARRIBA",
        "MODE:": "MODO:",
        "[ INICIAR_JUEGO ]": "[ INICIAR_JUEGO ]",
        "NUEVO RECORD": "NUEVO RÉCORD",
        "PAUSA": "PAUSA",
        "FIRE": "DISPARAR",
        "REANUDAR": "REANUDAR",
        "REINICIAR": "REINICIAR",
        "SALIR": "SALIR",
        "GAME OVER": "FIN DEL JUEGO",
        "PUNTUACIÓN FINAL: 0": "PUNTUACIÓN FINAL: 0",
        "La Demonio del Arcade sigue invicta.": "La Demonio del Arcade sigue invicta.",
        "[ ¿OTRA FICHA? ]": "[ ¿OTRA FICHA? ]",
        "¿GANASTE?": "¿GANASTE?",
        "Wow, no pense que llegarias hasta aqui, bien por ti supongo... lo que es tener demasiado tiempo libre...": "Wow, no pensé que llegarías hasta aquí, bien por ti supongo... lo que es tener demasiado tiempo libre...",
        "[ VE A TOCAR PASTO ]": "[ VE_A_TOCAR_PASTO ]"
    };

    const EN = {
        "Inicio": "Home",
        "¿Quiénes somos?": "Who are we?",
        "¿Qué es CheatGuys!?": "What is CheatGuys!?",
        "Minijuegos": "Minigames",
        "Galería": "Gallery",
        "Biblia de Producción": "Production Bible",
        "Abrir/cerrar menu": "Open/close menu",
        "Abrir/cerrar menú": "Open/close menu",
        "Menu principal": "Main menu",
        "Menú principal": "Main menu",
        "Control de musica": "Music control",
        "Control de música": "Music control",
        "Musica ON/OFF": "Music ON/OFF",
        "Música ON/OFF": "Music ON/OFF",
        "Activar o desactivar musica": "Turn music on or off",
        "Activar o desactivar música": "Turn music on or off",
        "Idioma": "Language",
        "Mixto": "Mixed",
        "Español": "Spanish",
        "Inglés": "English",
        "IDIOMA_SYS": "LANG_SYS",
        "CheatGuys! es una serie propiedad de Infinity Brothers Studios TM. Todo el arte, descripciones, documentos, personajes, música e historia pertenecen al estudio y están protegidos por derechos de autor.": "CheatGuys! is a series owned by Infinity Brothers Studios TM. All artwork, descriptions, documents, characters, music, and story are the property of the studio and are protected by copyright.",
        "CheatGuys! is a series owned by Infinity Brothers Studios TM. All artwork, descriptions, documents, characters, music, and story are the property of the studio and are protected by copyright.": "CheatGuys! is a series owned by Infinity Brothers Studios TM. All artwork, descriptions, documents, characters, music, and story are the property of the studio and are protected by copyright.",
        "Interactive components (including character chat simulations) utilize experimental AI for entertainment and narrative purposes only. Leaderboard submissions are stored locally for gameplay experience.": "Interactive components, including character chat simulations, use experimental AI only for narrative and entertainment purposes. Leaderboard submissions are stored locally for gameplay.",
        "Los componentes interactivos, incluidas las simulaciones de chat con personajes, usan IA experimental solo con fines narrativos y de entretenimiento. Los registros de puntuación se guardan localmente para la experiencia de juego.": "Interactive components, including character chat simulations, use experimental AI only for narrative and entertainment purposes. Leaderboard submissions are stored locally for gameplay.",
        "CheatGuys! © 2026 Infinity Brothers Studios TM. All rights reserved": "CheatGuys! © 2026 Infinity Brothers Studios TM. All rights reserved",
        "CheatGuys! © 2026 Infinity Brothers Studios TM. Todos los derechos reservados": "CheatGuys! © 2026 Infinity Brothers Studios TM. All rights reserved",

        "CheatGuys! - Lobby Multijugador": "CheatGuys! - Multiplayer Lobby",
        "CheatGuys! - ¿Qué es CheatGuys!?": "CheatGuys! - What is CheatGuys!?",
        "CheatGuys! - ¿Quiénes Somos?": "CheatGuys! - Who Are We?",
        "CheatGuys! - Galería": "CheatGuys! - Gallery",
        "CheatGuys! - Minijuegos": "CheatGuys! - Minigames",
        "CheatGuys! - Biblia de Producción": "CheatGuys! - Production Bible",
        "PRESIONA START": "PRESS START",
        "INSERTA MONEDA // BUILD 2026": "INSERT COIN // BUILD 2026",
        "JUGADOR UNO": "PLAYER ONE",
        "LISTO": "READY",
        "ESTADO: ESPERANDO": "STATUS: WAITING",
        "ENTRADA: TECLADO / TÁCTIL": "INPUT: KEYBOARD / TOUCH",
        "REVISANDO_NUCLEO_CREATIVO...": "CHECKING CREATIVE_CORE...",
        "CARGANDO_DRIVERS_DEL_GARAJE...": "LOADING GARAGE_DRIVERS...",
        "SINCRONIZANDO_INPUT_DE_AKANE...": "SYNCING AKANE_INPUT...",
        "CARGANDO_SISTEMA": "SYSTEM_LOADING",
        "ALERTA_DE_INTRUSO // NÚCLEO_CREATIVO": "INTRUDER_ALERT // CREATIVE_CORE",
        "Estás dentro del centro de operaciones secreto de CheatGuys!. 0 perfección, 100% emoción. Selecciona tu personaje para desplegar sus fichas tácticas, desplázate por el menú para revisar nuestro inventario de stickers o toca el póster de la banda si tienes las agallas para revelar los archivos prohibidos del Garaje.": "You are inside CheatGuys!' secret operations center. 0 perfection, 100% emotion. Select a character to deploy their tactical files, scroll through the menu to check our sticker inventory, or tap the band poster if you have the guts to reveal the forbidden Garage archives.",
        "SELECCIONA_TU_PERSONAJE.EXE": "SELECT_YOUR_CHARACTER.EXE",
        "ARCHIVOS_DEL_SISTEMA": "SYSTEM_FILES",
        "SYSTEM_FILES": "SYSTEM_FILES",
        "Official Pitch Bible": "Official Pitch Bible",
        "Biblia oficial de presentación": "Official Pitch Bible",
        "LEER_DOSSIER_DE_PRODUCCION.EXE": "READ_PRODUCTION_DECK.EXE",
        "Infinity Brothers en X": "Infinity Brothers on X",
        "SEGUIR_ACTUALIZACIONES_DEL_ESTUDIO": "FOLLOW_STUDIO_UPDATES",
        "Animatics en TikTok": "TikTok Animatics",
        "VIDEO_DETRAS_DE_CAMARAS": "BEHIND_THE_SCENES_VIDEO",
        "INVENTARIO: STICKERS": "INVENTORY: STICKERS",
        "Paquete de stickers para WhatsApp": "WhatsApp Sticker Pack",
        "EQUIPAR: ANSIEDAD_DE_AKANE": "EQUIP: AKANE'S ANXIETY",
        "Emotes de Discord": "Discord Emotes",
        "PROXIMAMENTE.EXE": "COMING_SOON.EXE",
        "TIENDA_DEL_MERCADER": "MERCHANT_SHOP",
        "Gremio de Patreon": "Patreon Guild",
        "Café de Mitsuki": "Mitsuki's Coffee",
        "COMPRALE_UN_CAFE_A_LA_MAESTRA": "BUY_HER_A_COFFEE_FOR_THE_TEACHER",
        "Donaciones por PayPal": "PayPal Donations",
        "APOYA_LA_ANIMACION_INDIE": "SUPPORT_INDIE_ANIMATION",
        "MENU_DE_PRUEBA_DE_AUDIO": "SOUND_TEST_MENU",
        "Akane: Ruido que no puedo decir en voz alta": "Akane: Noise I Can't Say Out Loud",
        "Rika: Volumen primero, consecuencias después": "Rika: Volume First, Consequences Later",
        "Momo: Luces rosas de ciudad": "Momo: Pink City Lights",
        "Jun: Ritmo somnoliento, precisión afilada": "Jun: Sleepy Groove, Sharp Timing",
        "COMUNICACIONES": "COMMUNICATIONS",
        "Enviar correo del sistema": "Send System Mail",
        "CHAT_DIRECTO_CON_EL_ESTUDIO": "DIRECT_CHAT_WITH_STUDIO",
        "REPRODUCIENDO_PREVIEW // 30_SEG": "NOW_PREVIEWING // 30_SEC",
        "ESPERANDO_ENTRADA": "WAITING_FOR_INPUT",
        "SELECCIONANDO...": "SELECTING...",
        "PREVIEW CORTESIA DE ITUNES // SOLO_STREAM": "PREVIEW PROVIDED COURTESY OF ITUNES // STREAM_ONLY",
        "TRANSMISION_EN_VIVO // @INFINITYBROOO": "LIVE_TRANSMISSION // @INFINITYBROOO",
        "No se pudo cargar el feed manual.": "The manual feed could not be loaded.",
        "[ ABRIR_PERFIL_X ]": "[ OPEN_X_PROFILE ]",
        "[ ABRIR_POST ]": "[ OPEN_POST ]",
        "[ ABRIR_X_FEED ]": "[ OPEN_X_FEED ]",
        "SEÑAL_X/TWITTER // SINCRONIA_MANUAL": "X/TWITTER SIGNAL // MANUAL_SYNC",
        "NO PRESIONAR": "DO NOT PRESS",
        "NOMBRE": "NAME",
        "Rol": "Role",
        "MENU_DE_ARCHIVOS_SECRETOS": "SECRET_ARCHIVES_MENU",
        "[ < VOLVER_A_LISTA ]": "[ < BACK_TO_LIST ]",
        "SISTEMA_MITSUKI": "MITSUKI_SYSTEM",
        "[ CONTINUAR ]": "[ CONTINUE ]",
        "Omitir la introducción y continuar al lobby": "Skip the introduction and continue to the lobby",
        "[ OMITIR_INTRO.EXE ]": "[ SKIP_INTRO.EXE ]",

        "¿QUIÉNES SOMOS?": "WHO ARE WE?",
        "Infinity Brothers Studios es el búnker creativo detrás de CheatGuys!: un espacio donde avatares caóticos, narrativa visual y animación tradicional chocan para construir universos excéntricos con alma emocional propia.": "Infinity Brothers Studios is the creative bunker behind CheatGuys!: a place where chaotic avatars, visual storytelling, and traditional animation collide to build eccentric universes with their own emotional soul.",
        "El ecosistema meta": "The Meta Ecosystem",
        "Las mascotas del estudio operan desde el metaverso con distintos niveles de caos creativo.": "The studio mascots operate from the metaverse with different levels of creative chaos.",
        "La escritora compulsiva": "The Compulsive Writer",
        "Una flor cósmica excéntrica, impredecible y con una energía caótica desbordada.": "An eccentric, unpredictable cosmic flower with overflowing chaotic energy.",
        "Es la fuente mayor de ideas y la mente detrás de los conceptos más puros del estudio. Tiene un corazón enorme bajo sus capas de creatividad y locura.": "She is the studio's biggest source of ideas and the mind behind its purest concepts. Beneath her layers of creativity and madness, she has a huge heart.",
        "El arquitecto del caos": "The Architect of Chaos",
        "Un agujero negro personificado en una sudadera viva: reservado, analítico y poco fan de las multitudes.": "A black hole personified in a living hoodie: reserved, analytical, and not a fan of crowds.",
        "Convierte el caos de Sally en cimientos sólidos mediante worldbuilding, líneas de tiempo y escaletas narrativas.": "He turns Sally's chaos into solid foundations through worldbuilding, timelines, and story outlines.",
        "La reina del desgane": "The Queen of Low Energy",
        "Una nebulosa flotante y diseñadora de personajes oficial, con talento gráfico monumental y energía física cuestionable.": "A floating nebula and official character designer with monumental visual talent and questionable physical energy.",
        "Tras su somnolencia mística vive una personalidad dulce, tierna y apasionada por ilustrar, diseñar y discutir sus ships favoritos.": "Behind her mystical sleepiness lives a sweet, gentle personality passionate about illustration, design, and debating her favorite ships.",
        "Las personas detrás del estudio": "The People Behind the Studio",
        "Detrás de los avatares coloridos existe una estructura real: Infinity Brothers Studios somos dos hermanos originarios de Jalisco, México.": "Behind the colorful avatars is a real structure: Infinity Brothers Studios is made up of two brothers from Jalisco, Mexico.",
        "Nos mueve el poder de la narrativa visual y el lenguaje de la animación tradicional. Fundamos este espacio para convertirlo en la cuna de proyectos excéntricos, sorprendentes y con un alma emocional única para cada universo.": "We are driven by the power of visual storytelling and the language of traditional animation. We founded this space to become the cradle of eccentric, surprising projects, each with a unique emotional soul.",
        "Roles de producción": "Production Roles",
        "El lado humano del búnker: arte visual, escritura, continuidad y dirección creativa.": "The human side of the bunker: visual art, writing, continuity, and creative direction.",
        "Director de Arte & Diseño Visual": "Art Director & Visual Designer",
        "Director de Arte y Diseño Visual": "Art Director & Visual Designer",
        "Responsable del universo estético y la identidad visual de la productora.": "Responsible for the studio's aesthetic universe and visual identity.",
        "Diseño de personajes y consistencia estilística en 2D.": "Character design and 2D style consistency.",
        "Conceptos de fondos, turnarounds e ilustración promocional.": "Background concepts, turnarounds, and promotional illustration.",
        "Conceptos de fondos, hojas de giro e ilustración promocional.": "Background concepts, turnarounds, and promotional illustration.",
        "Showrunner & Lead Writer": "Showrunner & Lead Writer",
        "Showrunner y Guionista Principal": "Showrunner & Lead Writer",
        "Responsable de la arquitectura conceptual, el desarrollo literario y la continuidad de los proyectos.": "Responsible for conceptual architecture, literary development, and project continuity.",
        "Guiones cinematográficos, estructuras narrativas y biblias de producción.": "Screenplays, narrative structures, and production bibles.",
        "Worldbuilding, backstory y mitologías internas de cada universo.": "Worldbuilding, backstory, and internal mythologies for each universe.",
        "Construcción de mundos, trasfondo y mitologías internas de cada universo.": "Worldbuilding, backstory, and internal mythologies for each universe.",
        "Un estudio pequeño con hambre de universo.": "A small studio hungry for universes.",
        "Infinity Brothers Studios combina diseño, guion, worldbuilding y una terquedad enorme por contar historias con identidad propia.": "Infinity Brothers Studios combines design, writing, worldbuilding, and a stubborn drive to tell stories with their own identity.",
        "Infinity Brothers Studios combina diseño, guion, construcción de mundos y una terquedad enorme por contar historias con identidad propia.": "Infinity Brothers Studios combines design, writing, worldbuilding, and a stubborn drive to tell stories with their own identity.",
        "Si CheatGuys! suena raro, colorido y emocional, es porque el estudio también funciona así.": "If CheatGuys! sounds weird, colorful, and emotional, it is because the studio works that way too.",
        "Historias infinitas. Mundos infinitos.": "Infinite stories. Infinite worlds.",

        "¿QUÉ ES CHEATGUYS!?": "WHAT IS CHEATGUYS!?",
        "Una comedia animada sobre una chica con ansiedad social que intenta hacer amigos de la forma más lógica y menos lógica posible: formando una banda de rock.": "An animated comedy about a girl with social anxiety who tries to make friends in the most logical and least logical way possible: by forming a rock band.",
        "Premisa desbloqueada": "Premise Unlocked",
        "Akane Hoshizora solo quería sobrevivir su último año de secundaria, jugar videojuegos, tocar guitarra y no tener que hablar con demasiada gente.": "Akane Hoshizora only wanted to survive her last year of middle school, play videogames, play guitar, and avoid talking to too many people.",
        "Su plan para hacer amigos salió demasiado bien: sus carteles mal hechos atrajeron a adolescentes intensos, raros y completamente incompatibles.": "Her plan to make friends worked too well: her badly made posters attracted intense, weird, completely incompatible teenagers.",
        "Resultado: una banda, un garaje invadido, demasiadas emociones desbloqueadas y cero puntos en habilidades sociales.": "Result: a band, an invaded garage, too many unlocked emotions, and zero points in social skills.",
        "La fórmula CheatGuys!": "The CheatGuys! Formula",
        "Comedia absurda, música, ansiedad adolescente y corazón DIY.": "Absurd comedy, music, teenage anxiety, and a DIY heart.",
        "Comedia absurda": "Absurd Comedy",
        "Ensayos caóticos, reacciones exageradas, decisiones terribles y humor meta con alma de cartoon.": "Chaotic rehearsals, exaggerated reactions, terrible decisions, and meta humor with a cartoon soul.",
        "Banda escolar": "School Band",
        "Una banda que intenta sonar bien mientras aprende a convivir sin explotar emocionalmente.": "A band trying to sound good while learning how to coexist without emotionally exploding.",
        "Anime con picante": "Anime With Spice",
        "Estética 2000s, HUDs mentales, chiptune, J-Rock y caos mexicano con neones saturados.": "2000s aesthetics, mental HUDs, chiptune, J-Rock, and Mexican chaos under saturated neon.",
        "Una amistad mal calibrada": "A Badly Calibrated Friendship",
        "CheatGuys! habla de crecer cuando no encajas, fallar en público, hacer arte con pocos recursos y descubrir que la amistad no siempre se ve bonita.": "CheatGuys! is about growing up when you do not fit in, failing in public, making art with few resources, and discovering that friendship does not always look pretty.",
        "A veces suena desafinada, grita mucho, ocupa tu sillón favorito y aun así termina siendo justo lo que necesitabas.": "Sometimes it sounds out of tune, screams too much, takes your favorite chair, and still becomes exactly what you needed.",
        "Neo Teno: el mapa del desastre": "Neo Teno: The Disaster Map",
        "Donde el manga, el mariachi, el karaoke y los tianguis tecnológicos conviven en hora pico.": "Where manga, mariachi, karaoke, and tech flea markets coexist at rush hour.",
        "México niponizado": "Japanized Mexico",
        "La historia ocurre en una versión alternativa del Valle de México donde Japón y México se mezclaron hasta crear una ciudad multicolor, intensa y profundamente rara.": "The story takes place in an alternate Valley of Mexico where Japan and Mexico blended into a multicolor, intense, deeply strange city.",
        "Templos sintoístas junto a puestos de tamales.": "Shinto shrines beside tamale stands.",
        "Trenes bala pasando frente a mercados de artesanías.": "Bullet trains passing in front of artisan markets.",
        "Pantallas LED anunciando tacos, karaoke y bandas escolares.": "LED screens advertising tacos, karaoke, and school bands.",
        "Arcades clandestinos con olor a fritura y gloria digital.": "Underground arcades smelling of fried snacks and digital glory.",
        "No es otro anime de banda.": "It is not another band anime.",
        "Es una historia ruidosa, colorida y emocionalmente honesta sobre adolescentes raros tratando de funcionar juntos.": "It is a loud, colorful, emotionally honest story about weird teenagers trying to function together.",
        "Nadie es perfecto, nadie sabe muy bien qué está haciendo y aun así todos siguen tocando.": "No one is perfect, no one really knows what they are doing, and still everyone keeps playing.",
        "0 PERFECCIÓN. +100 EMOCIÓN.": "0 PERFECTION. +100 EMOTION.",
        "Laptop de Akane": "Akane's Laptop",
        "Abre una app de la banda y conversa directo desde el bunker de Neo Teno.": "Open a band app and chat directly from the Neo Teno bunker.",
        "Abre una app de la banda y conversa directo desde el búnker de Neo Teno.": "Open a band app and chat directly from the Neo Teno bunker.",
        "ESCRITORIO": "DESKTOP",
        "Cerrar app": "Close app",
        "Escribe un mensaje...": "Write a message...",
        "Enviar": "Send",
        "ensayo_17: no hacer contacto visual.": "rehearsal_17: do not make eye contact.",
        "pendiente: bajar volumen mental.": "pending: lower mental volume.",
        "Rika prometio no gritar. verificar.": "Rika promised not to scream. verify.",

        "GALERÍA": "GALLERY",
        "ARCHIVO_VISUAL // CHEATGUYS!": "VISUAL_ARCHIVE // CHEATGUYS!",
        "Esos bocetos todavía no estaban terminados…": "Those sketches were not finished yet...",
        "ACTIVO": "ACTIVE",
        "ARCHIVOS": "FILES",
        "VESTIMENTAS": "OUTFITS",
        "HOJAS_DE_GIRO": "TURNAROUNDS",
        "BOCETOS": "SKETCHES",
        "ID_COLOR": "COLOR_ID",
        "ARCHIVOS_ENCONTRADOS": "FILES_FOUND",
        "ESTADO:": "STATUS:",

        "BIBLIA DE PRODUCCIÓN": "PRODUCTION BIBLE",
        "INFINITY OS // ADMINISTRADOR_DE_ARCHIVOS": "INFINITY OS // FILE MANAGER",
        "Autor:": "Author:",
        "Versión:": "Version:",
        "Estado:": "Status:",
        "CONFIDENCIAL": "CONFIDENTIAL",
        "[ ABRIR_ARCHIVO ]": "[ OPEN_FILE ]",
        "Inicializando visor...": "Initializing viewer...",
        "PÁGINA": "PAGE",
        "[ ◀ ANTERIOR ]": "[ ◀ PREVIOUS ]",
        "[ SIGUIENTE ▶ ]": "[ NEXT ▶ ]",
        "[ PANTALLA_COMPLETA ]": "[ FULLSCREEN ]",
        "[ DESCARGAR_PDF ]": "[ DOWNLOAD_PDF ]",

        "ESCENARIO ARCADE": "ARCADE STAGE",
        "¿Crees que puedas superar la máxima puntuación de la Demonio del Arcade? ¡Inténtalo!... Si te atreves...": "Do you think you can beat the Arcade Demon's high score? Try it!... If you dare...",
        "TU RÉCORD:": "YOUR RECORD:",
        "TU RECORD:": "YOUR RECORD:",
        "AKANE SIGUE ARRIBA": "AKANE STILL LEADS",
        "MODO:": "MODE:",
        "[ INICIAR_JUEGO ]": "[ START_GAME ]",
        "NUEVO RÉCORD": "NEW RECORD",
        "NUEVO RECORD": "NEW RECORD",
        "PAUSA": "PAUSE",
        "DISPARAR": "FIRE",
        "REANUDAR": "RESUME",
        "REINICIAR": "RESTART",
        "SALIR": "EXIT",
        "FIN DEL JUEGO": "GAME OVER",
        "PUNTUACIÓN FINAL: 0": "FINAL SCORE: 0",
        "La Demonio del Arcade sigue invicta.": "The Arcade Demon remains undefeated.",
        "[ ¿OTRA FICHA? ]": "[ ANOTHER_TOKEN? ]",
        "¿GANASTE?": "YOU WON?",
        "Wow, no pensé que llegarías hasta aquí, bien por ti supongo... lo que es tener demasiado tiempo libre...": "Wow, I did not think you would make it this far. Good for you, I guess... that is what too much free time does...",
        "Wow, no pense que llegarias hasta aqui, bien por ti supongo... lo que es tener demasiado tiempo libre...": "Wow, I did not think you would make it this far. Good for you, I guess... that is what too much free time does...",
        "[ VE_A_TOCAR_PASTO ]": "[ GO_TOUCH_GRASS ]",
        "[ VE A TOCAR PASTO ]": "[ GO_TOUCH_GRASS ]",

        "Infinity brothers sigue trabajando! CheatGuys sigue en produccion y preparacion de promocionales y otras cosas raras. Sigan la cuenta para seguir viendo este extrano grupo. #CheatGuys #OC #Pixelatl #Ideatoon": "Infinity Brothers keeps working! CheatGuys is still in production and preparing promos and other strange things. Follow the account to keep seeing this odd group. #CheatGuys #OC #Pixelatl #Ideatoon",
        "Esto apenas es el medio tiempo! Nos vemos en noviembre en el festival @Pixelatl para presentar la version mas solida y caotica de nuestro proyecto. Felicidades a los seleccionados! Conoce el lobby oficial: cheatguysinfinity.netlify.app": "This is only halftime! See you in November at the @Pixelatl festival to present the strongest and most chaotic version of our project. Congratulations to the selected projects! Visit the official lobby: cheatguysinfinity.netlify.app",
        "A alguien mas le ha pasado? Pobrecita Akane. CheatGuys! #Ideatoon2026 #Pixelatl": "Has this happened to anyone else? Poor Akane. CheatGuys! #Ideatoon2026 #Pixelatl"
    };

    const PREFIX_RULES = {
        es: [
            [/^SCORE:/, "PUNTAJE:"],
            [/^STATUS:/, "ESTADO:"],
            [/^MODE:/, "MODO:"],
            [/^RECORD:/, "RÉCORD:"],
            [/^PAGE /, "PÁGINA "]
        ],
        en: [
            [/^PUNTAJE:/, "SCORE:"],
            [/^PUNTUACIÓN FINAL:/, "FINAL SCORE:"],
            [/^ESTADO:/, "STATUS:"],
            [/^MODO:/, "MODE:"],
            [/^TU RÉCORD:/, "YOUR RECORD:"],
            [/^TU RECORD:/, "YOUR RECORD:"],
            [/^PÁGINA /, "PAGE "]
        ]
    };

    const ATTRS = ["aria-label", "title", "alt", "placeholder", "content"];
    const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "CANVAS"]);

    function normalize(value) {
        return String(value || "").replace(/\s+/g, " ").trim();
    }

    function translateRaw(value, mode) {
        if (mode === "mixed") return value;
        const dict = mode === "es" ? ES : EN;
        const normalized = normalize(value);
        if (!normalized) return value;

        let translated = dict[normalized] || (mode === "es" ? COMMON_ES[normalized] : undefined);
        if (!translated && mode === "en") translated = EN[ES[normalized]];

        if (!translated) {
            const rules = PREFIX_RULES[mode] || [];
            for (const [pattern, replacement] of rules) {
                if (pattern.test(normalized)) {
                    translated = normalized.replace(pattern, replacement);
                    break;
                }
            }
        }

        if (!translated) return value;

        const leading = String(value).match(/^\s*/)?.[0] || "";
        const trailing = String(value).match(/\s*$/)?.[0] || "";
        return `${leading}${translated}${trailing}`;
    }

    function shouldSkipNode(node) {
        const parent = node.parentElement;
        if (!parent || SKIP_TAGS.has(parent.tagName)) return true;
        if (parent.closest("[data-cg-i18n-control]")) return true;
        return false;
    }

    function translateTextNode(node) {
        if (shouldSkipNode(node)) return;
        if (!textOriginals.has(node)) textOriginals.set(node, node.nodeValue);
        const original = textOriginals.get(node);
        const translated = translateRaw(original, currentMode);
        if (node.nodeValue !== translated) node.nodeValue = translated;
    }

    function getAttrStore(element) {
        let store = attrOriginals.get(element);
        if (!store) {
            store = {};
            attrOriginals.set(element, store);
        }
        return store;
    }

    function translateAttributes(element) {
        if (SKIP_TAGS.has(element.tagName) || element.closest("[data-cg-i18n-control]")) return;
        const store = getAttrStore(element);
        ATTRS.forEach((attr) => {
            if (!element.hasAttribute(attr)) return;
            if (!store[attr]) store[attr] = element.getAttribute(attr);
            const translated = translateRaw(store[attr], currentMode);
            if (element.getAttribute(attr) !== translated) element.setAttribute(attr, translated);
        });
    }

    function walk(root) {
        if (!root) return;
        if (root.nodeType === Node.TEXT_NODE) {
            translateTextNode(root);
            return;
        }
        if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;

        if (root.nodeType === Node.ELEMENT_NODE) translateAttributes(root);
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        while (node) {
            if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
            else translateAttributes(node);
            node = walker.nextNode();
        }
    }

    function updateControl() {
        const control = document.querySelector("[data-cg-i18n-control]");
        if (!control) return;
        control.dataset.cgLangTitle = currentMode === "es" ? "IDIOMA_SYS" : "LANG_SYS";
        const label = control.querySelector(".cg-language-label");
        if (label) label.textContent = currentMode === "es" ? "IDIOMA_SYS" : "LANG_SYS";
        control.querySelectorAll("[data-cg-lang]").forEach((button) => {
            const active = button.dataset.cgLang === currentMode;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
        });
    }

    function applyLanguage(mode) {
        currentMode = MODES.includes(mode) ? mode : "mixed";
        document.documentElement.lang = currentMode === "en" ? "en" : "es";
        applying = true;
        walk(document.body);
        translateAttributes(document.head);
        document.title = currentMode === "mixed" ? originalTitle : translateRaw(originalTitle, currentMode);
        applying = false;
        updateControl();
        window.dispatchEvent(new CustomEvent("cg:languagechange", { detail: { mode: currentMode } }));
    }

    function setLanguage(mode) {
        const safeMode = MODES.includes(mode) ? mode : "mixed";
        try {
            window.localStorage.setItem(STORAGE_KEY, safeMode);
        } catch (error) {
            // La pagina sigue funcionando aunque localStorage este bloqueado.
        }
        applyLanguage(safeMode);
    }

    function getStoredLanguage() {
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            return MODES.includes(stored) ? stored : "mixed";
        } catch (error) {
            return "mixed";
        }
    }

    function createLanguageControl() {
        if (document.querySelector("[data-cg-i18n-control]")) return;
        const sidebar = document.getElementById("sidebarNav");
        if (!sidebar) return;

        const panel = document.createElement("div");
        panel.className = "cg-sidebar-language";
        panel.dataset.cgI18nControl = "true";
        panel.dataset.cgLangTitle = "LANG_SYS";
        panel.setAttribute("aria-label", "Idioma");

        const buttons = document.createElement("div");
        buttons.className = "cg-language-options";
        [
            ["mixed", "MIX", "Mixto"],
            ["es", "ES", "Español"],
            ["en", "EN", "English"]
        ].forEach(([mode, shortLabel, title]) => {
            const button = document.createElement("button");
            button.type = "button";
            button.dataset.cgLang = mode;
            button.textContent = shortLabel;
            button.title = title;
            button.setAttribute("aria-label", title);
            button.addEventListener("click", () => setLanguage(mode));
            buttons.appendChild(button);
        });

        panel.append(buttons);
        const audioPanel = sidebar.querySelector(".cg-sidebar-audio");
        if (audioPanel) audioPanel.insertAdjacentElement("afterend", panel);
        else sidebar.appendChild(panel);
    }

    function scheduleApply() {
        if (applying || scheduled || currentMode === "mixed") return;
        scheduled = true;
        window.requestAnimationFrame(() => {
            scheduled = false;
            applyLanguage(currentMode);
        });
    }

    function setupObserver() {
        if (observer) observer.disconnect();
        observer = new MutationObserver((mutations) => {
            if (applying) return;
            for (const mutation of mutations) {
                if (mutation.type === "childList" || mutation.type === "characterData") {
                    scheduleApply();
                    return;
                }
            }
        });
        observer.observe(document.body, {
            childList: true,
            characterData: true,
            subtree: true
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        originalTitle = document.title;
        createLanguageControl();
        applyLanguage(getStoredLanguage());
        setupObserver();
    });

    window.CGLanguage = Object.freeze({
        set: setLanguage,
        get: () => currentMode
    });
})();
