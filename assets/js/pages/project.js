import { escapeHtml, qs } from "../core/dom.js";
import { playFlip } from "../core/flip.js";
import { asset, projectRoute } from "../core/path.js";
import { getNextProject, getProjectBySlug } from "../data/projects.js";

function imageMarkup(image, alt, className = "project-block__media image-frame") {
  return `<div class="${className}"><img src="${asset(`img/${image}`)}" alt="${escapeHtml(alt)}" loading="lazy"></div>`;
}

function renderBlock(block) {
  switch (block.type) {
    case "text":
      return `
        <section class="project-block project-block--text" data-reveal>
          <p class="project-block__label eyebrow">${escapeHtml(block.label)}</p>
          <div class="project-block__content">${block.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div>
        </section>`;
    case "largeText":
      return `
        <section class="project-block project-block--large-text" data-reveal>
          <p class="project-block__label eyebrow">${escapeHtml(block.label)}</p>
          <p class="project-block__content">${escapeHtml(block.text)}</p>
        </section>`;
    case "image":
      return `<section class="project-block project-block--image image-frame" data-reveal>${imageMarkup(block.image, block.alt, "")}</section>`;
    case "imagePair":
      return `<section class="project-block project-block--image-pair" data-reveal>${block.images.map((image, index) => imageMarkup(image, block.alts[index])).join("")}</section>`;
    case "fullBleedImage":
      return `<section class="project-block project-block--full-bleed-image image-frame" data-reveal><img src="${asset(`img/${block.image}`)}" alt="${escapeHtml(block.alt)}" loading="lazy"></section>`;
    case "gallery":
      return `<section class="project-block project-block--gallery" data-reveal>${block.images.map((image, index) => imageMarkup(image, block.alts[index])).join("")}</section>`;
    default:
      return "";
  }
}

export function initProjectPage() {
  const params = new URLSearchParams(window.location.search);
  const project = getProjectBySlug(params.get("slug"));
  const nextProject = getNextProject(project.slug);

  document.title = `${project.title} — Bayel Yapı`;

  const heroImage = qs("[data-project-hero-image]");
  if (heroImage) {
    heroImage.src = asset(`img/${project.hero}`);
    heroImage.alt = `${project.title} kapak görseli`;
    playFlip(project.slug, heroImage);
  }

  qs("[data-project-category]").textContent = project.categoryLabel;
  qs("[data-project-title]").textContent = project.title;
  qs("[data-project-lead]").textContent = project.lead;
  qs("[data-project-location]").textContent = project.location;
  qs("[data-project-year]").textContent = project.year;
  qs("[data-project-role]").textContent = project.role;

  const blocks = qs("[data-project-blocks]");
  if (blocks) blocks.innerHTML = project.blocks.map(renderBlock).join("");

  const nextLink = qs("[data-next-project]");
  if (nextLink) {
    nextLink.href = projectRoute(nextProject.slug);
    qs("[data-next-project-name]", nextLink).textContent = nextProject.title;
    const image = qs("[data-next-project-image]", nextLink);
    image.src = asset(`img/${nextProject.image}`);
    image.alt = `${nextProject.title} küçük görseli`;
  }
}
