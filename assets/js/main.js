document.querySelectorAll(".current-year").forEach(function (el) {
  el.textContent = new Date().getFullYear();
});

const faqButtons = document.querySelectorAll(".faq-question");

function setOpen(button, open) {
  const answer = document.getElementById(button.getAttribute("aria-controls"));
  button.setAttribute("aria-expanded", String(open));
  answer.hidden = !open;
}

faqButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const wasOpen = button.getAttribute("aria-expanded") === "true";
    faqButtons.forEach(function (other) {
      setOpen(other, false);
    });
    if (!wasOpen) {
      setOpen(button, true);
    }
  });
});
