const KEY = "bayel-flip";
const MAX_AGE_MS = 4000;

const reduceMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function rememberFlip(slug, imgEl) {
  if (reduceMotion() || !imgEl) return;
  const r = imgEl.getBoundingClientRect();
  if (!r.width || !r.height) return;
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ slug, src: imgEl.currentSrc || imgEl.src, x: r.left, y: r.top, w: r.width, h: r.height, t: Date.now() }),
    );
  } catch {

  }
}

export function playFlip(slug, heroImgEl) {
  if (reduceMotion() || !heroImgEl) return;
  let data = null;
  try {
    data = JSON.parse(sessionStorage.getItem(KEY) || "null");
    sessionStorage.removeItem(KEY);
  } catch {
    return;
  }
  if (!data || data.slug !== slug || Date.now() - data.t > MAX_AGE_MS) return;

  const target = heroImgEl.getBoundingClientRect();
  if (!target.width || !target.height) return;

  const clone = document.createElement("img");
  clone.src = data.src;
  clone.alt = "";
  clone.setAttribute("aria-hidden", "true");
  clone.className = "flip-clone";
  Object.assign(clone.style, {
    position: "fixed",
    zIndex: "150",
    left: "0",
    top: "0",
    width: `${target.width}px`,
    height: `${target.height}px`,
    objectFit: "cover",
    pointerEvents: "none",
    transformOrigin: "top left",
  });

  const scaleX = data.w / target.width;
  const scaleY = data.h / target.height;
  const from = `translate3d(${data.x}px, ${data.y}px, 0) scale(${scaleX}, ${scaleY})`;
  const to = `translate3d(${target.left}px, ${target.top}px, 0) scale(1, 1)`;

  heroImgEl.style.opacity = "0";
  document.body.append(clone);

  const cleanup = () => {
    heroImgEl.style.opacity = "";
    clone.remove();
  };

  if (typeof clone.animate !== "function") {
    cleanup();
    return;
  }

  clone.style.transform = from;
  clone
    .animate(
      [{ transform: from }, { transform: to }],
      { duration: 620, easing: "cubic-bezier(.22, 1, .36, 1)" },
    )
    .finished.then(cleanup)
    .catch(cleanup);
}
