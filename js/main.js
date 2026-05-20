(function () {
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
  const nav = document.getElementById("site-nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.addEventListener("click", function (event) {
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
  const fields = {
    name: document.getElementById("name"),
    phone: document.getElementById("phone"),
    email: document.getElementById("email"),
    service: document.getElementById("service"),
  };

  const errors = {
    name: document.getElementById("err-name"),
    phone: document.getElementById("err-phone"),
    email: document.getElementById("err-email"),
    service: document.getElementById("err-service"),
  };

  function setError(field, message) {
    if (errors[field]) {
      errors[field].textContent = message;
    }
  }

  function valueOf(field) {
    return fields[field] ? fields[field].value.trim() : "";
  }

  function validate() {
    let valid = true;

    Object.keys(errors).forEach(function (field) {
      setError(field, "");
    });

    if (!valueOf("name")) {
      setError("name", "Please enter your name.");
      valid = false;
    }

    if (!valueOf("phone")) {
      setError("phone", "Please enter a phone number.");
      valid = false;
    }

    const email = valueOf("email");
    if (!email) {
      setError("email", "Please enter an email address.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("email", "Please enter a valid email address.");
      valid = false;
    }

    if (!valueOf("service")) {
      setError("service", "Please choose a service.");
      valid = false;
    }

    return valid;
  }

  function buildPayload() {
    const formData = new FormData(form);
    return {
      name: formData.get("name") || "",
      phone: formData.get("phone") || "",
      email: formData.get("email") || "",
      service: formData.get("service") || "",
      message: formData.get("message") || "",
    };
  }

  function openEmail(payload) {
    const subject = "Consultation request from " + payload.name;
    const body = [
      "Name: " + payload.name,
      "Phone: " + payload.phone,
      "Email: " + payload.email,
      "Service: " + payload.service,
      "",
      "Message:",
      payload.message || "(none provided)",
    ].join("\n");

    window.location.href =
      "mailto:" +
      encodeURIComponent(contactEmail) +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (status) {
      status.textContent = "";
    }

    if (!validate()) {
      if (status) {
        status.textContent = "Please fix the highlighted fields.";
      }
      return;
    }

    const payload = buildPayload();

    if (!formspreeEndpoint) {
      openEmail(payload);
      return;
    }

    if (status) {
      status.textContent = "Sending...";
    }

    fetch(formspreeEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Form submission failed");
        }
        window.location.href = "thanks.html";
      })
      .catch(function () {
        if (status) {
          status.textContent =
            "We could not send the form. Please call or email us directly.";
        }
      });
  });
})();
