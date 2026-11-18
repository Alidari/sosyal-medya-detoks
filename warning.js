let target = "https://x.com/";
try { target = decodeURIComponent(location.hash.slice(1)) || target; } catch { target = location.hash.slice(1) || target; }

(async () => {
  const today = new Date().toISOString().slice(0, 10);
  const { stats = {} } = await chrome.storage.local.get("stats");
  if (stats.date !== today) { stats.date = today; stats.count = 0; }
  stats.count++;
  await chrome.storage.local.set({ stats });
  document.getElementById("count").textContent = stats.count;
  document.querySelectorAll("#stars i").forEach((el, i) => el.classList.toggle("on", i < Math.min(stats.count, 5)));
})();

document.getElementById("back").onclick = () => chrome.runtime.sendMessage({ type: "close" });
document.getElementById("go").onclick = async () => {
  await chrome.runtime.sendMessage({ type: "allow" });
  location.replace(target);
};
