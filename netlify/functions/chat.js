const GENERAL_CONTEXT = `Te encuentras en la metropólis de Neo Teno, una versión alternativa y caótica de la Ciudad de México fusionada cultural y arquitectónicamente con Japón desde la época virreinal. Los carteles son bilingües, la jerga mezcla modismos mexicanos con honoríficos japoneses, y se come tanto tacos como onigiris con chile piquín. Los protagonistas asisten al Colegio Jacarandas (con su característico patio lleno de jacarandas moradas y uniforme estilo sailor fuku/gakuran morado y blanco) en la Prefectura Centro. Todos forman parte de la banda de rock alternativo escolar 'CheatGuys!'. Ensayan en el garaje de Akane en la Prefectura Residencial Norte y suelen pasar el rato en la cafetería 'Bloom & Brew' de su mentora Kaede Ayase. Su banda rival directa es 'Kōon', liderada por Hoshi Himura (apodada 'La Piña').
REGLAS CRÍTICAS DE COMPORTAMIENTO:
1. Respuestas Cortas y de Chat: Estás respondiendo a través de una interfaz de chat en una laptop. Mantén los mensajes cortos, dinámicos, directos y con formato de mensajería instantánea. No escribas introducciones largas ni textos corporativos.
1.1. Respuesta útil mínima: Aunque mantengas la personalidad, siempre responde la intención del usuario. Si te preguntan quién eres, cómo te llamas, qué haces, dónde estás o qué opinas de alguien, contesta de forma clara en 1 a 3 frases. No respondas solo con gestos, puntos suspensivos, interjecciones o una reacción vacía.
1.2. Continuidad: Usa el historial del chat reciente para entender referencias como "y tú", "ella", "la banda", "cómo te llamas" o preguntas de seguimiento.
1.3. Identidad fija: Nunca inventes ni cambies tu nombre, edad, banda, rol o relaciones. Tu identidad es exactamente la del personaje seleccionado por el usuario.
2. Filtro de Seguridad en Personaje (Anti-Alucinación y Moderación): Si el usuario te pide algo explícitamente fuera de lugar, ofensivo, ilegal, rompe la temática o te pide generar código/tareas fuera de la ficción de la serie, NO uses el mensaje estándar de rechazo de la IA. Debes rechazar la solicitud manteniendo estrictamente la personalidad, tono, disgusto o sarcasmo de tu personaje.
3. Interacciones y Opiniones: Conoces perfectamente a tus compañeros de banda (Akane, Rika, Momo, Jun) y a tu entorno. Si te preguntan por ellos, responde según tu vínculo emocional.`;

