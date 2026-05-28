// Cloudflare Worker — Firestore stock proxy
// Paste this entire file into Cloudflare Dashboard > Workers & Pages > Create Worker > Save and Deploy

const FIRESTORE_BASE = 'https://firestore.googleapis.com/v1/projects/japan-goodies/databases/(default)/documents';
const API_KEY = 'AIzaSyCR8jcz2JeDr3VYztZm2KYdns4uPUajtqQ';

async function firestoreGet(path) {
  const resp = await fetch(`${FIRESTORE_BASE}/${path}?key=${API_KEY}`);
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Firestore GET ${path}: HTTP ${resp.status} ${resp.statusText} ${text}`);
  }
  return resp.json();
}

async function firestorePatch(path, fields) {
  const keys = Object.keys(fields).join(',');
  const url = `${FIRESTORE_BASE}/${path}?key=${API_KEY}&updateMask.fieldPaths=${keys}`;
  const resp = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [k, { integerValue: String(v) }])
      )
    })
  });
  if (resp.ok) return true;
  const text = await resp.text().catch(() => '');
  if (resp.status === 404) return null;
  throw new Error(`Firestore PATCH ${path}: HTTP ${resp.status} ${resp.statusText} ${text}`);
}

async function firestoreCreate(docId, fields) {
  const url = `${FIRESTORE_BASE}/stocks?key=${API_KEY}&documentId=${docId}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [k, { integerValue: String(v) }])
      )
    })
  });
  if (resp.ok) return true;
  const text = await resp.text().catch(() => '');
  throw new Error(`Firestore CREATE ${docId}: HTTP ${resp.status} ${resp.statusText} ${text}`);
}

// Atomic increment/decrement via Firestore transform — no read-modify-write race
async function firestoreTransform(docId, amount) {
  const docName = `projects/japan-goodies/databases/(default)/documents/stocks/${docId}`;
  const resp = await fetch(`${FIRESTORE_BASE}:commit?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      writes: [{
        transform: {
          document: docName,
          fieldTransforms: [{
            fieldPath: 'quantity',
            increment: { integerValue: String(amount) }
          }]
        }
      }]
    })
  });
  if (resp.ok) return true;
  const text = await resp.text().catch(() => '');
  return { error: `HTTP ${resp.status}: ${text}` };
}

function parseStockDoc(doc) {
  if (!doc || !doc.fields || !doc.fields.quantity) return null;
  const match = doc.name.match(/\/stocks\/([^/]+)$/);
  return {
    id: match ? match[1] : null,
    quantity: parseInt(doc.fields.quantity.integerValue || doc.fields.quantity.stringValue, 10)
  };
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/+/, '');
  const parts = path.split('/').filter(Boolean);
  const origin = request.headers.get('Origin') || '*';

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  try {
    // GET /stocks
    if (request.method === 'GET' && parts.length === 1 && parts[0] === 'stocks') {
      const data = await firestoreGet('stocks');
      const docs = (data && data.documents) ? data.documents.map(parseStockDoc).filter(Boolean) : [];
      return new Response(JSON.stringify(docs), { headers: corsHeaders(origin) });
    }

    // GET /stocks/:id
    if (request.method === 'GET' && parts.length === 2 && parts[0] === 'stocks') {
      const data = await firestoreGet(`stocks/${parts[1]}`);
      const parsed = parseStockDoc(data);
      if (!parsed) return new Response(JSON.stringify({ quantity: null }), { headers: corsHeaders(origin) });
      return new Response(JSON.stringify(parsed), { headers: corsHeaders(origin) });
    }

    // PUT /stocks/:id  — set absolute quantity (idempotent, no race)
    if (request.method === 'PUT' && parts.length === 2 && parts[0] === 'stocks') {
      const body = await request.json();
      const qty = parseInt(body.quantity, 10);
      if (isNaN(qty)) return new Response(JSON.stringify({ error: 'invalid quantity' }), { status: 400, headers: corsHeaders(origin) });
      // Always do PATCH then fallback to CREATE if needed
      const r = await firestorePatch(`stocks/${parts[1]}`, { quantity: qty });
      if (r === null || r === false) {
        const created = await firestoreCreate(parts[1], { quantity: qty });
        return new Response(JSON.stringify({ ok: created }), { headers: corsHeaders(origin) });
      }
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders(origin) });
    }

    // POST /stocks/:id/decrement  — atomic decrement by amount
    if (request.method === 'POST' && parts.length === 3 && parts[0] === 'stocks' && parts[2] === 'decrement') {
      const body = await request.json().catch(() => ({}));
      const amount = parseInt(body.amount, 10) || 1;
      const r = await firestoreTransform(parts[1], -amount);
      if (r === true) {
        // Re-fetch to return current quantity
        const data = await firestoreGet(`stocks/${parts[1]}`);
        const parsed = parseStockDoc(data);
        return new Response(JSON.stringify(parsed || { quantity: null }), { headers: corsHeaders(origin) });
      }
      // Doc didn't exist — create it with base quantity first, then retry
      if (typeof r === 'object' && r.error) {
        const initial = Math.max(0, 5 - amount);
        await firestoreCreate(parts[1], { quantity: initial });
        return new Response(JSON.stringify({ quantity: initial }), { headers: corsHeaders(origin) });
      }
      throw new Error(`Transform failed: ${JSON.stringify(r)}`);
    }

    // POST /stocks/:id/increment  — atomic increment by amount
    if (request.method === 'POST' && parts.length === 3 && parts[0] === 'stocks' && parts[2] === 'increment') {
      const body = await request.json().catch(() => ({}));
      const amount = parseInt(body.amount, 10) || 1;
      const r = await firestoreTransform(parts[1], amount);
      if (r === true) {
        const data = await firestoreGet(`stocks/${parts[1]}`);
        const parsed = parseStockDoc(data);
        return new Response(JSON.stringify(parsed || { quantity: null }), { headers: corsHeaders(origin) });
      }
      if (typeof r === 'object' && r.error) {
        await firestoreCreate(parts[1], { quantity: amount });
        return new Response(JSON.stringify({ quantity: amount }), { headers: corsHeaders(origin) });
      }
      throw new Error(`Transform failed: ${JSON.stringify(r)}`);
    }

    return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: corsHeaders(origin) });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders(origin) });
  }
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request);
  }
};
