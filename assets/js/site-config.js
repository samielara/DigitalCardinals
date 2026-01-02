// assets/js/site-config.js
// Edit this file to customize your site without touching the rest of the code.

window.DC_CONFIG = Object.assign(
  {
    // Primary inbox for contact forms + mailto fallback.
    contactEmail: "SamiElarab@gmail.com",

    // Optional: direct form endpoint (recommended for production).
    // EXAMPLES:
    //  - Formspree: "https://formspree.io/f/YOUR_FORM_ID"  <-- Recommended
    //  - FormSubmit.co: "https://formsubmit.co/your-email"
    formEndpoint: "https://formspree.io/f/xeeoawaq",
  },
  window.DC_CONFIG || {}
);
