import { qs, qsa } from "../core/dom.js";
import { rememberFlip } from "../core/flip.js";
import { asset, projectRoute } from "../core/path.js";
import { projectCategories, projects } from "../data/projects.js";

function projectCard(project) {
  const article = document.createElement("article");
  article.className = "project-card";
  article.dataset.category = project.category;
  article.innerHTML = `
    <a class="project-card__link" href="${projectRoute(project.slug)}">
      <div class="project-card__media image-frame" data-flip-id="project-${project.slug}">
        <img src="${asset(`img/${project.image}`)}" alt="${project.title} — ${project.location}" loading="lazy">
      </div>
      <h2 class="project-card__title">
        <span>${project.title}</span><span class="project-card__category">${project.categoryLabel}</span>
      </h2>
    </a>`;
  return article;
}

function mobileCard(project) {
  const link = document.createElement("a");
  link.className = "mobile-project-card";
  link.dataset.category = project.category;
  link.href = projectRoute(project.slug);
  link.innerHTML = `
    <span class="mobile-project-card__media image-frame">
      <img src="${asset(`img/${project.image}`)}" alt="${project.title} — ${project.location}" loading="lazy">
    </span>
    <span class="mobile-project-card__sr-title">${project.title}</span>`;
  return link;
}

function initRailMotion(rail) {
  rail.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      rail.scrollLeft += event.deltaY;
    },
    { passive: false },
  );

  let dragging = false;
  let startX = 0;
  let startScroll = 0;

  rail.addEventListener("pointerdown", (event) => {
    dragging = true;
    startX = event.clientX;
    startScroll = rail.scrollLeft;
    rail.setPointerCapture(event.pointerId);
  });
  rail.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    rail.scrollLeft = startScroll - (event.clientX - startX);
  });
  rail.addEventListener("pointerup", () => { dragging = false; });
  rail.addEventListener("pointercancel", () => { dragging = false; });
}

export function initProjectsPage() {
  const filters = qs("[data-project-filters]");
  const rail = qs("[data-project-rail]");
  const mobileList = qs("[data-mobile-project-list]");
  if (!filters || !rail || !mobileList) return;

  projectCategories.forEach((category, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pill";
    button.dataset.filter = category.id;
    button.setAttribute("aria-pressed", String(index === 0));
    button.textContent = category.label;
    filters.append(button);
  });

  projects.forEach((project) => {
    rail.append(projectCard(project));
    mobileList.append(mobileCard(project));
  });

  qsa(".project-card", rail).forEach((card) => {
    card.addEventListener("mouseenter", () => {
      rail.classList.add("has-hover");
      card.classList.add("is-hovered");
    });
    card.addEventListener("mouseleave", () => {
      rail.classList.remove("has-hover");
      card.classList.remove("is-hovered");
    });
  });

  const applyFilter = (category) => {
    qsa("[data-filter]", filters).forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.filter === category));
    });

    [...qsa(".project-card", rail), ...qsa(".mobile-project-card", mobileList)].forEach((card) => {
      card.hidden = category !== "all" && card.dataset.category !== category;
    });

    const firstVisible = qsa(".project-card", rail).find((card) => !card.hidden);
    firstVisible?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (button) applyFilter(button.dataset.filter);
  });

  initRailMotion(rail);

  const captureFlip = (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;
    const slug = new URL(link.href, window.location.href).searchParams.get("slug");
    const img = link.querySelector("img");
    if (slug && img) rememberFlip(slug, img);
  };
  rail.addEventListener("click", captureFlip);
  mobileList.addEventListener("click", captureFlip);
}
