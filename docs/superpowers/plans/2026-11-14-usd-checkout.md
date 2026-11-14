# USD Checkout Implementation Plan

> Execute inline; verify with Node tests and a browser-level DOM integration check.

**Goal:** Select a package or enter a custom USD payment and continue to a matching, securely created Stripe Checkout.

**Architecture:** Static HTML/CSS/JS plus a dependency-free Netlify function using Stripe REST. Keep listed package pricing, validate all input server-side, and do not activate live payments without explicit configuration.

**Tech Stack:** HTML, CSS, browser JavaScript, Node.js 22+, Netlify Functions, Stripe Checkout.

**Spec:** `docs/superpowers/specs/2026-11-14-usd-checkout-design.md`

## Global constraints

- USD only; explicitly disable Adaptive Pricing.
- Custom $1–$10,000; no default custom amount. Fixed prices remain $1,999 and $3,999.
- No secrets in static assets or the repository; no raw card collection.
- Tax mode must be explicitly configured; no inferred exemption or surcharge.
- No automated fulfilment or paid receipt based on the success URL.

## Review focus

Price/currency tampering; malformed/over-precision amounts; repeated submissions; unavailable or misconfigured Stripe; canceled checkout and unverified success redirects.

### Task 1: Secure session creation

- [ ] Write Node handler tests for USD-only server-authoritative pricing, strict cents/bounds, same-origin requests, missing configuration, idempotency, upstream errors and Stripe request contract.
- [ ] Run `node --test tests/*.test.cjs`; observe failure before implementation.
- [ ] Implement `netlify/functions/create-checkout.cjs`, `netlify.toml`, and `package.json`.
- [ ] Run the suite and record results.

### Task 2: Checkout UI and integration

- [ ] Add `checkout.html`, `assets/css/checkout.css`, and `assets/js/checkout.js` with product selection, custom USD amount, summary, processing/error/cancel/return states.
- [ ] Update only the three one-time package links to checkout product URLs.
- [ ] Exercise the real DOM at mobile and desktop sizes, submitting invalid and valid amounts with only the external Stripe boundary simulated; test no duplicate submissions and retry behavior.
- [ ] Document Netlify environment setup, Stripe receipts, tax review, sandbox tests, production activation, and closing-business payment record retention.
- [ ] Run all verification, review the diff, fix material findings, and create a draft PR.
