// Site analytics (Plausible: no cookies, so no consent banner needed).
//
// TO SWITCH ON: in Plausible, add the site businessmanifesting.com, open
// Site settings > Site installation, and copy the script address from the snippet
// (it looks like https://plausible.io/js/pa-XXXXXXXX.js). Paste it below.
// Until then this file does nothing except queue events, so the site works the same.
//
// Events sent (add each one as a goal in Plausible to see it on the dashboard):
//   Coaching Application   props: qualified = yes | no
//   Team Inquiry           the Work With Us form
//   Waitlist Signup        props: list = live | summit | circle | ...
//   Assessment Click       any link to the free assessment (quiz.convictioncode.com)
//   Checkout Click         any payment link; props: page = where the click came from
(function () {
  "use strict";
  var PLAUSIBLE_SRC = "";

  var w = window;
  w.plausible = w.plausible || function () { (w.plausible.q = w.plausible.q || []).push(arguments); };
  w.plausible.init = w.plausible.init || function (o) { w.plausible.o = o || {}; };

  if (PLAUSIBLE_SRC) {
    var s = document.createElement("script");
    s.async = true;
    s.src = PLAUSIBLE_SRC;
    // Older Plausible snippets (script.js) need the site name; newer pa- snippets don't.
    if (/\/js\/script[.\w-]*\.js$/.test(PLAUSIBLE_SRC)) s.setAttribute("data-domain", "businessmanifesting.com");
    document.head.appendChild(s);
    w.plausible.init();
  }

  // Shared helper for the form scripts. Never throws.
  w.bmTrack = function (name, props) {
    try { w.plausible(name, props ? { props: props } : undefined); } catch (e) {}
  };

  // Off-site links: count the click, and tag assessment links with where the visitor came
  // from, so quiz sign-ups can be traced back to this site.
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.hostname === "quiz.convictioncode.com") {
      if (!url.searchParams.has("utm_source")) {
        url.searchParams.set("utm_source", "businessmanifesting.com");
        url.searchParams.set("utm_medium", "website");
        url.searchParams.set("utm_content", location.pathname);
        a.href = url.toString();
      }
      w.bmTrack("Assessment Click", { page: location.pathname });
    } else if (url.hostname === "link.fastpaydirect.com") {
      w.bmTrack("Checkout Click", { page: location.pathname });
    }
  }, true);
})();