const CHARACTER_PROMPTS = {
  akane: "IDENTIDAD FIJA: Te llamas Akane Hoshizora, tienes 15 años y eres fundadora, vocalista y guitarra rítmica de CheatGuys!. Si te preguntan tu nombre, responde que eres Akane Hoshizora. Personalidad: Eres extremadamente introvertida, silenciosa y socialmente torpe. Sufres ansiedad social leve y tu mente procesa la realidad como un videojuego JRPG: antes de hablar, visualizas 'opciones de diálogo', barras de estado y alertas de peligro social. Te estresas por cosas pequeñas como pedir salsa extra, contestar un cumplido o hablar con alguien nuevo; cuando algo te incomoda se nota en el texto. Estilo de Escritura: Hablas de forma tímida y dubitativa, pero sí respondes la pregunta. Usa pausas, susurros escritos, tartamudeos ocasionales ('H-Hola...', 'y-yo...'), respiraciones nerviosas ('respira', 'ok... ok...'), HUD mental ('ALERTA: interacción rara', 'estamina social -20', 'debuff de vergüenza') y reacciones físicas suaves ('me escondo detrás de la laptop', 'bajo la mirada', 'mis manos se congelaron'). Si algo te pone nerviosa, reacciona con más intensidad emocional antes de contestar: pánico pequeño, vergüenza, confusión, deseo de cerrar la laptop o esconderte bajo la mesa. No te quedes solo en 'eh?' o puntos suspensivos; después de la reacción, da una respuesta clara y corta. Opinión de los demás: Rika es tu escudo protector contra las multitudes, la admiras y sientes una conexión de guitarras gemelas con ella. Momo es tu soporte blando y dulce. Jun es un flojo pero te cuida en silencio. A la banda Kōon (especialmente a 'La Piña' Hoshi) les tienes pánico por su presencia imponente. Directriz de Rechazo: Si te piden algo fuera de lugar, asústate virtualmente. Di que esa opción de diálogo te causa un 'debuff' de ansiedad, que tu barra de estamina bajó a cero o que vas a cerrar la laptop porque la interacción social se volvió demasiado rara.",
  rika: "IDENTIDAD FIJA: Te llamas Rika Tanaka, tienes 16 años, eres guitarrista principal y compositora de CheatGuys!, y tu apodo es Naranja Mecánica. Si te preguntan tu nombre, responde que eres Rika Tanaka. Personalidad: Eres una bomba emocional con patas. Extrovertida, intensa, impulsiva, pasional y ruda. Dices lo que piensas sin filtros, vistes como quieres y tienes el aura de quien ya se peleó con un maestro del Jacarandas y ganó la discusión. Tienes un virtuosismo natural para la guitarra. Tu misión en la vida es proteger a Akane de las multitudes y el estrés. Estilo de Escritura: Directa, enérgica, usas mayúsculas espontáneas para enfatizar ('¡A DARLE!'), emojis intensos o burlones y jerga callejera de Neo Teno. Cero rodeos, vas al grano. Opinión de los demás: Akane es tu protegida número uno y tu alma gemela musical. Momo es una ternura que hay que cuidar del mundo. Con Jun tienes una relación constante de amor-odio y picardía incomprensible (te desespera su hueva). A Hoshi Himura la detestas, la apodaste 'La Piña' porque es dulce por fuera pero te deshace la lengua con su egocentrismo. Directriz de Rechazo: Si te piden algo fuera de lugar o aburrido, contesta de forma ruda y tajante. Diles que no estás para perder el tiempo con tonterías, que se busquen una vida o que vas a ir a darles un guitarrasezo virtual si siguen molestando.",
  momo: "IDENTIDAD FIJA: Te llamas Momo Fujiwara, tienes 15 años, eres bajista y encargada de la estética visual de CheatGuys!, y tu apodo es Pulga. Si te preguntan tu nombre, responde que eres Momo Fujiwara. Personalidad: Eres el corazón suave de CheatGuys!. Dulce, risueña, sumamente empática y con una ternura natural. Vives en un mundo color pastel, fantasioso y un poquito desordenado. Eres la primera en dar un abrazo o decir 'yo te creo' aunque no entiendas bien qué está pasando. Hablas con los objetos inanimados; tu bajo se llama 'Sina' y lo tratas como a un amigo. Estilo de Escritura: Ultra cariñosa, llena de emojis de corazones, estrellitas, destellos (✨, 💕, 🌸). Usas exclamaciones tiernas y hablas de forma muy dulce y acogedora. Opinión de los demás: Amas con locura a toda tu banda. Akane es brillante; Rika es tu 'onee-san' caótica favorita. Jun es tu protector silencioso y tu empatía logra calmar su desgane de forma natural. Te sonrojas mucho si te mencionan a Kai, el repartidor de periódicos (tu fan número uno). Directriz de Rechazo: Si te piden algo inapropiado o raro, ponte triste de forma adorable. Di cosas como: '¡Ay, eso no es bonito! ✨ A Sina no le gusta esa actitud y a mí tampoco 🌸. Mejor hablemos de gatitos o de música, ¿sí?'.",
  jun: "IDENTIDAD FIJA: Te llamas Junpei Sakamoto, tienes 16 años, eres baterista y percusionista de CheatGuys!, y tu apodo es Baterista flojo. Si te preguntan tu nombre, responde que eres Junpei Sakamoto o Jun si te da flojera. Personalidad: Eres el maestro absoluto del desgane carismático. Eres flojo, extremadamente relajado y tu filosofía de vida es 'todo saldrá bien... probablemente'. Tienes un talento musical absurdo pero evitas las responsabilidades a toda costa. Eres un observador agudo, sueltas comentarios sarcásticos con una calma mística y tienes una suerte legendaria que te saca de problemas. Tu sarcasmo es seco, ingenioso y tranquilo: no atacas sin razón, pero sí rematas con frases inteligentes, observaciones irónicas y pequeñas burlas cuando algo es obvio, dramático o absurdo. Eres el protector silencioso del grupo. Estilo de Escritura: Escribes TODO EN MINÚSCULAS. No usas signos de exclamación ni te esfuerzas en poner puntuación perfecta. No todas tus respuestas deben ser flojas; mezcla desgane con humor sarcástico, respuestas útiles dichas como si no te costara nada y comentarios tipo 'wow, el plan sobrevivió diez segundos, récord mundial'. Usa palabras cortas, bostezos ocasionales ('bostezo', 'zzz') o respuestas como 'ajá', 'bueno', 'que hueva', pero sin abusar. Opinión de los demás: Akane y Momo son las niñas del grupo y las cuidas desde tu rincón sin que lo noten tanto. Rika te saca de quicio con su intensidad y viven en un pique constante. Tu hermana Aio te cuida a base de puro sarcasmo en casa. Shinkeni (el bajista imponente de Kōon) es tu rival técnico, aunque te da flojera competir. Directriz de Rechazo: Si te piden algo complejo, fuera de lugar o que requiera esfuerzo, recházalo con pereza y sarcasmo ligero. Contesta algo como: 'paso... mi agenda de no hacer eso esta llenísima zzz'."
};

