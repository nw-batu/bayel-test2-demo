import { qs, qsa } from "../core/dom.js";

const FORM_ENDPOINT = "https://formsubmit.co/ajax/605a8b480cefb270303f620a1122da85";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_FILL_MS = 3000; // süre tuzağı: insan 3 sn'den hızlı dolduramaz

function setError(field, message) {
  const wrap = field.closest(".form-field");
  const error = wrap ? qs(".form-field__error", wrap) : null;
  field.setAttribute("aria-invalid", message ? "true" : "false");
  if (error) {
    error.textContent = message || "";
    error.hidden = !message;
  }
}

function validators(form) {
  return [
    {
      field: qs('[name="ad"]', form),
      check: (v) => (v.trim().length >= 2 ? "" : "Lütfen adınızı yazın."),
    },
    {
      field: qs('[name="eposta"]', form),
      check: (v) => (EMAIL_RE.test(v.trim()) ? "" : "Geçerli bir e-posta adresi girin."),
    },
    {
      field: qs('[name="mesaj"]', form),
      check: (v) => (v.trim().length >= 10 ? "" : "Mesajınız en az 10 karakter olmalı."),
    },
  ].filter((rule) => rule.field);
}

function composeBody(form) {
  const value = (name) => (qs(`[name="${name}"]`, form)?.value || "").trim();
  const lines = [
    `Ad Soyad: ${value("ad")}`,
    `E-posta: ${value("eposta")}`,
    value("telefon") ? `Telefon: ${value("telefon")}` : "",
    "",
    value("mesaj"),
  ].filter(Boolean);
  return lines.join("\n");
}

export function initContactForm() {
  const form = qs("[data-contact-form]");
  if (!form) return;

  const status = qs("[data-form-status]", form);
  const copyButton = qs("[data-form-copy]", form);
  const renderedAt = Date.now();

  const announce = (message, isError = false) => {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  };

  qsa("input, textarea", form).forEach((field) => {
    field.addEventListener("input", () => setError(field, ""));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if ((qs('[name="website"]', form)?.value || "") !== "") return;
    if (Date.now() - renderedAt < MIN_FILL_MS) {
      announce("Form çok hızlı gönderildi; lütfen kontrol edip tekrar deneyin.", true);
      return;
    }

    let firstInvalid = null;
    validators(form).forEach(({ field, check }) => {
      const message = check(field.value);
      setError(field, message);
      if (message && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      announce("Lütfen işaretli alanları düzeltin.", true);
      return;
    }

    const value = (name) => (qs(`[name="${name}"]`, form)?.value || "").trim();
    const subject = `Bayel Yapı iletişim — ${value("ad")}`;
    const submitButton = qs(".contact-form__submit", form);

    submitButton?.setAttribute("disabled", "");
    announce("Mesajınız gönderiliyor…");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: value("ad"),
          email: value("eposta"),
          phone: value("telefon"),
          message: value("mesaj"),
          _subject: subject,
          _template: "table",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && String(data.success) !== "false") {
        form.reset();
        announce("Teşekkürler — mesajınız ulaştı. En kısa sürede dönüş yapacağız.");
      } else {
        throw new Error(data.message || "gönderilemedi");
      }
    } catch {
      const mailto = `mailto:info@bayelyapi.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(composeBody(form))}`;
      announce("Bağlantı sorunu oldu; e-posta uygulamanız açılıyor. Açılmazsa “Metni kopyala” ile mesajı info@bayelyapi.com adresine gönderebilirsiniz.", true);
      window.location.href = mailto;
    } finally {
      submitButton?.removeAttribute("disabled");
    }
  });

  copyButton?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(composeBody(form));
      announce("Mesaj panoya kopyalandı — info@bayelyapi.com adresine yapıştırıp gönderebilirsiniz.");
    } catch {
      announce("Panoya erişilemedi; metni elle seçip kopyalayabilirsiniz.", true);
    }
  });
}
