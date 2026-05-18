(function () {
  const formEndpoint = "";
  const contactEmail = "PR@gmail.com";

  const qs = (selector, root = document) => root.querySelector(selector);

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  function setupNavigation() {
    const toggle = qs(".nav-toggle");
    const nav = document.getElementById("site-nav");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("open", !isOpen);
    });

    nav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("open");
      }
    });
  }

  function setError(fieldName, message) {
    const error = document.getElementById(`err-${fieldName}`);
    if (error) {
      error.textContent = message;
    }
  }

  function validateForm(form) {
    const values = {
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      email: form.elements.email.value.trim(),
      service: form.elements.service.value
    };

    let firstInvalid = null;

    Object.keys(values).forEach((name) => setError(name, ""));

    if (!values.name) {
      setError("name", "Please enter your name.");
      firstInvalid = firstInvalid || form.elements.name;
    }

    if (!values.phone) {
      setError("phone", "Please enter your phone number.");
      firstInvalid = firstInvalid || form.elements.phone;
    }

    if (!values.email || !form.elements.email.checkValidity()) {
      setError("email", "Please enter a valid email address.");
      firstInvalid = firstInvalid || form.elements.email;
    }

    if (!values.service) {
      setError("service", "Please choose a service.");
      firstInvalid = firstInvalid || form.elements.service;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return false;
    }

    return true;
  }

  function buildEmailBody(form) {
    const data = new FormData(form);
    const lines = [
      `Name: ${data.get("name") || ""}`,
      `Phone: ${data.get("phone") || ""}`,
      `Email: ${data.get("email") || ""}`,
      `Service: ${data.get("service") || ""}`,
      "",
      "Message:",
      data.get("message") || ""
    ];

    return lines.join("\n");
  }

  async function submitToEndpoint(form, status) {
    const response = await fetch(formEndpoint, {
      method: "POST",
      body: new FormData(form),
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Form submission failed");
    }

    status.textContent = "Thanks! Redirecting...";
    window.location.href = "thanks.html";
  }

  function setupForm() {
    const form = document.getElementById("consultation-form");
    const status = document.getElementById("form-status");

    if (!form || !status) {
      return;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      status.textContent = "";

      if (!validateForm(form)) {
        return;
      }

      if (formEndpoint) {
        try {
          status.textContent = "Sending...";
          await submitToEndpoint(form, status);
        } catch (error) {
          status.textContent = "We could not send the form. Please call or email us directly.";
        }
        return;
      }

      const subject = encodeURIComponent("Consultation request");
      const body = encodeURIComponent(buildEmailBody(form));
      window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
      status.textContent = "Opening your email app...";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const today = new Date();

    setText("year", String(today.getFullYear()));
    setText(
      "policy-date",
      today.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    );

    setupNavigation();
    setupForm();
  });
})();
