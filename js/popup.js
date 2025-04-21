/**
 * reMINDer - Popup Script
 * Author: matndev
 * License: MIT
 * Last Modified: April 21, 2025
 * Description: Manages the popup UI for saving highlights with custom titles.
 */

/**
 * Displays a popup for entering a highlight title and saves the highlight.
 */
function showCustomPopup() {
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
    if (tempSelectedText) {
      const url = tempHighlightId ? `${window.location.href.split("#")[0]}#highlight-${tempHighlightId}` : window.location.href;
      const contentSnippet = tempSelectedText.substring(0, 200);
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
    removeExistingPopup();
    removeExistingSaveButton();
    setTimeout(() => {
      const selection = window.getSelection();
      selectedText = selection.toString().trim();
      if (selectedText) {
        showSaveButton(selection, occurrenceIndex);
      }
    }, 100);
  });
}

/**
 * Removes the existing highlight popup if present.
 */
function removeExistingPopup() {
  const existingPopup = document.getElementById("highlight-popup");
  if (existingPopup) {
    existingPopup.remove();
  }
}