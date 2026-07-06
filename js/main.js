const FORMSPREE_ENDPOINT = "";
const CONTACT_EMAIL = "PR@gmail.com";

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
}

function setupNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");

  if (!toggle || !nav) {
    return;
  }

  const closeNav = () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
    }
  });
}

function getFormValues(form) {
  const formData = new FormData(form);

  return {
    name: String(formData.get("name") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    service: String(formData.get("service") || "").trim(),
    message: String(formData.get("message") || "").trim(),
  };
}

function setError(field, message) {
  const error = document.querySelector(`#err-${field}`);

  if (error) {
    error.textContent = message;
  }
}

function validate(values) {
  const errors = {};

  if (!values.name) {
    errors.name = "Please enter your name.";
  }

  if (!values.phone) {
    errors.phone = "Please enter your phone number.";
  }

  if (!values.email) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.service) {
    errors.service = "Please choose a service.";
  }

  return errors;
}

function buildMailto(values) {
  const subject = "Consultation request from Peace & Recovery Co. website";
  const body = [
    `Name: ${values.name}`,
    `Phone: ${values.phone}`,
    `Email: ${values.email}`,
    `Service: ${values.service}`,
    "",
    "Message:",
    values.message || "(No message provided)",
  ].join("\n");

  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function setupConsultationForm() {
  const form = document.querySelector("#consultation-form");
  const status = document.querySelector("#form-status");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    ["name", "phone", "email", "service"].forEach((field) => setError(field, ""));

    const values = getFormValues(form);
    const errors = validate(values);

    Object.entries(errors).forEach(([field, message]) => setError(field, message));

    if (Object.keys(errors).length > 0) {
      if (status) {
        status.textContent = "Please fix the highlighted fields.";
      }
      return;
    }

    if (FORMSPREE_ENDPOINT) {
      try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error("Form submission failed");
        }

        window.location.href = "thanks.html";
        return;
      } catch (error) {
        if (status) {
          status.textContent = "We could not submit the form. Opening your email app instead.";
        }
      }
    }

    window.location.href = buildMailto(values);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const now = new Date();

  setText("#year", String(now.getFullYear()));
  setText("#policy-date", now.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }));

  setupNavigation();
  setupConsultationForm();
});
