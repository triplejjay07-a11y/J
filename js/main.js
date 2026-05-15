(() => {
  const FORM_ENDPOINT = "";
  const CONTACT_EMAIL = "PR@gmail.com";

  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const policyDate = document.getElementById("policy-date");
  if (policyDate) {
    policyDate.textContent = new Date(document.lastModified).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  const form = document.getElementById("consultation-form");
  if (!form) {
    return;
  }

  const status = document.getElementById("form-status");

  const setFieldError = (name, message) => {
    const error = document.getElementById(`err-${name}`);
    if (error) {
      error.textContent = message;
    }
  };

  const getValue = (name) => {
    const field = form.elements.namedItem(name);
    return field instanceof HTMLInputElement ||
      field instanceof HTMLSelectElement ||
      field instanceof HTMLTextAreaElement
      ? field.value.trim()
      : "";
  };

  const validate = () => {
    const values = {
      name: getValue("name"),
      phone: getValue("phone"),
      email: getValue("email"),
      service: getValue("service"),
      message: getValue("message"),
    };

    const errors = {
      name: values.name ? "" : "Please enter your name.",
      phone: values.phone ? "" : "Please enter your phone number.",
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ? "" : "Please enter a valid email.",
      service: values.service ? "" : "Please choose a service.",
    };

    Object.entries(errors).forEach(([name, message]) => setFieldError(name, message));

    return {
      values,
      isValid: Object.values(errors).every((message) => message === ""),
    };
  };

  const buildEmailBody = (values) => [
    `Name: ${values.name}`,
    `Phone: ${values.phone}`,
    `Email: ${values.email}`,
    `Service: ${values.service}`,
    "",
    "Message:",
    values.message || "(none)",
  ].join("\n");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (status) {
      status.textContent = "";
    }

    const { values, isValid } = validate();
    if (!isValid) {
      if (status) {
        status.textContent = "Please fix the highlighted fields before sending.";
      }
      return;
    }

    if (FORM_ENDPOINT) {
      if (status) {
        status.textContent = "Sending your request...";
      }

      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });

        if (!response.ok) {
          throw new Error(`Form endpoint returned ${response.status}`);
        }

        window.location.href = "thanks.html";
      } catch (error) {
        if (status) {
          status.textContent = "We could not send the form. Please call or email us directly.";
        }
      }
      return;
    }

    const subject = encodeURIComponent("Consultation request");
    const body = encodeURIComponent(buildEmailBody(values));
    if (status) {
      status.textContent = "Opening your email app so you can send the request.";
    }
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  });
})();
