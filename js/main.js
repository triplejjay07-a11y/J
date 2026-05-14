(function () {
  var FORM_ENDPOINT = "";
  var BUSINESS_EMAIL = "PR@gmail.com";

  var yearElements = document.querySelectorAll("#year");
  var currentYear = String(new Date().getFullYear());
  yearElements.forEach(function (element) {
    element.textContent = currentYear;
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

    siteNav.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        siteNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  var form = document.getElementById("consultation-form");
  if (!form) {
    return;
  }

  var status = document.getElementById("form-status");
  var submitButton = form.querySelector('button[type="submit"]');

  function setStatus(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function setFieldError(fieldName, message) {
    var errorElement = document.getElementById("err-" + fieldName);
    var field = form.elements[fieldName];
    if (errorElement) {
      errorElement.textContent = message;
    }
    if (field) {
      field.setAttribute("aria-invalid", message ? "true" : "false");
    }
  }

  function fieldValue(fieldName) {
    var field = form.elements[fieldName];
    return field ? field.value.trim() : "";
  }

  function validateForm() {
    var values = {
      name: fieldValue("name"),
      phone: fieldValue("phone"),
      email: fieldValue("email"),
      service: fieldValue("service"),
      message: fieldValue("message")
    };
    var firstInvalidField = null;

    ["name", "phone", "email", "service"].forEach(function (fieldName) {
      setFieldError(fieldName, "");
    });

    if (!values.name) {
      setFieldError("name", "Please enter your name.");
      firstInvalidField = firstInvalidField || form.elements.name;
    }

    if (values.phone.replace(/\D/g, "").length < 7) {
      setFieldError("phone", "Please enter a valid phone number.");
      firstInvalidField = firstInvalidField || form.elements.phone;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      setFieldError("email", "Please enter a valid email address.");
      firstInvalidField = firstInvalidField || form.elements.email;
    }

    if (!values.service) {
      setFieldError("service", "Please choose a service.");
      firstInvalidField = firstInvalidField || form.elements.service;
    }

    return {
      values: values,
      firstInvalidField: firstInvalidField
    };
  }

  function buildEmailBody(values) {
    return [
      "New consultation request",
      "",
      "Name: " + values.name,
      "Phone: " + values.phone,
      "Email: " + values.email,
      "Service: " + values.service,
      "Message: " + (values.message || "None provided")
    ].join("\n");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var result = validateForm();
    if (result.firstInvalidField) {
      setStatus("Please fix the highlighted fields and try again.");
      result.firstInvalidField.focus();
      return;
    }

    var values = result.values;

    if (FORM_ENDPOINT) {
      setStatus("Sending your request...");
      if (submitButton) {
        submitButton.disabled = true;
      }

      fetch(FORM_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Form submission failed");
          }
          window.location.href = "thanks.html";
        })
        .catch(function () {
          setStatus("We could not send the form. Please call or email us directly.");
        })
        .finally(function () {
          if (submitButton) {
            submitButton.disabled = false;
          }
        });
      return;
    }

    var subject = encodeURIComponent("Consultation request");
    var body = encodeURIComponent(buildEmailBody(values));
    window.location.href = "mailto:" + BUSINESS_EMAIL + "?subject=" + subject + "&body=" + body;
    setStatus("Your email app should open with the request details. Please send the email to complete your request.");
  });
}());
