document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const primaryNav = document.querySelector("#primary-nav");

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = primaryNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    primaryNav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement && window.innerWidth <= 780) {
        primaryNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  const gameRoot = document.querySelector("[data-snake-game]");
  if (gameRoot && typeof window.SnakeGame === "function") {
    const game = new window.SnakeGame(gameRoot);
    game.mount();
  }
});
