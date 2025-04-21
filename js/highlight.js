function handleTextSelection(event) {
  if (event.target.closest("#save-highlight-button")) {
    console.log("Ignoring mouseup from Save Highlight button");
    return;
  }
  setTimeout(() => {
    const selection = window.getSelection();
    selectedText = selection.toString().trim();
    if (selectedText !== "" && selectedText !== lastSelectedText) {
      lastSelectedText = selectedText;
      const range = selection.getRangeAt(0);
      highlightId = `highlight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const span = document.createElement("span");
      span.setAttribute("data-highlight-id", highlightId);
      try {
        range.surroundContents(span);
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
    event.stopPropagation();
    event.preventDefault();
    if (selectedText) {
      showCustomPopup();
    }
  } else {
    if (editorMode && document.querySelectorAll("#save-highlight-button").length > 0) {
      const attributeName = 'data-highlight-id';
      const attributeValue = highlightId;
      document.querySelectorAll(`[${attributeName}="${attributeValue}"]`).forEach(element => {
        element.replaceWith(...element.childNodes);
      });
    }
  }
}

function showSaveButton(selection) {
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
    event.stopPropagation();
    event.preventDefault();
    if (selectedText) {
      showCustomPopup();
    }
  });
  document.body.appendChild(button);
}

function removeExistingSaveButton() {
  const buttons = document.querySelectorAll("#save-highlight-button");
  buttons.forEach((button) => {
    button.remove();
  });
}