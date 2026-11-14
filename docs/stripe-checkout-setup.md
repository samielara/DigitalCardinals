# Activate USD-only checkout

This PR prepares a USD-only checkout for the three one-time service options. Existing recurring Payment Links are unchanged. Do not merge or activate until the checklist below is complete. All three one-time links depend on the new function after merge; without configuration they deliberately show an unavailable message instead of collecting money.

## Owner setup

1. In Stripe, confirm the legal business is the actual single-member LLC, the representative is correct, the personal checking payout account is verified, and its payout currency is USD. Confirm with the bank that the account may receive this business income. Do not reclassify an LLC as an individual to avoid verification.
2. In Stripe's customer email settings, enable receipts for successful payments. Verify support contact and the statement descriptor. This integration collects email and billing address in Stripe Checkout; it does not promise invoice generation or guaranteed expense deductibility.
3. Decide the correct tax treatment with the business's tax adviser. Do not enable Stripe Tax or claim zero tax just because this customer is Canadian. If using Stripe Tax, configure required registrations and the default product tax code for these services before enabling it. Prices are exclusive of any applicable tax, with the final USD total shown before card confirmation.
4. In Netlify > this site > environment variables, add the variables below with Functions scope. Never paste a secret key into chat or GitHub. Use a test key for previews; scope a live key only to Production. Never share production keys with untrusted deploy previews.

| Variable | Value |
|---|---|
| `STRIPE_SECRET_KEY` | Your Stripe **test** secret key during QA, and verified live key only in Production |
| `SITE_URL` | `https://digitalcardinals.com` |
| `CHECKOUT_ENABLED` | `true` only after configuring and testing this deployment |
| `STRIPE_TAX_MODE` | `automatic` for configured Stripe Tax, or `reviewed_none` only after explicitly determining no tax must be collected for the enabled flows |

No keys are required in client-side code. The functions do not log secrets or Stripe response payloads. Adaptive Pricing is explicitly disabled and every Checkout Session is priced in USD. A Canadian cardholder's issuer can still convert the USD charge on their own statement; this is outside the website's charge currency.

## Verification before live deployment

- Run `npm test`. The tests simulate only the external Stripe API boundary; they do not prove the account is activated or that payouts work.
- Run `npm run build`; Netlify publishes only `dist`, excluding function source, tests, and internal documentation. The Netlify function is deployed separately.
- Optional browser suite: install Playwright and Chromium in your development environment, then run `NODE_PATH=<path-to-node_modules> node tests/checkout-ui.cjs`. Set `CHROMIUM_EXECUTABLE_PATH` if using a system Chromium. The author could not run the browser suite in the restricted workspace because Chromium could not create its required sockets; run this in CI or locally before merge.
- In a trusted Netlify deploy preview, use a Stripe test key. Check `checkout.html?product=starter`, `?product=growth`, and `?product=custom`. Verify fixed USD amounts, invalid input, custom bounds, cancel/back/retry, and 390px and desktop layouts.
- Use Stripe test cards to test success, decline and 3DS. Confirm the amount and currency in Stripe itself; do not treat visiting the return URL as proof of payment.
- Validate Stripe Tax or reviewed no-tax behavior and receipt delivery for the real customer's scenario.
- After verified configuration, merge and deploy. Confirm the production checkout shows **USD**, the correct service amount, and any applicable tax. The owner must make any real payment themselves; do not use a live charge merely to test this PR.
- Fulfilment and paid invoices are manual: check the actual Stripe payment record before marking an invoice paid. This PR has no fulfilment webhook, order database, or automatic custom PDF invoice.

## Pricing and winding down

Starter stays $1,999 USD, Growth stays $3,999 USD. Custom input is blank by default and accepts a final agreed service subtotal from $1 to $10,000 USD. No CAD conversion or processing surcharge is added. If the quote must recover processing costs, agree on a revised overall USD service price first; a card surcharge is subject to separate rules and is not enabled here. Stripe fees and the net payout depend on payment method, card origin and account pricing.

Before shutting down the business, settle payouts, preserve invoices and tax/payment records, and keep a way to handle refunds and disputes. A successful charge is not proof of a completed bank payout. Disabling this checkout only stops new sessions; previously created Stripe Checkout Sessions can still be payable until they expire or are expired in Stripe.

Maintenance note: this small integration uses Netlify's legacy Lambda-compatible handler, supported for this 2026 payment. If retained beyond July 1, 2027, migrate it to Netlify's web-standard function API before redeploying (see Netlify's Lambda compatibility documentation).
