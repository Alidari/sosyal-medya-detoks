// GTA 6 ile ilgili tweet'leri bulanıklaştırır
const GTA_TERMS = [
  // oyun adı
  "gta\\s*-?\\s*(6|vi|six)\\b", "grand\\s*theft\\s*auto\\s*(6|vi)\\b", "#gta6", "#gtavi",
  // karakterler
  "\\blucia\\b", "\\bjason\\b", "\\bduval\\b", "\\bcaminos\\b", "cal\\s+hampton", "boobie\\s+ike",
  "dre.?quan", "real\\s+dimez", "bae.?luxe", "raul\\s+bautista", "brian\\s+heder",
  // mekanlar
  "vice\\s*city", "\\bleonida\\b", "port\\s+gellhorn", "grassrivers", "kalaga"
];
const GTA_REGEX = new RegExp("(" + GTA_TERMS.join("|") + ")", "i");
let enabled = true;

function textOf(article) {
  let t = "";
  for (const child of article.children) {
    if (child.classList.contains("gta6-overlay")) continue;   // kendi etiketimizi sayma
    t += " " + (child.innerText || child.textContent || "");
    child.querySelectorAll("img[alt], [aria-label]").forEach((el) => {
      t += " " + (el.getAttribute("alt") || el.getAttribute("aria-label") || "");
    });
  }
  return t;
}

// X, fare üzerine gelince article'ın class'ını yeniden yazıyor; bu yüzden data-attribute kullanıyoruz
function accountOf(article) {
  const box = article.querySelector('[data-testid="User-Name"]');
  if (!box) return null;
  const lines = (box.innerText || "").split("\n").map((l) => l.trim()).filter(Boolean);
  const handle = lines.find((l) => l.startsWith("@")) || "";
  const name = lines[0] && !lines[0].startsWith("@") ? lines[0] : "";
  return { name, handle };
}

function blur(article) {
  if (article.dataset.gta6 !== "blur") article.dataset.gta6 = "blur";
  if (article.querySelector(":scope > .gta6-overlay")) return;
  const o = document.createElement("div");
  o.className = "gta6-overlay";
  const pill = document.createElement("div");
  pill.className = "gta6-pill";
  const acc = accountOf(article);
  if (acc && (acc.name || acc.handle)) {
    const who = document.createElement("div");
    who.className = "gta6-who";
    who.textContent = [acc.name, acc.handle].filter(Boolean).join("  ·  ");
    pill.appendChild(who);
  }
  const b = document.createElement("b"); b.textContent = "GTA 6 spoiler olabilir";
  const sp = document.createElement("span"); sp.textContent = "Göstermek için tıkla";
  pill.append(b, sp);
  o.appendChild(pill);
  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };
  ["mousedown", "mouseup", "pointerdown", "pointerup"].forEach((t) => o.addEventListener(t, stop, true));
  o.addEventListener("click", (e) => {
    stop(e);
    article.dataset.gta6 = "revealed";
    o.remove();
  }, true);
  article.appendChild(o);
}

function unblur(article) {
  if (article.dataset.gta6 === "blur") delete article.dataset.gta6;
  article.querySelector(":scope > .gta6-overlay")?.remove();
}

function scan() {
  document.querySelectorAll("article").forEach((a) => {
    if (!enabled) return unblur(a);
    if (a.dataset.gta6 === "revealed") return;
    if (GTA_REGEX.test(textOf(a))) blur(a); else unblur(a);
  });
}

let pending = false;
const schedule = () => {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => { pending = false; scan(); });
};

chrome.storage.local.get("gtaBlur").then(({ gtaBlur = true }) => {
  enabled = gtaBlur;
  scan();
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
});
chrome.storage.onChanged.addListener((c) => {
  if (c.gtaBlur) { enabled = c.gtaBlur.newValue; scan(); }
});
