(() => {
  const FORMSPREE_ENDPOINT = "";
  const CONTACT_EMAIL = "PR@gmail.com";

  const currentYear = new Date().getFullYear().toString();
  document.querySelectorAll("#year").forEach((element) => {
    element.textContent = currentYear;
  });

  const policyDate = document.getElementById("policy-date");
  if (policyDate) {
    const lastModified = new Date(document.lastModified);
    const displayDate = Number.isNaN(lastModified.getTime()) ? new Date() : lastModified;
    policyDate.textContent = displayDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen.toString());
    });

    nav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  const form = document.getElementById("consultation-form");
  if (!form) {
    return;
  }

  const status = document.getElementById("form-status");

  const fields = {
    name: document.getElementById("name"),
    phone: document.getElementById("phone"),
    email: document.getElementById("email"),
    service: document.getElementById("service"),
    message: document.getElementById("message"),
  };

  const setError = (fieldName, message) => {
    const field = fields[fieldName];
    const error = document.getElementById(`err-${fieldName}`);
    if (field) {
      field.setAttribute("aria-invalid", message ? "true" : "false");
    }
    if (error) {
      error.textContent = message;
    }
  };

  const fieldValue = (fieldName) => {
    const field = fields[fieldName];
    return field && "value" in field ? field.value.trim() : "";
  };

  const validate = () => {
    let isValid = true;

    if (!fieldValue("name")) {
      setError("name", "Please enter your name.");
      isValid = false;
    } else {
      setError("name", "");
    }

    const phoneDigits = fieldValue("phone").replace(/\D/g, "");
    if (phoneDigits.length < 7) {
      setError("phone", "Please enter a phone number.");
      isValid = false;
    } else {
      setError("phone", "");
    }

    const email = fieldValue("email");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("email", "Please enter a valid email address.");
      isValid = false;
    } else {
      setError("email", "");
    }

    if (!fieldValue("service")) {
      setError("service", "Please choose a service.");
      isValid = false;
    } else {
      setError("service", "");
    }

    return isValid;
  };

  const buildMailto = () => {
    const subject = encodeURIComponent("Consultation request");
    const body = encodeURIComponent(
      [
        `Name: ${fieldValue("name")}`,
        `Phone: ${fieldValue("phone")}`,
        `Email: ${fieldValue("email")}`,
        `Service: ${fieldValue("service")}`,
        `Message: ${fieldValue("message") || "N/A"}`,
      ].join("\n")
    );
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (status) {
      status.textContent = "";
    }

    if (!validate()) {
      if (status) {
        status.textContent = "Please fix the highlighted fields.";
      }
      return;
    }

    if (!FORMSPREE_ENDPOINT) {
      if (status) {
        status.textContent = "Opening your email app to send the request.";
      }
      window.location.href = buildMailto();
      return;
    }

    try {
      const formData = new FormData(form);
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Unable to submit the consultation request.");
      }

      window.location.href = "thanks.html";
    } catch (error) {
      if (status) {
        status.textContent = "We could not send the request. Please call or email us directly.";
      }
    }
  });
})();
