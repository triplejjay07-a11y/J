(function () {
  var CONTACT_EMAIL = "PR@gmail.com";

  function setText(id, value) {
    var element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  function setupDates() {
    var now = new Date();
    setText("year", String(now.getFullYear()));
    setText("policy-date", now.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    }));
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

  function valueOf(form, name) {
    var field = form.elements[name];
    return field ? String(field.value).trim() : "";
  }

  function showError(name, message) {
    var error = document.getElementById("err-" + name);
    if (error) {
      error.textContent = message;
    }
  }

  function clearErrors() {
    ["name", "phone", "email", "service"].forEach(function (name) {
      showError(name, "");
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function setupConsultationForm() {
    var form = document.getElementById("consultation-form");
    var status = document.getElementById("form-status");

    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearErrors();

      var name = valueOf(form, "name");
      var phone = valueOf(form, "phone");
      var email = valueOf(form, "email");
      var service = valueOf(form, "service");
      var message = valueOf(form, "message");
      var hasError = false;

      if (!name) {
        showError("name", "Please enter your name.");
        hasError = true;
      }

      if (!phone) {
        showError("phone", "Please enter your phone number.");
        hasError = true;
      }

      if (!email || !isValidEmail(email)) {
        showError("email", "Please enter a valid email address.");
        hasError = true;
      }

      if (!service) {
        showError("service", "Please choose a service.");
        hasError = true;
      }

      if (hasError) {
        if (status) {
          status.textContent = "Please fix the highlighted fields and try again.";
        }
        return;
      }

      var body = [
        "New consultation request",
        "",
        "Name: " + name,
        "Phone: " + phone,
        "Email: " + email,
        "Interested in: " + service,
        "",
        "Message:",
        message || "(none provided)"
      ].join("\n");

      if (status) {
        status.textContent = "Opening your email app to send the request.";
      }

      window.location.href = "mailto:" + encodeURIComponent(CONTACT_EMAIL) +
        "?subject=" + encodeURIComponent("Consultation request from " + name) +
        "&body=" + encodeURIComponent(body);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupDates();
    setupNavigation();
    setupConsultationForm();
  });
}());
