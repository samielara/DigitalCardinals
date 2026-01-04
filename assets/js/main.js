// assets/js/main.js

function initPageScripts() {
  // Navbar: transparent at top, solid on scroll
  // We use the 'is-scrolled' class to toggle styles in style.css
  const navbar = document.getElementById("navbar");
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 20) {
        navbar.classList.add("is-scrolled");
      } else {
        navbar.classList.remove("is-scrolled");
      }
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

    // Handle both "services.html" (local) and "services" (live/clean URL)
    const active = map[path] || map[path + ".html"] || null;
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

    // Animated button spotlight (video-style)
    (function initOrbitButtons() {
      // We use a MutationObserver in case buttons are loaded dynamically via include.js
      const observer = new MutationObserver(() => {
        const buttons = document.querySelectorAll(
          ".card-spotlight:not([data-orbit-init])"
        );
        buttons.forEach((btn) => {
          btn.setAttribute("data-orbit-init", "true");
          const setVars = (e) => {
            const rect = btn.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            btn.style.setProperty("--mx", `${x}%`);
            btn.style.setProperty("--my", `${y}%`);
          };

          // Pointer events handle mouse + pen + touch
          btn.addEventListener("pointerenter", setVars);
          btn.addEventListener("pointermove", setVars);

          // On touch, set spotlight to touch point
          btn.addEventListener("pointerdown", setVars);

          // Optional: on leave, reset to center
          btn.addEventListener("pointerleave", () => {
            btn.style.setProperty("--mx", "50%");
            btn.style.setProperty("--my", "50%");
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    })();
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

  // Services Carousel (Specific)
  (function initServicesLogic() {
    const track = document.getElementById("serviceCarousel");
    const prev = document.getElementById("prevBtn");
    const next = document.getElementById("nextBtn");
    const cards = document.querySelectorAll("[data-carousel-item]");

    if (!track || !prev || !next) return;

    // Center Focus Logic
    const updateActiveScale = () => {
      const centerPoint = track.scrollLeft + track.clientWidth / 2;

      cards.forEach((card) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(centerPoint - cardCenter);
        // Threshold: roughly half a card width
        const isCenter = dist < card.offsetWidth / 2;

        if (isCenter) {
          card.classList.remove("scale-90", "opacity-40");
          card.classList.add(
            "scale-100",
            "md:scale-110",
            "opacity-100",
            "z-10"
          );
        } else {
          card.classList.remove(
            "scale-100",
            "md:scale-110",
            "opacity-100",
            "z-10"
          );
          card.classList.add("scale-90", "opacity-40");
        }
      });
    };

    // Infinite Loop Logic (No disabled states)
    const updateAuthButtons = () => {
      // Always allow interaction for infinite feel
      prev.disabled = false;
      next.disabled = false;
      prev.style.opacity = "1";
      next.style.opacity = "1";
      prev.style.cursor = "pointer";
      next.style.cursor = "pointer";
    };

    const getScrollStep = () => {
      // Find width including gap
      if (cards.length > 0) {
        return cards[0].offsetWidth + 24; // 24 is gap-6
      }
      return window.innerWidth < 768 ? 340 : 440;
    };

    prev.addEventListener("click", () => {
      const scrollStep = getScrollStep();
      const tolerance = 5;

      if (track.scrollLeft <= tolerance) {
        // Loop to end
        track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
      } else {
        track.scrollBy({ left: -scrollStep, behavior: "smooth" });
      }
    });

    next.addEventListener("click", () => {
      const scrollStep = getScrollStep();
      const tolerance = 5;
      const maxScroll = track.scrollWidth - track.clientWidth;

      if (track.scrollLeft >= maxScroll - tolerance) {
        // Loop to start
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: scrollStep, behavior: "smooth" });
      }
    });

    track.addEventListener(
      "scroll",
      () => {
        updateActiveScale();
      },
      { passive: true }
    );

    window.addEventListener("resize", () => {
      updateActiveScale();
    });

    // Init
    updateActiveScale();
    updateAuthButtons();

    // Keyboard Nav (Infinite support)
    track.setAttribute("tabindex", "0");
    track.style.outline = "none";
    track.addEventListener("keydown", (e) => {
      const tolerance = 5;
      const maxScroll = track.scrollWidth - track.clientWidth;
      const scrollStep = getScrollStep();

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (track.scrollLeft <= tolerance) {
          track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
        } else {
          track.scrollBy({ left: -scrollStep, behavior: "smooth" });
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (track.scrollLeft >= maxScroll - tolerance) {
          track.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          track.scrollBy({ left: scrollStep, behavior: "smooth" });
        }
      }
    });

    // Auto-center initial load if not already
    // The CSS padding handles this, but we force a check
    setTimeout(updateActiveScale, 100);
  })();

  // Contact forms
  // Strategy:
  // 1) If a form endpoint is configured (Formspree / serverless), POST to it.
  // 2) Else, if deployed on Netlify, POST as a Netlify Form (AJAX).
  // 3) Else, fall back to mailto as a last resort.
  (function initContactForms() {
    const forms = Array.from(document.querySelectorAll('form[name="contact"]'));
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

        // Only process forms with name="contact"
        if (form.getAttribute("name") !== "contact") return;

        // Spam bot check (Netlify/Formspree honeypot)
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

        // 1) If we have an endpoint, try it.
        if (endpoint) {
          setBusy(true);
          setStatus("Sending…", false);

          try {
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
          } catch (err) {
            console.error(err);
            // Fallthrough to mailto
          }
        }

        // 2) If no endpoint, check if we are possibly on Netlify (not file protocol)
        // If we are mostly likely plain HTML, skip straight to mailto logic to avoid "Error" flash.
        const isFileProtocol = window.location.protocol === "file:";

        // If we really want to try Netlify forms implicitly:
        if (!endpoint && !isFileProtocol) {
          setBusy(true);
          setStatus("Sending…", false);
          try {
            const fd = new FormData(form);
            const res = await fetch("/", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: encodeFormData(fd),
            });
            if (res.ok) {
              setStatus("Sent! We’ll reply soon.", false);
              form.reset();
              setBusy(false); // Important: clear busy here if returning
              return;
            }
          } catch (e) {
            // Fallthrough
          }
        }

        // 3) Fallback to mailto (Direct open)
        // If we never had an endpoint and Netlify failed or we skipped it:
        setBusy(false); // Ensure button is clickable again
        setStatus("Opening your email client...", false);

        setTimeout(() => {
          window.location.href = buildMailto(to, values);
          setStatus("Please send the email that was created.", false);
          form.reset();
        }, 800);
      });
    });
  })();

  console.log("Digital Cardinal: Main systems online.");
}

