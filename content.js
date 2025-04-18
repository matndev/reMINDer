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

function createToggleButton() {
  console.log("Creating toggle button");
  removeToggleButton();
  toggleButton = document.createElement("button");
  toggleButton.id = "toggle-button";
  toggleButton.innerHTML = `<span class="arrow up"></span>`;
  toggleButton.addEventListener("click", toggleSidebar);
  document.body.appendChild(toggleButton);
}

function toggleSidebar() {
  console.log("Toggling sidebar, current state:", isSidebarVisible);
  if (isSidebarVisible) {
    if (sidebar) {
      sidebar.style.display = "none";
    }
    toggleButton.innerHTML = `<span class="arrow up"></span>`;
    isSidebarVisible = false;
  } else {
    if (!sidebar) {
      createSidebar();
    }
    sidebar.style.display = "block";
    toggleButton.innerHTML = `<span class="arrow up"></span>`;
    isSidebarVisible = true;
  }
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

function createSidebar() {
  console.log("Creating sidebar");
  sidebar = document.createElement("div");
  sidebar.id = "highlight-sidebar";
  sidebar.innerHTML = `
    <div class="sidebar-header">
      Saved Highlights
      <button class="circle-button" id="sidebar-toggle"><span class="arrow down"></span></button>
    </div>
    <div class="highlight-list"></div>
  `;
  document.body.appendChild(sidebar);
  sidebar.querySelector("#sidebar-toggle").addEventListener("click", toggleSidebar);
  chrome.storage.local.get(["highlights"], (result) => {
    updateSidebar(result.highlights || []);
  });
}

function updateSidebar(highlights) {
  console.log("Updating sidebar with highlights:", highlights);
  const list = sidebar.querySelector(".highlight-list");
  list.innerHTML = "";
  highlights.forEach((highlight) => {
    const item = document.createElement("details");
    item.className = "highlight-item";
    const linkUrl = highlight.highlightId ? `${highlight.url}#highlight-${highlight.highlightId}` : highlight.url;
    item.innerHTML = `
      <summary>${highlight.title}</summary>
      <div class="highlight-content">${highlight.content}</div>
      <div class="highlight-ref">Saved from: <a href="${linkUrl}" class="highlight-link">${linkUrl}</a></div>
    `;
    list.appendChild(item);
    // Listener for scrolling
    item.querySelector(".highlight-link").addEventListener("click", (event) => {
      event.preventDefault();
      if (highlight.highlightId) {
        const targetElement = document.querySelector(`[data-highlight-id="${highlight.highlightId}"]`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        } else {
          window.location.href = linkUrl; // Fallback to URL
        }
      } else {
        window.location.href = highlight.url;
      }
    });
  });
}

function restoreHighlightIds() {
  console.log("Restoring highlight IDs");
  chrome.storage.local.get(["highlights"], (result) => {
    const highlights = result.highlights || [];
    const currentUrl = window.location.href.split("#")[0];
    highlights.forEach((highlight) => {
      if (highlight.highlightId && highlight.url.split("#")[0] === currentUrl) {
        const textNodes = document.createTreeWalker(document.body, Node.TEXT_NODE, {
          acceptNode: (node) => node.textContent.includes(highlight.contentSnippet) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
        });
        let node;
        while ((node = textNodes.nextNode())) {
          const parent = node.parentNode;
          if (!parent.querySelector(`[data-highlight-id="${highlight.highlightId}"]`)) {
            const span = document.createElement("span");
            span.setAttribute("data-highlight-id", highlight.highlightId);
            const range = document.createRange();
            range.selectNodeContents(node);
            range.surroundContents(span);
            console.log("Restored data-highlight-id:", highlight.highlightId, "to span:", span);
            break;
          }
        }
      }
    });
  });
}

function handleTextSelection(event) {
  console.log("Mouseup event triggered");
  // Ignore if event comes from Save Highlight button
  if (event.target.closest("#save-highlight-button")) {
    console.log("Ignoring mouseup from Save Highlight button");
    return;
  }
  setTimeout(() => {
    const selection = window.getSelection();
    selectedText = selection.toString().trim();
    console.log("Selected text:", selectedText);
    if (selectedText !== "" && selectedText !== lastSelectedText) {
      lastSelectedText = selectedText;
      const range = selection.getRangeAt(0);
      highlightId = `highlight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const span = document.createElement("span");
      span.setAttribute("data-highlight-id", highlightId);
      try {
        range.surroundContents(span);
        console.log("Added data-highlight-id:", highlightId, "to span:", span);
      } catch (e) {
        console.error("Failed to surround selection with span:", e);
        highlightId = null;
      }
      showSaveButton(selection);
    } else if (selectedText === "") {
      removeExistingSaveButton();
    }
  }, 100);
}

function handleGlobalClick(event) {
  const button = event.target.closest("#save-highlight-button");
  if (button) {
    console.log("Global click detected on Save Highlight, selectedText:", selectedText);
    event.stopPropagation();
    event.preventDefault();
    if (selectedText) {
      showCustomPopup();
    }
  }
}

function showSaveButton(selection) {
  console.log("Showing save button");
  removeExistingSaveButton();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  const button = document.createElement("button");
  button.id = "save-highlight-button";
  button.textContent = "Save Highlight";
  button.style.position = "absolute";
  button.style.left = `${rect.left + window.scrollX}px`;
  button.style.top = `${rect.bottom + window.scrollY + 5}px`;
  button.addEventListener("click", (event) => {
    console.log("Button click detected, selectedText:", selectedText);
    event.stopPropagation();
    event.preventDefault();
    if (selectedText) {
      showCustomPopup();
    }
  });
  document.body.appendChild(button);
}

function showCustomPopup() {
  console.log("Showing custom popup, selectedText:", selectedText);
  removeExistingSaveButton();
  removeExistingPopup();
  const popup = document.createElement("div");
  popup.id = "highlight-popup";
  popup.style.position = "fixed";
  popup.style.left = "50%";
  popup.style.top = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.background = "white";
  popup.style.padding = "20px";
  popup.style.border = "1px solid #ddd";
  popup.style.zIndex = "10000";
  popup.innerHTML = `
    <label>Enter title for this highlight:</label><br>
    <input type="text" id="highlight-title-input" style="width: 200px; margin: 10px 0;">
    <div>
      <button id="popup-save">Save</button>
      <button id="popup-cancel">Cancel</button>
    </div>
  `;
  document.body.appendChild(popup);

  const tempSelectedText = selectedText;
  const tempHighlightId = highlightId;
  document.getElementById("popup-save").addEventListener("click", () => {
    const title = document.getElementById("highlight-title-input").value.trim();
    console.log("Saving highlight with title:", title, "and content:", tempSelectedText, "highlightId:", tempHighlightId);
    if (tempSelectedText) {
      const url = tempHighlightId ? `${window.location.href.split("#")[0]}#highlight-${tempHighlightId}` : window.location.href;
      const contentSnippet = tempSelectedText.substring(0, 50);
      chrome.runtime.sendMessage({
        action: "saveHighlight",
        content: tempSelectedText,
        title: title,
        url: url,
        highlightId: tempHighlightId,
        contentSnippet: contentSnippet
      });
    } else {
      console.error("No selected text to save");
    }
    window.getSelection().removeAllRanges();
    removeExistingPopup();
    removeExistingSaveButton();
    disableEditorMode();
  });

  document.getElementById("popup-cancel").addEventListener("click", () => {
    console.log("Popup cancelled");
    removeExistingPopup();
    removeExistingSaveButton();
    setTimeout(() => {
      const selection = window.getSelection();
      selectedText = selection.toString().trim();
      console.log("Re-evaluating selection after cancel, selectedText:", selectedText);
      if (selectedText) {
        showSaveButton(selection);
      }
    }, 100);
  });
}

function removeExistingSaveButton() {
  console.log("Attempting to remove save button");
  const buttons = document.querySelectorAll("#save-highlight-button");
  buttons.forEach((button) => {
    console.log("Removing save button with ID:", button.id);
    button.remove();
  });
}

function removeExistingPopup() {
  console.log("Attempting to remove popup");
  const existingPopup = document.getElementById("highlight-popup");
  if (existingPopup) {
    console.log("Removing popup with ID:", existingPopup.id);
    existingPopup.remove();
  }
}

function removeToggleButton() {
  console.log("Attempting to remove toggle button");
  const existingButton = document.getElementById("toggle-button");
  if (existingButton) {
    console.log("Removing toggle button with ID:", existingButton.id);
    existingButton.remove();
  }
}