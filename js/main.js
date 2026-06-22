const FORM_ENDPOINT = "";
const CONTACT_EMAIL = "PR@gmail.com";

const setText = (id, text) => {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
  }
};

const getField = (form, name) => form.elements.namedItem(name);

const fieldValue = (form, name) => {
  const field = getField(form, name);
  return field ? field.value.trim() : "";
};

const setError = (form, name, message) => {
  setText(`err-${name}`, message);
  const field = getField(form, name);
  if (field) {
    field.setAttribute("aria-invalid", message ? "true" : "false");
  }
};

const validateForm = (form) => {
  const errors = [];
  const requiredFields = [
    ["name", "Please enter your name."],
    ["phone", "Please enter your phone number."],
    ["email", "Please enter your email address."],
    ["service", "Please choose a service."],
  ];

  requiredFields.forEach(([name, message]) => {
    const value = fieldValue(form, name);
    const field = getField(form, name);
    const hasError = !value || (field && !field.checkValidity());

    setError(form, name, hasError ? message : "");
    if (hasError) {
      errors.push(name);
    }
  });

  const email = getField(form, "email");
  if (email && fieldValue(form, "email") && !email.validity.valid) {
    setError(form, "email", "Please enter a valid email address.");
    if (!errors.includes("email")) {
      errors.push("email");
    }
  }

  return errors;
};

const buildMailto = (form) => {
  const subject = "Consultation request - Peace & Recovery Co.";
  const body = [
    `Name: ${fieldValue(form, "name")}`,
    `Phone: ${fieldValue(form, "phone")}`,
    `Email: ${fieldValue(form, "email")}`,
    `Service: ${fieldValue(form, "service")}`,
    "",
    "Message:",
    fieldValue(form, "message") || "(No message provided)",
  ].join("\n");

  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const submitToEndpoint = async (form) => {
  const response = await fetch(FORM_ENDPOINT, {
    method: "POST",
    body: new FormData(form),
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Form submission failed with ${response.status}`);
  }
};

const setupForm = () => {
  const form = document.getElementById("consultation-form");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setText("form-status", "");

    const errors = validateForm(form);
    if (errors.length) {
      const firstInvalidField = getField(form, errors[0]);
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
      setText("form-status", "Please fix the highlighted fields.");
      return;
    }

    if (!FORM_ENDPOINT) {
      setText("form-status", "Opening your email app to send the request.");
      window.location.href = buildMailto(form);
      return;
    }

    try {
      await submitToEndpoint(form);
      window.location.href = "thanks.html";
    } catch (error) {
      setText("form-status", "We could not send that request. Please call or email us directly.");
    }
  });
};

const setupNavigation = () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const year = new Date().getFullYear();
  setText("year", String(year));
  setText("policy-date", String(year));
  setupNavigation();
  setupForm();
});
