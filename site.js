// Waitlist form. Each signup: (1) lead alert email to Rola via the convictioncode.com email
// system (Lovable Cloud), (2) a "summit_waitlist" row in the quiz_events counter table,
// (3) GHL, once GHL_WEBHOOK_URL is set (needs a GHL workflow with an Inbound Webhook trigger).
(function () {
  var CONFIG = {
    GHL_WEBHOOK_URL: "",
    EMAIL_FUNCTION_URL: "https://zyonpiskcpoiwhkgxdjp.supabase.co/functions/v1/send-transactional-email",
    EVENTS_URL: "https://zyonpiskcpoiwhkgxdjp.supabase.co/rest/v1/quiz_events",
    PUBLIC_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5b25waXNrY3BvaXdoa2d4ZGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NTM0MDgsImV4cCI6MjA4NDIyOTQwOH0.2AdGgTflahS0Y_jO66BmH4b8n5PwDp-0wtQPtFPh_BI"
  };

  var form = document.getElementById("waitlist");
  var errorEl = document.getElementById("error");
  var params = new URLSearchParams(location.search);
  var source = params.get("utm_source") || (document.referrer ? new URL(document.referrer).hostname : "direct");

  function supabaseHeaders() {
    return { "Content-Type": "application/json", "apikey": CONFIG.PUBLIC_KEY, "Authorization": "Bearer " + CONFIG.PUBLIC_KEY };
  }

  function send(v) {
    var jobs = [];
    jobs.push(fetch(CONFIG.EMAIL_FUNCTION_URL, {
      method: "POST",
      headers: supabaseHeaders(),
      body: JSON.stringify({
        templateName: "application-submission",
        templateData: {
          name: v.first_name, email: v.email, phone: "", role: v.role || "Not given",
          message: "SUMMIT WAITLIST signup from businessmanifesting.com. Source: " + source + "."
        }
      }),
      keepalive: true
    }).catch(function () {}));

    jobs.push(fetch(CONFIG.EVENTS_URL, {
      method: "POST",
      headers: Object.assign(supabaseHeaders(), { "Prefer": "return=minimal" }),
      body: JSON.stringify({ event: "summit_waitlist", source: source.slice(0, 100) }),
      keepalive: true
    }).catch(function () {}));

    if (CONFIG.GHL_WEBHOOK_URL) {
      jobs.push(fetch(CONFIG.GHL_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: v.first_name, email: v.email, role: v.role, utm_source: source, tags: "summit-waitlist" }),
        keepalive: true
      }).catch(function () {}));
    }
    return Promise.race([Promise.all(jobs), new Promise(function (r) { setTimeout(r, 4000); })]);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = {
      first_name: form.first_name.value.trim(),
      email: form.email.value.trim(),
      role: form.role.value
    };
    errorEl.textContent = "";
    if (!v.first_name) { errorEl.textContent = "Please add your first name."; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) { errorEl.textContent = "Please add a valid email."; return; }
    if (!form.consent.checked) { errorEl.textContent = "Please tick the box so we can send you updates."; return; }

    var btn = form.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Saving your spot...";
    send(v).then(function () {
      document.getElementById("done-name").textContent = v.first_name;
      form.hidden = true;
      document.getElementById("done").hidden = false;
    });
  });
})();
