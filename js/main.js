(function () {
  var currentYear = new Date().getFullYear();

  document.querySelectorAll("#year").forEach(function (node) {
    node.textContent = String(currentYear);
  });

  var policyDate = document.getElementById("policy-date");
  if (policyDate) {
    policyDate.textContent = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  var navToggle = document.querySelector(".nav-toggle");
  var siteNav = document.getElementById("site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = siteNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    siteNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var form = document.getElementById("consultation-form");
  if (!form) {
    return;
  }

  var status = document.getElementById("form-status");
  var requiredFields = ["name", "phone", "email", "service"];

  function setError(field, message) {
    var error = document.getElementById("err-" + field.id);
    if (error) {
      error.textContent = message;
    }
    field.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function validateForm() {
    var firstInvalid = null;

    requiredFields.forEach(function (fieldId) {
      var field = document.getElementById(fieldId);
      if (!field) {
        return;
      }

      var message = "";
      if (!field.value.trim()) {
        message = "Please complete this field.";
      } else if (field.type === "email" && !field.validity.valid) {
        message = "Please enter a valid email address.";
      }

      setError(field, message);
      if (message && !firstInvalid) {
        firstInvalid = field;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      if (status) {
        status.textContent = "Please fix the highlighted fields before sending.";
      }
      return false;
    }

    if (status) {
      status.textContent = "";
    }
    return true;
  }

  form.addEventListener("input", function (event) {
    if (event.target && requiredFields.indexOf(event.target.id) !== -1) {
      setError(event.target, "");
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    var formData = new FormData(form);
    var lines = [
      "New consultation request",
      "",
      "Name: " + (formData.get("name") || ""),
      "Phone: " + (formData.get("phone") || ""),
      "Email: " + (formData.get("email") || ""),
      "Service: " + (formData.get("service") || ""),
      "Message: " + (formData.get("message") || "")
    ];

    var mailto = "mailto:PR@gmail.com"
      + "?subject=" + encodeURIComponent("Consultation request")
      + "&body=" + encodeURIComponent(lines.join("\n"));

    window.location.href = mailto;
    if (status) {
      status.textContent = "Opening your email app to send the request.";
    }
  });
})();
