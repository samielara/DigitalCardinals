const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const handlerPath = path.join(__dirname, '../netlify/functions/create-checkout.cjs');

test('USD checkout handler is available', () => assert.equal(fs.existsSync(handlerPath), true));

const env = {
  STRIPE_SECRET_KEY: 'sk_test_fixture', CHECKOUT_ENABLED: 'true',
  STRIPE_TAX_MODE: 'reviewed_none', SITE_URL: 'https://digitalcardinals.com',
};
const requestId = '550e8400-e29b-41d4-a716-446655440000';
function event(data = {}, overrides = {}) {
  return { httpMethod: 'POST', headers: { origin: env.SITE_URL, 'content-type': 'application/json' },
    body: JSON.stringify({ product: 'custom', amount: '123.45', requestId, ...data }), ...overrides };
}
async function run(input, config = env, fetchImpl) {
  if (!fs.existsSync(handlerPath)) return assert.fail('Checkout implementation missing');
  return require(handlerPath).createHandler({ env: config, fetchImpl })(input);
}
function stripeBoundary(check) {
  return async (url, options) => {
    check(url, options, new URLSearchParams(options.body));
    return new Response(JSON.stringify({ id: 'cs_test_fixture', url: 'https://checkout.stripe.com/c/pay/cs_test_fixture' }), { status: 200 });
  };
}

test('custom dollars become exact cents, with USD forced and local currencies disabled', async () => {
  const result = await run(event({ currency: 'cad', unitAmount: 1 }), env, stripeBoundary((url, options, form) => {
    assert.equal(url, 'https://api.stripe.com/v1/checkout/sessions');
    assert.equal(form.get('line_items[0][price_data][currency]'), 'usd');
    assert.equal(form.get('line_items[0][price_data][unit_amount]'), '12345');
    assert.equal(form.get('adaptive_pricing[enabled]'), 'false');
    assert.equal(form.get('mode'), 'payment');
    assert.equal(form.get('allowed_payment_method_types[0]'), 'card');
    assert.equal(form.has('payment_method_types[0]'), false);
    assert.equal(form.get('billing_address_collection'), 'required');
    assert.equal(form.get('success_url'), 'https://digitalcardinals.com/checkout.html?status=returned');
    assert.ok(options.headers['Idempotency-Key']);
  }));
  assert.equal(result.statusCode, 200);
  assert.deepEqual(JSON.parse(result.body), { url: 'https://checkout.stripe.com/c/pay/cs_test_fixture' });
});

test('fixed package prices cannot be overridden by the browser', async () => {
  for (const [product, cents] of [['starter', '199900'], ['growth', '399900']]) {
    const result = await run(event({ product, amount: '1' }), env, stripeBoundary((url, options, form) => {
      assert.equal(form.get('line_items[0][price_data][unit_amount]'), cents);
    }));
    assert.equal(result.statusCode, 200);
  }
});

test('invalid, missing, oversized and imprecise custom amounts never reach Stripe', async () => {
  for (const amount of ['', '0', '0.99', '-1', '10000.01', '1.001', '1e3', '1,000', 'NaN', 10, null, ' 1 ', '01.00']) {
    const result = await run(event({ amount }), env, () => assert.fail('Invalid amount reached Stripe'));
    assert.equal(result.statusCode, 400, String(amount));
  }
  for (const amount of ['1', '1.01', '10000.00']) {
    const result = await run(event({ amount }), env, stripeBoundary(() => {}));
    assert.equal(result.statusCode, 200, amount);
  }
});

test('unknown products, invalid request IDs, malformed JSON and foreign origins are rejected', async () => {
  for (const input of [event({ product: '__proto__' }), event({ requestId: '' }),
    event({}, { body: '{' }), event({}, { body: 'null' }),
    event({}, { body: 'x'.repeat(5000) }), event({}, { isBase64Encoded: true }),
    event({}, { headers: { origin: 'https://evil.test', 'content-type': 'application/json' } })]) {
    const result = await run(input, env, () => assert.fail('Invalid request reached Stripe'));
    assert.ok([400, 403, 413].includes(result.statusCode));
  }
  assert.equal((await run(event({}, { httpMethod: 'GET' }))).statusCode, 405);
  assert.equal((await run(event({}, { headers: { origin: env.SITE_URL, 'content-type': 'text/plain' } }))).statusCode, 415);
});

test('missing key, activation or explicit tax review blocks checkout', async () => {
  for (const patch of [{ STRIPE_SECRET_KEY: '' }, { CHECKOUT_ENABLED: '' }, { STRIPE_TAX_MODE: '' }, { STRIPE_TAX_MODE: 'guess' }]) {
    assert.equal((await run(event(), { ...env, ...patch }, () => assert.fail('Misconfigured checkout reached Stripe'))).statusCode, 503);
  }
});

test('configured tax calculation is included; repeat requests use stable idempotency', async () => {
  const keys = [];
  for (let i = 0; i < 2; i++) {
    await run(event(), { ...env, STRIPE_TAX_MODE: 'automatic' }, stripeBoundary((url, options, form) => {
      assert.equal(form.get('automatic_tax[enabled]'), 'true');
      assert.equal(form.get('line_items[0][price_data][tax_behavior]'), 'exclusive');
      keys.push(options.headers['Idempotency-Key']);
    }));
  }
  assert.equal(keys[0], keys[1]);
});

test('upstream errors and unsafe redirect URLs never leak keys or Stripe internals', async () => {
  for (const fetchImpl of [
    async () => { throw new Error(env.STRIPE_SECRET_KEY); },
    async () => new Response(JSON.stringify({ error: { message: env.STRIPE_SECRET_KEY } }), { status: 400 }),
    async () => new Response(JSON.stringify({ url: 'https://evil.test' }), { status: 200 }),
  ]) {
    const result = await run(event(), env, fetchImpl);
    assert.equal(result.statusCode, 502);
    assert.ok(!result.body.includes(env.STRIPE_SECRET_KEY));
    assert.equal(result.headers['Cache-Control'], 'no-store');
  }
});
