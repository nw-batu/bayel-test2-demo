import { qs } from "../core/dom.js";

const INTRO_FIRST_MS = 3600;
const INTRO_NEXT_MS = 900;
const SEEN_KEY = "bayel-intro-seen";

function introDuration() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
  try {
    if (sessionStorage.getItem(SEEN_KEY)) return INTRO_NEXT_MS;
    sessionStorage.setItem(SEEN_KEY, "1");
    return INTRO_FIRST_MS;
  } catch {
    return INTRO_NEXT_MS;
  }
}

export function mountLoader() {
  const loader = qs("[data-page-loader]");
  const transition = document.createElement("div");
  transition.className = "page-transition";
  transition.setAttribute("aria-hidden", "true");
  document.body.append(transition);

  if (loader && !qs(".page-loader__word", loader)) {
    const word = document.createElement("span");
    word.className = "page-loader__word";
    word.setAttribute("aria-hidden", "true");
    word.innerHTML = "<span>Bayel</span><span>Yapı</span>";
    loader.append(word);
  }

  const startedAt = performance.now();
  const minDuration = introDuration();
  loader?.classList.add("is-intro");

  const finish = () => {
    const elapsed = performance.now() - startedAt;
    const wait = Math.max(0, minDuration - elapsed);
    window.setTimeout(() => {
      loader?.classList.add("is-complete");
      document.documentElement.classList.add("intro-done");
      document.dispatchEvent(new CustomEvent("bayel:loader-complete"));
    }, wait);
  };

  if (document.readyState === "complete") finish();
  else window.addEventListener("load", finish, { once: true });

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("a[href]");
    if (!link || link.target === "_blank" || link.hasAttribute("download") || link.dataset.noTransition !== undefined) return;

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin || url.protocol === "mailto:" || url.protocol === "tel:") return;
    if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return;

    event.preventDefault();
    transition.classList.add("is-active");
    window.setTimeout(() => {
      window.location.href = url.href;
    }, 420);
  });
}
