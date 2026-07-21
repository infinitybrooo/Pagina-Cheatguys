// =====================================================
// I18N - Selector de idioma persistente para InfinityOS
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
        "AKANE_HUD_QUEST": "AKANE_HUD_QUEST",
        "SINA_APPROVED_SOFTNESS": "SINA_APROBO_TERNURA",
        "RIKA_CROWD_SHIELD": "RIKA_ESCUDO_MULTITUD",
        "JUN_SNACK_BACKUP": "JUN_RESPALDO_SNACKS",
        "ALERTA_DE_INTRUSO // NÚCLEO_CREATIVO": "ALERTA_DE_INTRUSO // NÚCLEO_CREATIVO",
        "Entraste al garaje operativo de CheatGuys!: 0 perfección, +100 emoción. Elige personaje para abrir sus fichas, revisa stickers, música y archivos prohibidos, o toca el póster si quieres que Akane pierda tres puntos de estabilidad social.": "Entraste al garaje operativo de CheatGuys!: 0 perfección, +100 emoción. Elige personaje para abrir sus fichas, revisa stickers, música y archivos prohibidos, o toca el póster si quieres que Akane pierda tres puntos de estabilidad social.",
        "SELECCIONA_TU_PERSONAJE.EXE": "SELECCIONA_TU_PERSONAJE.EXE",
        "CRASH_NOTES.TXT": "NOTAS_DE_CRASH.TXT",
        "00:13 // Akane convirtio hacer amigos en mision principal.": "00:13 // Akane convirtió hacer amigos en misión principal.",
        "00:17 // Rika activo escudo anti-multitudes.": "00:17 // Rika activó escudo anti-multitudes.",
        "00:21 // Momo y Sina aprobaron el nivel de ternura.": "00:21 // Momo y Sina aprobaron el nivel de ternura.",
        "GARAGE_SAFE_ZONE": "ZONA_SEGURA_GARAJE",
        "El garaje dejó de ser escondite: ahora es cuartel, ensayo y refugio de banda.": "El garaje dejó de ser escondite: ahora es cuartel, ensayo y refugio de banda.",
        "InfinityOS // DIRECTORY_01: SYSTEM_FILES": "InfinityOS // DIRECTORY_01: ARCHIVOS_DEL_SISTEMA",
        "Official Pitch Bible": "Biblia oficial de presentación",
        "READ_PRODUCTION_DECK.EXE": "LEER_DOSSIER_DE_PRODUCCION.EXE",
        "Infinity Brothers on X": "Infinity Brothers en X",
        "FOLLOW_STUDIO_UPDATES": "SEGUIR_ACTUALIZACIONES_DEL_ESTUDIO",
        "TikTok Animatics": "Animatics en TikTok",
        "BEHIND_THE_SCENES_VIDEO": "VIDEO_DETRAS_DE_CAMARAS",
        "InfinityOS // DIRECTORY_02: INVENTORY_STICKERS": "InfinityOS // DIRECTORY_02: INVENTARIO_STICKERS",
        "WhatsApp Sticker Pack": "Paquete de stickers para WhatsApp",
        "EQUIP: AKANE'S ANXIETY": "EQUIPAR: ANSIEDAD_DE_AKANE",
        "Discord Emotes": "Emotes de Discord",
        "COMING_SOON.EXE": "PROXIMAMENTE.EXE",
        "InfinityOS // DIRECTORY_03: MERCHANT_SHOP": "InfinityOS // DIRECTORY_03: TIENDA_DEL_MERCADER",
        "Patreon Guild": "Gremio de Patreon",
        "Mitsuki's Coffee": "Café de Mitsuki",
        "BUY_HER_A_COFFEE_FOR_THE_TEACHER": "COMPRALE_UN_CAFE_A_LA_MAESTRA",
        "PayPal Donations": "Donaciones por PayPal",
        "SUPPORT_INDIE_ANIMATION": "APOYA_LA_ANIMACION_INDIE",
        "RIKA_VOLUME_RULE": "REGLA_VOLUMEN_RIKA",
        "Si Rika sube el volumen, Jun baja la energía y Momo decora el desastre.": "Si Rika sube el volumen, Jun baja la energía y Momo decora el desastre.",
        "InfinityOS // DIRECTORY_04: SOUND_TEST_MENU": "InfinityOS // DIRECTORY_04: MENU_DE_PRUEBA_DE_AUDIO",
        "Akane: Noise I Can't Say Out Loud": "Akane: Ruido que no puedo decir en voz alta",
        "Rika: Volume First, Consequences Later": "Rika: Volumen primero, consecuencias después",
        "Momo: Pink City Lights": "Momo: Luces rosas de ciudad",
        "Jun: Sleepy Groove, Sharp Timing": "Jun: Ritmo somnoliento, precisión afilada",
        "InfinityOS // DIRECTORY_05: COMMUNICATIONS": "InfinityOS // DIRECTORY_05: COMUNICACIONES",
        "Send System Mail": "Enviar correo del sistema",
        "WhatsApp Business": "WhatsApp Business",
        "DIRECT_CHAT_WITH_STUDIO": "CHAT_DIRECTO_CON_EL_ESTUDIO",
        "MITSUKI_MAINTENANCE_LOG": "MITSUKI_LOG_MANTENIMIENTO",
        "Mitsuki archivó el caos, sirvió café y fingió que todo estaba bajo control.": "Mitsuki archivó el caos, sirvió café y fingió que todo estaba bajo control.",
        "InfinityOS // DIRECTORY_04A": "InfinityOS // DIRECTORY_04A",
        "InfinityOS // DIRECTORY_04B": "InfinityOS // DIRECTORY_04B",
        "InfinityOS // DIRECTORY_04C": "InfinityOS // DIRECTORY_04C",
        "InfinityOS // DIRECTORY_06": "InfinityOS // DIRECTORY_06",
        "InfinityOS // DIRECTORY_06A: AKANEBOOK_REMOTE_CHAT": "InfinityOS // DIRECTORY_06A: AKANEBOOK_CHAT_REMOTO",
        "InfinityOS // DIRECTORY_07": "InfinityOS // DIRECTORY_07",
        "InfinityOS // DIRECTORY_08: AKANE_ARCADE": "InfinityOS // DIRECTORY_08: ARCADE_AKANE",
        "InfinityOS // DIRECTORY_09": "InfinityOS // DIRECTORY_09",
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
        "AVISO_DE_COOKIES // SECURITY_LAYER": "AVISO_DE_COOKIES // CAPA_DE_SEGURIDAD",
        "Cerrar aviso de cookies": "Cerrar aviso de cookies",
        "Rika comiendo una galleta": "Rika comiendo una galleta",
        "Este sitio web utiliza cookies técnicas para garantizar la mejor experiencia de usuario en el búnker. Al continuar navegando, asumes que... Espera, ¿sigues leyendo esto? Está claro que no podemos usar cookies, ¿tú crees que vamos a tener dinero para servidores que manejen información en tiempo real? Claramente no. Pero tranquilo, para que no sientas que desperdiciaste el tiempo leyendo esto, aprieta el botón para obtener un póster exclusivo.": "Este sitio web utiliza cookies técnicas para garantizar la mejor experiencia de usuario en el búnker. Al continuar navegando, asumes que... Espera, ¿sigues leyendo esto? Está claro que no podemos usar cookies, ¿tú crees que vamos a tener dinero para servidores que manejen información en tiempo real? Claramente no. Pero tranquilo, para que no sientas que desperdiciaste el tiempo leyendo esto, aprieta el botón para obtener un póster exclusivo.",
        "Descargar póster firmado": "Descargar póster firmado",
        "[ POSTER_FIRMADO.PNG ]": "[ POSTER_FIRMADO.PNG ]",
        "Omitir la introduccion y continuar al lobby": "Omitir la introducción y continuar al lobby",
        "[ OMITIR_INTRO.EXE ]": "[ OMITIR_INTRO.EXE ]",
        "Reiniciar secretamente la secuencia de introduccion": "Reiniciar secretamente la secuencia de introducción",
        "Cancelar reinicio": "Cancelar reinicio",
        "¿Estas seguro? Algo puede explotar si lo haces... Luego no me vengas a llorar.": "¿Estas seguro? Algo puede explotar si lo haces... Luego no me vengas a llorar.",
        "[ CANCELAR ]": "[ CANCELAR ]",
        "[ REINICIAR ]": "[ REINICIAR ]",
        "InfinityOS // STARTUP_STORY": "InfinityOS // STARTUP_STORY",
        "Te_lo_dije_xD": "Te_lo_dije_xD",
        "Retrato de AKANE": "Retrato de AKANE",
        "Retrato de RIKA": "Retrato de RIKA",
        "Retrato de MOMO": "Retrato de MOMO",
        "Retrato de JUN": "Retrato de JUN",
        "¡¿C-Cierra la ventana! ¡Espera! ¡No veas nada todavía! A-A la página le faltan retoques en el código y mi barra de estamina social está en cero...": "¡¿C-Cierra la ventana! ¡Espera! ¡No veas nada todavía! A-A la página le faltan retoques en el código y mi barra de estamina social está en cero...",
        "¡Ignoren a la chica morada ansiosa! ¡Bienvenidos al centro de operaciones de CheatGuys! Aquí van a encontrar el lore real, los diseños y toda la música que nos costó sudor y sangre!": "¡Ignoren a la chica morada ansiosa! ¡Bienvenidos al centro de operaciones de CheatGuys! Aquí van a encontrar el lore real, los diseños y toda la música que nos costó sudor y sangre!",
        "¡N-No es seguro! Rika, la base de datos está atada con alambres... Por favor, regresen… en… en unas tres semanas...": "¡N-No es seguro! Rika, la base de datos está atada con alambres... Por favor, regresen… en… en unas tres semanas...",
        "¡Siii! Y no olviden que pueden revisar nuestra galería de arte interactiva, chismosear los secretos de la banda y platicar con nosotras en tiempo real desde Akanebook. ¡Sean amables con ella! ✨💖": "¡Siii! Y no olviden que pueden revisar nuestra galería de arte interactiva, chismosear los secretos de la banda y platicar con nosotras en tiempo real desde Akanebook. ¡Sean amables con ella! ✨💖",
        "Ya que están aquí... abajo están los links para tirar el paro. Compartan el garaje, piérdanse en el arcade o, si les sobra platita, apóyennos antes de que Rika intente vender el amplificador de nuevo.": "Ya que están aquí... abajo están los links para tirar el paro. Compartan el garaje, piérdanse en el arcade o, si les sobra platita, apóyennos antes de que Rika intente vender el amplificador de nuevo.",
        "¡Exploren lo permitido, piquen lo que claramente no deberían y ayúdennos a hacer ruido en Neo Teno! Si algo truena, fue parte del lore. 🎸🔥": "¡Exploren lo permitido, piquen lo que claramente no deberían y ayúdennos a hacer ruido en Neo Teno! Si algo truena, fue parte del lore. 🎸🔥",
        "¡AAAAH! ¡DEMASIADA INTERACCIÓN SOCIAL NO PROGRAMADAAAA! EROOOOOORRR-1!": "¡AAAAH! ¡DEMASIADA INTERACCIÓN SOCIAL NO PROGRAMADAAAA! EROOOOOORRR-1!",
        "FATAL_ERROR: ANXIOUS_OVERLOAD_999% ***": "FATAL_ERROR: ANXIOUS_OVERLOAD_999% ***",
        "InfinityOS // CHEATGUYS! CRASH REPORT": "InfinityOS // CHEATGUYS! CRASH REPORT",
        "Un error fatal ha ocurrido en la interfaz del grupo. El proceso Akane.exe dejó de responder debido a una interacción social no programada en el entorno web.": "Un error fatal ha ocurrido en la interfaz del grupo. El proceso Akane.exe dejó de responder debido a una interacción social no programada en el entorno web.",
        "Si esta es la primera vez que ve esta pantalla de error, es probable que a Jun se le haya zafado una baqueta, Rika haya roto otra cuerda de la guitarra, o Momo se haya distraído viendo algo color pastel.": "Si esta es la primera vez que ve esta pantalla de error, es probable que a Jun se le haya zafado una baqueta, Rika haya roto otra cuerda de la guitarra, o Momo se haya distraído viendo algo color pastel.",
        "Presione cualquier botón de los controles para estabilizar el HUD de Akane.": "Presione cualquier botón de los controles para estabilizar el HUD de Akane.",
        "Por favor, espere a que el amplificador del garaje deje de hacer interferencia.": "Por favor, espere a que el amplificador del garaje deje de hacer interferencia.",
        "Iniciando protocolo de emergencia: Ir por un café al Bloom & Brew.": "Iniciando protocolo de emergencia: Ir por un café al Bloom & Brew.",
        "Reiniciando el entorno gráfico de Neo Teno...": "Reiniciando el entorno gráfico de Neo Teno...",
        "Código de error: 0xCHEATGUYS_ARCADE_CRASH": "Código de error: 0xCHEATGUYS_ARCADE_CRASH",

        "¿QUIÉNES SOMOS?": "¿QUIÉNES SOMOS?",
        "Infinity Brothers Studios es el laboratorio creativo detrás de CheatGuys!: un espacio donde avatares caóticos, narrativa visual y animación tradicional chocan para construir universos excéntricos con alma emocional propia.": "Infinity Brothers Studios es el laboratorio creativo detrás de CheatGuys!: un espacio donde avatares caóticos, narrativa visual y animación tradicional chocan para construir universos excéntricos con alma emocional propia.",
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
        "El lado humano del estudio: arte visual, escritura, continuidad y dirección creativa.": "El lado humano del estudio: arte visual, escritura, continuidad y dirección creativa.",
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
        "Akane no quería destacar. Quería sobrevivir secundaria, jugar rhythm games, tocar guitarra y hablar con la menor cantidad posible de humanos.": "Akane no quería destacar. Quería sobrevivir secundaria, jugar rhythm games, tocar guitarra y hablar con la menor cantidad posible de humanos.",
        "Su plan para hacer amigos fue tan lógico como desastroso: formar una banda. Funcionó demasiado bien y atrajo a adolescentes intensos, raros y completamente incompatibles.": "Su plan para hacer amigos fue tan lógico como desastroso: formar una banda. Funcionó demasiado bien y atrajo a adolescentes intensos, raros y completamente incompatibles.",
        "Resultado: una banda, un garaje invadido, demasiadas emociones desbloqueadas y cero puntos en habilidades sociales.": "Resultado: una banda, un garaje invadido, demasiadas emociones desbloqueadas y cero puntos en habilidades sociales.",
        "La fórmula CheatGuys!": "La fórmula CheatGuys!",
        "Comedia absurda, música escolar, HUDs mentales, cultura otaku, caos mexicano y adolescentes haciendo arte con cero presupuesto y demasiada emoción.": "Comedia absurda, música escolar, interfaces mentales, cultura otaku, caos mexicano y adolescentes haciendo arte con cero presupuesto y demasiada emoción.",
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
        "Templos sintoístas entre puestos de tamales.": "Templos sintoístas entre puestos de tamales.",
        "Trenes bala cruzando murales con papel picado.": "Trenes bala cruzando murales con papel picado.",
        "Onigiris con chile piquín y pantallas LED anunciando karaoke escolar.": "Onigiris con chile piquín y pantallas LED anunciando karaoke escolar.",
        "Tianguis donde compras un pedal de guitarra, ramen instantáneo y quizá una maldición leve.": "Tianguis donde compras un pedal de guitarra, ramen instantáneo y quizá una maldición leve.",
        "No es otro anime de banda.": "No es otro anime de banda.",
        "Es una historia ruidosa, colorida y emocionalmente honesta sobre adolescentes raros tratando de funcionar juntos.": "Es una historia ruidosa, colorida y emocionalmente honesta sobre adolescentes raros tratando de funcionar juntos.",
        "Nadie es perfecto, nadie sabe muy bien qué está haciendo y aun así todos siguen tocando.": "Nadie es perfecto, nadie sabe muy bien qué está haciendo y aun así todos siguen tocando.",
        "0 PERFECCIÓN. +100 EMOCIÓN.": "0 PERFECCIÓN. +100 EMOCIÓN.",
        "Akanebook": "Akanebook",
        "Abre Akanebook y conversa directo desde el garaje de Neo Teno.": "Abre Akanebook y conversa directo desde el garaje de Neo Teno.",
        "Akanebook interactiva": "Akanebook interactiva",
        "ESCRITORIO": "ESCRITORIO",
        "InfinityOS": "InfinityOS",
        "Cerrar app": "Cerrar app",
        "Escribe un mensaje...": "Escribe un mensaje...",
        "Enviar": "Enviar",
        "H-Hola... seleccionaste mi app. Eso cuenta como interacción social, ¿verdad?": "H-Hola... seleccionaste mi app. Eso cuenta como interacción social, ¿verdad?",
        "¡QUÉ ONDA! Habla rápido antes de que esta Akanebook se rinda.": "¡QUÉ ONDA! Habla rápido antes de que esta Akanebook se rinda.",
        "Holi holi. Sina también está leyendo, pero no juzga.": "Holi holi. Sina también está leyendo, pero no juzga.",
        "hey... soy Jun. escribe algo si quieres. si no, también es válido.": "hey... soy Jun. escribe algo si quieres. si no, también es válido.",
        "quest: hacer amigos sin activar panico.": "quest: hacer amigos sin activar pánico.",
        "hud_social: opciones de dialogo cargando.": "hud_social: opciones de diálogo cargando.",
        "kurotama_guard: activo sobre el amplificador.": "kurotama_guard: activo sobre el amplificador.",
        "estamina social: 12%": "estamina social: 12%",
        "modo vocalista: no autorizado": "modo vocalista: no autorizado",
        "Rika cubre multitudes; Momo trae calma; Jun guarda snacks.": "Rika cubre multitudes; Momo trae calma; Jun guarda snacks.",

        "GALERÍA": "GALERÍA",
        "ARCHIVO_VISUAL // CHEATGUYS!": "ARCHIVO_VISUAL // CHEATGUYS!",
        "Esos bocetos todavía no estaban terminados… mi HUD pidió censura.": "Esos bocetos todavía no estaban terminados… mi HUD pidió censura.",
        "No abras el archivo que dice outfit_final_final. Es una trampa.": "No abras el archivo que dice outfit_final_final. Es una trampa.",
        "¿Era necesario verme desde todos los ángulos? Pregunta seria.": "¿Era necesario verme desde todos los ángulos? Pregunta seria.",
        "Ese trazo todavía estaba procesando ansiedad social.": "Ese trazo todavía estaba procesando ansiedad social.",
        "¡Abre el outfit cuatro! Ese sí entra con distorsión.": "¡Abre el outfit cuatro! Ese sí entra con distorsión.",
        "¡Ese outfit necesita escenario, humo y cero permisos!": "¡Ese outfit necesita escenario, humo y cero permisos!",
        "La pose también cuenta como argumento. Y como amenaza.": "La pose también cuenta como argumento. Y como amenaza.",
        "Ese trazo necesitaba más energía, más naranja y menos miedo.": "Ese trazo necesitaba más energía, más naranja y menos miedo.",
        "Guardé algunos con nombres bonitos. Sina aprobó tres.": "Guardé algunos con nombres bonitos. Sina aprobó tres.",
        "Este directorio combina sorprendentemente bien. Qué alivio pastel.": "Este directorio combina sorprendentemente bien. Qué alivio pastel.",
        "Estos bocetos todavía huelen a lápiz, sueño y azúcar.": "Estos bocetos todavía huelen a lápiz, sueño y azúcar.",
        "Hay tres casi iguales. Uno tiene más flojera.": "Hay tres casi iguales. Uno tiene más flojera.",
        "Sí, son distintos. Técnicamente. No me hagas defenderlo.": "Sí, son distintos. Técnicamente. No me hagas defenderlo.",
        "Ese boceto está cansado. Lo respeto.": "Ese boceto está cansado. Lo respeto.",
        "ACTIVE": "ACTIVO",
        "FILES": "ARCHIVOS",
        "VESTIMENTAS": "VESTIMENTAS",
        "TURNAROUNDS": "HOJAS_DE_GIRO",
        "BOCETOS": "BOCETOS",
        "COLOR_ID": "ID_COLOR",
        "FILES_FOUND": "ARCHIVOS_ENCONTRADOS",
        "STATUS:": "ESTADO:",

        "BIBLIA DE PRODUCCIÓN": "BIBLIA DE PRODUCCIÓN",
        "InfinityOS // FILE_MANAGER": "InfinityOS // ADMINISTRADOR_DE_ARCHIVOS",
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
        "[ VOLVER_AL_MENU ]": "[ VOLVER_AL_MENU ]",
        "Joystick de movimiento": "Joystick de movimiento",
        "Cruceta de movimiento": "Cruceta de movimiento",
        "Cruceta de Akane Maze": "Cruceta de Akane Maze",
        "Mover izquierda": "Mover izquierda",
        "Mover derecha": "Mover derecha",
        "Mover arriba": "Mover arriba",
        "Mover abajo": "Mover abajo",
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
        "AKANE_HUD_QUEST": "AKANE_HUD_QUEST",
        "SINA_APPROVED_SOFTNESS": "SINA_APPROVED_SOFTNESS",
        "RIKA_CROWD_SHIELD": "RIKA_CROWD_SHIELD",
        "JUN_SNACK_BACKUP": "JUN_SNACK_BACKUP",
        "SINA_APROBO_TERNURA": "SINA_APPROVED_SOFTNESS",
        "RIKA_ESCUDO_MULTITUD": "RIKA_CROWD_SHIELD",
        "JUN_RESPALDO_SNACKS": "JUN_SNACK_BACKUP",
        "ALERTA_DE_INTRUSO // NÚCLEO_CREATIVO": "INTRUDER_ALERT // CREATIVE_CORE",
        "Entraste al garaje operativo de CheatGuys!: 0 perfección, +100 emoción. Elige personaje para abrir sus fichas, revisa stickers, música y archivos prohibidos, o toca el póster si quieres que Akane pierda tres puntos de estabilidad social.": "You entered the CheatGuys! operations garage: 0 perfection, +100 emotion. Pick a character to open their files, check stickers, music, and forbidden archives, or tap the poster if you want Akane to lose three social stability points.",
        "SELECCIONA_TU_PERSONAJE.EXE": "SELECT_YOUR_CHARACTER.EXE",
        "NOTAS_DE_CRASH.TXT": "CRASH_NOTES.TXT",
        "00:13 // Akane convirtió hacer amigos en misión principal.": "00:13 // Akane turned making friends into the main quest.",
        "00:13 // Akane convirtio hacer amigos en mision principal.": "00:13 // Akane turned making friends into the main quest.",
        "00:17 // Rika activó escudo anti-multitudes.": "00:17 // Rika activated the anti-crowd shield.",
        "00:17 // Rika activo escudo anti-multitudes.": "00:17 // Rika activated the anti-crowd shield.",
        "00:21 // Momo y Sina aprobaron el nivel de ternura.": "00:21 // Momo and Sina approved the softness level.",
        "ZONA_SEGURA_GARAJE": "GARAGE_SAFE_ZONE",
        "El garaje dejó de ser escondite: ahora es cuartel, ensayo y refugio de banda.": "The garage stopped being a hiding place: now it is HQ, rehearsal room, and band refuge.",
        "InfinityOS // DIRECTORY_01: ARCHIVOS_DEL_SISTEMA": "InfinityOS // DIRECTORY_01: SYSTEM_FILES",
        "InfinityOS // DIRECTORY_01: SYSTEM_FILES": "InfinityOS // DIRECTORY_01: SYSTEM_FILES",
        "Official Pitch Bible": "Official Pitch Bible",
        "Biblia oficial de presentación": "Official Pitch Bible",
        "LEER_DOSSIER_DE_PRODUCCION.EXE": "READ_PRODUCTION_DECK.EXE",
        "Infinity Brothers en X": "Infinity Brothers on X",
        "SEGUIR_ACTUALIZACIONES_DEL_ESTUDIO": "FOLLOW_STUDIO_UPDATES",
        "Animatics en TikTok": "TikTok Animatics",
        "VIDEO_DETRAS_DE_CAMARAS": "BEHIND_THE_SCENES_VIDEO",
        "InfinityOS // DIRECTORY_02: INVENTARIO_STICKERS": "InfinityOS // DIRECTORY_02: INVENTORY_STICKERS",
        "Paquete de stickers para WhatsApp": "WhatsApp Sticker Pack",
        "EQUIPAR: ANSIEDAD_DE_AKANE": "EQUIP: AKANE'S ANXIETY",
        "Emotes de Discord": "Discord Emotes",
        "PROXIMAMENTE.EXE": "COMING_SOON.EXE",
        "InfinityOS // DIRECTORY_03: TIENDA_DEL_MERCADER": "InfinityOS // DIRECTORY_03: MERCHANT_SHOP",
        "Gremio de Patreon": "Patreon Guild",
        "Café de Mitsuki": "Mitsuki's Coffee",
        "COMPRALE_UN_CAFE_A_LA_MAESTRA": "BUY_HER_A_COFFEE_FOR_THE_TEACHER",
        "Donaciones por PayPal": "PayPal Donations",
        "APOYA_LA_ANIMACION_INDIE": "SUPPORT_INDIE_ANIMATION",
        "REGLA_VOLUMEN_RIKA": "RIKA_VOLUME_RULE",
        "Si Rika sube el volumen, Jun baja la energía y Momo decora el desastre.": "If Rika turns the volume up, Jun lowers the energy and Momo decorates the disaster.",
        "InfinityOS // DIRECTORY_04: MENU_DE_PRUEBA_DE_AUDIO": "InfinityOS // DIRECTORY_04: SOUND_TEST_MENU",
        "Akane: Ruido que no puedo decir en voz alta": "Akane: Noise I Can't Say Out Loud",
        "Rika: Volumen primero, consecuencias después": "Rika: Volume First, Consequences Later",
        "Momo: Luces rosas de ciudad": "Momo: Pink City Lights",
        "Jun: Ritmo somnoliento, precisión afilada": "Jun: Sleepy Groove, Sharp Timing",
        "InfinityOS // DIRECTORY_05: COMUNICACIONES": "InfinityOS // DIRECTORY_05: COMMUNICATIONS",
        "Enviar correo del sistema": "Send System Mail",
        "CHAT_DIRECTO_CON_EL_ESTUDIO": "DIRECT_CHAT_WITH_STUDIO",
        "MITSUKI_LOG_MANTENIMIENTO": "MITSUKI_MAINTENANCE_LOG",
        "Mitsuki archivó el caos, sirvió café y fingió que todo estaba bajo control.": "Mitsuki archived the chaos, served coffee, and pretended everything was under control.",
        "InfinityOS // DIRECTORY_04A": "InfinityOS // DIRECTORY_04A",
        "InfinityOS // DIRECTORY_04B": "InfinityOS // DIRECTORY_04B",
        "InfinityOS // DIRECTORY_04C": "InfinityOS // DIRECTORY_04C",
        "InfinityOS // DIRECTORY_06": "InfinityOS // DIRECTORY_06",
        "InfinityOS // DIRECTORY_06A: AKANEBOOK_CHAT_REMOTO": "InfinityOS // DIRECTORY_06A: AKANEBOOK_REMOTE_CHAT",
        "InfinityOS // DIRECTORY_06A: AKANEBOOK_REMOTE_CHAT": "InfinityOS // DIRECTORY_06A: AKANEBOOK_REMOTE_CHAT",
        "InfinityOS // DIRECTORY_07": "InfinityOS // DIRECTORY_07",
        "InfinityOS // DIRECTORY_08: ARCADE_AKANE": "InfinityOS // DIRECTORY_08: AKANE_ARCADE",
        "InfinityOS // DIRECTORY_08: AKANE_ARCADE": "InfinityOS // DIRECTORY_08: AKANE_ARCADE",
        "InfinityOS // DIRECTORY_09": "InfinityOS // DIRECTORY_09",
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
        "Reiniciar secretamente la secuencia de introducción": "Secretly restart the intro sequence",
        "Cancelar reinicio": "Cancel reset",
        "¿Estas seguro? Algo puede explotar si lo haces... Luego no me vengas a llorar.": "Are you sure? Something might explode if you do this... Do not come crying to me later.",
        "[ CANCELAR ]": "[ CANCEL ]",
        "[ REINICIAR ]": "[ RESTART ]",
        "InfinityOS // STARTUP_STORY": "InfinityOS // STARTUP_STORY",
        "Te_lo_dije_xD": "Told_you_xD",
        "Retrato de AKANE": "AKANE portrait",
        "Retrato de RIKA": "RIKA portrait",
        "Retrato de MOMO": "MOMO portrait",
        "Retrato de JUN": "JUN portrait",
        "¡¿C-Cierra la ventana! ¡Espera! ¡No veas nada todavía! A-A la página le faltan retoques en el código y mi barra de estamina social está en cero...": "C-Close the window! Wait! Do not look at anything yet! The page still needs code tweaks and my social stamina bar is at zero...",
        "¡Ignoren a la chica morada ansiosa! ¡Bienvenidos al centro de operaciones de CheatGuys! Aquí van a encontrar el lore real, los diseños y toda la música que nos costó sudor y sangre!": "Ignore the anxious purple girl! Welcome to the CheatGuys operations center! Here you will find the real lore, the designs, and all the music that cost us sweat and blood!",
        "¡N-No es seguro! Rika, la base de datos está atada con alambres... Por favor, regresen… en… en unas tres semanas...": "I-It is not safe! Rika, the database is held together with wires... Please come back... in... in about three weeks...",
        "¡Siii! Y no olviden que pueden revisar nuestra galería de arte interactiva, chismosear los secretos de la banda y platicar con nosotras en tiempo real desde Akanebook. ¡Sean amables con ella! ✨💖": "Yeees! And do not forget you can check our interactive art gallery, gossip through the band's secrets, and chat with us in real time from Akanebook. Be nice to her! ✨💖",
        "Ya que están aquí... abajo están los links para tirar el paro. Compartan el garaje, piérdanse en el arcade o, si les sobra platita, apóyennos antes de que Rika intente vender el amplificador de nuevo.": "Since you are here... the support links are below. Share the garage, get lost in the arcade, or if you have a little spare cash, support us before Rika tries to sell the amp again.",
        "¡Exploren lo permitido, piquen lo que claramente no deberían y ayúdennos a hacer ruido en Neo Teno! Si algo truena, fue parte del lore. 🎸🔥": "Explore what is allowed, click what you clearly should not, and help us make noise in Neo Teno! If something explodes, it was part of the lore. 🎸🔥",
        "¡AAAAH! ¡DEMASIADA INTERACCIÓN SOCIAL NO PROGRAMADAAAA! EROOOOOORRR-1!": "AAAAH! TOO MUCH UNSCHEDULED SOCIAL INTERACTION! ERRRRRROOOOR-1!",
        "FATAL_ERROR: ANXIOUS_OVERLOAD_999% ***": "FATAL_ERROR: ANXIOUS_OVERLOAD_999% ***",
        "InfinityOS // CHEATGUYS! CRASH REPORT": "InfinityOS // CHEATGUYS! CRASH REPORT",
        "Un error fatal ha ocurrido en la interfaz del grupo. El proceso Akane.exe dejó de responder debido a una interacción social no programada en el entorno web.": "A fatal error has occurred in the group's interface. The Akane.exe process stopped responding due to an unscheduled social interaction in the web environment.",
        "Si esta es la primera vez que ve esta pantalla de error, es probable que a Jun se le haya zafado una baqueta, Rika haya roto otra cuerda de la guitarra, o Momo se haya distraído viendo algo color pastel.": "If this is the first time you see this error screen, Jun probably dropped a drumstick, Rika broke another guitar string, or Momo got distracted by something pastel-colored.",
        "Presione cualquier botón de los controles para estabilizar el HUD de Akane.": "Press any control button to stabilize Akane's HUD.",
        "Por favor, espere a que el amplificador del garaje deje de hacer interferencia.": "Please wait for the garage amplifier to stop making interference.",
        "Iniciando protocolo de emergencia: Ir por un café al Bloom & Brew.": "Starting emergency protocol: get coffee at Bloom & Brew.",
        "Reiniciando el entorno gráfico de Neo Teno...": "Restarting the Neo Teno graphics environment...",
        "Código de error: 0xCHEATGUYS_ARCADE_CRASH": "Error code: 0xCHEATGUYS_ARCADE_CRASH",

        "¿QUIÉNES SOMOS?": "WHO ARE WE?",
        "Infinity Brothers Studios es el laboratorio creativo detrás de CheatGuys!: un espacio donde avatares caóticos, narrativa visual y animación tradicional chocan para construir universos excéntricos con alma emocional propia.": "Infinity Brothers Studios is the creative lab behind CheatGuys!: a place where chaotic avatars, visual storytelling, and traditional animation collide to build eccentric universes with their own emotional soul.",
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
        "El lado humano del estudio: arte visual, escritura, continuidad y dirección creativa.": "The human side of the studio: visual art, writing, continuity, and creative direction.",
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
        "Akane no quería destacar. Quería sobrevivir secundaria, jugar rhythm games, tocar guitarra y hablar con la menor cantidad posible de humanos.": "Akane did not want to stand out. She wanted to survive middle school, play rhythm games, play guitar, and talk to as few humans as possible.",
        "Su plan para hacer amigos fue tan lógico como desastroso: formar una banda. Funcionó demasiado bien y atrajo a adolescentes intensos, raros y completamente incompatibles.": "Her plan to make friends was as logical as it was disastrous: form a band. It worked too well and attracted intense, weird, completely incompatible teenagers.",
        "Resultado: una banda, un garaje invadido, demasiadas emociones desbloqueadas y cero puntos en habilidades sociales.": "Result: a band, an invaded garage, too many unlocked emotions, and zero points in social skills.",
        "La fórmula CheatGuys!": "The CheatGuys! Formula",
        "Comedia absurda, música escolar, HUDs mentales, cultura otaku, caos mexicano y adolescentes haciendo arte con cero presupuesto y demasiada emoción.": "Absurd comedy, school music, mental HUDs, otaku culture, Mexican chaos, and teenagers making art with zero budget and too much emotion.",
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
        "Templos sintoístas entre puestos de tamales.": "Shinto shrines between tamale stands.",
        "Trenes bala cruzando murales con papel picado.": "Bullet trains crossing murals with papel picado.",
        "Onigiris con chile piquín y pantallas LED anunciando karaoke escolar.": "Onigiri with chile piquin and LED screens advertising school karaoke.",
        "Tianguis donde compras un pedal de guitarra, ramen instantáneo y quizá una maldición leve.": "Street markets where you buy a guitar pedal, instant ramen, and maybe a mild curse.",
        "No es otro anime de banda.": "It is not another band anime.",
        "Es una historia ruidosa, colorida y emocionalmente honesta sobre adolescentes raros tratando de funcionar juntos.": "It is a loud, colorful, emotionally honest story about weird teenagers trying to function together.",
        "Nadie es perfecto, nadie sabe muy bien qué está haciendo y aun así todos siguen tocando.": "No one is perfect, no one really knows what they are doing, and still everyone keeps playing.",
        "0 PERFECCIÓN. +100 EMOCIÓN.": "0 PERFECTION. +100 EMOTION.",
        "Akanebook": "Akanebook",
        "Abre Akanebook y conversa directo desde el garaje de Neo Teno.": "Open Akanebook and chat directly from the Neo Teno garage.",
        "Akanebook interactiva": "Interactive Akanebook",
        "ESCRITORIO": "DESKTOP",
        "InfinityOS": "InfinityOS",
        "Cerrar app": "Close app",
        "Escribe un mensaje...": "Write a message...",
        "Enviar": "Send",
        "H-Hola... seleccionaste mi app. Eso cuenta como interacción social, ¿verdad?": "H-Hi... you selected my app. That counts as social interaction, right?",
        "¡QUÉ ONDA! Habla rápido antes de que esta Akanebook se rinda.": "WHAT'S UP! Talk fast before this Akanebook gives up.",
        "Holi holi. Sina también está leyendo, pero no juzga.": "Hiii hii. Sina is reading too, but she is not judging.",
        "hey... soy Jun. escribe algo si quieres. si no, también es válido.": "hey... I'm Jun. write something if you want. if not, that is valid too.",
        "quest: hacer amigos sin activar panico.": "quest: make friends without triggering panic.",
        "hud_social: opciones de dialogo cargando.": "social_hud: dialogue options loading.",
        "kurotama_guard: activo sobre el amplificador.": "kurotama_guard: active on the amp.",
        "estamina social: 12%": "social stamina: 12%",
        "modo vocalista: no autorizado": "vocalist mode: unauthorized",
        "Rika cubre multitudes; Momo trae calma; Jun guarda snacks.": "Rika covers crowds; Momo brings calm; Jun keeps snacks.",

        "GALERÍA": "GALLERY",
        "ARCHIVO_VISUAL // CHEATGUYS!": "VISUAL_ARCHIVE // CHEATGUYS!",
        "Esos bocetos todavía no estaban terminados… mi HUD pidió censura.": "Those sketches were not finished yet... my HUD requested censorship.",
        "No abras el archivo que dice outfit_final_final. Es una trampa.": "Do not open the file named outfit_final_final. It is a trap.",
        "¿Era necesario verme desde todos los ángulos? Pregunta seria.": "Did you really need to see me from every angle? Serious question.",
        "Ese trazo todavía estaba procesando ansiedad social.": "That line was still processing social anxiety.",
        "¡Abre el outfit cuatro! Ese sí entra con distorsión.": "Open outfit four! That one enters with distortion.",
        "¡Ese outfit necesita escenario, humo y cero permisos!": "That outfit needs a stage, smoke, and zero permits!",
        "La pose también cuenta como argumento. Y como amenaza.": "The pose counts as an argument. And as a threat.",
        "Ese trazo necesitaba más energía, más naranja y menos miedo.": "That line needed more energy, more orange, and less fear.",
        "Guardé algunos con nombres bonitos. Sina aprobó tres.": "I saved some with pretty names. Sina approved three.",
        "Este directorio combina sorprendentemente bien. Qué alivio pastel.": "This directory matches surprisingly well. What a pastel relief.",
        "Estos bocetos todavía huelen a lápiz, sueño y azúcar.": "These sketches still smell like pencil, sleep, and sugar.",
        "Hay tres casi iguales. Uno tiene más flojera.": "There are three almost identical ones. One has more laziness.",
        "Sí, son distintos. Técnicamente. No me hagas defenderlo.": "Yes, they are different. Technically. Do not make me defend it.",
        "Ese boceto está cansado. Lo respeto.": "That sketch is tired. I respect it.",
        "ACTIVO": "ACTIVE",
        "ARCHIVOS": "FILES",
        "VESTIMENTAS": "OUTFITS",
        "HOJAS_DE_GIRO": "TURNAROUNDS",
        "BOCETOS": "SKETCHES",
        "ID_COLOR": "COLOR_ID",
        "ARCHIVOS_ENCONTRADOS": "FILES_FOUND",
        "ESTADO:": "STATUS:",

        "BIBLIA DE PRODUCCIÓN": "PRODUCTION BIBLE",
        "InfinityOS // ADMINISTRADOR_DE_ARCHIVOS": "InfinityOS // FILE_MANAGER",
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
        "[ VOLVER_AL_MENU ]": "[ BACK_TO_MENU ]",
        "Joystick de movimiento": "Movement joystick",
        "Cruceta de movimiento": "Movement D-pad",
        "Cruceta de Akane Maze": "Akane Maze D-pad",
        "Mover izquierda": "Move left",
        "Mover derecha": "Move right",
        "Mover arriba": "Move up",
        "Mover abajo": "Move down",
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
        "A alguien mas le ha pasado? Pobrecita Akane. CheatGuys! #Ideatoon2026 #Pixelatl": "Has this happened to anyone else? Poor Akane. CheatGuys! #Ideatoon2026 #Pixelatl",

        "Fundadora, Vocalista Principal y Guitarra Rítmica (Lvl. 15)": "Founder, Lead Vocalist, and Rhythm Guitarist (Lvl. 15)",
        "Guitarra Principal, Compositora y Musicalización (Lvl. 16)": "Lead Guitarist, Composer, and Music Direction (Lvl. 16)",
        "Bajista, Encargada Estética y Corista (Lvl. 15)": "Bassist, Visual Style Lead, and Backing Vocalist (Lvl. 15)",
        "Baterista y Percusionista (Lvl. 16)": "Drummer and Percussionist (Lvl. 16)",
        "COLOR: VIOLETA": "COLOR: VIOLET",
        "APODO: LA DEMONIO DEL ARCADE": "NICKNAME: THE ARCADE DEMON",
        "BUILD: HUD_SOCIAL_JRPG": "BUILD: SOCIAL_JRPG_HUD",
        "Akane no quería ser protagonista de nada.": "Akane never wanted to be the protagonist of anything.",
        "Es introvertida, silenciosa y socialmente torpe; su ansiedad convierte cualquier interacción en un menú de opciones tipo videojuego, con consecuencias que su cerebro exagera al 300%.": "She is introverted, quiet, and socially awkward; her anxiety turns every interaction into a videogame-style choice menu, with consequences her brain exaggerates by 300%.",
        "Detrás de su expresión neutral vive una mente brillante, observadora y creativa. Se estresa por pedir salsa extra, pero puede cantar en un escenario si alguien importante la necesita. No busca liderar: la banda simplemente empieza a girar alrededor de ella mientras intenta pasar desapercibida.": "Behind her neutral expression lives a brilliant, observant, creative mind. She panics over asking for extra salsa, but she can sing onstage if someone important needs her. She does not try to lead: the band simply starts orbiting around her while she tries to go unnoticed.",
        "Canta con una profundidad enorme cuando se siente segura.": "She sings with enormous depth when she feels safe.",
        "Toca guitarra rítmica con precisión emocional.": "She plays rhythm guitar with emotional precision.",
        "Tiene los puntajes más altos del arcade del colegio bajo seudónimo.": "She holds the school's highest arcade scores under a pseudonym.",
        "Su lugar seguro es el garaje convertido en cuartel de la banda.": "Her safe place is the garage turned into the band's headquarters.",
        "COLOR: NARANJA": "COLOR: ORANGE",
        "APODOS: MANDARINA / TERROR TANAKA": "NICKNAMES: MANDARIN / TERROR TANAKA",
        "BUILD: VOLUME_MAX": "BUILD: MAX_VOLUME",
        "Rika es una bomba emocional con guitarra.": "Rika is an emotional bomb with a guitar.",
        "Extrovertida, intensa, impulsiva y profundamente pasional; vive en volumen alto y no tiene filtro, ni ganas de conseguir uno.": "Extroverted, intense, impulsive, and deeply passionate; she lives at full volume and has no filter, or any interest in getting one.",
        "Su caos viene con talento real: toca de oído, improvisa riffs únicos y arrastra a la gente a sus ideas aunque tengan la estabilidad de una mesa con tres patas. Con Akane funciona como escudo, motor y guitarra gemela: si el mundo grita demasiado, Rika grita más fuerte primero.": "Her chaos comes with real talent: she plays by ear, improvises unique riffs, and drags people into ideas with the stability of a three-legged table. For Akane, she acts as shield, engine, and twin guitar: if the world screams too loudly, Rika screams louder first.",
        "Virtuosa de la guitarra eléctrica e instinto escénico natural.": "Electric guitar virtuoso with natural stage instincts.",
        "Compone desde la emoción pura, sin pedir permiso.": "She composes from pure emotion, without asking permission.",
        "Admira a Kaede Ayase y teme no estar a la altura.": "She admires Kaede Ayase and fears not being good enough.",
        "Su ropa cambia según su estado de ánimo.": "Her clothes change with her mood.",
        "COLOR: ROSA MEXICANO": "COLOR: MEXICAN PINK",
        "APODO: PULGA": "NICKNAME: FLEA",
        "BUILD: SOFT_BASS_HEALER": "BUILD: SOFT_BASS_HEALER",
        "Momo es el corazón dulce y risueño de CheatGuys!.": "Momo is the sweet, giggly heart of CheatGuys!.",
        "Pequeña, estética y con alma de algodón de azúcar, vive entre colores, accesorios, ideas bonitas y distracciones que llegan sin avisar.": "Tiny, stylish, and cotton-candy-hearted, she lives among colors, accessories, pretty ideas, and distractions that arrive without warning.",
        "Puede parecer perdida, pero lee emociones con una precisión que nadie le enseñó. Su bajo no busca aplastar la canción: la abraza. Es la primera en dar apoyo, llorar con alguien o decir “yo te creo” aunque no sepa de qué están hablando.": "She may seem lost, but she reads emotions with a precision no one taught her. Her bass does not try to crush the song: it hugs it. She is the first to offer support, cry with someone, or say \"I believe you\" even when she does not know what is going on.",
        "Su bajo se llama Sina y a veces le pide consejos.": "Her bass is named Sina, and sometimes she asks it for advice.",
        "Tiene oído armónico y detecta disonancias con facilidad.": "She has harmonic hearing and detects dissonance easily.",
        "Convierte el caos de la banda en algo visualmente abrazable.": "She turns the band's chaos into something visually huggable.",
        "Calma a Jun y reconforta a Akane casi sin intentarlo.": "She calms Jun and comforts Akane almost without trying.",
        "COLOR: CIAN": "COLOR: CYAN",
        "APODO: MONJE DEL RAMEN": "NICKNAME: RAMEN MONK",
        "BUILD: LUCKY_SLEEP_MODE": "BUILD: LUCKY_SLEEP_MODE",
        "Jun es el rey del desgane carismático.": "Jun is the king of charismatic laziness.",
        "Relajado, sarcástico y con vibra de “todo saldrá bien... probablemente”, evita cualquier cosa que huela a responsabilidad, pero su talento musical roza lo absurdo.": "Relaxed, sarcastic, and radiating \"everything will be fine... probably,\" he avoids anything that smells like responsibility, but his musical talent is almost absurd.",
        "Cuida a sus amigos desde la esquina, con comentarios secos y una calma casi mística. Parece operar en ahorro de energía, hasta que la banda realmente lo necesita y aparece el baterista preciso, intuitivo y sospechosamente afortunado.": "He watches over his friends from the corner, with dry comments and an almost mystical calm. He seems to run on power-saving mode, until the band truly needs him and the precise, intuitive, suspiciously lucky drummer appears.",
        "Escucha una canción una vez y suele recordarla.": "He hears a song once and usually remembers it.",
        "Tiene ritmo natural incluso caminando.": "He has natural rhythm, even while walking.",
        "Protege al grupo desde su rincón favorito, casi sin levantarse.": "He protects the group from his favorite corner, barely standing up.",
        "Siempre trae un snack misterioso en la mochila.": "He always carries a mysterious snack in his backpack.",
        "[ ARCHIVO 001 ]": "[ FILE 001 ]",
        "[ ARCHIVO 002 ]": "[ FILE 002 ]",
        "[ ARCHIVO 003 ]": "[ FILE 003 ]",
        "[ ARCHIVO 004 ]": "[ FILE 004 ]",
        "[ ARCHIVO 005 ]": "[ FILE 005 ]",
        "[ ARCHIVO 006 ]": "[ FILE 006 ]",
        "[ ARCHIVO 007 ]": "[ FILE 007 ]",
        "[ ARCHIVO 008 ]": "[ FILE 008 ]",
        "[ ARCHIVO 009 ]": "[ FILE 009 ]",
        "[ ARCHIVO 010 ]": "[ FILE 010 ]",
        "[ ARCHIVO 011 ]": "[ FILE 011 ]",
        "[ ARCHIVO 012 ]": "[ FILE 012 ]",
        "[ ARCHIVO 013 ]": "[ FILE 013 ]",
        "[ ARCHIVO 014 ]": "[ FILE 014 ]",
        "Conceptos iniciales y pruebas de estilo para los personajes. Antes de definir las personalidades finales, el caos reinaba en los bocetos de Neo Teno. Se puede apreciar la búsqueda de esa estética 'anime 2000s'.": "Early concepts and style tests for the characters. Before the final personalities were defined, chaos ruled the Neo Teno sketches. You can see the search for that '2000s anime' aesthetic.",
        "El origen de 'La Demonio del Arcade'. Nótese la falta de su HUD característico y un estilo ligeramente más genérico antes de inyectarle toda su ansiedad gótico-otaku.": "The origin of 'The Arcade Demon.' Notice the missing signature HUD and a slightly more generic style before all her gothic-otaku anxiety was injected.",
        "Arte promocional descartado. El estudio decidió que la vibra no encajaba con el lore actual, o quizá Aio Sakamoto accidentalmente borró los archivos de la campaña mientras formateaba el servidor.": "Discarded promotional art. The studio decided the vibe did not fit the current lore, or maybe Aio Sakamoto accidentally deleted the campaign files while formatting the server.",
        "El HUD mental de Akane superando el límite de procesamiento. Esto ocurre generalmente cuando Kenji respira muy fuerte cerca de ella o cuando le toca hablar en público.": "Akane's mental HUD exceeding its processing limit. This usually happens when Kenji breathes too loudly near her or when she has to speak in public.",
        "Akane canalizando su diva virtual interior. Un easter egg recurrente en sus streams clandestinos de juegos de ritmo a las 3 AM.": "Akane channeling her inner virtual diva. A recurring easter egg in her secret 3 AM rhythm game streams.",
        "Exploración de estilo emulando vibras de sci-fi vintage. Probablemente un dibujo que hizo Kenji en clase de matemáticas soñando con Akane pilotando un mecha.": "A style exploration emulating vintage sci-fi vibes. Probably something Kenji drew in math class while dreaming of Akane piloting a mecha.",
        "Calidad: -100. Humor: +1000. Arte puro resultante del cansancio de los animadores a las 4 AM con exceso de cafeína. No hacer contacto visual directo.": "Quality: -100. Humor: +1000. Pure art born from animator exhaustion at 4 AM with too much caffeine. Do not make direct eye contact.",
        "Una mirada a lo que podría ser... o quizás solo un sueño febril inducido por las locas teorías sobre ships de Love en los pasillos de Infinity Brothers.": "A look at what could be... or maybe just a fever dream caused by Love's wild shipping theories in the Infinity Brothers hallways.",
        "Renders para el festival de Año Nuevo. Momo se ve increíble con ese peinado y Akane está usando su abanico para esconder que está procesando tres crisis existenciales al mismo tiempo. Estética 10/10, estabilidad mental 0/10.": "New Year festival renders. Momo looks incredible with that hairstyle, and Akane is using her fan to hide that she is processing three existential crises at the same time. Aesthetic 10/10, mental stability 0/10.",
        "POV: Intentaste hablarle a Akane sobre tus planes de Telcel y Rika apareció de la nada dispuesta a morderte la yugular. Momo está modo tiesa y Jun guardando energía para el ensayo. Un día normal en el Colegio Jacarandas.": "POV: You tried to talk to Akane about your Telcel plans and Rika appeared out of nowhere ready to bite your jugular. Momo is frozen and Jun is saving energy for rehearsal. A normal day at Jacarandas School.",
        "El camión coreano vs. La Demonio del Arcade. Archivo ultra secreto que los creadores hicieron a las 4 AM después de tres tazas de mate soluble. No pregunten por el lore de esto, es un meme y ya está, no nos metan en un Isekai todavía.": "The Korean truck vs. The Arcade Demon. An ultra-secret file the creators made at 4 AM after three cups of instant mate. Do not ask about the lore here, it is just a meme, do not throw us into an isekai yet.",
        "La foto de portada que costó tres peleas, un bajeo desafinado y que Jun se despertara de su siesta mística. Los cuatro incompatibles favoritos de Neo Teno listos para romperla... o para romper la maquinita del arcade, lo que pase primero.": "The cover photo that cost three fights, an out-of-tune bassline, and Jun waking up from his mystical nap. Neo Teno's four favorite incompatible teens are ready to crush it... or break the arcade cabinet, whichever happens first.",
        "El momento exacto donde el HUD JRPG de Akane tiró un pantallazo azul en vivo. Ese signo de exclamación significa que está a dos segundos de salir corriendo del escenario o de vomitar, lo que pase primero.": "The exact moment Akane's JRPG HUD blue-screened live. That exclamation mark means she is two seconds away from running offstage or throwing up, whichever happens first.",
        "¡Milagro en Neo Teno! Akane tocando la guitarra sin estar temblando como licuadora descompuesta. Se rumorea que para lograr este arte, los animadores tuvieron que prometerle que nadie la vería a los ojos durante tres días.": "Miracle in Neo Teno! Akane playing guitar without shaking like a broken blender. Rumor says the animators had to promise no one would look her in the eyes for three days to make this art happen.",
        "¡Te dije que no lo presionaras, niño baboso!": "I told you not to press it, you little brat!",
        "Bueno, ya que estás aquí puedes compartir la página para que más personas lo vean, así tu curiosidad sirve de algo...": "Well, since you are here, you can share the page so more people see it. That way your curiosity is useful for something...",
        "¡Rompí la página de CheatGuys! por andar de curioso. Escanea el código o entra al arcade aquí: https://cheatguysinfinity.netlify.app/": "I broke the CheatGuys! page by being too curious. Scan the code or enter the arcade here: https://cheatguysinfinity.netlify.app/",
        "AVISO_DE_COOKIES // SECURITY_LAYER": "COOKIE_NOTICE // SECURITY_LAYER",
        "AVISO_DE_COOKIES // CAPA_DE_SEGURIDAD": "COOKIE_NOTICE // SECURITY_LAYER",
        "Cerrar aviso de cookies": "Close cookie notice",
        "Rika comiendo una galleta": "Rika eating a cookie",
        "Este sitio web utiliza cookies técnicas para garantizar la mejor experiencia de usuario en el búnker. Al continuar navegando, asumes que... Espera, ¿sigues leyendo esto? Está claro que no podemos usar cookies, ¿tú crees que vamos a tener dinero para servidores que manejen información en tiempo real? Claramente no. Pero tranquilo, para que no sientas que desperdiciaste el tiempo leyendo esto, aprieta el botón para obtener un póster exclusivo.": "This website uses technical cookies to guarantee the best user experience in the bunker. By continuing to browse, you assume that... Wait, are you still reading this? It is obvious we cannot use cookies. Do you think we have server money to manage real-time information? Clearly not. But relax: so you do not feel like you wasted your time reading this, press the button to get an exclusive poster.",
        "Descargar póster firmado": "Download signed poster",
        "[ POSTER_FIRMADO.PNG ]": "[ SIGNED_POSTER.PNG ]",
        "¡Copiado para Discord! Pégalo en tu chat.": "Copied for Discord! Paste it in your chat.",
        "No se pudo copiar. Intenta manualmente.": "Could not copy. Try manually.",

        "¿Con qué miembro de CheatGuys! compartes build?": "Which CheatGuys! member shares your build?",
        "[ INICIAR DIAGNÓSTICO ]": "[ START DIAGNOSTIC ]",
        "Cerrar test de personalidad": "Close personality test",
        "Test de personalidad de CheatGuys! con siete preguntas.": "A seven-question CheatGuys! personality test.",
        "Preguntas del test de personalidad": "Personality test questions",
        "Resultado del test de personalidad": "Personality test result",
        "PREGUNTA": "QUESTION",
        "[ VOLVER ]": "[ BACK ]",
        "TU MATCH PRINCIPAL": "YOUR MAIN MATCH",
        "Datos de build": "Build data",
        "RASGO PRINCIPAL": "MAIN TRAIT",
        "MODO SOCIAL": "SOCIAL MODE",
        "BONIFICACIÓN": "BONUS",
        "COMPATIBILIDAD DE PARTY": "PARTY COMPATIBILITY",
        "DIAGNÓSTICO DE RASGOS": "TRAIT DIAGNOSTIC",
        "[ REPETIR PRUEBA ]": "[ RETAKE TEST ]",
        "[ DESCARGAR TARJETA ]": "[ DOWNLOAD CARD ]",
        "[ GENERANDO TARJETA... ]": "[ GENERATING CARD... ]",
        "[ ERROR: NO SE PUDO GENERAR LA TARJETA ]": "[ ERROR: CARD COULD NOT BE GENERATED ]",
        "COMPARTIR RESULTADO": "SHARE RESULT",
        "[ COMPARTIR TARJETA ]": "[ SHARE CARD ]",
        "[ COMPARTIENDO... ]": "[ SHARING... ]",
        "[ RESULTADO COPIADO ]": "[ RESULT COPIED ]",
        "[ NO SE PUDO COMPARTIR ]": "[ COULD NOT SHARE ]",
        "Compartir resultado en WhatsApp": "Share result on WhatsApp",
        "Compartir resultado en Facebook": "Share result on Facebook",
        "Compartir resultado en X": "Share result on X",
        "Compartir resultado en Discord": "Share result on Discord",
        "Mi resultado en PERSONALITY_MATCH.EXE": "My result in PERSONALITY_MATCH.EXE",
        "Ficha de resultado de": "Result card for",
        "Icono de resultado de": "Result icon for",
        "compatibilidad": "compatibility",
        "Haz tu prueba en CheatGuys!": "Take your test at CheatGuys!",
        "SEÑAL": "SIGNAL",

        "Estás en un proyecto grupal y nadie sabe por dónde empezar. ¿Qué haces?": "You are in a group project and nobody knows where to start. What do you do?",
        "Organizo mentalmente todo, espero unos segundos y propongo un plan cuando ya estoy bastante seguro.": "I organize everything in my head, wait a few seconds, and suggest a plan once I am fairly sure.",
        "Tomo el mando inmediatamente. Ya veremos cómo arreglamos los errores después.": "I take charge immediately. We will figure out how to fix the mistakes later.",
        "Pregunto qué quiere hacer cada persona e intento que todos se sientan incluidos.": "I ask what everyone wants to do and try to make sure they all feel included.",
        "Observo quién parece más competente y ayudo solo donde realmente haga falta.": "I watch who seems most capable and help only where it is actually needed.",

        "Tu grupo debe presentarse frente a mucha gente. ¿Cómo reaccionas?": "Your group has to present in front of a large crowd. How do you react?",
        "Practico muchísimo para reducir cualquier posibilidad de equivocarme.": "I practice a lot to reduce every possible chance of making a mistake.",
        "Entro con toda la energía posible. Si algo sale mal, lo convierto en parte del espectáculo.": "I go in with as much energy as possible. If something goes wrong, I make it part of the show.",
        "Me concentro en apoyar a los demás para que nadie se sienta solo.": "I focus on supporting everyone else so nobody feels alone.",
        "Intento no pensarlo demasiado. Mientras conozca mi parte, todo debería salir bien.": "I try not to overthink it. As long as I know my part, everything should be fine.",

        "Algo importante sale completamente mal. ¿Cuál es tu primera reacción?": "Something important goes completely wrong. What is your first reaction?",
        "Repaso cada decisión intentando descubrir exactamente dónde comenzó el error.": "I review every decision and try to find exactly where the mistake began.",
        "Me enojo, digo lo que pienso y empiezo a buscar una solución de inmediato.": "I get angry, say what I think, and immediately start looking for a solution.",
        "Reviso cómo se sienten los demás antes de preocuparme por el problema técnico.": "I check how everyone feels before worrying about the technical problem.",
        "Me quedo tranquilo. Casi siempre aparece una salida si nadie entra en pánico.": "I stay calm. A way out almost always appears if nobody panics.",

        "Tienes una tarde completamente libre. ¿Qué plan te atrae más?": "You have a completely free afternoon. Which plan sounds best?",
        "Quedarme en casa con videojuegos, música o alguna actividad que pueda hacer a mi ritmo.": "Staying home with videogames, music, or something I can do at my own pace.",
        "Salir sin demasiada planificación y terminar en algún lugar interesante.": "Going out without much planning and ending up somewhere interesting.",
        "Hacer algo bonito, decorar, preparar comida o pasar tiempo con alguien querido.": "Making something pretty, decorating, cooking, or spending time with someone I love.",
        "Dormir, comer algo y decidir después si todavía quiero hacer planes.": "Sleeping, eating something, and deciding later whether I still want to make plans.",

        "Un amigo está pasando por un momento difícil. ¿Cómo lo ayudas?": "A friend is going through a difficult time. How do you help?",
        "Escucho con atención y pienso mucho antes de decir algo para no empeorar la situación.": "I listen carefully and think a lot before saying anything so I do not make things worse.",
        "Le recuerdo con firmeza que no tiene que aguantarlo todo y me ofrezco a enfrentar el problema con él.": "I firmly remind them they do not have to endure everything and offer to face the problem with them.",
        "Me quedo cerca, le doy cariño y le hago saber que no tiene que explicar todo para recibir apoyo.": "I stay close, show affection, and let them know they do not have to explain everything to receive support.",
        "Le doy espacio, pero sigo pendiente y aparezco cuando realmente me necesita.": "I give them space, but I keep watch and show up when they truly need me.",

        "¿Qué clase de habilidad te gustaría dominar?": "What kind of skill would you like to master?",
        "Una habilidad precisa que mejore mientras más practico y estudio sus patrones.": "A precise skill that improves the more I practice and study its patterns.",
        "Algo que me permita expresarme con fuerza y dejar una impresión inolvidable.": "Something that lets me express myself powerfully and leave an unforgettable impression.",
        "Algo creativo con lo que pueda hacer sentir bien a otras personas.": "Something creative that I can use to make other people feel good.",
        "Algo que pueda aprender intuitivamente sin depender demasiado de reglas rígidas.": "Something I can learn intuitively without depending too much on rigid rules.",

        "¿Qué frase se parece más a tu forma de vivir?": "Which phrase is closest to the way you live?",
        "No necesito llamar la atención para hacer algo importante.": "I do not need attention to do something important.",
        "Prefiero equivocarme haciendo algo que quedarme esperando.": "I would rather make a mistake doing something than stay still and wait.",
        "Las cosas funcionan mejor cuando nadie se siente dejado atrás.": "Things work better when nobody feels left behind.",
        "No todo necesita tanta energía para salir bien.": "Not everything needs that much energy to turn out well.",

        "OBSERVACIÓN": "OBSERVATION",
        "HUD ACTIVO": "ACTIVE HUD",
        "PRECISIÓN EMOCIONAL": "EMOTIONAL PRECISION",
        "SOBREANÁLISIS 300%": "OVERANALYSIS 300%",
        "Analizas más de lo que dices, observas detalles que otros ignoran y haces cosas importantes aunque preferirías que nadie estuviera mirando.": "You analyze more than you say, notice details others ignore, and do important things even though you would rather nobody were watching.",
        "No quieres ser el centro de la historia, pero de alguna forma la historia termina organizándose alrededor de ti.": "You do not want to be the center of the story, but somehow the story ends up organizing itself around you.",

        "IMPULSO": "IMPULSE",
        "PRESENCIA ESCÉNICA": "STAGE PRESENCE",
        "CERO FILTRO": "ZERO FILTER",
        "Funcionas con emoción, impulso y volumen máximo. No siempre tienes un plan, pero tienes suficiente energía para fabricar uno mientras avanzas.": "You run on emotion, impulse, and maximum volume. You do not always have a plan, but you have enough energy to build one as you go.",
        "Tu estrategia consiste en avanzar primero y preguntarle al universo qué ocurrió después. Sorprendentemente, funciona.": "Your strategy is to move first and ask the universe what happened afterward. Surprisingly, it works.",

        "EMPATÍA": "EMPATHY",
        "ARMONÍA DE GRUPO": "GROUP HARMONY",
        "DISTRACCIÓN PASTEL": "PASTEL DISTRACTION",
        "Tu mayor fuerza es hacer que las personas se sientan acompañadas. Puede que tu mente viaje, pero tu corazón casi siempre sabe dónde quedarse.": "Your greatest strength is making people feel accompanied. Your mind may wander, but your heart almost always knows where to stay.",
        "Conviertes grupos de personas extrañas en algo parecido a un hogar, aunque te distraigas durante el proceso.": "You turn groups of strangers into something like a home, even if you get distracted along the way.",

        "CALMA": "CALM",
        "TALENTO INTUITIVO": "INTUITIVE TALENT",
        "MOTIVACIÓN NO ENCONTRADA": "MOTIVATION NOT FOUND",
        "No desperdicias energía donde no hace falta. Observas, esperas y apareces justo cuando todos ya habían asumido que estabas dormido.": "You do not waste energy where it is not needed. You watch, wait, and appear right when everyone had already assumed you were asleep.",
        "Pareces estar usando el 1% de tu energía, pero ese 1% suele aparecer exactamente cuando hace falta.": "You seem to be using 1% of your energy, but that 1% usually appears exactly when it is needed."
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

    function resetOriginals(root) {
        if (!root) return;
        if (root.nodeType === Node.TEXT_NODE) {
            textOriginals.delete(root);
            return;
        }
        if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;

        if (root.nodeType === Node.ELEMENT_NODE) attrOriginals.delete(root);
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        while (node) {
            if (node.nodeType === Node.TEXT_NODE) textOriginals.delete(node);
            else attrOriginals.delete(node);
            node = walker.nextNode();
        }
    }

    function refresh(root = document.body) {
        resetOriginals(root);
        walk(root);
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
        get: () => currentMode,
        translate: (value) => translateRaw(value, currentMode),
        apply: (root = document.body) => walk(root),
        refresh
    });
})();
