const FORM_ENDPOINT = "";
const CONTACT_EMAIL = "PR@gmail.com";

const setText = (id, value) => {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
};

setText("year", new Date().getFullYear().toString());
setText(
  "policy-date",
  new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
);

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.getElementById("site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen.toString());
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      siteNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const form = document.getElementById("consultation-form");
const formStatus = document.getElementById("form-status");

const errorFor = (name) => document.getElementById(`err-${name}`);

const setError = (name, message) => {
  const error = errorFor(name);
  if (error) {
    error.textContent = message;
  }
};

const clearErrors = () => {
  ["name", "phone", "email", "service"].forEach((name) => setError(name, ""));
  if (formStatus) {
    formStatus.textContent = "";
  }
};

const formValue = (data, name) => (data.get(name) || "").toString().trim();

const validateForm = (data) => {
  const errors = {};
  const email = formValue(data, "email");

  if (!formValue(data, "name")) {
    errors.name = "Please enter your name.";
  }

  if (!formValue(data, "phone")) {
    errors.phone = "Please enter your phone number.";
  }

  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!formValue(data, "service")) {
    errors.service = "Please choose a service.";
  }

  return errors;
};

const buildMailto = (data) => {
  const subject = encodeURIComponent("Consultation request from website");
  const body = encodeURIComponent(
    [
      `Name: ${formValue(data, "name")}`,
      `Phone: ${formValue(data, "phone")}`,
      `Email: ${formValue(data, "email")}`,
      `Service: ${formValue(data, "service")}`,
      "",
      "Message:",
      formValue(data, "message") || "(none)",
    ].join("\n")
  );

  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
};

if (form instanceof HTMLFormElement) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();

    const data = new FormData(form);
    const errors = validateForm(data);
    const errorNames = Object.keys(errors);

    if (errorNames.length > 0) {
      errorNames.forEach((name) => setError(name, errors[name]));
      const firstInvalid = form.querySelector(`[name="${errorNames[0]}"]`);
      if (firstInvalid instanceof HTMLElement) {
        firstInvalid.focus();
      }
      return;
    }

    if (FORM_ENDPOINT) {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      window.location.href = "thanks.html";
      return;
    }

    if (formStatus) {
      formStatus.textContent = "Opening your email app with the request details.";
    }
    window.location.href = buildMailto(data);
  });
}
