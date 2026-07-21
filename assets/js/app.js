import { mountFooter } from "./components/footer.js";
import { mountHeader } from "./components/header.js";
import { mountLoader } from "./components/loader.js";
import { initAnchorScroll, initHeaderTheme, initRevealObserver, initScrollEffects } from "./core/motion.js";
import { initAboutPage } from "./pages/about.js";
import { initContactPage } from "./pages/contact.js";
import { initHomePage } from "./pages/home.js";
import { initLegalPage } from "./pages/legal.js";
import { initProjectPage } from "./pages/project.js";
import { initProjectsPage } from "./pages/projects.js";

const pageInitializers = {
  home: initHomePage,
  about: initAboutPage,
  projects: initProjectsPage,
  project: initProjectPage,
  contact: initContactPage,
  legal: initLegalPage,
};

mountLoader();
const header = mountHeader();
mountFooter();

const page = document.body.dataset.page || "home";
pageInitializers[page]?.();

initHeaderTheme(header);
initAnchorScroll();
initScrollEffects();

if (document.documentElement.classList.contains("intro-done")) {
  initRevealObserver();
} else {
  document.addEventListener("bayel:loader-complete", () => initRevealObserver(), { once: true });
}
