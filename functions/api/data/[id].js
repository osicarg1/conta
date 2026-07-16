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

export async function onRequestGet(context) {
  const { params, env } = context;
  const id = params.id;

  if (!id) {
    return jsonResponse({ error: "Missing id" }, 400);
  }

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

export async function onRequestPut(context) {
  const { params, request, env } = context;
  const id = params.id;

  if (!id) {
    return jsonResponse({ error: "Missing id" }, 400);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  if (!payload || !Array.isArray(payload.rentalData) || !Array.isArray(payload.interestData)) {
    return jsonResponse({ error: "Invalid payload shape" }, 400);
  }

  await env.CASS_DATA.put(id, JSON.stringify(payload));
  return jsonResponse({ ok: true, id });
}
