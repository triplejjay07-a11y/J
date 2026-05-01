(function () {
  const businessEmail = "PR@gmail.com";
  const formspreeEndpoint = "";

  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const policyDate = document.getElementById("policy-date");
  if (policyDate) {
    policyDate.textContent = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.getElementById("site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      const isOpen = siteNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    siteNav.addEventListener("click", function (event) {
      if (event.target instanceof HTMLAnchorElement) {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  const form = document.getElementById("consultation-form");
  if (!form) {
    return;
  }

  const status = document.getElementById("form-status");

  function setError(name, message) {
    const error = document.getElementById("err-" + name);
    const field = form.elements.namedItem(name);

    if (error) {
      error.textContent = message;
    }

    if (field instanceof HTMLElement) {
      field.setAttribute("aria-invalid", message ? "true" : "false");
    }
  }

  function getValue(name) {
    const field = form.elements.namedItem(name);
    return field && "value" in field ? String(field.value).trim() : "";
  }

  function validate() {
    const values = {
      name: getValue("name"),
      phone: getValue("phone"),
      email: getValue("email"),
      service: getValue("service"),
      message: getValue("message")
    };

    const errors = {
      name: values.name ? "" : "Please enter your full name.",
      phone: values.phone ? "" : "Please enter your phone number.",
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ? "" : "Please enter a valid email address.",
      service: values.service ? "" : "Please choose a service."
    };

    Object.keys(errors).forEach(function (name) {
      setError(name, errors[name]);
    });

    return {
      values,
      isValid: !Object.values(errors).some(Boolean)
    };
  }

  function buildEmail(values) {
    const subject = "Consultation request from " + values.name;
    const body = [
      "New consultation request:",
      "",
      "Name: " + values.name,
      "Phone: " + values.phone,
      "Email: " + values.email,
      "Service: " + values.service,
      "",
      "Message:",
      values.message || "(No message provided)"
    ].join("\n");

    return "mailto:" + businessEmail +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const result = validate();
    if (!result.isValid) {
      if (status) {
        status.textContent = "Please fix the highlighted fields and try again.";
      }
      return;
    }

    if (status) {
      status.textContent = "Preparing your request...";
    }

    if (formspreeEndpoint) {
      fetch(formspreeEndpoint, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      }).then(function (response) {
        if (!response.ok) {
          throw new Error("Form submission failed");
        }
        window.location.href = "thanks.html";
      }).catch(function () {
        window.location.href = buildEmail(result.values);
      });
      return;
    }

    window.location.href = buildEmail(result.values);
  });
}());
