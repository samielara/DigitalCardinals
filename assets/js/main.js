// assets/js/main.js

function initPageScripts() {
  // Navbar: transparent at top, solid on scroll
  // We use the 'is-scrolled' class to toggle styles in style.css
  const navbar = document.getElementById("navbar");
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle("is-scrolled", window.scrollY > 20);
    };

    onScroll(); // initial check
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Smooth scroll for on-page anchors.
  // Also supports index.html#section when you're already on the home page (avoids a reload).
  document
    .querySelectorAll('a[href^="#"], a[href^="index.html#"]')
    .forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href") || "";
        if (!href || href === "#") return;

        const isIndexAnchor = href.startsWith("index.html#");
        const isHashAnchor = href.startsWith("#");
        const path =
          (window.location.pathname || "").split("/").pop() || "index.html";

        // Only hijack index.html#... if we're already on index.
        if (isIndexAnchor && path !== "index.html" && path !== "") return;

        const targetId = isIndexAnchor ? `#${href.split("#").pop()}` : href;
        if (!targetId || targetId === "#") return;

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        e.preventDefault();
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

  // Mobile Menu Toggle
  const mobileBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });

    // Close menu when a link is clicked
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
      });
    });
  }

  // Active nav link
  (function setActiveNav() {
    const path =
      (window.location.pathname || "").split("/").pop() || "index.html";
    const map = {
      "index.html": "home",
      "": "home",
      "services.html": "services",
      "packages.html": "packages",
      "about.html": "about",
      "contact.html": "contact",

      "web-development.html": "services",
      "web-design.html": "services",
      "seo.html": "services",
      "digital-ads.html": "services",
      "social-media-content.html": "services",
      "ai-agents.html": "services",
    };

    const active = map[path] || null;
    if (!active) return;

    document.querySelectorAll("[data-nav]").forEach((a) => {
      if (a.getAttribute("data-nav") === active) a.classList.add("active");
      else a.classList.remove("active");
    });
  })();

  // Hero: rotating services text
  (function initServiceRotator() {
    const rotator = document.getElementById("service-rotator");
    if (!rotator) return;

    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const services = [
      {
        label: "Web Development",
        classes:
          "text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-cyan-500 drop-shadow-[0_0_16px_rgba(34,211,238,0.30)]",
      },
      {
        label: "Web Design",
        classes:
          "text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-400 drop-shadow-[0_0_16px_rgba(99,102,241,0.26)]",
      },
      {
        label: "SEO",
        classes:
          "text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-400 drop-shadow-[0_0_16px_rgba(16,185,129,0.22)]",
      },
      {
        label: "Digital Ads",
        classes:
          "text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-cardinal drop-shadow-[0_0_16px_rgba(239,68,68,0.26)]",
      },
      {
        label: "Social & Video Content",
        classes:
          "text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 drop-shadow-[0_0_16px_rgba(168,85,247,0.22)]",
      },
      {
        label: "AI Agents",
        classes:
          "text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-400 drop-shadow-[0_0_16px_rgba(250,204,21,0.18)]",
      },
    ];

    const intervalMs = 1900;
    const animationMs = 260;

    const baseClassName = rotator.className;
    let index = 0;

    function apply(item) {
      rotator.textContent = item.label;
      rotator.className = `${baseClassName} ${item.classes}`;
    }

    apply(services[index]);

    window.setInterval(() => {
      rotator.classList.add("opacity-0", "-translate-y-1");
      rotator.style.filter = "blur(6px)";

      window.setTimeout(() => {
        index = (index + 1) % services.length;
        apply(services[index]);

        rotator.classList.remove("opacity-0", "-translate-y-1");
        rotator.style.filter = "blur(0px)";
      }, animationMs);
    }, intervalMs);
  })();

  // Carousels (services / packages / projects)
  (function initCarousels() {
    const tracks = Array.from(
      document.querySelectorAll("[data-carousel-track]")
    );

    function setButtonState(track) {
      const prev = document.querySelector(
        `[data-carousel-prev="#${track.id}"]`
      );
      const next = document.querySelector(
        `[data-carousel-next="#${track.id}"]`
      );

      if (!prev || !next) return;

      const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
      const current = Math.round(track.scrollLeft);

      prev.disabled = current <= 2;
      next.disabled = current >= maxScrollLeft - 2;
    }

    tracks.forEach((track) => {
      if (!track.id) return;

      const prev = document.querySelector(
        `[data-carousel-prev="#${track.id}"]`
      );
      const next = document.querySelector(
        `[data-carousel-next="#${track.id}"]`
      );

      const scrollStep = () =>
        Math.max(280, Math.floor(track.clientWidth * 0.92));

      const scrollByDir = (dir) => {
        track.scrollBy({ left: dir * scrollStep(), behavior: "smooth" });
      };

      if (prev) prev.addEventListener("click", () => scrollByDir(-1));
      if (next) next.addEventListener("click", () => scrollByDir(1));

      // Keyboard support when track is focused
      track.setAttribute("tabindex", "0");
      track.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          scrollByDir(-1);
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          scrollByDir(1);
        }
      });

      // Keep buttons updated
      track.addEventListener("scroll", () => setButtonState(track), {
        passive: true,
      });
      window.addEventListener("resize", () => setButtonState(track));
      setButtonState(track);
    });
  })();

  // Contact forms
  // Strategy:
  // 1) If a form endpoint is configured (Formspree / serverless), POST to it.
  // 2) Else, if deployed on Netlify, POST as a Netlify Form (AJAX).
  // 3) Else, fall back to mailto as a last resort.
  (function initContactForms() {
    const forms = Array.from(
      document.querySelectorAll("form[data-contact-form]")
    );
    if (!forms.length) return;

    const config = window.DC_CONFIG || {};
    const defaultTo = config.contactEmail || "SamiElarab@gmail.com";
    const defaultEndpoint = config.formEndpoint || "";

    function encodeFormData(formData) {
      const params = new URLSearchParams();
      for (const [k, v] of formData.entries()) {
        params.append(k, String(v));
      }
      return params.toString();
    }

    function buildMailto(to, values) {
      const subject = encodeURIComponent(
        `New inquiry — ${values.service || "Digital Cardinal"}`
      );
      const body = encodeURIComponent(
        `Name: ${values.name}\nEmail: ${values.email}\nInterested in: ${
          values.service || ""
        }\n\nMessage:\n${values.message}\n\n— Sent from digitalcardinal.com`
      );
      return `mailto:${encodeURIComponent(to)}?subject=${subject}&body=${body}`;
    }

    forms.forEach((form) => {
      const to = form.getAttribute("data-contact-to") || defaultTo;
      const endpoint =
        form.getAttribute("data-form-endpoint") || defaultEndpoint;
      const statusEl = form.querySelector("[data-form-status]");
      const submitBtn = form.querySelector("button[type=submit]");

      function setStatus(msg, isError) {
        if (!statusEl) return;
        statusEl.textContent = msg;
        statusEl.classList.remove("hidden");
        statusEl.classList.toggle("text-red-300", !!isError);
        statusEl.classList.toggle("text-emerald-300", !isError);
      }

      function setBusy(isBusy) {
        if (!submitBtn) return;
        submitBtn.disabled = !!isBusy;
        submitBtn.classList.toggle("opacity-70", !!isBusy);
        submitBtn.classList.toggle("cursor-not-allowed", !!isBusy);
      }

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const honeypot =
          (form.querySelector('[name="bot-field"]') || {}).value || "";
        if (honeypot) {
          // Spam bots fill this — treat as success without doing anything.
          setStatus("Thanks! Your message was sent.", false);
          form.reset();
          return;
        }

        const values = {
          name: (
            (form.querySelector('[name="name"]') || {}).value || ""
          ).trim(),
          email: (
            (form.querySelector('[name="email"]') || {}).value || ""
          ).trim(),
          service: (
            (form.querySelector('[name="interest"]') || {}).value || ""
          ).trim(),
          message: (
            (form.querySelector('[name="message"]') || {}).value || ""
          ).trim(),
        };

        if (!values.name || !values.email || !values.message) {
          setStatus("Please fill in name, email, and message.", true);
          return;
        }

        setBusy(true);
        setStatus("Sending…", false);

        try {
          // 1) Configured endpoint (Formspree / custom)
          if (endpoint) {
            const fd = new FormData(form);
            fd.append("to", to);

            const res = await fetch(endpoint, {
              method: "POST",
              body: fd,
              headers: { Accept: "application/json" },
            });

            if (res.ok) {
              setStatus("Sent! We’ll reply soon.", false);
              form.reset();
              return;
            }
            throw new Error("Endpoint submission failed.");
          }

          // 2) Netlify Forms (works when deployed on Netlify)
          const isFileProtocol =
            window.location && window.location.protocol === "file:";
          if (!isFileProtocol) {
            const fd = new FormData(form);
            const res = await fetch("/", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: encodeFormData(fd),
            });

            if (res.ok) {
              setStatus("Sent! We’ll reply soon.", false);
              form.reset();
              return;
            }
          }

          // 3) Fallback to mailto
          setStatus(
            "Couldn’t submit directly — opening your email as a fallback…",
            false
          );
          window.location.href = buildMailto(to, values);
        } catch (err) {
          setStatus(
            "Couldn’t submit directly — opening your email as a fallback…",
            false
          );
          window.location.href = buildMailto(to, values);
        } finally {
          setBusy(false);
        }
      });
    });
  })();

  console.log("Digital Cardinal: Main systems online.");
}

// Run after components are injected
document.addEventListener("includesLoaded", initPageScripts);
