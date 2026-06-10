(() => {
  const formspreeEndpoint = "";
  const contactEmail = "PR@gmail.com";

  const year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const policyDate = document.getElementById("policy-date");
  if (policyDate) {
    policyDate.textContent = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.getElementById("site-nav");
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

  const form = document.getElementById("consultation-form");
  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  const status = document.getElementById("form-status");
  const fields = {
    name: form.elements.namedItem("name"),
    phone: form.elements.namedItem("phone"),
    email: form.elements.namedItem("email"),
    service: form.elements.namedItem("service"),
    message: form.elements.namedItem("message"),
  };

  const setError = (name, message) => {
    const error = document.getElementById(`err-${name}`);
    if (error) {
      error.textContent = message;
    }
  };

  const getValue = (field) => (field instanceof HTMLInputElement ||
    field instanceof HTMLTextAreaElement ||
    field instanceof HTMLSelectElement
    ? field.value.trim()
    : "");

  const validate = () => {
    const values = {
      name: getValue(fields.name),
      phone: getValue(fields.phone),
      email: getValue(fields.email),
      service: getValue(fields.service),
      message: getValue(fields.message),
    };
    const errors = {};

    if (!values.name) {
      errors.name = "Please enter your name.";
    }

    if (values.phone.replace(/\D/g, "").length < 7) {
      errors.phone = "Please enter a valid phone number.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!values.service) {
      errors.service = "Please choose a service.";
    }

    for (const name of ["name", "phone", "email", "service"]) {
      setError(name, errors[name] || "");
    }

    return { values, isValid: Object.keys(errors).length === 0 };
  };

  const submitToEmail = ({ name, phone, email, service, message }) => {
    const subject = encodeURIComponent(`Consultation request from ${name}`);
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Email: ${email}`,
        `Service: ${service}`,
        "",
        "Message:",
        message || "(No message provided)",
      ].join("\n")
    );

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const { values, isValid } = validate();

    if (!isValid) {
      if (status) {
        status.textContent = "Please fix the highlighted fields.";
      }
      return;
    }

    if (!formspreeEndpoint) {
      if (status) {
        status.textContent = "Opening your email app to send the request.";
      }
      submitToEmail(values);
      return;
    }

    if (status) {
      status.textContent = "Sending your request...";
    }

    try {
      const response = await fetch(formspreeEndpoint, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      window.location.href = "thanks.html";
    } catch (error) {
      if (status) {
        status.textContent = "We could not send the form. Please call or email us directly.";
      }
    }
  });
})();
