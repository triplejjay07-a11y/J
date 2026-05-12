(function () {
  var CONTACT_EMAIL = "PR@gmail.com";
  var FORMSPREE_ENDPOINT = "";

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    var node = byId(id);
    if (node) {
      node.textContent = value;
    }
  }

  function setDates() {
    var year = new Date().getFullYear().toString();
    document.querySelectorAll("#year").forEach(function (node) {
      node.textContent = year;
    });

    var policyDate = byId("policy-date");
    if (policyDate) {
      policyDate.textContent = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = byId("site-nav");
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function formValues(form) {
    var data = new FormData(form);
    return {
      name: (data.get("name") || "").toString().trim(),
      phone: (data.get("phone") || "").toString().trim(),
      email: (data.get("email") || "").toString().trim(),
      service: (data.get("service") || "").toString().trim(),
      message: (data.get("message") || "").toString().trim()
    };
  }

  function validate(values) {
    var errors = {};
    if (!values.name) {
      errors.name = "Please enter your name.";
    }
    if (values.phone.replace(/\D/g, "").length < 7) {
      errors.phone = "Please enter a phone number.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!values.service) {
      errors.service = "Please choose a service.";
    }
    return errors;
  }

  function showErrors(errors) {
    setText("err-name", errors.name || "");
    setText("err-phone", errors.phone || "");
    setText("err-email", errors.email || "");
    setText("err-service", errors.service || "");
  }

  function mailtoUrl(values) {
    var body = [
      "New consultation request",
      "",
      "Name: " + values.name,
      "Phone: " + values.phone,
      "Email: " + values.email,
      "Service: " + values.service,
      "",
      "Message:",
      values.message || "(none)"
    ].join("\n");

    return "mailto:" + encodeURIComponent(CONTACT_EMAIL) +
      "?subject=" + encodeURIComponent("Consultation request") +
      "&body=" + encodeURIComponent(body);
  }

  function setupForm() {
    var form = byId("consultation-form");
    var status = byId("form-status");
    if (!form) {
      return;
    }

    form.noValidate = true;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var values = formValues(form);
      var errors = validate(values);
      showErrors(errors);

      if (Object.keys(errors).length > 0) {
        if (status) {
          status.textContent = "Please fix the highlighted fields.";
        }
        return;
      }

      if (!FORMSPREE_ENDPOINT) {
        if (status) {
          status.textContent = "Opening your email app with the request details.";
        }
        window.location.href = mailtoUrl(values);
        return;
      }

      if (status) {
        status.textContent = "Sending...";
      }

      fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      }).then(function (response) {
        if (!response.ok) {
          throw new Error("Form submission failed");
        }
        window.location.href = "thanks.html";
      }).catch(function () {
        if (status) {
          status.textContent = "We could not send that automatically. Opening your email app instead.";
        }
        window.location.href = mailtoUrl(values);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setDates();
    setupNavigation();
    setupForm();
  });
}());
