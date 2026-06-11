(function () {
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector("#site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const year = new Date().getFullYear();
  document.querySelectorAll("#year").forEach((element) => {
    element.textContent = String(year);
  });

  const policyDate = document.querySelector("#policy-date");
  if (policyDate) {
    policyDate.textContent = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const form = document.querySelector("#consultation-form");
  if (!form) {
    return;
  }

  const status = document.querySelector("#form-status");
  const formspreeEndpoint = "";

  const setError = (field, message) => {
    const error = document.querySelector(`#err-${field}`);
    if (error) {
      error.textContent = message;
    }
  };

  const clearErrors = () => {
    ["name", "phone", "email", "service"].forEach((field) => setError(field, ""));
    if (status) {
      status.textContent = "";
    }
  };

  const getValue = (name) => {
    const element = form.elements.namedItem(name);
    return element && "value" in element ? element.value.trim() : "";
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors();

    const values = {
      name: getValue("name"),
      phone: getValue("phone"),
      email: getValue("email"),
      service: getValue("service"),
      message: getValue("message"),
    };

    let isValid = true;
    if (!values.name) {
      setError("name", "Please enter your name.");
      isValid = false;
    }
    if (!values.phone) {
      setError("phone", "Please enter your phone number.");
      isValid = false;
    }
    if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      setError("email", "Please enter a valid email address.");
      isValid = false;
    }
    if (!values.service) {
      setError("service", "Please choose a service.");
      isValid = false;
    }

    if (!isValid) {
      if (status) {
        status.textContent = "Please fix the highlighted fields.";
      }
      return;
    }

    if (formspreeEndpoint) {
      if (status) {
        status.textContent = "Sending...";
      }
      try {
        const response = await fetch(formspreeEndpoint, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });
        if (!response.ok) {
          throw new Error("Unable to submit form.");
        }
        window.location.href = "thanks.html";
      } catch (error) {
        if (status) {
          status.textContent = "We could not send the form. Please call or email us directly.";
        }
      }
      return;
    }

    const subject = encodeURIComponent("Consultation request");
    const body = encodeURIComponent(
      [
        `Name: ${values.name}`,
        `Phone: ${values.phone}`,
        `Email: ${values.email}`,
        `Service: ${values.service}`,
        `Message: ${values.message || "(none)"}`,
      ].join("\n")
    );
    window.location.href = `mailto:PR@gmail.com?subject=${subject}&body=${body}`;
  });
})();
