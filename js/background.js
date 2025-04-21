/**
 * reMINDer - Background Script
 * Author: matndev
 * License: MIT
 * Last Modified: April 21, 2025
 * Description: Manages the extension's background tasks, including toggling the app state and saving highlights to storage.
 */

let appEnabled = true;
const activeIcons = { 16: "icons/active_icon16.png", 48: "icons/active_icon48.png", 128: "icons/active_icon128.png" };
const inactiveIcons = { 16: "icons/inactive_icon16.png", 48: "icons/inactive_icon48.png", 128: "icons/inactive_icon128.png" };

/**
 * Toggles the extension's enabled state and updates the toolbar icon when clicked.
 * @param {Object} tab - The active tab object.
 */
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "toggleApp", appEnabled });
  appEnabled = !appEnabled;
  chrome.action.setIcon({
    path: appEnabled ? activeIcons : inactiveIcons
  });
});

/**
 * Handles messages from content scripts, specifically saving highlights to storage.
 * @param {Object} message - The message object containing action and data.
 * @param {Object} sender - The sender of the message.
 * @param {Function} sendResponse - Callback to send a response.
 */
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
        contentSnippet: message.contentSnippet,
        timestamp: new Date().toISOString()
      });
      chrome.storage.local.set({ highlights }, () => {
        chrome.tabs.sendMessage(sender.tab.id, { action: "updateHighlights", highlights });
      });
    });
  }
});