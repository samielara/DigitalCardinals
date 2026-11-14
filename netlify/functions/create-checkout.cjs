const { createHash } = require('node:crypto');

const products = new Map([
  ['starter', { name: 'Starter Kit', cents: 199900 }],
  ['growth', { name: 'Growth Kit', cents: 399900 }],
  ['custom', { name: 'Custom service payment' }],
]);

function response(statusCode, body, extraHeaders = {}) {
  return { statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extraHeaders }, body: JSON.stringify(body) };
}

function customCents(amount) {
  if (typeof amount !== 'string' || !/^(?:0|[1-9]\d{0,4})(?:\.\d{1,2})?$/.test(amount)) return null;
  const [dollars, fraction = ''] = amount.split('.');
  const cents = Number(dollars) * 100 + Number(fraction.padEnd(2, '0'));
  return cents >= 100 && cents <= 1000000 ? cents : null;
}

function allowedOrigins(env) {
  const urls = [env.SITE_URL || 'https://digitalcardinals.com'];
  if (env.DEPLOY_PRIME_URL) urls.push(env.DEPLOY_PRIME_URL);
  const origins = new Set();
  for (const value of urls) {
    try {
      const url = new URL(value);
      if (url.protocol === 'https:' && !url.username && !url.password) origins.add(url.origin);
    } catch { /* Invalid deployment configuration never authorizes a request. */ }
  }
  if (origins.has('https://digitalcardinals.com')) origins.add('https://www.digitalcardinals.com');
  return origins;
}

function createHandler({ env = process.env, fetchImpl = globalThis.fetch } = {}) {
  return async function handler(event) {
    if (event.httpMethod !== 'POST') return response(405, { error: 'Use POST.' }, { Allow: 'POST' });
    const headers = Object.fromEntries(Object.entries(event.headers || {}).map(([key, value]) => [key.toLowerCase(), value]));
    if (!allowedOrigins(env).has(headers.origin)) return response(403, { error: 'Open checkout from the Digital Cardinal website.' });
    if ((headers['content-type'] || '').split(';')[0].trim().toLowerCase() !== 'application/json') return response(415, { error: 'Send JSON.' });
    if (event.isBase64Encoded || typeof event.body !== 'string') return response(400, { error: 'Invalid checkout request.' });
    if (Buffer.byteLength(event.body, 'utf8') > 4096) return response(413, { error: 'Checkout request is too large.' });

    let input;
    try { input = JSON.parse(event.body); } catch { return response(400, { error: 'Invalid checkout request.' }); }
    if (!input || typeof input !== 'object' || Array.isArray(input)) return response(400, { error: 'Invalid checkout request.' });
    const product = products.get(input.product);
    if (!product) return response(400, { error: 'Choose a valid service.' });
    const cents = input.product === 'custom' ? customCents(input.amount) : product.cents;
    if (cents === null) return response(400, { error: 'Enter a USD amount from $1.00 to $10,000.00, with at most two decimal places.' });
    if (typeof input.requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.requestId)) {
      return response(400, { error: 'Refresh the page and try again.' });
    }
    if (env.CHECKOUT_ENABLED !== 'true' || !/^sk_(test|live)_\S+$/.test(env.STRIPE_SECRET_KEY || '') || !['automatic', 'reviewed_none'].includes(env.STRIPE_TAX_MODE)) {
      return response(503, { error: 'Online payment is not available yet. Contact us to arrange payment.' });
    }

    const form = new URLSearchParams({
      mode: 'payment',
      'allowed_payment_method_types[0]': 'card',
      'adaptive_pricing[enabled]': 'false',
      billing_address_collection: 'required',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': product.name,
      'line_items[0][price_data][unit_amount]': String(cents),
      'line_items[0][price_data][tax_behavior]': 'exclusive',
      'line_items[0][quantity]': '1',
      'automatic_tax[enabled]': String(env.STRIPE_TAX_MODE === 'automatic'),
      'metadata[source]': 'digitalcardinals-website',
      'metadata[product]': input.product,
      'payment_intent_data[metadata][source]': 'digitalcardinals-website',
      'payment_intent_data[metadata][product]': input.product,
      success_url: `${headers.origin}/checkout.html?status=returned`,
      cancel_url: `${headers.origin}/checkout.html?product=${input.product}&status=canceled`,
    });
    // An invoice reference is a reconciliation aid, never proof of an agreed price.
    if (input.reference !== undefined && (typeof input.reference !== 'string' || input.reference.length > 80 || /[\x00-\x1f\x7f]/.test(input.reference))) {
      return response(400, { error: 'Use an invoice reference of at most 80 characters.' });
    }
    if (input.reference) {
      form.set('metadata[invoice_reference]', input.reference);
      form.set('payment_intent_data[metadata][invoice_reference]', input.reference);
    }
    const fingerprint = createHash('sha256').update(form.toString()).digest('hex');
    try {
      const upstream = await fetchImpl('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Stripe-Version': '2026-10-28.endive',
          'Idempotency-Key': `dc-${input.requestId}-${fingerprint}`,
        },
        body: form.toString(), signal: AbortSignal.timeout(12000),
      });
      if (!upstream.ok) return response(502, { error: 'Stripe checkout is temporarily unavailable. Please try again.' });
      const session = await upstream.json();
      const url = new URL(session.url);
      if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com' || url.username || url.password) throw new Error('Invalid checkout URL');
      return response(200, { url: session.url });
    } catch {
      // Never expose Stripe error payloads, keys, or customer data to the browser.
      return response(502, { error: 'Could not open Stripe checkout. Please try again.' });
    }
  };
}

exports.createHandler = createHandler;
exports.handler = createHandler();
