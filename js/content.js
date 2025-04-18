let editorMode = false;
let sidebar = null;
let selectedText = "";
let toggleButton = null;
let isSidebarVisible = false;
let highlightId = null;
let lastSelectedText = ""; // Avoid ID regeneration

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message, editorMode);
  if (message.action === "toggleEditorMode") {
    editorMode = !editorMode;
    if (editorMode) {
      enableEditorMode();
    } else {
      disableEditorMode();
    }
  } else if (message.action === "updateHighlights") {
    updateSidebar(message.highlights);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  console.log("Page loaded, showing toggle button");
  createToggleButton();
  restoreHighlightIds();
});

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