// Run after components are injected
document.addEventListener("includesLoaded", initPageScripts);

// Expose switchTab globally so inline onclicks work
// Mobile Tabs Scroll Helper
window.scrollTabs = function (direction) {
  const container = document.getElementById("tabs-container");
  if (!container) return;

  const scrollAmount = 200; // Adjust scroll distance

  if (direction === "left") {
    container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  } else {
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }
};

// ... existing code ...
window.switchTab = function (tabName) {
  // Reset all buttons
  const buttons = document.querySelectorAll("#packages button");
  buttons.forEach((btn) => {
    btn.classList.remove("active");
  });

  // Activate clicked button
  const activeBtn = document.getElementById("tab-" + tabName);
  if (activeBtn) {
    activeBtn.classList.add("active");
  }

  // Hide all content
  const contents = document.querySelectorAll(".package-content");
  contents.forEach((content) => {
    content.classList.add("hidden");
  });

  // Show selected content
  const selectedContent = document.getElementById("content-" + tabName);
  if (selectedContent) {
    selectedContent.classList.remove("hidden");
  }

  // Auto-center the active tab in the scroll view (Mobile)
  if (activeBtn) {
    activeBtn.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }
};

// Auto-hide "Service Details" feature blocks if on Home Page (index.html or root)
// Because we used the same component for both Home and Packages, but only want the details on Packages.
document.addEventListener("includesLoaded", () => {
  // Check if we are on the home page (index.html or root)
  const path = window.location.pathname;
  const isHome =
    path === "/" || path.endsWith("index.html") || path.endsWith("/");

  if (isHome) {
    const details = document.querySelectorAll(".service-detail-block");
    details.forEach((el) => el.classList.add("hidden"));
  }
});
