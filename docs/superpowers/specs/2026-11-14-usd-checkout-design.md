# USD checkout

Customers choose Starter Kit, Growth Kit, or a custom service payment on Digital Cardinal's existing static Netlify site. All input, summaries, charges, and receipts are USD; no CAD conversion or Adaptive Pricing. Preserve the listed Starter ($1,999) and Growth ($3,999) prices; permit custom final payment amounts of $1–$10,000 with no default amount. Existing recurring subscription links remain as they are.

Use a branded checkout page and a Netlify function creating a Stripe-hosted Checkout Session. Fixed prices are authoritative on the server; custom amounts are strictly parsed into integer cents. No card details or Stripe secret keys enter the static site. Hosted Checkout collects billing details and email; Stripe receipt delivery must be enabled in the account. A return page does not itself prove payment. Fulfilment and paid receipts require checking the Stripe record.

Approaches: a fixed Payment Link preserves the current simple setup but cannot accept a website-specified amount; a customer-chooses Payment Link moves entry to Stripe. Server-created Checkout fits the requested website amount entry and existing Netlify hosting.

Do not silently change package prices, add processing surcharges, assume tax exemptions, or activate live payments. Fail closed until an owner explicitly configures the tax mode and Stripe key. Tax mode supports Stripe Tax (after registrations and product classifications are configured) or explicit manual/off review. Tax, when enabled, is shown at Stripe Checkout before payment. The custom amount is the agreed final service subtotal, not a guaranteed net payout.

Deployment needs a Netlify secret environment variable and an explicit tax decision; never request a secret in chat or commit it. Prepare a draft GitHub PR and leave the production site unchanged until activation is configured and verified.
