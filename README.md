# Digital Cardinal (Static Site)

This project is a **static HTML + Tailwind (CDN)** marketing site with reusable components (`components/*.html`) loaded at runtime via `assets/js/include.js`.

## Pages

- `index.html` — landing page (Services carousel, Packages carousel, Projects carousel)
- `services.html` — services overview
  - `web-development.html`
  - `web-design.html`
  - `seo.html`
  - `digital-ads.html`
  - `social-media-content.html`
  - `ai-agents.html`
- `packages.html` — packages + pricing
- `about.html` — about + projects + contact form
- `contact.html` — contact form

## Contact form (recommended production setup)

The form supports three modes (in this order):

1) **Direct endpoint** (recommended): set `formEndpoint` in `assets/js/site-config.js`.
   - Works with Formspree or any custom API endpoint that accepts a POST.
2) **Netlify Forms**: if you deploy to Netlify, leaving `formEndpoint` blank will still capture submissions.
3) **Mailto fallback**: if neither of the above works, the site opens the visitor’s email client pre-filled.

Edit this file:

`assets/js/site-config.js`

```js
window.DC_CONFIG = Object.assign(
  {
    contactEmail: "SamiElarab@gmail.com",
    formEndpoint: "https://formspree.io/f/xxxxxxxx" // optional
  },
  window.DC_CONFIG || {}
);
```

## Run locally

Because the site uses runtime includes, open it with a simple local server:

```bash
# Python
python -m http.server 5500

# Node
npx serve .
```

Then visit `http://localhost:5500/index.html`.
