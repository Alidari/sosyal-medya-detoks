const REDIRECT_RULE_ID = 1;
const PATTERN = "^https?://([a-z0-9-]+\\.)?(x|twitter)\\.com(/.*)?$";

async function applyRules() {
  const { enabled = true } = await chrome.storage.local.get("enabled");
  const addRules = enabled ? [{
    id: REDIRECT_RULE_ID,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { regexSubstitution: `chrome-extension://${chrome.runtime.id}/warning.html#\\0` }
    },
    condition: { regexFilter: PATTERN, resourceTypes: ["main_frame"] }
  }] : [];
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [REDIRECT_RULE_ID],
    addRules
  });
}

chrome.runtime.onInstalled.addListener(applyRules);
chrome.runtime.onStartup.addListener(applyRules);
chrome.storage.onChanged.addListener((c) => { if (c.enabled) applyRules(); });

// "Yine de devam et" -> sadece o sekmede, sekme kapanana kadar izin ver
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "allow" && sender.tab) {
    const tabId = sender.tab.id;
    chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [1000 + tabId],
      addRules: [{
        id: 1000 + tabId,
        priority: 2,
        action: { type: "allow" },
        condition: { regexFilter: PATTERN, resourceTypes: ["main_frame"], tabIds: [tabId] }
      }]
    }).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === "close" && sender.tab) {
    chrome.tabs.remove(sender.tab.id);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [1000 + tabId] });
});
