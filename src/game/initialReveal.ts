export const revealKingdom = (shell: HTMLElement): void => {
  shell.classList.remove("is-loading");
  shell.classList.add("is-ready");
};
