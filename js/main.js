(function () {
  const CONTACT_EMAIL = "PR@gmail.com";
  const FORMSPREE_ENDPOINT = "";

  const $ = (selector, root = document) => root.querySelector(selector);

  const year = $("#year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const policyDate = $("#policy-date");
  if (policyDate) {
    policyDate.textContent = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const navToggle = $(".nav-toggle");
  const siteNav = $("#site-nav");
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

  const form = $("#consultation-form");
  if (!form) {
    return;
  }

  const status = $("#form-status");
  const setStatus = (message) => {
    if (status) {
      status.textContent = message;
    }
  };

  const setError = (fieldName, message) => {
    const field = form.elements[fieldName];
    const error = $(`#err-${fieldName}`);

    if (error) {
      error.textContent = message;
    }

    if (field instanceof HTMLElement) {
      if (message) {
        field.setAttribute("aria-invalid", "true");
      } else {
        field.removeAttribute("aria-invalid");
      }
    }
  };

  const valueFor = (fieldName) => {
    const field = form.elements[fieldName];
    return field && "value" in field ? String(field.value).trim() : "";
  };

  const validate = () => {
    const values = {
      name: valueFor("name"),
      phone: valueFor("phone"),
      email: valueFor("email"),
      service: valueFor("service"),
      message: valueFor("message"),
    };

    const errors = {
      name: values.name ? "" : "Please enter your name.",
      phone: values.phone ? "" : "Please enter your phone number.",
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
        ? ""
        : "Please enter a valid email address.",
      service: values.service ? "" : "Please choose a service.",
    };

    Object.entries(errors).forEach(([fieldName, message]) => setError(fieldName, message));

    return {
      values,
      isValid: Object.values(errors).every((message) => !message),
    };
  };

  const buildEmailLink = (values) => {
    const subject = `Consultation request from ${values.name}`;
    const body = [
      `Name: ${values.name}`,
      `Phone: ${values.phone}`,
      `Email: ${values.email}`,
      `Interested in: ${values.service}`,
      "",
      "Message:",
      values.message || "(No message provided)",
    ].join("\n");

    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  form.addEventListener("input", (event) => {
    if (event.target instanceof HTMLElement && event.target.getAttribute("name")) {
      setError(event.target.getAttribute("name"), "");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    const result = validate();
    if (!result.isValid) {
      setStatus("Please fix the highlighted fields.");
      return;
    }

    if (FORMSPREE_ENDPOINT) {
      try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });

        if (!response.ok) {
          throw new Error(`Form submission failed with ${response.status}`);
        }

        window.location.href = "thanks.html";
        return;
      } catch (error) {
        setStatus("We could not submit the form online. Opening your email app instead.");
      }
    }

    window.location.href = buildEmailLink(result.values);
    setStatus("Your email app should open with the request details.");
  });
})();
