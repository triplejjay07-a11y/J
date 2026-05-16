const FORMSPREE_ENDPOINT = "";

const $ = (selector, root = document) => root.querySelector(selector);

const setText = (selector, value) => {
  const element = $(selector);
  if (element) {
    element.textContent = value;
  }
};

setText("#year", String(new Date().getFullYear()));
setText("#policy-date", new Date().toLocaleDateString(undefined, {
  year: "numeric",
  month: "long",
  day: "numeric",
}));

const navToggle = $(".nav-toggle");
const siteNav = $("#site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      siteNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const form = $("#consultation-form");

const setError = (field, message) => {
  setText(`#err-${field}`, message);
};

const getValue = (field) => {
  const input = form ? form.elements.namedItem(field) : null;
  return input instanceof HTMLInputElement ||
    input instanceof HTMLSelectElement ||
    input instanceof HTMLTextAreaElement
    ? input.value.trim()
    : "";
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector("button[type='submit']");
    const status = $("#form-status");
    const fields = {
      name: getValue("name"),
      phone: getValue("phone"),
      email: getValue("email"),
      service: getValue("service"),
      message: getValue("message"),
    };

    setError("name", fields.name ? "" : "Please enter your name.");
    setError("phone", fields.phone ? "" : "Please enter your phone number.");
    setError("email", isValidEmail(fields.email) ? "" : "Please enter a valid email address.");
    setError("service", fields.service ? "" : "Please choose a service.");

    if (!fields.name || !fields.phone || !isValidEmail(fields.email) || !fields.service) {
      if (status) {
        status.textContent = "Please fix the highlighted fields and try again.";
      }
      return;
    }

    if (status) {
      status.textContent = "Preparing your request...";
    }

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
    }

    try {
      if (FORMSPREE_ENDPOINT) {
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fields),
        });

        if (!response.ok) {
          throw new Error("Form submission failed");
        }

        window.location.href = "thanks.html";
        return;
      }

      const subject = encodeURIComponent("Consultation request - Peace & Recovery Co.");
      const body = encodeURIComponent(
        [
          `Name: ${fields.name}`,
          `Phone: ${fields.phone}`,
          `Email: ${fields.email}`,
          `Service: ${fields.service}`,
          "",
          "Message:",
          fields.message || "(none provided)",
        ].join("\n"),
      );

      window.location.href = `mailto:PR@gmail.com?subject=${subject}&body=${body}`;
      if (status) {
        status.textContent = "Your email app should open with the request details.";
      }
    } catch (error) {
      if (status) {
        status.textContent = "We could not send the form. Please call or email us directly.";
      }
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
      }
    }
  });
}
