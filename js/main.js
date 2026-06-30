(() => {
  const FORMSPREE_ENDPOINT = "";
  const CONTACT_EMAIL = "PR@gmail.com";

  const byId = (id) => document.getElementById(id);

  const year = byId("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const policyDate = byId("policy-date");
  if (policyDate) {
    policyDate.textContent = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = byId("site-nav");
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    siteNav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  const form = byId("consultation-form");
  if (!form) {
    return;
  }

  const status = byId("form-status");
  const fields = {
    name: byId("name"),
    phone: byId("phone"),
    email: byId("email"),
    service: byId("service"),
    message: byId("message"),
  };

  const errors = {
    name: byId("err-name"),
    phone: byId("err-phone"),
    email: byId("err-email"),
    service: byId("err-service"),
  };

  const setError = (field, message) => {
    if (errors[field]) {
      errors[field].textContent = message;
    }
  };

  const valueOf = (field) => (fields[field]?.value || "").trim();

  const validate = () => {
    let valid = true;

    Object.keys(errors).forEach((field) => setError(field, ""));

    if (!valueOf("name")) {
      setError("name", "Please enter your name.");
      valid = false;
    }

    if (!valueOf("phone")) {
      setError("phone", "Please enter your phone number.");
      valid = false;
    }

    const email = valueOf("email");
    if (!email) {
      setError("email", "Please enter your email.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("email", "Please enter a valid email address.");
      valid = false;
    }

    if (!valueOf("service")) {
      setError("service", "Please choose a service.");
      valid = false;
    }

    if (status) {
      status.textContent = valid ? "" : "Please fix the highlighted fields.";
    }

    return valid;
  };

  const buildMailto = () => {
    const subject = encodeURIComponent("Consultation request from website");
    const body = encodeURIComponent(
      [
        `Name: ${valueOf("name")}`,
        `Phone: ${valueOf("phone")}`,
        `Email: ${valueOf("email")}`,
        `Service: ${valueOf("service")}`,
        "",
        "Message:",
        valueOf("message") || "(No message provided)",
      ].join("\n"),
    );

    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    if (!FORMSPREE_ENDPOINT) {
      window.location.href = buildMailto();
      if (status) {
        status.textContent = "Opening your email app to send the request.";
      }
      return;
    }

    if (status) {
      status.textContent = "Sending...";
    }

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: valueOf("name"),
          phone: valueOf("phone"),
          email: valueOf("email"),
          service: valueOf("service"),
          message: valueOf("message"),
        }),
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      window.location.href = "thanks.html";
    } catch (error) {
      if (status) {
        status.textContent =
          "We could not send that automatically. Please call or email us directly.";
      }
    }
  });
})();
