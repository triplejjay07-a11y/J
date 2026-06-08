(function () {
  var currentYear = new Date().getFullYear();
  var yearNodes = document.querySelectorAll("#year");

  yearNodes.forEach(function (node) {
    node.textContent = currentYear;
  });

  var policyDate = document.getElementById("policy-date");
  if (policyDate) {
    policyDate.textContent = new Date(document.lastModified).toLocaleDateString("en-US", {
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

  function setError(fieldName, message) {
    var errorNode = document.getElementById("err-" + fieldName);
    if (errorNode) {
      errorNode.textContent = message;
    }
  }

  function fieldValue(fieldName) {
    var field = form.elements[fieldName];
    return field ? field.value.trim() : "";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    ["name", "phone", "email", "service"].forEach(function (fieldName) {
      setError(fieldName, "");
    });

    var values = {
      name: fieldValue("name"),
      phone: fieldValue("phone"),
      email: fieldValue("email"),
      service: fieldValue("service"),
      message: fieldValue("message")
    };

    var hasError = false;
    if (!values.name) {
      setError("name", "Please enter your name.");
      hasError = true;
    }
    if (!values.phone) {
      setError("phone", "Please enter your phone number.");
      hasError = true;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      setError("email", "Please enter a valid email address.");
      hasError = true;
    }
    if (!values.service) {
      setError("service", "Please choose a service.");
      hasError = true;
    }

    if (hasError) {
      if (status) {
        status.textContent = "Please fix the highlighted fields.";
      }
      return;
    }

    var body = [
      "Name: " + values.name,
      "Phone: " + values.phone,
      "Email: " + values.email,
      "Service: " + values.service,
      "",
      "Message:",
      values.message || "(none)"
    ].join("\n");

    if (status) {
      status.textContent = "Opening your email app to send the request.";
    }

    window.location.href = "mailto:PR@gmail.com?subject=" +
      encodeURIComponent("Consultation request") +
      "&body=" + encodeURIComponent(body);
  });
})();
