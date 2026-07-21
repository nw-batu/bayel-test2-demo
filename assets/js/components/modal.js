import { getFocusable, qs } from "../core/dom.js";
import { asset } from "../core/path.js";

export function createModalController() {
  const root = qs("[data-modal-root]");
  if (!root) return { open() {}, close() {} };

  let opener = null;

  const close = () => {
    root.classList.remove("is-open");
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    opener?.focus?.();
  };

  const open = ({ title, eyebrow = "", image, alt = "", description = "", items = [] }, trigger) => {
    opener = trigger || document.activeElement;
    root.innerHTML = `
      <article class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button class="modal__close" type="button" aria-label="Pencereyi kapat">×</button>
        <div class="modal__media image-frame"><img src="${asset(`img/${image}`)}" alt="${alt || title}"></div>
        <div class="modal__body">
          <div>
            <p class="eyebrow" style="margin-bottom:2rem">${eyebrow}</p>
            <h2 class="modal__title" id="modal-title">${title}</h2>
          </div>
          <div class="modal__copy">
            <p>${description}</p>
            ${items.length ? `<ul class="modal__list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
          </div>
        </div>
      </article>`;

    root.classList.add("is-open");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    qs(".modal__close", root)?.addEventListener("click", close);
    window.setTimeout(() => getFocusable(root)[0]?.focus(), 80);
  };

  root.addEventListener("click", (event) => {
    if (event.target === root) close();
  });

  document.addEventListener("keydown", (event) => {
    if (!root.classList.contains("is-open")) return;
    if (event.key === "Escape") close();

    if (event.key === "Tab") {
      const focusable = getFocusable(root);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  });

  return { open, close };
}
