// Work With Us inquiry form. Emails each inquiry to Rola through the convictioncode.com email system.
(function () {
  var CONFIG = {
    EMAIL_FUNCTION_URL: "https://zyonpiskcpoiwhkgxdjp.supabase.co/functions/v1/send-transactional-email",
    PUBLIC_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5b25waXNrY3BvaXdoa2d4ZGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NTM0MDgsImV4cCI6MjA4NDIyOTQwOH0.2AdGgTflahS0Y_jO66BmH4b8n5PwDp-0wtQPtFPh_BI"
  };
  var form = document.getElementById("inquiry");
  var errorEl = form.querySelector(".error");

  // Offer links preselect the matching interest in the form.
  Array.prototype.forEach.call(document.querySelectorAll("[data-interest]"), function (link) {
    link.addEventListener("click", function () { form.interest.value = link.getAttribute("data-interest"); });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = {
      first_name: form.first_name.value.trim(),
      last_name: form.last_name.value.trim(),
      email: form.email.value.trim(),
      company: form.company.value.trim(),
      interest: form.interest.value,
      message: form.message.value.trim()
    };
    var err = !v.first_name ? "Please add your first name." :
      !v.last_name ? "Please add your last name." :
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email) ? "Please add a valid email." :
      !v.company ? "Please add your company." :
      !v.interest ? "Please choose what you're interested in." : "";
    errorEl.textContent = err;
    if (err) return;

    var btn = form.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Sending...";
    var send = fetch(CONFIG.EMAIL_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": CONFIG.PUBLIC_KEY, "Authorization": "Bearer " + CONFIG.PUBLIC_KEY },
      body: JSON.stringify({
        templateName: "application-submission",
        templateData: {
          name: v.first_name + " " + v.last_name, email: v.email, phone: "", role: v.company,
          message: "WORK WITH US INQUIRY from businessmanifesting.com\nInterested in: " + v.interest + "\n\n" + (v.message || "No message")
        }
      }),
      keepalive: true
    }).catch(function () {});
    Promise.race([send, new Promise(function (r) { setTimeout(r, 4000); })]).then(function () {
      document.querySelector("#inquiry-done .done-name").textContent = v.first_name;
      form.hidden = true;
      document.getElementById("inquiry-done").hidden = false;
    });
  });
})();
