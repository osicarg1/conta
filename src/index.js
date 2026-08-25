const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS
  });
}

function extractIdFromApiPath(pathname) {
  const match = pathname.match(/^\/api\/data\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function handleApi(request, env, pathname) {
  const id = extractIdFromApiPath(pathname);
  if (!id) {
    return jsonResponse({ error: "Missing id" }, 400);
  }

  if (request.method === "GET") {
    const raw = await env.CASS_DATA.get(id);
    if (!raw) {
      return jsonResponse({ error: "Not found" }, 404);
    }

    try {
      return jsonResponse(JSON.parse(raw));
    } catch {
      return jsonResponse({ error: "Stored data is invalid" }, 500);
    }
  }

  if (request.method === "PUT") {
    let payload;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }

    if (!payload || !Array.isArray(payload.rentalData) || !Array.isArray(payload.interestData)) {
      return jsonResponse({ error: "Invalid payload shape" }, 400);
    }

    if (!Array.isArray(payload.depositData)) {
      payload.depositData = [];
    }

    if (!Array.isArray(payload.otherData)) {
      payload.otherData = [];
    }

    await env.CASS_DATA.put(id, JSON.stringify(payload));
    return jsonResponse({ ok: true, id });
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/data/")) {
      return handleApi(request, env, url.pathname);
    }

    return env.ASSETS.fetch(request);
  }
};
