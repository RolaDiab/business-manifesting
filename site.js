// Waitlist forms. Each .signup block carries data-list ("summit" or "circle"). Each signup:
// (1) lead alert email to Rola via the convictioncode.com email system (Lovable Cloud),
// (2) GHL, once GHL_WEBHOOK_URL is set (needs a GHL workflow with an Inbound Webhook trigger).
(function () {
  var CONFIG = {
    GHL_WEBHOOK_URL: "",
    EMAIL_FUNCTION_URL: "https://zyonpiskcpoiwhkgxdjp.supabase.co/functions/v1/send-transactional-email",
    PUBLIC_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5b25waXNrY3BvaXdoa2d4ZGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NTM0MDgsImV4cCI6MjA4NDIyOTQwOH0.2AdGgTflahS0Y_jO66BmH4b8n5PwDp-0wtQPtFPh_BI"
  };

  var params = new URLSearchParams(location.search);
  var source = params.get("utm_source") || (document.referrer ? new URL(document.referrer).hostname : "direct");

  function send(v, list) {
    var jobs = [];
    jobs.push(fetch(CONFIG.EMAIL_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": CONFIG.PUBLIC_KEY, "Authorization": "Bearer " + CONFIG.PUBLIC_KEY },
      body: JSON.stringify({
        templateName: "application-submission",
        templateData: {
          name: v.first_name + " " + v.last_name, email: v.email, phone: "", role: "Not given",
          message: list.toUpperCase() + " WAITLIST signup from businessmanifesting.com" + location.pathname + ". Source: " + source + "."
        }
      }),
      keepalive: true
    }).catch(function () {}));

    if (CONFIG.GHL_WEBHOOK_URL) {
      jobs.push(fetch(CONFIG.GHL_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: v.first_name, last_name: v.last_name, email: v.email, list: list, utm_source: source, tags: list + "-waitlist" }),
        keepalive: true
      }).catch(function () {}));
    }
    return Promise.race([Promise.all(jobs), new Promise(function (r) { setTimeout(r, 4000); })]);
  }

  // Bot filter. Flagged signups still see the success screen, but nothing is sent.
  var loadedAt = Date.now();
  function looksLikeBot(v, form) {
    if (form.website && form.website.value) return true;                 // hidden trap field filled
    if (Date.now() - loadedAt < 3000) return true;                        // submitted inhumanly fast
    var names = (v.first_name + " " + v.last_name).split(/\s+/);
    if (names.some(function (w) { return (w.slice(1).match(/[A-Z]/g) || []).length >= 2; })) return true; // "OaVUampAcyq"
    var parts = v.email.toLowerCase().split("@");
    if (/^(gmail|googlemail)\.com$/.test(parts[1]) && (parts[0].match(/\./g) || []).length >= 3) return true; // "si.z.i.q.eyu76@gmail.com"
    return false;
  }

  Array.prototype.forEach.call(document.querySelectorAll(".signup"), function (block) {
    var form = block.querySelector("form");
    var errorEl = block.querySelector(".error");
    var list = block.getAttribute("data-list");

    var trap = document.createElement("input");
    trap.type = "text"; trap.name = "website"; trap.tabIndex = -1; trap.autocomplete = "off";
    trap.setAttribute("aria-hidden", "true");
    trap.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;opacity:0;";
    form.appendChild(trap);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = { first_name: form.first_name.value.trim(), last_name: form.last_name.value.trim(), email: form.email.value.trim() };
      errorEl.textContent = "";
      if (!v.first_name) { errorEl.textContent = "Please add your first name."; return; }
      if (!v.last_name) { errorEl.textContent = "Please add your last name."; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) { errorEl.textContent = "Please add a valid email."; return; }
      if (!form.consent.checked) { errorEl.textContent = "Please tick the box so we can send you updates."; return; }

      var btn = form.querySelector("button");
      btn.disabled = true;
      btn.textContent = "Saving your spot...";
      (looksLikeBot(v, form) ? Promise.resolve() : send(v, list)).then(function () {
        block.querySelector(".done-name").textContent = v.first_name;
        form.hidden = true;
        block.querySelector(".done").hidden = false;
      });
    });
  });
})();
