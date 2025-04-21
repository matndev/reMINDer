/**
 * reMINDer - Content Script
 * Author: matndev
 * License: MIT
 * Last Modified: April 21, 2025
 * Description: Initializes the extension's UI and handles editor mode, sidebar, and highlight restoration.
 */

let editorMode = false;
let sidebar = null;
let selectedText = "";
let toggleButton = null;
let isSidebarVisible = false;
let highlightId = null;
let lastSelectedText = "";

/**
 * Handles messages from the background script to update highlights or toggle the app.
 * @param {Object} message - The message object containing action and data.
 * @param {Object} sender - The sender of the message.
 * @param {Function} sendResponse - Callback to send a response.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateHighlights") {
    updateSidebar(message.highlights);
  }
  if (message.action === "toggleApp") {
    message.appEnabled ? disableApp() : enableApp();
  }
});

/**
 * Enables the extension by creating the toggle button.
 */
function enableApp() {
  createToggleButton();
}

/**
 * Disables the extension by resetting editor mode and removing UI elements.
 */
function disableApp() {
  editorMode = false;
  disableEditorMode();
  disableSidebar();
  removeToggleButton();
}

/**
 * Initializes the toggle button and sets up DOM stabilization observer for highlight restoration.
 */
document.addEventListener("DOMContentLoaded", () => {
  createToggleButton();

  // temp solution : Stabilize DOM, check mutations under 1s and reload
  let timeout;
  const observer = new MutationObserver(() => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      // No more mutations
      restoreHighlightIds();
      observer.disconnect();
    }, 1000);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  // Fallback after 10s
  setTimeout(() => {
    if (timeout) {
      restoreHighlightIds();
      observer.disconnect();
    }
  }, 10000);
});

/**
 * Toggles the editor mode on or off.
 */
function toggleEditorMode() {
  editorMode ? disableEditorMode() : enableEditorMode();
  editorMode = !editorMode;
}

/**
 * Enables editor mode, activating text selection and sidebar.
 */
function enableEditorMode() {
  document.body.classList.add("highlight-mode");
  if (!sidebar && isSidebarVisible) {
    createSidebar();
  }
  if (sidebar) {
    sidebar.style.display = "block";
    const editorButton = sidebar.querySelector("#enable-editor-mode-button");
    if (editorButton) {
      editorButton.classList.add("active");
    }
  }
  document.addEventListener("mouseup", handleTextSelection);
  document.addEventListener("click", handleGlobalClick);
}

/**
 * Disables editor mode, removing text selection listeners and UI elements.
 */
function disableEditorMode() {
  document.body.classList.remove("highlight-mode");
  document.removeEventListener("mouseup", handleTextSelection);
  document.removeEventListener("click", handleGlobalClick);
  removeExistingSaveButton();
  removeExistingPopup();
  if (sidebar) {
    const editorButton = sidebar.querySelector("#enable-editor-mode-button");
    if (editorButton) {
      editorButton.classList.remove("active");
    }
  }
}