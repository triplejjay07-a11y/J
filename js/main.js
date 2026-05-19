const FORM_ENDPOINT = "";
const CONTACT_EMAIL = "PR@gmail.com";

function setText(id, message) {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = message;
  }
}

function valueFor(form, fieldName) {
  const field = form.elements[fieldName];
  return field ? String(field.value || "").trim() : "";
}

function validateConsultation(form) {
  const values = {
    name: valueFor(form, "name"),
    phone: valueFor(form, "phone"),
    email: valueFor(form, "email"),
    service: valueFor(form, "service"),
    message: valueFor(form, "message"),
  };

  const errors = {};
  if (!values.name) errors.name = "Please enter your name.";
  if (!values.phone) errors.phone = "Please enter your phone number.";
  if (!values.email) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!values.service) errors.service = "Please choose a service.";

  return { values, errors };
}

function renderErrors(errors) {
  setText("err-name", errors.name || "");
  setText("err-phone", errors.phone || "");
  setText("err-email", errors.email || "");
  setText("err-service", errors.service || "");
}

function buildMailto(values) {
  const subject = encodeURIComponent(`Consultation request from ${values.name}`);
  const body = encodeURIComponent(
    [
      `Name: ${values.name}`,
      `Phone: ${values.phone}`,
      `Email: ${values.email}`,
      `Service: ${values.service}`,
      "",
      "Message:",
      values.message || "(none)",
    ].join("\n")
  );
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

async function submitConsultation(form, values) {
  if (!FORM_ENDPOINT) {
    window.location.href = buildMailto(values);
    return;
  }

  const response = await fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error("Form submission failed");
  }

  window.location.href = "thanks.html";
}

function initNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("open", !expanded);
  });
}

function initConsultationForm() {
  const form = document.getElementById("consultation-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setText("form-status", "");

    const { values, errors } = validateConsultation(form);
    renderErrors(errors);

    if (Object.keys(errors).length > 0) {
      setText("form-status", "Please fix the highlighted fields.");
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    setText("form-status", "Preparing your request...");

    try {
      await submitConsultation(form, values);
    } catch (error) {
      setText("form-status", "Sorry, we could not send this request. Please call or email us directly.");
      if (submitButton) submitButton.disabled = false;
    }
  });
}

function initDates() {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const policyDate = document.getElementById("policy-date");
  if (policyDate) policyDate.textContent = new Date().toLocaleDateString();
}

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initConsultationForm();
  initDates();
});
