import { qs } from "../core/dom.js";
import { prefersReducedMotion, scheduleFrame } from "../core/motion.js";
import { asset } from "../core/path.js";
import { compassMark } from "../components/compass.js";
import { createModalController } from "../components/modal.js";
import { destinations } from "../data/destinations.js";

function initDestinations() {
  const map = qs("[data-destination-map]");
  const list = qs("[data-destination-list]");
  if (!map || !list) return;

  map.insertAdjacentHTML("beforeend", compassMark("destination-map__compass", "map"));

  const modal = createModalController();

  const openDestination = (destination, trigger) => {
    modal.open(
      {
        title: destination.name,
        eyebrow: `${destination.region} · ${destination.roleLabel}`,
        image: destination.image,
        alt: `${destination.name} bölgesini temsil eden İstanbul yapısı`,
        description: destination.description,
        items: [`Bölge: ${destination.region}`, `Üstlenilen rol: ${destination.roleLabel}`],
      },
      trigger,
    );
  };

  destinations.forEach((destination, index) => {
    const point = document.createElement("button");
    point.type = "button";
    point.className = "destination-map__point";
    point.dataset.role = destination.role;
    point.style.left = `${destination.x}%`;
    point.style.top = `${destination.y}%`;
    point.setAttribute("aria-label", `${destination.name} ayrıntısını aç`);
    point.addEventListener("click", () => openDestination(destination, point));
    map.append(point);

    const item = document.createElement("button");
    item.type = "button";
    item.className = "destination-list__item";
    item.innerHTML = `
      <span class="destination-list__index">${String(index + 1).padStart(2, "0")}</span>
      <span class="destination-list__name">${destination.name}</span>
      <span class="destination-list__meta">${destination.roleLabel}</span>`;
    item.addEventListener("click", () => openDestination(destination, item));
    list.append(item);
  });
}

function initMosaicMotion() {
  const section = qs("[data-mosaic-scroll]");
  if (!section || prefersReducedMotion()) return;

  const grid = qs(".mosaic", section);
  const items = Array.from(section.querySelectorAll(".mosaic__item"));
  const center = items[2];
  const centerImg = center ? center.querySelector("img") : null;
  const caption = qs(".mosaic-scroll__caption", section);
  if (!grid || !center || !centerImg) return;

  const easeInOut = (t) => (t < .5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2);
  let targetScale = 1;
  let ticking = false;

  const measure = () => {
    if (window.innerWidth < 650) return;
    grid.style.transform = "none";
    const r = center.getBoundingClientRect();
    targetScale = window.innerWidth > window.innerHeight
      ? window.innerWidth / r.width
      : window.innerHeight / r.height;
    grid.style.willChange = "transform";
    centerImg.style.transition = "none";
  };

  const update = () => {
    ticking = false;
    if (window.innerWidth < 650) {
      grid.style.transform = "";
      items.forEach((item) => { item.style.transform = ""; item.style.opacity = ""; });
      centerImg.style.transform = "";
      if (caption) caption.style.opacity = "";
      return;
    }
    const rect = section.getBoundingClientRect();
    const range = Math.max(1, section.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -rect.top / range));
    const eased = easeInOut(progress);

    grid.style.transform = `scale(${(1 + (targetScale - 1) * eased).toFixed(4)})`;
    centerImg.style.transform = `scale(${(1.18 - .18 * eased).toFixed(4)})`;

    items.forEach((item, index) => {
      if (index === 2) return;
      item.style.transform = `scale(${(1 - .25 * eased).toFixed(4)})`;
      item.style.opacity = String(Math.max(0, 1 - 1.15 * eased).toFixed(3));
    });
    if (caption) caption.style.opacity = String(Math.max(0, 1 - 1.6 * eased).toFixed(3));
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    scheduleFrame(update);
  };

  measure();
  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", () => { measure(); requestUpdate(); });
  window.addEventListener("load", () => { measure(); requestUpdate(); }, { once: true });
}

export function initHomePage() {
  initDestinations();
  initMosaicMotion();

  const promoMark = qs(".brand-promo__mark");
  if (promoMark) {
    promoMark.classList.remove("brand-mark");
    promoMark.innerHTML = compassMark("brand-promo__compass", "promo");
  }

  qs("[data-home-hero-image]")?.setAttribute("src", asset("img/hero-konut.jpg"));
}
