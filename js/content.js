let editorMode = false;
let sidebar = null;
let selectedText = "";
let toggleButton = null;
let isSidebarVisible = false;
let highlightId = null;
let lastSelectedText = "";

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
  createToggleButton();
  window.addEventListener("load", () => {
    setTimeout(restoreHighlightIds, 1000);
  });
});

function toggleEditorMode() {
  editorMode ? disableEditorMode() : enableEditorMode();
  editorMode = !editorMode;
}

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