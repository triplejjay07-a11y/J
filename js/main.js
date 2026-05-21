(function () {
  "use strict";

  var FORM_ENDPOINT = "";
  var CONTACT_EMAIL = "PR@gmail.com";

  function setText(id, value) {
    var element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  function getValue(form, name) {
    var field = form.elements[name];
    return field ? String(field.value || "").trim() : "";
  }

  function setFieldError(form, name, message) {
    setText("err-" + name, message);
    var field = form.elements[name];
    if (field) {
      if (message) {
        field.setAttribute("aria-invalid", "true");
      } else {
        field.removeAttribute("aria-invalid");
      }
    }
  }

  function validateForm(form) {
    var isValid = true;
    var email = getValue(form, "email");
    var phone = getValue(form, "phone");

    ["name", "phone", "email", "service"].forEach(function (name) {
      var message = getValue(form, name) ? "" : "This field is required.";
      setFieldError(form, name, message);
      if (message) {
        isValid = false;
      }
    });

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError(form, "email", "Enter a valid email address.");
      isValid = false;
    }

    if (phone && phone.replace(/\D/g, "").length < 7) {
      setFieldError(form, "phone", "Enter a valid phone number.");
      isValid = false;
    }

    return isValid;
  }

  function buildMailtoUrl(form) {
    var lines = [
      "New consultation request",
      "",
      "Name: " + getValue(form, "name"),
      "Phone: " + getValue(form, "phone"),
      "Email: " + getValue(form, "email"),
      "Service: " + getValue(form, "service"),
      "",
      "Message:",
      getValue(form, "message") || "(none)"
    ];

    return "mailto:" + encodeURIComponent(CONTACT_EMAIL) +
      "?subject=" + encodeURIComponent("Peace & Recovery Co. consultation request") +
      "&body=" + encodeURIComponent(lines.join("\n"));
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.addEventListener("click", function (event) {
      if (event.target && event.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function setupForm() {
    var form = document.getElementById("consultation-form");
    var status = document.getElementById("form-status");
    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!validateForm(form)) {
        if (status) {
          status.textContent = "Please fix the highlighted fields and try again.";
        }
        return;
      }

      if (!FORM_ENDPOINT) {
        if (status) {
          status.textContent = "Opening your email app with the request details.";
        }
        window.location.href = buildMailtoUrl(form);
        return;
      }

      if (status) {
        status.textContent = "Sending your request...";
      }

      fetch(FORM_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      }).then(function (response) {
        if (!response.ok) {
          throw new Error("Form submission failed");
        }
        window.location.href = "thanks.html";
      }).catch(function () {
        if (status) {
          status.textContent = "We could not send the form. Please call or email us directly.";
        }
      });
    });
  }

  setText("year", String(new Date().getFullYear()));
  setText("policy-date", new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }));
  setupNavigation();
  setupForm();
}());
