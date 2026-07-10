const FORMSPREE_ENDPOINT = "";
const CONTACT_EMAIL = "PR@gmail.com";

function setTextIfPresent(selector, value) {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = value;
  }
}

function initNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");

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

function getFormValue(form, name) {
  const field = form.elements.namedItem(name);
  return field instanceof HTMLInputElement ||
    field instanceof HTMLSelectElement ||
    field instanceof HTMLTextAreaElement
    ? field.value.trim()
    : "";
}

function setFieldError(name, message) {
  const error = document.querySelector(`#err-${name}`);
  if (error) {
    error.textContent = message;
  }
}

function validateConsultationForm(form) {
  const values = {
    name: getFormValue(form, "name"),
    phone: getFormValue(form, "phone"),
    email: getFormValue(form, "email"),
    service: getFormValue(form, "service"),
    message: getFormValue(form, "message"),
  };

  const errors = {
    name: values.name ? "" : "Please enter your name.",
    phone: values.phone ? "" : "Please enter your phone number.",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
      ? ""
      : "Please enter a valid email address.",
    service: values.service ? "" : "Please choose a service.",
  };

  Object.entries(errors).forEach(([name, message]) => setFieldError(name, message));

  return {
    values,
    isValid: Object.values(errors).every((message) => !message),
  };
}

function buildMailtoUrl(values) {
  const subject = "Consultation request from Peace & Recovery Co. website";
  const body = [
    `Name: ${values.name}`,
    `Phone: ${values.phone}`,
    `Email: ${values.email}`,
    `Service: ${values.service}`,
    "",
    "Message:",
    values.message || "(none provided)",
  ].join("\n");

  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function submitToFormspree(values) {
  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error("Form submission failed");
  }
}

function initConsultationForm() {
  const form = document.querySelector("#consultation-form");
  const status = document.querySelector("#form-status");

  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const { values, isValid } = validateConsultationForm(form);

    if (!isValid) {
      if (status) {
        status.textContent = "Please fix the highlighted fields.";
      }
      return;
    }

    if (!FORMSPREE_ENDPOINT) {
      if (status) {
        status.textContent = "Opening your email app to send the request.";
      }
      window.location.href = buildMailtoUrl(values);
      return;
    }

    try {
      if (status) {
        status.textContent = "Sending...";
      }
      await submitToFormspree(values);
      window.location.href = "thanks.html";
    } catch (error) {
      if (status) {
        status.textContent = "Sorry, we could not send that request. Please call or email us directly.";
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const now = new Date();
  setTextIfPresent("#year", String(now.getFullYear()));
  setTextIfPresent(
    "#policy-date",
    now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  );
  initNavToggle();
  initConsultationForm();
});
