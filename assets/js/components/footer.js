import { qs } from "../core/dom.js";
import { route } from "../core/path.js";
import { legalNavigation, navigation } from "../data/navigation.js";

export function mountFooter() {
  const host = qs("[data-site-footer]");
  if (!host) return;

  const links = [...navigation.slice(1), ...legalNavigation]
    .map((item) => `<a href="${route(item.path)}">${item.label}</a>`)
    .join("");

  host.className = "site-footer";
  host.setAttribute("data-header-theme", "light");
  host.innerHTML = `
    <div class="site-footer__inner" data-foot-slide>
      <p class="eyebrow">Bir sonraki yapıyı birlikte düşünelim</p>
      <a class="site-footer__heading" href="${route("contact/")}">
        Kalıcı bir <em>iz</em> bırakalım.
      </a>

      <div class="site-footer__bottom">
        <div>
          <nav class="site-footer__links" aria-label="Alt menü">${links}</nav>
          <p class="site-footer__meta" style="margin-top:2.5rem">
            © ${new Date().getFullYear()} Bayel Yapı — Tüm Hakları Saklıdır.
          </p>
        </div>
        <div class="site-footer__meta">
          Şerifali Mah., 34775 Ümraniye / İstanbul<br>
          <a href="mailto:info@bayelyapi.com">info@bayelyapi.com</a><br>
          <a href="tel:+905541805800">0554 180 58 00</a>
        </div>
        <button class="site-footer__top circle-button" type="button" aria-label="Sayfanın başına dön">
          <span class="circle-button__icon" style="transform:rotate(180deg)"></span>
        </button>
      </div>
    </div>`;

  qs(".site-footer__top", host)?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
