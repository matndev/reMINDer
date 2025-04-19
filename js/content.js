let editorMode = false;
let sidebar = null;
let selectedText = "";
let toggleButton = null;
let isSidebarVisible = false;
let highlightId = null;
let lastSelectedText = ""; // Avoid ID regeneration

/**
 * On toolbar button click
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateHighlights") {
    updateSidebar(message.highlights);
  }
  if (message.action === "toggleApp") {
    message.appEnabled ? disableApp() : enableApp();
  }
});

function enableApp() {
  createToggleButton();
}

function disableApp() {
  editorMode = false;
  disableEditorMode();
  disableSidebar();
  removeToggleButton();
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Page loaded, showing toggle button");
  createToggleButton();
  restoreHighlightIds();
});

function toggleEditorMode() {
  editorMode ? disableEditorMode() : enableEditorMode();
  editorMode = !editorMode;
}

function enableEditorMode() {
  console.log("Enabling editor mode");
  document.body.classList.add("highlight-mode");
  if (!sidebar && isSidebarVisible) {
    createSidebar();
  }
  if (sidebar) {
    sidebar.style.display = "block";
  }
  document.addEventListener("mouseup", handleTextSelection);
  document.addEventListener("click", handleGlobalClick);
}

function disableEditorMode() {
  console.log("Disabling editor mode");
  document.body.classList.remove("highlight-mode");
  document.removeEventListener("mouseup", handleTextSelection);
  document.removeEventListener("click", handleGlobalClick);
  removeExistingSaveButton();
  removeExistingPopup();
}