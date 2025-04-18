chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "toggleEditorMode" });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "saveHighlight") {
    chrome.storage.local.get(["highlights"], (result) => {
      let highlights = result.highlights || [];
      highlights.push({
        id: Date.now(),
        title: message.title || "Highlight " + (highlights.length + 1),
        content: message.content,
        url: message.url,
        highlightId: message.highlightId,
        contentSnippet: message.contentSnippet, // Extract for identification
        timestamp: new Date().toISOString()
      });
      chrome.storage.local.set({ highlights }, () => {
        chrome.tabs.sendMessage(sender.tab.id, { action: "updateHighlights", highlights });
      });
    });
  }
});