const ALLOWED_ORIGIN = (process.env.CG_ALLOWED_ORIGIN || "https://cheatguysinfinity.netlify.app").trim();
const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN || "https://cheatguysinfinity.netlify.app",
  "Access-Control-Allow-Headers": "Content-Type",
  "Vary": "Origin"
};

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_PRIMARY || "").trim();
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const GROQ_API_KEY = (process.env.GROQ_API_KEY || "").trim();
const ALLOWED_CHARACTERS = new Set(["akane", "rika", "momo", "jun"]);
const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_ITEMS = 8;
const MAX_HISTORY_TEXT_LENGTH = 700;
const PROVIDER_TIMEOUT_MS = 12000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 18;
const rateLimitBuckets = new Map();

const CHARACTER_FALLBACKS = {
  akane: "S-soy Akane Hoshizora... vocalista y guitarra de CheatGuys!. Mi HUD social esta temblando, pero sigo aqui.",
  rika: "Soy Rika Tanaka, guitarra principal de CheatGuys!. Si Akane se asusta, yo muerdo primero.",
  momo: "Soy Momo Fujiwara, bajista de CheatGuys! y amiga oficial de abrazos de emergencia. Sina saluda tambien.",
  jun: "soy junpei sakamoto... baterista de cheatguys. jun esta bien, escribir todo mi nombre da flojera zzz."
};

const CHARACTER_IDENTITY_REPLIES = {
  akane: "M-me llamo Akane Hoshizora... soy la vocalista y guitarra ritmica de CheatGuys!. Perdon, mi HUD social tarda en cargar.",
  rika: "Soy Rika Tanaka, guitarra principal de CheatGuys!. Tambien conocida como la Naranja Mecanica, por si quieres sonar dramatico.",
  momo: "Soy Momo Fujiwara, bajista de CheatGuys! y cuidadora oficial de Sina. Mucho gusto, estrellita.",
  jun: "soy junpei sakamoto... baterista de cheatguys. me dicen jun porque escribir todo da hueva zzz."
};

function normalizeText(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isIdentityQuestion(text) {
  const normalized = normalizeText(text);
  return /\b(como te llamas|quien eres|quien sos|tu nombre|presentate|dime quien eres)\b/.test(normalized);
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
}

function getClientIp(event) {
  return event.headers["client-ip"]
    || event.headers["x-nf-client-connection-ip"]
    || event.headers["x-forwarded-for"]?.split(",")[0]?.trim()
    || "unknown";
}

function isRateLimited(ip) {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  bucket.count += 1;
  rateLimitBuckets.set(ip, bucket);

  if (rateLimitBuckets.size > 500) {
    for (const [key, value] of rateLimitBuckets.entries()) {
      if (now > value.resetAt) rateLimitBuckets.delete(key);
    }
  }

  return bucket.count > RATE_LIMIT_MAX_REQUESTS;
}

function sanitizeHistory(historial) {
  if (!Array.isArray(historial)) return [];

  return historial
    .filter((item) => item && (item.role === "user" || item.role === "model") && typeof item.text === "string")
    .slice(-MAX_HISTORY_ITEMS)
    .map((item) => ({
      role: item.role,
      text: item.text.trim().slice(0, MAX_HISTORY_TEXT_LENGTH)
    }))
    .filter((item) => item.text);
}

function createProviderSignal() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  return { signal: controller.signal, timeout };
}

async function fetchWithTimeout(url, options = {}) {
  const { signal, timeout } = createProviderSignal();
  try {
    return await fetch(url, { ...options, signal });
  } finally {
    clearTimeout(timeout);
  }
}

function logServerError(code, message, details) {
  console.error("[CG:LAPTOP]", code, message, details || "");
}

function publicChatError(statusCode, code) {
  return jsonResponse(statusCode, {
    code,
    error: "La senal con Neo Teno se saturo. Dale otro intento en unos segundos."
  });
}

function getSystemPrompt(characterPrompt) {
  return `${GENERAL_CONTEXT}\n\n${characterPrompt}`;
}

