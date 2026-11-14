(() => {
  'use strict';
  const form = document.getElementById('checkout-form');
  const product = document.getElementById('product');
  const amount = document.getElementById('amount');
  const reference = document.getElementById('reference');
  const customFields = document.getElementById('custom-fields');
  const summaryHeading = document.getElementById('summary-heading');
  const summaryAmount = document.getElementById('summary-amount');
  const summaryDescription = document.getElementById('summary-description');
  const error = document.getElementById('checkout-error');
  const button = document.getElementById('pay-button');
  const params = new URLSearchParams(window.location.search);
  const catalog = new Map([
    ['custom', { name: 'Custom service payment', description: 'For your agreed project, deposit, or outstanding invoice balance.' }],
    ['starter', { name: 'Starter Kit', cents: 199900, description: 'A premium website to launch your business.' }],
    ['growth', { name: 'Growth Kit', cents: 399900, description: 'A brand and website upgrade to grow your business.' }],
  ]);
  const storageKey = 'dc-checkout-draft-v1';
  let saved;
  try { saved = JSON.parse(sessionStorage.getItem(storageKey)); } catch { /* Storage is optional. */ }
  if (catalog.has(params.get('product'))) product.value = params.get('product');
  if (saved && typeof saved.amount === 'string') amount.value = saved.amount;
  if (saved && typeof saved.reference === 'string') reference.value = saved.reference.slice(0, 80);
  let requestId = saved && /^[0-9a-f-]{36}$/i.test(saved.requestId || '') ? saved.requestId : crypto.randomUUID();
  let busy = false;

  function centsFromAmount(value) {
    if (!/^(?:0|[1-9]\d{0,4})(?:\.\d{1,2})?$/.test(value)) return null;
    const [dollars, fraction = ''] = value.split('.');
    const cents = Number(dollars) * 100 + Number(fraction.padEnd(2, '0'));
    return cents >= 100 && cents <= 1000000 ? cents : null;
  }
  function updateSummary() {
    const item = catalog.get(product.value);
    const custom = product.value === 'custom';
    customFields.hidden = !custom;
    amount.required = custom;
    amount.disabled = !custom;
    const cents = custom ? centsFromAmount(amount.value) : item.cents;
    amount.setCustomValidity(custom && cents === null ? 'Enter a USD amount from $1.00 to $10,000.00, with at most two decimal places.' : '');
    summaryHeading.textContent = item.name;
    summaryDescription.textContent = item.description;
    summaryAmount.textContent = cents === null ? 'Enter an amount' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100) + ' USD';
  }
  function saveDraft() {
    try { sessionStorage.setItem(storageKey, JSON.stringify({ amount: amount.value, reference: reference.value, requestId })); } catch { /* Checkout still works without storage. */ }
  }
  for (const field of [product, amount, reference]) {
    field.addEventListener('input', () => {
      requestId = crypto.randomUUID();
      error.hidden = true;
      updateSummary();
      saveDraft();
    });
  }
  if (params.get('status') === 'returned') {
    document.getElementById('checkout-layout').hidden = true;
    document.getElementById('return-message').hidden = false;
    try { sessionStorage.removeItem(storageKey); } catch { /* Storage is optional. */ }
  } else if (params.get('status') === 'canceled') {
    document.getElementById('canceled-message').hidden = false;
  }
  updateSummary();

  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    busy = false;
    button.disabled = false;
    product.disabled = false;
    reference.disabled = false;
    button.textContent = 'Continue to Stripe';
    updateSummary();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !form.reportValidity()) return;
    busy = true;
    error.hidden = true;
    button.disabled = true;
    product.disabled = true;
    amount.disabled = true;
    reference.disabled = true;
    button.textContent = 'Opening secure checkout…';
    saveDraft();
    try {
      const response = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: product.value, amount: amount.value, reference: reference.value.trim(), requestId }),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not open checkout. Please try again.');
      const url = new URL(result.url);
      if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com' || url.username || url.password) throw new Error('Could not open secure checkout. Please contact us.');
      window.location.assign(url.href);
    } catch (failure) {
      error.textContent = failure.name === 'TimeoutError' || failure.name === 'AbortError' ? 'Checkout took too long to respond. Please try again.' : failure instanceof TypeError || failure instanceof SyntaxError ? 'Could not connect to checkout. Please try again.' : failure.message;
      error.hidden = false;
      busy = false;
      button.disabled = false;
      product.disabled = false;
      reference.disabled = false;
      updateSummary();
      button.textContent = 'Continue to Stripe';
    }
  });
})();
