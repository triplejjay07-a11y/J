(() => {
  const formspreeEndpoint = "";
  const contactEmail = "PR@gmail.com";

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value;
    }
  };

  const setError = (field, message) => {
    setText(`err-${field}`, message);
  };

  const getValue = (form, name) => {
    const field = form.elements[name];
    return field ? String(field.value).trim() : "";
  };

  const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const buildMailto = (data) => {
    const subject = encodeURIComponent("Consultation request");
    const body = encodeURIComponent(
      [
        "New consultation request:",
        "",
        `Name: ${data.name}`,
        `Phone: ${data.phone}`,
        `Email: ${data.email}`,
        `Service: ${data.service}`,
        "",
        "Message:",
        data.message || "(none)",
      ].join("\n")
    );

    return `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  const validateForm = (form) => {
    const data = {
      name: getValue(form, "name"),
      phone: getValue(form, "phone"),
      email: getValue(form, "email"),
      service: getValue(form, "service"),
      message: getValue(form, "message"),
    };

    let valid = true;

    setError("name", "");
    setError("phone", "");
    setError("email", "");
    setError("service", "");

    if (!data.name) {
      setError("name", "Please enter your full name.");
      valid = false;
    }

    if (!data.phone) {
      setError("phone", "Please enter a phone number.");
      valid = false;
    }

    if (!data.email) {
      setError("email", "Please enter an email address.");
      valid = false;
    } else if (!isEmail(data.email)) {
      setError("email", "Please enter a valid email address.");
      valid = false;
    }

    if (!data.service) {
      setError("service", "Please choose a service.");
      valid = false;
    }

    return { data, valid };
  };

  const submitToFormspree = async (form, status) => {
    const response = await fetch(formspreeEndpoint, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Form submission failed with ${response.status}`);
    }

    status.textContent = "Request sent. Redirecting...";
    window.location.href = "thanks.html";
  };

  document.addEventListener("DOMContentLoaded", () => {
    const currentYear = String(new Date().getFullYear());
    const currentDate = new Intl.DateTimeFormat("en", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date());

    setText("year", currentYear);
    setText("policy-date", currentDate);

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
    const status = document.getElementById("form-status");

    if (!form || !status) {
      return;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const { data, valid } = validateForm(form);
      if (!valid) {
        status.textContent = "Please fix the highlighted fields.";
        return;
      }

      status.textContent = "Preparing your request...";

      if (formspreeEndpoint) {
        try {
          await submitToFormspree(form, status);
        } catch (error) {
          status.textContent = "We could not send the form. Opening your email app instead.";
          window.location.href = buildMailto(data);
        }
        return;
      }

      status.textContent = "Opening your email app. Please send the prepared message to complete your request.";
      window.location.href = buildMailto(data);
    });
  });
})();