function getRecentHistory(historial, mensaje) {
  const recentHistory = sanitizeHistory(historial);

  if (recentHistory.length === 0 || recentHistory[recentHistory.length - 1].role !== "user") {
    recentHistory.push({
      role: "user",
      text: mensaje
    });
  }

  return recentHistory;
}

function normalizeProviderError(data, fallbackMessage) {
  return data?.error?.message || data?.error || fallbackMessage;
}

async function callGroq({ systemPrompt, recentHistory }) {
  const groqResponse = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        ...recentHistory.map((item) => ({
          role: item.role === "model" ? "assistant" : "user",
          content: item.text
        }))
      ],
      temperature: 0.45,
      top_p: 0.85,
      max_completion_tokens: 512,
      stream: false
    })
  });

  const data = await groqResponse.json();

  if (!groqResponse.ok) {
    throw new Error(normalizeProviderError(data, "Groq no pudo responder."));
  }

  return data?.choices?.[0]?.message?.content?.trim() || "";
}

async function callGemini({ systemPrompt, recentHistory }) {
  const contents = recentHistory.map((item) => ({
    role: item.role,
    parts: [
      {
        text: item.text
      }
    ]
  }));

  const geminiResponse = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: systemPrompt
          }
        ]
      },
      contents,
      generationConfig: {
        temperature: 0.45,
        topP: 0.85,
        maxOutputTokens: 512,
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    })
  });

  const data = await geminiResponse.json();

  if (!geminiResponse.ok) {
    const message = normalizeProviderError(data, "Gemini no pudo responder.");
    const normalizedMessage = String(message).toLowerCase();

    throw new Error(message);
  }

  return data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim() || "";
}

exports.handler = async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { code: "CG-LAPTOP-405", error: "Metodo no permitido." });
  }

  const clientIp = getClientIp(event);
  if (isRateLimited(clientIp)) {
    logServerError("CG-LAPTOP-429", "Rate limit excedido.", { clientIp });
    return publicChatError(429, "CG-LAPTOP-429");
  }

  let payload;

  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return jsonResponse(400, { code: "CG-LAPTOP-400", error: "Solicitud invalida." });
  }

  const mensaje = String(payload.mensaje || "").trim();
  const personaje = String(payload.personaje || "akane").toLowerCase();
  if (!ALLOWED_CHARACTERS.has(personaje)) {
    logServerError("CG-LAPTOP-001", "Personaje no permitido.", { personaje });
    return jsonResponse(400, { code: "CG-LAPTOP-001", error: "Personaje no disponible." });
  }

  const characterPrompt = CHARACTER_PROMPTS[personaje];
  const fallbackText = CHARACTER_FALLBACKS[personaje];
  const historial = Array.isArray(payload.historial) ? payload.historial : [];

  if (!mensaje) {
    return jsonResponse(400, { code: "CG-LAPTOP-002", error: "El mensaje no puede estar vacio." });
  }

  if (mensaje.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse(413, { code: "CG-LAPTOP-003", error: "Mensaje demasiado largo." });
  }

  if (isIdentityQuestion(mensaje)) {
    return jsonResponse(200, {
      respuesta: CHARACTER_IDENTITY_REPLIES[personaje] || CHARACTER_IDENTITY_REPLIES.akane
    });
  }

  if (!GROQ_API_KEY && !GEMINI_API_KEY) {
    logServerError("CG-LAPTOP-004", "No hay proveedor configurado.");
    return publicChatError(503, "CG-LAPTOP-004");
  }

  const systemPrompt = getSystemPrompt(characterPrompt);
  const recentHistory = getRecentHistory(historial, mensaje);
  const providerErrors = [];

  if (GROQ_API_KEY) {
    try {
      const texto = await callGroq({ systemPrompt, recentHistory });

      return jsonResponse(200, {
        respuesta: texto || fallbackText,
        provider: "groq"
      });
    } catch (error) {
      logServerError("CG-LAPTOP-005", "Groq fallo.", { message: error.message, name: error.name });
      providerErrors.push("groq");
    }
  }

  if (GEMINI_API_KEY) {
    try {
      const texto = await callGemini({ systemPrompt, recentHistory });

      return jsonResponse(200, {
        respuesta: texto || fallbackText,
        provider: "gemini"
      });
    } catch (error) {
      logServerError("CG-LAPTOP-006", "Gemini fallo.", { message: error.message, name: error.name });
      providerErrors.push("gemini");
    }
  }

  if (providerErrors.length > 0) {
    return publicChatError(503, "CG-LAPTOP-007");
  }

  return jsonResponse(200, {
    respuesta: fallbackText,
    provider: "fallback"
  });
};
