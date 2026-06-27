const FORMSPREE_ENDPOINT = "";
const CONTACT_EMAIL = "PR@gmail.com";

const $ = (selector, root = document) => root.querySelector(selector);

function setText(selector, value) {
  const element = $(selector);
  if (element) {
    element.textContent = value;
  }
}

function setupDates() {
  const now = new Date();
  setText("#year", String(now.getFullYear()));
  setText("#policy-date", now.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }));
}

function setupNavigation() {
  const toggle = $(".nav-toggle");
  const nav = $("#site-nav");
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
}

function setError(field, message) {
  const error = $(`#err-${field}`);
  if (error) {
    error.textContent = message;
  }
}

function validateForm(form) {
  const data = new FormData(form);
  const values = {
    name: String(data.get("name") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    email: String(data.get("email") || "").trim(),
    service: String(data.get("service") || "").trim(),
    message: String(data.get("message") || "").trim(),
  };

  let valid = true;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  setError("name", "");
  setError("phone", "");
  setError("email", "");
  setError("service", "");

  if (!values.name) {
    setError("name", "Please enter your name.");
    valid = false;
  }

  if (values.phone.replace(/\D/g, "").length < 7) {
    setError("phone", "Please enter a valid phone number.");
    valid = false;
  }

  if (!emailPattern.test(values.email)) {
    setError("email", "Please enter a valid email address.");
    valid = false;
  }

  if (!values.service) {
    setError("service", "Please choose a service.");
    valid = false;
  }

  return { valid, values };
}

function buildMailto(values) {
  const subject = "Consultation request";
  const body = [
    `Name: ${values.name}`,
    `Phone: ${values.phone}`,
    `Email: ${values.email}`,
    `Service: ${values.service}`,
    "",
    "Message:",
    values.message || "(none)",
  ].join("\n");

  return `mailto:${encodeURIComponent(CONTACT_EMAIL)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function submitToFormspree(form) {
  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    body: new FormData(form),
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Form submission failed");
  }
}

function setupConsultationForm() {
  const form = $("#consultation-form");
  const status = $("#form-status");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const { valid, values } = validateForm(form);
    if (!valid) {
      if (status) {
        status.textContent = "Please fix the highlighted fields.";
      }
      return;
    }

    if (status) {
      status.textContent = "Preparing your request...";
    }

    if (!FORMSPREE_ENDPOINT) {
      window.location.href = buildMailto(values);
      return;
    }

    try {
      await submitToFormspree(form);
      window.location.href = "thanks.html";
    } catch (error) {
      if (status) {
        status.textContent = "We could not send your request. Please call or email us directly.";
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupDates();
  setupNavigation();
  setupConsultationForm();
});
