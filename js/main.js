const FORMSPREE_ENDPOINT = "";

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function setError(id, value) {
  setText(`err-${id}`, value);
}

function getField(form, name) {
  return form.elements.namedItem(name);
}

function validateForm(form) {
  const values = {
    name: getField(form, "name").value.trim(),
    phone: getField(form, "phone").value.trim(),
    email: getField(form, "email").value.trim(),
    service: getField(form, "service").value,
    message: getField(form, "message").value.trim(),
  };

  let valid = true;
  ["name", "phone", "email", "service"].forEach((field) => setError(field, ""));

  if (!values.name) {
    setError("name", "Please enter your name.");
    valid = false;
  }

  if (!values.phone) {
    setError("phone", "Please enter your phone number.");
    valid = false;
  }

  if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
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
  const subject = encodeURIComponent("Consultation request");
  const body = encodeURIComponent(
    [
      `Name: ${values.name}`,
      `Phone: ${values.phone}`,
      `Email: ${values.email}`,
      `Service: ${values.service}`,
      "",
      values.message ? `Message: ${values.message}` : "Message: (none)",
    ].join("\n"),
  );

  return `mailto:PR@gmail.com?subject=${subject}&body=${body}`;
}

function initNavigation() {
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

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("open");
    }
  });
}

function initForm() {
  const form = document.getElementById("consultation-form");
  const status = document.getElementById("form-status");

  if (!(form instanceof HTMLFormElement)) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const { valid, values } = validateForm(form);
    if (!valid) {
      setText("form-status", "Please fix the highlighted fields.");
      return;
    }

    if (!FORMSPREE_ENDPOINT) {
      if (status) {
        status.textContent = "Opening your email app...";
      }
      window.location.href = buildMailto(values);
      return;
    }

    try {
      if (status) {
        status.textContent = "Sending...";
      }

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });

      if (!response.ok) {
        throw new Error("Form submission failed");
      }

      window.location.href = "thanks.html";
    } catch (error) {
      if (status) {
        status.textContent = "We could not send the form. Please call or email us instead.";
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const now = new Date();
  setText("year", String(now.getFullYear()));
  setText(
    "policy-date",
    now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
  );
  initNavigation();
  initForm();
});
