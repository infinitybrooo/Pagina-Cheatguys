const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";
const MAX_TERM_LENGTH = 160;
const REQUEST_TIMEOUT_MS = 8000;

function jsonResponse(statusCode, body, extraHeaders = {}) {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": statusCode === 200
                ? "public, max-age=1800, stale-while-revalidate=86400"
                : "no-store",
            ...extraHeaders
        },
        body: JSON.stringify(body)
    };
}

function normalizeTerm(value) {
    return String(value || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, MAX_TERM_LENGTH);
}

function createTimeoutSignal() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    return { signal: controller.signal, timeout };
}

exports.handler = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 204,
            headers: {
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Cache-Control": "no-store"
            },
            body: ""
        };
    }

    if (event.httpMethod !== "GET") {
        return jsonResponse(405, { error: "Metodo no permitido" }, { Allow: "GET, OPTIONS" });
    }

    const term = normalizeTerm(event.queryStringParameters?.term);
    if (!term) {
        return jsonResponse(400, { error: "Falta parametro term" });
    }

    const params = new URLSearchParams({
        term,
        limit: "3",
        entity: "musicTrack"
    });

    const { signal, timeout } = createTimeoutSignal();
    try {
        const response = await fetch(`${ITUNES_SEARCH_URL}?${params}`, {
            signal,
            headers: {
                Accept: "application/json",
                "User-Agent": "CheatGuys-GarageMixer/1.0"
            }
        });

        if (!response.ok) {
            return jsonResponse(response.status, { error: `iTunes respondio ${response.status}` });
        }

        const data = await response.json();
        return jsonResponse(200, data);
    } catch (error) {
        const timedOut = error.name === "AbortError";
        return jsonResponse(timedOut ? 504 : 502, {
            error: timedOut ? "iTunes no respondio a tiempo" : "No se pudo consultar iTunes"
        });
    } finally {
        clearTimeout(timeout);
    }
};
