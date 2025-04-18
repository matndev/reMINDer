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

function removeExistingSaveButton() {
    console.log("Attempting to remove save button");
    const buttons = document.querySelectorAll("#save-highlight-button");
    buttons.forEach((button) => {
      console.log("Removing save button with ID:", button.id);
      button.remove();
    });
}