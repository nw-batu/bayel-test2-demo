export function getRoot() {
  return document.body.dataset.root || "./";
}

export function route(path = "") {
  const cleanPath = String(path).replace(/^\/+/, "");
  return `${getRoot()}${cleanPath}`;
}

export function asset(path = "") {
  const cleanPath = String(path).replace(/^\/+/, "");
  return route(`assets/${cleanPath}`);
}

export function projectRoute(slug) {
  return route(`project/?slug=${encodeURIComponent(slug)}`);
}
