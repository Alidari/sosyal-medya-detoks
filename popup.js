const toggle = document.getElementById("toggle");
const info = document.getElementById("info");
const render = (on) => { info.textContent = on ? "Açık: x.com'a girerken uyarı çıkar." : "Kapalı: x.com normal açılır."; };
chrome.storage.local.get(["enabled", "stats"]).then(({ enabled = true, stats }) => {
  toggle.checked = enabled; render(enabled);
  const today = new Date().toISOString().slice(0, 10);
  if (stats && stats.date === today) info.textContent += ` Bugün ${stats.count} deneme.`;
});
toggle.onchange = () => { chrome.storage.local.set({ enabled: toggle.checked }); render(toggle.checked); };
const gta = document.getElementById("gta");
chrome.storage.local.get("gtaBlur").then(({ gtaBlur = true }) => { gta.checked = gtaBlur; });
gta.onchange = () => chrome.storage.local.set({ gtaBlur: gta.checked });
