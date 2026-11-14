const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { randomUUID } = require('node:crypto');
const vm = require('node:vm');
// This DOM fixture exercises the real page controller; it is not a layout/browser test.
function pageFixture(saved) {
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      value: id === 'product' ? 'custom' : '', hidden: false, disabled: false,
      listeners: new Map(), textContent: '', validity: '',
      addEventListener(name, listener) { this.listeners.set(name, listener); },
      setCustomValidity(message) { this.validity = message; },
      reportValidity() { return !element('amount').validity; },
      async emit(name, event = {}) { return this.listeners.get(name)?.({ preventDefault() {}, ...event }); },
    });
    return elements.get(id);
  }
  const storage = new Map(saved ? [['dc-checkout-draft-v1', JSON.stringify(saved)]] : []);
  const listeners = new Map();
  let release;
  const calls = [];
  const context = { document: { getElementById: element }, URLSearchParams, URL, Intl, crypto: { randomUUID },
    sessionStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    AbortSignal, console,
    window: { location: { search: '?product=custom', assign: url => calls.push({ redirect: url }) }, addEventListener: (name, listener) => listeners.set(name, listener) },
    fetch: async (url, options) => { calls.push(JSON.parse(options.body)); return new Promise(resolve => { release = resolve; }); },
  };
  vm.runInNewContext(readFileSync(require.resolve('../assets/js/checkout.js'), 'utf8'), context);
  return { element, calls, storage, listeners, resolve: result => release(result) };
}

test('cancel/reload restores the invoice reference as well as the custom amount', () => {
  const page = pageFixture({ amount: '123.45', reference: 'INV-2026-1107', requestId: randomUUID() });
  assert.equal(page.element('amount').value, '123.45');
  assert.equal(page.element('reference').value, 'INV-2026-1107');
});

test('draft saves the invoice reference for reconciliation after cancel', async () => {
  const page = pageFixture();
  page.element('amount').value = '123.45';
  page.element('reference').value = 'INV-2026-1107';
  await page.element('reference').emit('input');
  assert.equal(JSON.parse(page.storage.get('dc-checkout-draft-v1')).reference, 'INV-2026-1107');
});

test('one in-flight submit; persisted browser Back restores an actionable checkout', async () => {
  const page = pageFixture();
  page.element('amount').value = '123.45';
  await page.element('amount').emit('input');
  const pending = page.element('checkout-form').emit('submit');
  await page.element('checkout-form').emit('submit');
  assert.equal(page.calls.length, 1);
  assert.equal(page.element('pay-button').disabled, true);
  page.resolve({ ok: true, json: async () => ({ url: 'https://checkout.stripe.com/c/pay/cs_test_fixture' }) });
  await pending;
  assert.equal(page.calls[1].redirect, 'https://checkout.stripe.com/c/pay/cs_test_fixture');
  assert.ok(page.listeners.has('pageshow'));
  page.listeners.get('pageshow')({ persisted: true });
  assert.equal(page.element('pay-button').disabled, false);
  assert.equal(page.element('product').disabled, false);
  assert.equal(page.element('reference').disabled, false);
  assert.equal(page.element('amount').disabled, false);
});
