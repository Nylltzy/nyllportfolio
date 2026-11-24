// Hero parallax, 3D card tilt and scroll reveals.
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ── Hero pointer parallax ─────────────────────────────── */
  const hero = document.querySelector("[data-parallax]");

  if (hero && !reduceMotion && finePointer) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = null;

    const tick = () => {
      currentX += (targetX - currentX) * 0.075;
      currentY += (targetY - currentY) * 0.075;
      hero.style.setProperty("--mx", currentX.toFixed(3));
      hero.style.setProperty("--my", currentY.toFixed(3));

      if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = null;
      }
    };

    window.addEventListener(
      "pointermove",
      (event) => {
        targetX = (event.clientX / window.innerWidth - 0.5) * 2;
        targetY = (event.clientY / window.innerHeight - 0.5) * 2;
        if (!frame) frame = requestAnimationFrame(tick);
      },
      { passive: true }
    );
  }

  /* ── Project cards: 3D tilt + light follow ─────────────── */
  const cards = document.querySelectorAll("[data-tilt]");
  const MAX_TILT = 7;

  cards.forEach((card) => {
    const reset = () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--px", "50%");
      card.style.setProperty("--py", "50%");
    };

    card.addEventListener(
      "pointermove",
      (event) => {
        if (reduceMotion || !finePointer) return;
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;

        card.style.setProperty("--rx", ((0.5 - py) * MAX_TILT).toFixed(2) + "deg");
        card.style.setProperty("--ry", ((px - 0.5) * MAX_TILT).toFixed(2) + "deg");
        card.style.setProperty("--px", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--py", (py * 100).toFixed(1) + "%");
      },
      { passive: true }
    );

    card.addEventListener("pointerleave", reset);
    card.addEventListener("blur", reset);
  });

  /* ── Contact form: posts to Web3Forms, which emails the message ── */
  /* Access key for repuntecapa1234@gmail.com (public, safe to ship). */
  const WEB3FORMS_ACCESS_KEY = "61aa0d0f-009b-4f86-9183-ee8c8ef41eac";
  const CONTACT_EMAIL = "repuntecapa1234@gmail.com";
  const form = document.querySelector("[data-contact-form]");

  if (form) {
    const status = form.querySelector("[data-form-status]");
    const button = form.querySelector(".contact__send");
    const buttonLabel = button ? button.textContent : "Send →";

    const setStatus = (text, state) => {
      if (!status) return;
      status.textContent = text;
      status.className = "contact__status" + (state ? " is-" + state : "");
      status.hidden = !text;
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      const message = form.elements.message.value.trim();

      if (!name) {
        form.elements.name.focus();
        return;
      }

      if (!email || !form.elements.email.checkValidity()) {
        form.elements.email.focus();
        return;
      }

      if (!message) {
        form.elements.message.focus();
        return;
      }

      // Honeypot: only bots tick this
      if (form.elements.botcheck && form.elements.botcheck.checked) return;

      if (button) {
        button.disabled = true;
        button.textContent = "Sending…";
      }
      setStatus("Sending your message…");

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);

      const formData = new FormData();
      formData.append("access_key", WEB3FORMS_ACCESS_KEY);
      formData.append("name", name);
      formData.append("email", email);
      formData.append("replyto", email);
      formData.append("subject", `Let's connect — ${name}`);
      formData.append("message", message);
      formData.append("Received", new Date().toISOString());

      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          signal: controller.signal,
          headers: { Accept: "application/json" },
          body: formData,
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Send failed");
        }

        form.reset();
        setStatus("Thanks — your message is in my inbox. I'll reply within a day.", "success");
      } catch (error) {
        setStatus(
          `Couldn't send just now. Email me directly at ${CONTACT_EMAIL}.`,
          "error"
        );
      } finally {
        clearTimeout(timer);
        if (button) {
          button.disabled = false;
          button.textContent = buttonLabel;
        }
      }
    });
  }

  /* ── Reveal on scroll ─────────────────────────────────── */
  const revealItems = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("in"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item) => observer.observe(item));
})();
  
