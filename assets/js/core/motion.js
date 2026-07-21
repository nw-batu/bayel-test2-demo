import { qsa } from "./dom.js";

function splitIntoWords(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.textContent.trim() && !node.parentElement.closest(".rl-w")
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach((node) => {
    const frag = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        frag.append(document.createTextNode(part));
        return;
      }
      const span = document.createElement("span");
      span.className = "rl-w";
      span.textContent = part;
      frag.append(span);
    });
    node.replaceWith(frag);
  });

  return qsa(".rl-w", el);
}

function applyLineDelays(el, words) {
  let lineTop = null;
  let line = -1;
  words.forEach((word) => {
    const top = word.offsetTop;
    if (lineTop === null || Math.abs(top - lineTop) > 4) {
      line += 1;
      lineTop = top;
    }
    word.style.setProperty("--rl-delay", `${line * 110}ms`);
  });
}

function prepareLineReveals(reduceMotion) {
  qsa('[data-reveal="lines"]').forEach((el) => {
    if (reduceMotion) return;
    const words = splitIntoWords(el);
    if (!words.length) return;
    applyLineDelays(el, words);
    el.classList.add("rl-ready");
  });
}

export function scheduleFrame(cb) {
  let done = false;
  const run = () => { if (done) return; done = true; cb(); };
  const rafId = window.requestAnimationFrame(() => { window.clearTimeout(tId); run(); });
  const tId = window.setTimeout(() => { window.cancelAnimationFrame(rafId); run(); }, 66);
}

export function prefersReducedMotion() {
  return window.location.search.includes("motion=calm");
}

function openCurtain(el) {
  if (!el.matches("figure[data-reveal], .image-frame[data-reveal]")) return;
  el.style.clipPath = "inset(0 0 0 0)";
  if (el.hasAttribute("data-pan") || el.hasAttribute("data-parallax")) return;
  const img = el.querySelector("img");
  if (img) img.style.transform = "scale(1) translateY(0)";
}

export function initRevealObserver() {
  const reduceMotion = prefersReducedMotion();
  prepareLineReveals(reduceMotion);
  const items = qsa("[data-reveal]");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => {
      item.classList.add("is-visible");
      openCurtain(item);
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        openCurtain(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10%", threshold: 0.08 },
  );

  items.forEach((item) => observer.observe(item));
}

export function initHeaderTheme(header) {
  const sections = qsa("[data-header-theme]");
  if (!header || !sections.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const active = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!active) return;
      header.classList.toggle("is-light", active.target.dataset.headerTheme === "light");
    },
    { rootMargin: "-5% 0px -88%", threshold: [0, 0.01, 0.1] },
  );

  sections.forEach((section) => observer.observe(section));
}

export function initScrollEffects() {
  if (prefersReducedMotion()) return;

  const panFrames = qsa("[data-pan], [data-parallax]");
  const footSlide = document.querySelector("[data-foot-slide]");
  if (!panFrames.length && !footSlide) return;

  const pans = [];
  const measure = () => {
    pans.length = 0;
    panFrames.forEach((frame) => {
      const img = frame.querySelector("img");
      if (!img) return;
      img.style.transform = "translate3d(0,0,0)";
      const overflow = img.offsetHeight - frame.clientHeight;
      if (overflow > 4) pans.push({ frame, img, overflow });
    });
  };

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = window.innerHeight;

    pans.forEach(({ frame, img, overflow }) => {
      const rect = frame.getBoundingClientRect();
      if (rect.bottom < -80 || rect.top > vh + 80) return;
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
      img.style.transform = `translate3d(0, ${(-overflow * progress).toFixed(1)}px, 0)`;
    });

    if (footSlide && window.innerWidth >= 650) {
      const host = footSlide.parentElement;
      const rect = host.getBoundingClientRect();
      if (rect.top <= vh && rect.bottom >= 0) {
        const progress = Math.min(1, Math.max(0, (vh - rect.top) / Math.min(rect.height, vh)));
        footSlide.style.transform = `translate3d(0, ${(-42 * (1 - progress)).toFixed(2)}%, 0)`;
      }
    } else if (footSlide) {
      footSlide.style.transform = "";
    }
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

export function initAnchorScroll() {
  qsa('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}
