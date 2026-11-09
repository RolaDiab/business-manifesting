(function () {
  "use strict";
  // Qualifying application for one-to-one coaching. Same questions and gate as
  // quiz.convictioncode.com/apply. Every application is emailed to Rola; only qualified
  // applicants ($150K+ income or revenue, starting within 3 months, ready to invest) see the calendar.
  var CONFIG = {
    EMAIL_FUNCTION_URL: "https://zyonpiskcpoiwhkgxdjp.supabase.co/functions/v1/send-transactional-email",
    EVENTS_URL: "https://zyonpiskcpoiwhkgxdjp.supabase.co/rest/v1/quiz_events",
    PUBLIC_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5b25waXNrY3BvaXdoa2d4ZGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NTM0MDgsImV4cCI6MjA4NDIyOTQwOH0.2AdGgTflahS0Y_jO66BmH4b8n5PwDp-0wtQPtFPh_BI",
    BOOKING_URL: "https://api.leadconnectorhq.com/widget/booking/T5FW8VnbAbvoi3C1zAuA",
    QUIZ_URL: "https://quiz.convictioncode.com/?utm_source=businessmanifesting.com"
  };
  var root = document.getElementById("apply");
  var params = new URLSearchParams(location.search);
  var source = "businessmanifesting.com" + (params.get("utm_source") ? " / " + params.get("utm_source") : "");

  function track(event) {
    try {
      fetch(CONFIG.EVENTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": CONFIG.PUBLIC_KEY, "Authorization": "Bearer " + CONFIG.PUBLIC_KEY, "Prefer": "return=minimal" },
        body: JSON.stringify({ event: event, source: source.slice(0, 100) }),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }

  var TYPE = ["1:1 private coaching", "Group coaching", "Not sure yet, help me choose"];
  var ROLE = ["Founder or CEO", "Business owner or entrepreneur", "C-suite executive", "VP or director", "Senior manager", "Consultant or advisor", "Other"];
  var START = ["Right away", "In the next 30 days", "In 1 to 3 months", "I'm just exploring"];
  var ENERGY = ["Very open. I've done energy work before", "Open and curious", "Not sure yet", "I prefer only the science-backed performance work"];
  var INCOME = ["Under $150K", "$150K to $500K", "$500K to $1M", "$1M to $5M", "$5M+"];
  var INVEST = ["Yes, if it's the right fit", "I'd need to discuss it with someone first", "Not right now"];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function radios(name, options, value) {
    return '<div class="opts">' + options.map(function (o) {
      return '<label class="opt"><input type="radio" name="' + name + '" value="' + esc(o) + '"' + (o === value ? " checked" : "") + '> <span>' + esc(o) + '</span></label>';
    }).join("") + '</div>';
  }

  function renderForm(v, error) {
    v = v || {};
    root.innerHTML =
      '<header class="hero hero-short hero-dark">' +
        '<p class="eyebrow">Apply for coaching</p>' +
        '<h1>Let\'s clear the path to <span class="gold">your biggest wins.</span></h1>' +
        '<p class="lede">1:1 or group coaching in the Business Manifesting method.<br>A few questions first, and if it\'s a fit, you\'ll book a 45-minute Performance Strategy Session right away.</p>' +
      '</header>' +
      '<section class="apply-wrap"><form id="app-form" class="apply-form" novalidate>' +
        '<fieldset><legend>Which coaching are you interested in?</legend>' + radios("type", TYPE, v.type) + '</fieldset>' +
        '<div class="two">' +
          '<label>First name<input name="first_name" autocomplete="given-name" maxlength="60" value="' + esc(v.first_name || "") + '"></label>' +
          '<label>Last name<input name="last_name" autocomplete="family-name" maxlength="60" value="' + esc(v.last_name || "") + '"></label>' +
        '</div>' +
        '<div class="two">' +
          '<label>Email<input name="email" type="email" autocomplete="email" maxlength="255" value="' + esc(v.email || "") + '"></label>' +
          '<label>Phone or WhatsApp<input name="phone" type="tel" autocomplete="tel" maxlength="40" value="' + esc(v.phone || "") + '"></label>' +
        '</div>' +
        '<label>Your role and company<input name="company" maxlength="150" placeholder="For example: CEO, Acme Group" value="' + esc(v.company || "") + '"></label>' +
        '<fieldset><legend>Which best describes your role?</legend>' + radios("role", ROLE, v.role) +
          '<input class="other-input" name="role_other" maxlength="100" placeholder="Tell us your role" aria-label="Your role"' + (v.role === "Other" ? "" : " hidden") + ' value="' + esc(v.role_other || "") + '">' +
        '</fieldset>' +
        '<fieldset><legend>What\'s going on for you right now? Share your top 3 challenges, with as much detail as you can.</legend>' +
          [1, 2, 3].map(function (n) { return '<textarea name="c' + n + '" rows="3" maxlength="1000" aria-label="Challenge ' + n + '" placeholder="' + n + '.' + (n === 1 ? ' For example: I second-guess big decisions, so I delay them for weeks and my team waits on me.' : '') + '">' + esc((v.challenges || [])[n - 1] || "") + '</textarea>'; }).join("") +
        '</fieldset>' +
        '<label>What do you want to be true 90 days from now?<textarea name="goal" rows="3" maxlength="1000">' + esc(v.goal || "") + '</textarea></label>' +
        '<fieldset><legend>Rola\'s work combines science-backed performance tools with energy clearing. How open are you to energy clearing?</legend>' + radios("energy", ENERGY, v.energy) + '</fieldset>' +
        '<fieldset><legend>When do you want to start?</legend>' + radios("start", START, v.start) + '</fieldset>' +
        '<fieldset><legend>What is your annual income, or your business revenue if you own one (USD)?</legend>' + radios("income", INCOME, v.income) + '</fieldset>' +
        '<fieldset><legend>Business Manifesting Coaching is a private, premium engagement. If it\'s the right fit, are you ready to invest now?</legend>' + radios("invest", INVEST, v.invest) + '</fieldset>' +
        (error ? '<p class="error">' + esc(error) + '</p>' : "") +
        '<button type="submit">Submit my application</button>' +
        '<p class="apply-alt">Not ready yet? <a class="link" href="' + CONFIG.QUIZ_URL + '">Take the free Performance Profile</a></p>' +
      '</form></section>';
  }

  function sendApplication(v, qualified) {
    var message =
      "COACHING APPLICATION from businessmanifesting.com\n" +
      "QUALIFIED: " + (qualified ? "YES, shown the booking calendar" : "NO, not shown the calendar") + "\n" +
      "Interested in: " + v.type + "\n\n" +
      "Role: " + (v.role === "Other" ? "Other: " + v.role_other : v.role) + "\n" +
      "Wants to start: " + v.start + "\n" +
      "Income or revenue: " + v.income + "\n" +
      "Ready to invest: " + v.invest + "\n\n" +
      "Open to energy clearing: " + v.energy + "\n\n" +
      "Top challenges:\n" + v.challenges.filter(Boolean).map(function (c, i) { return (i + 1) + ". " + c; }).join("\n") + "\n\n" +
      "90-day goal:\n" + v.goal + "\n\n" +
      "Source: " + source;
    return fetch(CONFIG.EMAIL_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + CONFIG.PUBLIC_KEY, "apikey": CONFIG.PUBLIC_KEY },
      body: JSON.stringify({
        templateName: "application-submission",
        templateData: { name: v.first_name + " " + v.last_name, email: v.email, phone: v.phone, role: v.company, message: message }
      }),
      keepalive: true
    }).catch(function () {});
  }

  function renderQualified(v) {
    root.innerHTML =
      '<header class="hero hero-short hero-dark">' +
        '<p class="eyebrow">Application received</p>' +
        '<h1>You\'re a fit, <span class="gold">' + esc(v.first_name) + '.</span></h1>' +
        '<p class="lede">Pick a time for your Performance Strategy Session. You\'ll get a confirmation by email.</p>' +
      '</header>' +
      '<section class="apply-wrap">' +
        '<div class="calendar"><iframe src="' + CONFIG.BOOKING_URL + '" title="Book your Performance Strategy Session" loading="lazy"></iframe></div>' +
        '<p class="apply-alt">Calendar not loading? <a class="link" href="' + CONFIG.BOOKING_URL + '" target="_blank" rel="noopener">Open it in a new tab</a></p>' +
      '</section>';
    window.scrollTo(0, 0);
  }

  function renderNotYet(v) {
    root.innerHTML =
      '<header class="hero hero-short hero-dark">' +
        '<p class="eyebrow">Application received</p>' +
        '<h1>Thank you, <span class="gold">' + esc(v.first_name) + '.</span></h1>' +
        '<p class="lede">Based on your answers, a strategy session isn\'t the right next step just yet. Rola reads every application, and you\'ll keep getting her insights by email.</p>' +
      '</header>' +
      '<section class="apply-wrap apply-center">' +
        '<p>In the meantime, find your biggest growth block with the free Performance Profile.</p>' +
        '<a class="btn" href="' + CONFIG.QUIZ_URL + '">Take the free Performance Profile</a>' +
        '<p class="apply-alt">Follow along on <a class="link" href="https://www.instagram.com/rolaspeaks/" target="_blank" rel="noopener">Instagram</a> and <a class="link" href="https://www.youtube.com/@Rolaspeaks" target="_blank" rel="noopener">YouTube</a></p>' +
      '</section>';
    window.scrollTo(0, 0);
  }

  root.addEventListener("submit", function (e) {
    if (e.target.id !== "app-form") return;
    e.preventDefault();
    var f = e.target;
    var pick = function (name) { var el = f.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ""; };
    var v = {
      first_name: f.first_name.value.trim().slice(0, 60),
      last_name: f.last_name.value.trim().slice(0, 60),
      email: f.email.value.trim().toLowerCase().slice(0, 255),
      phone: f.phone.value.trim().slice(0, 40),
      company: f.company.value.trim().slice(0, 150),
      type: pick("type"),
      role: pick("role"),
      role_other: (f.role_other ? f.role_other.value : "").trim().slice(0, 100),
      goal: f.goal.value.trim().slice(0, 1000),
      challenges: [f.c1.value, f.c2.value, f.c3.value].map(function (c) { return c.trim().slice(0, 1000); }),
      energy: pick("energy"),
      start: pick("start"),
      income: pick("income"),
      invest: pick("invest")
    };
    var err = !v.type ? "Please choose 1:1 or group coaching." :
      !v.first_name ? "Please enter your first name." :
      !v.last_name ? "Please enter your last name." :
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email) ? "Please enter a valid email." :
      v.phone.replace(/\D/g, "").length < 7 ? "Please enter a phone or WhatsApp number." :
      !v.company ? "Please share your role and company." :
      !v.role ? "Please choose your role." :
      v.role === "Other" && !v.role_other ? "Please tell us your role." :
      v.challenges.filter(Boolean).length < 3 ? "Please share your top 3 challenges." :
      !v.goal ? "Please tell us what you want to be true in 90 days." :
      !v.energy ? "Please answer the energy clearing question." :
      !v.start ? "Please choose when you want to start." :
      !v.income ? "Please choose your income or revenue." :
      !v.invest ? "Please answer the investment question." : "";
    if (err) {
      renderForm(v, err);
      var errEl = root.querySelector(".error");
      if (errEl) errEl.scrollIntoView({ block: "center" });
      return;
    }

    var earnsEnough = INCOME.indexOf(v.income) >= 1;
    var qualified = earnsEnough && v.start !== START[3] && v.invest !== INVEST[2];
    track("apply_submit");
    if (qualified) track("apply_qualified");
    var btn = f.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.textContent = "Submitting...";
    Promise.race([sendApplication(v, qualified), new Promise(function (r) { setTimeout(r, 4000); })]).then(function () {
      if (qualified) renderQualified(v); else renderNotYet(v);
    });
  });

  // Show the "Other" role box only when Other is picked.
  root.addEventListener("change", function (e) {
    if (e.target.name !== "role") return;
    var box = root.querySelector('input[name="role_other"]');
    if (!box) return;
    box.hidden = e.target.value !== "Other";
    if (!box.hidden) box.focus();
  });

  track("apply_view");
  renderForm();
})();
