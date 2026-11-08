// Phone menu: the ☰ button opens and closes the link list; tapping a link closes it.
(function () {
  var nav = document.querySelector(".nav"), btn = nav && nav.querySelector(".nav-toggle");
  if (!btn) return;
  btn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
  nav.querySelectorAll(".nav-links a").forEach(function (a) {
    a.addEventListener("click", function () { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); });
  });
})();
