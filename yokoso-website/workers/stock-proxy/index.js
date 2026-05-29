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
  const keys = Object.keys(fields);
  const maskParams = keys.map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  const url = `${FIRESTORE_BASE}/${path}?key=${API_KEY}&${maskParams}`;
  const mappedFields = {};
  for (const [k, v] of Object.entries(fields)) {
    if (k === 'passwordHash') {
      mappedFields[k] = { stringValue: String(v) };
    } else {
      mappedFields[k] = { integerValue: String(v) };
    }
  }
  const resp = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: mappedFields })
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
// fieldPath defaults to 'default' (for products without sizes)
async function firestoreTransform(docId, amount, fieldPath) {
  fieldPath = fieldPath || 'q';
  const docName = `projects/japan-goodies/databases/(default)/documents/stocks/${docId}`;
  const resp = await fetch(`${FIRESTORE_BASE}:commit?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      writes: [{
        transform: {
          document: docName,
          fieldTransforms: [{
            fieldPath: fieldPath,
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
  if (!doc || !doc.fields) return null;
  const match = doc.name.match(/\/stocks\/([^/]+)$/);
  const id = match ? match[1] : null;
  const fields = {};
  let total = 0;
  // Process new-style fields first, then old 'quantity' only if 'q' not present
  let quantityVal = null;
  for (const [key, val] of Object.entries(doc.fields)) {
    const qty = parseInt(val.integerValue || val.stringValue, 10);
    if (!isNaN(qty)) {
      if (key === 'quantity') {
        quantityVal = qty;
      } else {
        fields[key] = qty;
        total += qty;
      }
    }
  }
  // Use old 'quantity' as 'q' only if 'q' was not already set
  if (quantityVal !== null && fields.q === undefined) {
    fields.q = quantityVal;
    total += quantityVal;
  }
  return { id, fields, total };
}

function orderField(size) {
  if (!size || size === 'default' || size === 'quantity') return 'q';
  return 's' + size.replace(/[^a-zA-Z0-9]/g, '');
}

async function restoreItemStock(productId, size, qty) {
  const field = orderField(size);
  const docName = `projects/japan-goodies/databases/(default)/documents/stocks/${productId}`;
  const resp = await fetch(`${FIRESTORE_BASE}:commit?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      writes: [{
        transform: {
          document: docName,
          fieldTransforms: [{
            fieldPath: field,
            increment: { integerValue: String(qty) }
          }]
        }
      }]
    })
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Restore stock ${productId}/${field}: HTTP ${resp.status} ${text}`);
  }
}

function parseOrderDoc(doc) {
  if (!doc || !doc.fields) return null;
  const match = doc.name.match(/\/orders\/([^/]+)$/);
  const id = match ? match[1] : null;
  const fields = {};
  for (const [key, val] of Object.entries(doc.fields)) {
    fields[key] = val.stringValue || val.integerValue || '';
  }
  return { id, ...fields };
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'y0k0s0_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function parseAccountDoc(doc) {
  if (!doc || !doc.fields) return null;
  const match = doc.name.match(/\/([^/]+)$/);
  const contact = match ? match[1] : null;
  const fields = {};
  for (const [key, val] of Object.entries(doc.fields)) {
    fields[key] = val.stringValue || val.integerValue || '';
  }
  return fields.contact ? { name: fields.name || '', address: fields.address || '', contact: fields.contact, email: fields.email || '' } : null;
}

async function sendEmail(env, to, subject, text, fromAddr) {
  fromAddr = fromAddr || to;
  if (env && env.EMAIL) {
    const msg = new SendEmailMessage({ to, from: fromAddr, subject, text });
    await msg.send();
    return 'email_binding';
  }
  if (env && env.RESEND_API_KEY) {
    const resendFrom = env.RESEND_FROM || 'onboarding@resend.dev';
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: resendFrom, to: [to], subject, text })
    });
    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      throw new Error('Resend: HTTP ' + resp.status + ' ' + errText);
    }
    return 'resend';
  }
  if (env && env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN) {
    const resp = await fetch(`https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + btoa('api:' + env.MAILGUN_API_KEY), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ from: fromAddr, to, subject, text })
    });
    if (!resp.ok) throw new Error('Mailgun: HTTP ' + resp.status);
    return 'mailgun';
  }
  throw new Error('No email method configured. Set RESEND_API_KEY, EMAIL binding, or MAILGUN_API_KEY+MAILGUN_DOMAIN.');
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
}

