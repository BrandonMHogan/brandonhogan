const avatar = document.querySelector<HTMLElement>(".avatar");

avatar?.addEventListener("click", () => {
  avatar.classList.toggle("spin");
});
