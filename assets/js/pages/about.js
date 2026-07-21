import { qs } from "../core/dom.js";
import { asset } from "../core/path.js";
import { createModalController } from "../components/modal.js";
import { companyRoles } from "../data/company-roles.js";
import { testimonials } from "../data/testimonials.js";

function initRoles() {
  const grid = qs("[data-role-grid]");
  if (!grid) return;
  const modal = createModalController();

  companyRoles.forEach((role) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "role-card";
    card.innerHTML = `
      <span class="role-card__media image-frame">
        <img src="${asset(`img/${role.image}`)}" alt="${role.title} rolünü temsil eden yapı detayı" loading="lazy">
        <span class="role-card__plus" aria-hidden="true">+</span>
      </span>
      <span class="role-card__title">${role.title}<span aria-hidden="true">↗</span></span>`;
    card.addEventListener("click", () => modal.open({ ...role, alt: role.title }, card));
    grid.append(card);
  });
}

function initTestimonials() {
  const quote = qs("[data-testimonial-quote]");
  const author = qs("[data-testimonial-author]");
  const counter = qs("[data-testimonial-counter]");
  const previous = qs("[data-testimonial-prev]");
  const next = qs("[data-testimonial-next]");
  if (!quote || !author || !counter) return;

  let index = 0;

  const render = () => {
    quote.textContent = `“${testimonials[index].quote}”`;
    author.textContent = testimonials[index].author;
    counter.textContent = `${index + 1} / ${testimonials.length}`;
  };

  previous?.addEventListener("click", () => {
    index = (index - 1 + testimonials.length) % testimonials.length;
    render();
  });
  next?.addEventListener("click", () => {
    index = (index + 1) % testimonials.length;
    render();
  });
  render();
}

export function initAboutPage() {
  initRoles();
  initTestimonials();
}
