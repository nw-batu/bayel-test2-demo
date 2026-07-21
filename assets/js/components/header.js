import { compassMark } from "./compass.js";
import { getFocusable, qs, qsa } from "../core/dom.js";
import { route } from "../core/path.js";
import { navigation } from "../data/navigation.js";

function isCurrentPage(item, page) {
  if (page === "project" && item.key === "projects") return true;
  return item.key === page;
}

export function mountHeader() {
  const host = qs("[data-site-header]");
  if (!host) return null;

  const page = document.body.dataset.page || "home";
  const navMarkup = navigation
    .map(
      (item) => `
        <a class="site-nav__link" href="${route(item.path)}" ${isCurrentPage(item, page) ? 'aria-current="page"' : ""}>
          ${item.label}
        </a>`,
    )
    .join("");

  const mobileMarkup = navigation
    .map(
      (item) => `
        <a class="mobile-menu__link" href="${route(item.path)}" ${isCurrentPage(item, page) ? 'aria-current="page"' : ""}>
          ${item.label}
        </a>`,
    )
    .join("");

  host.className = "site-header";
  host.innerHTML = `
    <div class="site-header__inner">
      <a class="brand" href="${route("")}" aria-label="Bayel Yapı ana sayfa">
        <span class="brand-compass" aria-hidden="true">${compassMark("", "hdr")}</span>
        <span class="brand-copy"><span>Bayel</span><span>Yapı</span></span>
      </a>

      <nav class="site-nav" aria-label="Ana menü">${navMarkup}</nav>

      <button class="menu-toggle" type="button" aria-label="Menüyü aç" aria-expanded="false" aria-controls="mobile-menu">
        <span></span><span></span><span></span>
      </button>
    </div>

    <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
      <div class="mobile-menu__inner">
        <nav class="mobile-menu__nav" aria-label="Mobil menü">${mobileMarkup}</nav>
        <a class="mobile-menu__email" href="mailto:info@bayelyapi.com">info@bayelyapi.com</a>
      </div>
    </div>`;

  const toggle = qs(".menu-toggle", host);
  const menu = qs(".mobile-menu", host);
  let lastFocused = null;

  const setOpen = (open) => {
    lastFocused = open ? document.activeElement : lastFocused;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
    menu.setAttribute("aria-hidden", String(!open));
    menu.classList.toggle("is-open", open);
    host.classList.toggle("is-menu-open", open);
    document.body.classList.toggle("is-locked", open);

    if (open) {
      window.setTimeout(() => getFocusable(menu)[0]?.focus(), 120);
    } else if (lastFocused instanceof HTMLElement) {
      lastFocused.focus();
    }
  };

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  qsa("a", menu).forEach((link) => link.addEventListener("click", () => setOpen(false)));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
    }

    if (event.key !== "Tab" || toggle.getAttribute("aria-expanded") !== "true") return;
    const focusable = getFocusable(menu);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 650 && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
    }
  });

  return host;
}
