// Run with NODE_PATH pointing to a Playwright installation and Chromium installed.
const { chromium } = require('playwright');
const { createServer } = require('node:http');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const root = path.resolve(__dirname, '..');
  const server = createServer(async (req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try {
      const bytes = await readFile(file);
      res.setHeader('Content-Type', file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'text/javascript' : 'text/html');
      res.end(bytes);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE_PATH, args: ['--no-sandbox'] });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let calls = 0;
    let payload;
    let fail = true;
    await page.route('**/.netlify/functions/create-checkout', async route => {
      calls++;
      payload = route.request().postDataJSON();
      await new Promise(resolve => setTimeout(resolve, 150));
      await route.fulfill({ status: fail ? 503 : 200, contentType: 'application/json',
        body: JSON.stringify(fail ? { error: 'Online payment is not available yet.' } : { url: 'https://checkout.stripe.com/c/pay/cs_test_ui' }) });
    });
    await page.route('https://checkout.stripe.com/**', route => route.fulfill({ body: 'Stripe boundary reached' }));
    await page.goto(base + '/checkout.html?product=custom');
    await page.getByLabel('Amount to pay (USD)').waitFor();
    assert.equal(await page.getByLabel('Amount to pay (USD)').inputValue(), '');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.getByLabel('Amount to pay (USD)').fill('0.99');
    await page.getByRole('button', { name: 'Continue to Stripe' }).click();
    assert.equal(calls, 0);
    await page.getByLabel('Amount to pay (USD)').fill('123.45');
    assert.equal(await page.locator('#summary-amount').innerText(), '$123.45 USD');
    await page.getByRole('button', { name: 'Continue to Stripe' }).click();
    assert.equal(await page.locator('#pay-button').isDisabled(), true);
    await page.getByRole('alert').filter({ hasText: 'not available' }).waitFor();
    assert.equal(calls, 1);
    assert.equal(payload.amount, '123.45');
    const originalId = payload.requestId;
    assert.equal(await page.locator('#pay-button').isDisabled(), false);
    fail = false;
    await page.getByRole('button', { name: 'Continue to Stripe' }).click();
    await page.waitForURL('https://checkout.stripe.com/**');
    assert.equal(payload.requestId, originalId);
    await page.goto(base + '/checkout.html?product=custom&status=canceled');
    assert.equal(await page.getByLabel('Amount to pay (USD)').inputValue(), '123.45');
    await page.getByLabel('Product or service').selectOption('starter');
    assert.equal(await page.locator('#summary-amount').innerText(), '$1,999.00 USD');
    assert.equal(await page.getByLabel('Amount to pay (USD)').isVisible(), false);
    await page.getByLabel('Product or service').selectOption('growth');
    assert.equal(await page.locator('#summary-amount').innerText(), '$3,999.00 USD');
    await page.goto(base + '/checkout.html?status=returned');
    assert.equal(await page.locator('#checkout-form').isVisible(), false);
    assert.ok((await page.locator('#return-message').innerText()).includes('confirmation'));
    await page.goto(base + '/checkout.html?product=custom');
    await page.setViewportSize({ width: 1440, height: 1000 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const dir = process.env.CHECKOUT_SCREENSHOT_DIR;
    if (dir) {
      await page.getByLabel('Amount to pay (USD)').fill('123.45');
      await page.screenshot({ path: path.join(dir, 'checkout-desktop.png'), fullPage: true });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({ path: path.join(dir, 'checkout-mobile.png'), fullPage: true });
    }
    assert.deepEqual(errors, []);
    console.log('PASS: custom USD input, validation, fixed prices, retries, duplicate-submit guard, cancel restoration, neutral return, mobile/desktop layout.');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
