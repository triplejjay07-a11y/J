(function () {
  var CONTACT_EMAIL = "PR@gmail.com";
  var FORMSPREE_ENDPOINT = "";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setText(id, value) {
    var element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
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
      if (event.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function setupDates() {
    var now = new Date();
    setText("year", String(now.getFullYear()));
    setText("policy-date", now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }));
  }

  function setupConsultationForm() {
    var form = document.getElementById("consultation-form");
    if (!form) {
      return;
    }

    form.noValidate = true;

    var status = document.getElementById("form-status");
    var fields = {
      name: document.getElementById("name"),
      phone: document.getElementById("phone"),
      email: document.getElementById("email"),
      service: document.getElementById("service"),
      message: document.getElementById("message")
    };

    function setError(name, message) {
      var error = document.getElementById("err-" + name);
      var field = fields[name];

      if (error) {
        error.textContent = message;
      }
      if (field) {
        field.setAttribute("aria-invalid", message ? "true" : "false");
      }
    }

    function value(name) {
      return fields[name] ? fields[name].value.trim() : "";
    }

    function validate() {
      var firstInvalid = null;
      var checks = [
        ["name", value("name") ? "" : "Please enter your name."],
        ["phone", value("phone") ? "" : "Please enter your phone number."],
        ["email", fields.email && fields.email.validity.valid && value("email") ? "" : "Please enter a valid email address."],
        ["service", value("service") ? "" : "Please choose a service."]
      ];

      checks.forEach(function (check) {
        setError(check[0], check[1]);
        if (check[1] && !firstInvalid) {
          firstInvalid = fields[check[0]];
        }
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return false;
      }

      return true;
    }

    function formBody() {
      return [
        "New consultation request",
        "",
        "Name: " + value("name"),
        "Phone: " + value("phone"),
        "Email: " + value("email"),
        "Service: " + value("service"),
        "Message: " + (value("message") || "(none provided)")
      ].join("\n");
    }

    function showStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!validate()) {
        showStatus("Please fix the highlighted fields.");
        return;
      }

      if (FORMSPREE_ENDPOINT) {
        showStatus("Sending your request...");

        fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: value("name"),
            phone: value("phone"),
            email: value("email"),
            service: value("service"),
            message: value("message")
          })
        }).then(function (response) {
          if (!response.ok) {
            throw new Error("Form submission failed");
          }
          window.location.href = "thanks.html";
        }).catch(function () {
          showStatus("We could not send the form. Please call 901-237-8890 or email " + CONTACT_EMAIL + ".");
        });

        return;
      }

      showStatus("Opening your email app. Please send the prefilled message to complete your request.");
      window.location.href = "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent("Consultation request") +
        "&body=" + encodeURIComponent(formBody());
    });
  }

  ready(function () {
    setupNavigation();
    setupDates();
    setupConsultationForm();
  });
}());