async function handleRequest(request, env) {
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
      const data = await firestoreGet('stocks').catch(() => null);
      const docs = (data && data.documents) ? data.documents.map(parseStockDoc).filter(Boolean) : [];
      return new Response(JSON.stringify(docs), { headers: corsHeaders(origin) });
    }

    // GET /stocks/:id
    if (request.method === 'GET' && parts.length === 2 && parts[0] === 'stocks') {
      const data = await firestoreGet(`stocks/${parts[1]}`);
      const parsed = parseStockDoc(data);
      if (!parsed) return new Response(JSON.stringify({ id: parts[1], fields: {}, total: 0 }), { headers: corsHeaders(origin) });
      return new Response(JSON.stringify(parsed), { headers: corsHeaders(origin) });
    }

    // ---- ACCOUNTS ----

    // POST /accounts/create
    if (request.method === 'POST' && parts.length === 2 && parts[0] === 'accounts' && parts[1] === 'create') {
      const body = await request.json();
      if (!body.contact || !body.password || !body.name || !body.address) {
        return new Response(JSON.stringify({ error: 'name, address, contact, and password required' }), { status: 400, headers: corsHeaders(origin) });
      }
      // Check if account already exists
      const existing = await firestoreGet(`accounts/${encodeURIComponent(body.contact)}`).catch(() => null);
      if (existing && existing.fields && existing.fields.contact) {
        return new Response(JSON.stringify({ error: 'Account with this contact number already exists' }), { status: 409, headers: corsHeaders(origin) });
      }
      const passwordHash = await hashPassword(body.password);
      const url = `${FIRESTORE_BASE}/accounts?key=${API_KEY}&documentId=${encodeURIComponent(body.contact)}`;
      const fields = {
        name: { stringValue: body.name },
        address: { stringValue: body.address },
        contact: { stringValue: body.contact },
        passwordHash: { stringValue: passwordHash }
      };
      if (body.email) fields.email = { stringValue: body.email };
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`Firestore create account: HTTP ${resp.status} ${text}`);
      }
      return new Response(JSON.stringify({ ok: true, name: body.name, address: body.address, contact: body.contact, email: body.email || '' }), { headers: corsHeaders(origin) });
    }

    // POST /accounts/login
    if (request.method === 'POST' && parts.length === 2 && parts[0] === 'accounts' && parts[1] === 'login') {
      const body = await request.json();
      if (!body.contact || !body.password) {
        return new Response(JSON.stringify({ error: 'contact and password required' }), { status: 400, headers: corsHeaders(origin) });
      }
      const data = await firestoreGet(`accounts/${encodeURIComponent(body.contact)}`).catch(() => null);
      if (!data || !data.fields) {
        return new Response(JSON.stringify({ error: 'Account not found' }), { status: 404, headers: corsHeaders(origin) });
      }
      const storedHash = data.fields.passwordHash ? data.fields.passwordHash.stringValue || data.fields.passwordHash.integerValue || '' : '';
      const inputHash = await hashPassword(body.password);
      if (storedHash !== inputHash) {
        return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401, headers: corsHeaders(origin) });
      }
      const acct = parseAccountDoc(data);
      return new Response(JSON.stringify({ ok: true, ...acct }), { headers: corsHeaders(origin) });
    }

    // GET /accounts (list all)
    if (request.method === 'GET' && parts.length === 1 && parts[0] === 'accounts') {
      const data = await firestoreGet('accounts').catch(() => null);
      const docs = (data && data.documents) ? data.documents.map(parseAccountDoc).filter(Boolean) : [];
      return new Response(JSON.stringify(docs), { headers: corsHeaders(origin) });
    }

    // GET /accounts/:contact
    if (request.method === 'GET' && parts.length === 2 && parts[0] === 'accounts') {
      const data = await firestoreGet(`accounts/${encodeURIComponent(parts[1])}`).catch(() => null);
      if (!data || !data.fields) {
        return new Response(JSON.stringify({ error: 'Account not found' }), { status: 404, headers: corsHeaders(origin) });
      }
      const acct = parseAccountDoc(data);
      return new Response(JSON.stringify(acct || { error: 'Account not found' }), { headers: corsHeaders(origin) });
    }

    // POST /accounts/:contact/reset-password
    if (request.method === 'POST' && parts.length === 3 && parts[0] === 'accounts' && parts[2] === 'reset-password') {
      const body = await request.json();
      if (!body.password) {
        return new Response(JSON.stringify({ error: 'password required' }), { status: 400, headers: corsHeaders(origin) });
      }
      const passwordHash = await hashPassword(body.password);
      const r = await firestorePatch(`accounts/${encodeURIComponent(parts[1])}`, { passwordHash });
      if (r === null) {
        return new Response(JSON.stringify({ error: 'Account not found' }), { status: 404, headers: corsHeaders(origin) });
      }
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders(origin) });
    }

    // ---- ORDERS ----

    // POST /orders/create — save a pending order with timestamp
    if (request.method === 'POST' && parts.length === 2 && parts[0] === 'orders' && parts[1] === 'create') {
      const body = await request.json();
      if (!body.poNumber || !body.items) {
        return new Response(JSON.stringify({ error: 'poNumber and items required' }), { status: 400, headers: corsHeaders(origin) });
      }
      const docId = encodeURIComponent(body.poNumber);
      const now = new Date().toISOString();
      const fields = {
        poNumber: { stringValue: body.poNumber },
        status: { stringValue: 'pending' },
        createdAt: { stringValue: now },
        items: { stringValue: JSON.stringify(body.items) },
        customerName: { stringValue: body.customerName || '' },
        customerEmail: { stringValue: body.customerEmail || '' },
        customerContact: { stringValue: body.customerContact || '' },
        total: { stringValue: body.total || '' },
        deposit: { stringValue: body.deposit || '' }
      };
      const resp = await fetch(`${FIRESTORE_BASE}/orders?key=${API_KEY}&documentId=${docId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`Firestore create order: HTTP ${resp.status} ${text}`);
      }
      return new Response(JSON.stringify({ ok: true, poNumber: body.poNumber }), { headers: corsHeaders(origin) });
    }

    // POST /orders/release-expired — find orders older than 24h, restore stock, mark cancelled
    if (request.method === 'POST' && parts.length === 2 && parts[0] === 'orders' && parts[1] === 'release-expired') {
      const released = await releaseExpiredOrders(env);
      return new Response(JSON.stringify({ ok: true, released }), { headers: corsHeaders(origin) });
    }

    // POST /orders/:poNumber/confirm — mark order as confirmed (keep stock)
    if (request.method === 'POST' && parts.length === 3 && parts[0] === 'orders' && parts[2] === 'confirm') {
      const docId = encodeURIComponent(parts[1]);
      const resp = await fetch(`${FIRESTORE_BASE}/orders/${docId}?key=${API_KEY}&updateMask.fieldPaths=status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { status: { stringValue: 'confirmed' } } })
      });
      if (!resp.ok) throw new Error(`Confirm order: HTTP ${resp.status}`);
      return new Response(JSON.stringify({ ok: true, poNumber: parts[1], status: 'confirmed' }), { headers: corsHeaders(origin) });
    }

    // POST /orders/:poNumber/deposit-paid — mark deposit as paid
    if (request.method === 'POST' && parts.length === 3 && parts[0] === 'orders' && parts[2] === 'deposit-paid') {
      const docId = encodeURIComponent(parts[1]);
      const resp = await fetch(`${FIRESTORE_BASE}/orders/${docId}?key=${API_KEY}&updateMask.fieldPaths=status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { status: { stringValue: 'deposit_paid' } } })
      });
      if (!resp.ok) throw new Error(`Deposit paid order: HTTP ${resp.status}`);
      return new Response(JSON.stringify({ ok: true, poNumber: parts[1], status: 'deposit_paid' }), { headers: corsHeaders(origin) });
    }

    // POST /orders/:poNumber/cancel — cancel order and restore stock
    if (request.method === 'POST' && parts.length === 3 && parts[0] === 'orders' && parts[2] === 'cancel') {
      const data = await firestoreGet(`orders/${encodeURIComponent(parts[1])}`).catch(() => null);
      const order = parseOrderDoc(data);
      if (!order) return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: corsHeaders(origin) });
      let items = [];
      try { items = JSON.parse(order.items || '[]'); } catch(e) {}
      for (const item of items) {
        try { await restoreItemStock(item.productId || item.id, item.size || '', parseInt(item.qty, 10) || 1); } catch(e) {}
      }
      const docId = encodeURIComponent(parts[1]);
      await fetch(`${FIRESTORE_BASE}/orders/${docId}?key=${API_KEY}&updateMask.fieldPaths=status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { status: { stringValue: 'cancelled' } } })
      });
      return new Response(JSON.stringify({ ok: true, poNumber: parts[1], status: 'cancelled' }), { headers: corsHeaders(origin) });
    }

    // GET /orders — list all orders
    if (request.method === 'GET' && parts.length === 1 && parts[0] === 'orders') {
      const data = await firestoreGet('orders').catch(() => null);
      const docs = (data && data.documents) ? data.documents.map(parseOrderDoc).filter(Boolean) : [];
      docs.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      return new Response(JSON.stringify({ count: docs.length, docs: docs }), { headers: corsHeaders(origin) });
    }

    // GET /orders/:poNumber — get single order by PO number
    if (request.method === 'GET' && parts.length === 2 && parts[0] === 'orders') {
      const data = await firestoreGet(`orders/${encodeURIComponent(parts[1])}`).catch(() => null);
      if (!data || !data.fields) return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: corsHeaders(origin) });
      const order = parseOrderDoc(data);
      return new Response(JSON.stringify(order), { headers: corsHeaders(origin) });
    }

    // GET /cart/test-email — send a test email to verify email config
    if (request.method === 'GET' && parts.length === 2 && parts[0] === 'cart' && parts[1] === 'test-email') {
      const to = url.searchParams.get('to');
      if (!to) {
        return new Response(JSON.stringify({ error: 'Query param "to" is required' }), { status: 400, headers: corsHeaders(origin) });
      }
      try {
        const method = await sendEmail(env, to, 'Test Email from Yokoso Osaka', 'This is a test email to verify your email configuration is working correctly.\n\nIf you received this, SendGrid/Mailgun is properly configured!', to);
        return new Response(JSON.stringify({ ok: true, method: method, message: 'Test email sent to ' + to + ' via ' + method }), { headers: corsHeaders(origin) });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500, headers: corsHeaders(origin) });
      }
    }

    // POST /cart/send-order
    if (request.method === 'POST' && parts.length === 2 && parts[0] === 'cart' && parts[1] === 'send-order') {
      const body = await request.json();
      if (!body.adminEmail || !body.subject || !body.text) {
        return new Response(JSON.stringify({ error: 'adminEmail, subject, and text required' }), { status: 400, headers: corsHeaders(origin) });
      }
      const results = [];
      const sendPromises = [];
      // Send to admin
      sendPromises.push(
        sendEmail(env, body.adminEmail, body.subject, body.text, body.adminEmail)
          .then(function(m) { results.push({ to: 'admin', method: m }); })
          .catch(function(e) { results.push({ to: 'admin', error: e.message }); })
      );
      await Promise.allSettled(sendPromises);
      return new Response(JSON.stringify({ results }), { headers: corsHeaders(origin) });
    }

    // PUT /stocks/:id  — set fields (idempotent)
    if (request.method === 'PUT' && parts.length === 2 && parts[0] === 'stocks') {
      const body = await request.json();
      const fields = {};
      let hasValid = false;
      for (const [k, v] of Object.entries(body)) {
        const qty = parseInt(v, 10);
        if (!isNaN(qty)) { fields[k] = qty; hasValid = true; }
      }
      if (!hasValid) return new Response(JSON.stringify({ error: 'no valid fields' }), { status: 400, headers: corsHeaders(origin) });
      const r = await firestorePatch(`stocks/${parts[1]}`, fields);
      if (r === null) {
        const created = await firestoreCreate(parts[1], fields);
        return new Response(JSON.stringify({ ok: created }), { headers: corsHeaders(origin) });
      }
      return new Response(JSON.stringify({ ok: r }), { headers: corsHeaders(origin) });
    }

    // POST /stocks/:id/increment  — atomic increment by amount on a field
    if (request.method === 'POST' && parts.length === 3 && parts[0] === 'stocks' && parts[2] === 'increment') {
      const body = await request.json().catch(() => ({}));
      const amount = parseInt(body.amount, 10) || 1;
      const field = body.field || 'default';
      const r = await firestoreTransform(parts[1], amount, field);
      if (r === true) {
        const data = await firestoreGet(`stocks/${parts[1]}`).catch(() => null);
        const parsed = parseStockDoc(data);
        return new Response(JSON.stringify(parsed || { id: parts[1], fields: { [field]: amount }, total: amount }), { headers: corsHeaders(origin) });
      }
      if (typeof r === 'object' && r.error) {
        const fields = {};
        fields[field] = amount;
        const patched = await firestorePatch(`stocks/${parts[1]}`, fields);
        if (patched === null) {
          await firestoreCreate(parts[1], fields);
        }
        return new Response(JSON.stringify({ id: parts[1], fields, total: amount }), { headers: corsHeaders(origin) });
      }
      throw new Error(`Increment failed: ${JSON.stringify(r)}`);
    }

    // POST /stocks/:id/decrement  — atomic decrement by amount on a field
    if (request.method === 'POST' && parts.length === 3 && parts[0] === 'stocks' && parts[2] === 'decrement') {
      const body = await request.json().catch(() => ({}));
      const amount = parseInt(body.amount, 10) || 1;
      const field = body.field || 'default';
      const r = await firestoreTransform(parts[1], -amount, field);
      if (r === true) {
        const data = await firestoreGet(`stocks/${parts[1]}`).catch(() => null);
        const parsed = parseStockDoc(data);
        const fallbackFields = {};
        fallbackFields[field] = 5 - amount;
        return new Response(JSON.stringify(parsed || { id: parts[1], fields: fallbackFields, total: 5 - amount }), { headers: corsHeaders(origin) });
      }
      if (typeof r === 'object' && r.error) {
        const fields = {};
        fields[field] = Math.max(0, 5 - amount);
        const patched = await firestorePatch(`stocks/${parts[1]}`, fields);
        if (patched === null) {
          await firestoreCreate(parts[1], fields);
        }
        return new Response(JSON.stringify({ id: parts[1], fields, total: fields[field] }), { headers: corsHeaders(origin) });
      }
      throw new Error(`Decrement failed: ${JSON.stringify(r)}`);
    }

    return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: corsHeaders(origin) });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders(origin) });
  }
}

async function releaseExpiredOrders(env) {
  const data = await firestoreGet('orders').catch(() => null);
  const docs = (data && data.documents) ? data.documents : [];
  const released = [];
  const now = Date.now();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  for (const doc of docs) {
    const order = parseOrderDoc(doc);
    if (!order || order.status !== 'pending') continue;
    const created = new Date(order.createdAt).getTime();
    if (isNaN(created) || (now - created) < TWENTY_FOUR_HOURS) continue;
    let items = [];
    try { items = JSON.parse(order.items || '[]'); } catch(e) {}
    for (const item of items) {
      try {
        await restoreItemStock(item.productId || item.id, item.size || '', parseInt(item.qty, 10) || 1);
      } catch(e) {}
    }
    const docId = encodeURIComponent(order.id);
    await fetch(`${FIRESTORE_BASE}/orders/${docId}?key=${API_KEY}&updateMask.fieldPaths=status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { status: { stringValue: 'cancelled' } } })
    }).catch(() => {});
    released.push(order.id);
  }
  return released;
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
  async scheduled(event, env, ctx) {
    await releaseExpiredOrders(env);
  }
};
