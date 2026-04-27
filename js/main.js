const FORMSPREE_ENDPOINT = "";
const CONTACT_EMAIL = "PR@gmail.com";

const setText = (id, value) => {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
};

const setError = (name, value) => setText(`err-${name}`, value);

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const buildMailtoUrl = (formData) => {
  const subject = "Consultation request";
  const body = [
    `Name: ${formData.get("name")}`,
    `Phone: ${formData.get("phone")}`,
    `Email: ${formData.get("email")}`,
    `Service: ${formData.get("service")}`,
    "",
    "Message:",
    formData.get("message") || "(none)",
  ].join("\n");

  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const validateForm = (formData) => {
  const errors = {};

  if (!String(formData.get("name") || "").trim()) {
    errors.name = "Please enter your name.";
  }

  if (!String(formData.get("phone") || "").trim()) {
    errors.phone = "Please enter your phone number.";
  }

  const email = String(formData.get("email") || "").trim();
  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!String(formData.get("service") || "").trim()) {
    errors.service = "Please choose a service.";
  }

  return errors;
};

const initNavigation = () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("open", !expanded);
  });
};

const initForm = () => {
  const form = document.getElementById("consultation-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const errors = validateForm(formData);

    ["name", "phone", "email", "service"].forEach((name) => setError(name, errors[name] || ""));

    if (Object.keys(errors).length > 0) {
      setText("form-status", "Please fix the highlighted fields.");
      return;
    }

    setText("form-status", "Preparing your request...");

    if (FORMSPREE_ENDPOINT) {
      try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Form submission failed");
        }

        window.location.assign("thanks.html");
        return;
      } catch (error) {
        setText("form-status", "We could not submit the form. Please call or email us directly.");
        return;
      }
    }

    window.location.href = buildMailtoUrl(formData);
    setText("form-status", "Your email app should open with the request details. Please send the email to finish.");
  });
};

setText("year", new Date().getFullYear());
setText("policy-date", new Date().toLocaleDateString(undefined, {
  year: "numeric",
  month: "long",
  day: "numeric",
}));

initNavigation();
initForm();
