(function () {
  var navToggle = document.querySelector(".nav-toggle");
  var siteNav = document.getElementById("site-nav");
  var year = document.getElementById("year");
  var policyDate = document.getElementById("policy-date");
  var form = document.getElementById("consultation-form");
  var formStatus = document.getElementById("form-status");
  var formspreeEndpoint = "";

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  if (policyDate) {
    policyDate.textContent = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var isExpanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isExpanded));
      siteNav.classList.toggle("open", !isExpanded);
    });

    siteNav.addEventListener("click", function (event) {
      if (event.target && event.target.tagName === "A") {
        navToggle.setAttribute("aria-expanded", "false");
        siteNav.classList.remove("open");
      }
    });
  }

  function setError(fieldName, message) {
    var error = document.getElementById("err-" + fieldName);
    var field = document.getElementById(fieldName);

    if (error) {
      error.textContent = message;
    }

    if (field) {
      field.setAttribute("aria-invalid", message ? "true" : "false");
    }
  }

  function buildMailtoUrl(data) {
    var subject = encodeURIComponent("Consultation request from " + data.name);
    var body = encodeURIComponent(
      "Name: " + data.name + "\n" +
      "Phone: " + data.phone + "\n" +
      "Email: " + data.email + "\n" +
      "Service: " + data.service + "\n\n" +
      "Message:\n" + (data.message || "No message provided.")
    );

    return "mailto:PR@gmail.com?subject=" + subject + "&body=" + body;
  }

  function validate(data) {
    var isValid = true;

    setError("name", "");
    setError("phone", "");
    setError("email", "");
    setError("service", "");

    if (!data.name) {
      setError("name", "Please enter your name.");
      isValid = false;
    }

    if (!data.phone) {
      setError("phone", "Please enter your phone number.");
      isValid = false;
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setError("email", "Please enter a valid email address.");
      isValid = false;
    }

    if (!data.service) {
      setError("service", "Please choose a service.");
      isValid = false;
    }

    return isValid;
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var data = {
        name: form.elements.name.value.trim(),
        phone: form.elements.phone.value.trim(),
        email: form.elements.email.value.trim(),
        service: form.elements.service.value,
        message: form.elements.message.value.trim()
      };

      if (!validate(data)) {
        if (formStatus) {
          formStatus.textContent = "Please fix the highlighted fields.";
        }
        return;
      }

      if (formStatus) {
        formStatus.textContent = "Opening your email app...";
      }

      if (formspreeEndpoint) {
        fetch(formspreeEndpoint, {
          method: "POST",
          headers: { "Accept": "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(data)
        }).then(function (response) {
          if (!response.ok) {
            throw new Error("Form submission failed.");
          }
          window.location.href = "thanks.html";
        }).catch(function () {
          window.location.href = buildMailtoUrl(data);
        });
        return;
      }

      window.location.href = buildMailtoUrl(data);
    });
  }
}());
