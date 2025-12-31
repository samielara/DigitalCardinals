// assets/js/site-config.js
// Edit this file to customize your site without touching the rest of the code.

window.DC_CONFIG = Object.assign(
  {
    // Primary inbox for contact forms + mailto fallback.
    contactEmail: "SamiElarab@gmail.com",

    // Optional: direct form endpoint (recommended for production).
    // Examples:
    //  - Formspree: https://formspree.io/f/xxxxxxxx
    //  - Your own API endpoint: https://api.yourdomain.com/contact
    // Leave blank to use Netlify Forms (when deployed on Netlify) with a mailto fallback.
    formEndpoint: "",
  },
  window.DC_CONFIG || {}
);
