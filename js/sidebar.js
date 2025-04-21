function createSidebar() {
  sidebar = document.createElement("div");
  sidebar.id = "highlight-sidebar";
  sidebar.innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-header-title">
        <img src="${chrome.runtime.getURL('icons/active_icon48.png')}" class="sidebar-icon" alt="Icon" />
        reMINDer
      </div>
      <div class="sidebar-header-buttons">
        <button class="circle-button ${editorMode ? 'active' : ''}" id="enable-editor-mode-button">
          <img src="${chrome.runtime.getURL('icons/screenshot_region_24dp.svg')}" alt="capture text" width="24" height="24" />
        </button>
        <button class="circle-button" id="sidebar-toggle"><span class="arrow down"></span></button>
      </div>
    </div>
    <div class="highlight-list"></div>
  `;
  document.body.appendChild(sidebar);
  sidebar.querySelector("#sidebar-toggle").addEventListener("click", toggleSidebar);
  sidebar.querySelector("#enable-editor-mode-button").addEventListener("click", toggleEditorMode);
  chrome.storage.local.get(["highlights"], (result) => {
    updateSidebar(result.highlights || []);
  });
}

function updateSidebar(highlights) {
  const list = sidebar.querySelector(".highlight-list");
  list.innerHTML = "";
  highlights.forEach((highlight) => {
    const item = document.createElement("details");
    item.className = "highlight-item";
    const isOrphan = highlight.highlightId && !document.querySelector(`[data-highlight-id="${highlight.highlightId}"]`);
    if (isOrphan) {
      item.classList.add("disabled");
    }
    const linkUrl = highlight.highlightId ? `${highlight.url}#highlight-${highlight.highlightId}` : highlight.url;
    item.innerHTML = `
      <summary>
        ${highlight.title}
        <button class="delete-button" data-highlight-id="${highlight.highlightId}" title="Delete highlight">
          <img src="${chrome.runtime.getURL('icons/delete_24dp.svg')}" alt="Delete" width="24" height="24" />
        </button>
      </summary>
      <div class="highlight-content">${highlight.content}</div>
      <div class="highlight-ref">(Experimental feature) <a href="${linkUrl}" class="highlight-link">Go to reference</a></div>
    `;
    list.appendChild(item);
    item.querySelector(".highlight-link").addEventListener("click", (event) => {
      event.preventDefault();
      if (highlight.highlightId) {
        const targetElement = document.querySelector(`[data-highlight-id="${highlight.highlightId}"]`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        } else {
          window.location.href = linkUrl;
        }
      } else {
        window.location.href = highlight.url;
      }
    });
    item.querySelector(".delete-button").addEventListener("click", () => {
      chrome.storage.local.get(["highlights"], (result) => {
        let highlights = result.highlights || [];
        highlights = highlights.filter(h => h.highlightId !== highlight.highlightId);
        chrome.storage.local.set({ highlights }, () => {
          const span = document.querySelector(`[data-highlight-id="${highlight.highlightId}"]`);
          if (span) {
            span.replaceWith(...span.childNodes);
          }
          updateSidebar(highlights);
        });
      });
    });
  });
}

function toggleSidebar() {
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

function createToggleButton() {
  removeToggleButton();
  toggleButton = document.createElement("button");
  toggleButton.id = "toggle-button";
  toggleButton.innerHTML = `<span class="arrow up"></span>`;
  toggleButton.addEventListener("click", toggleSidebar);
  document.body.appendChild(toggleButton);
}

function removeToggleButton() {
  const existingButton = document.getElementById("toggle-button");
  if (existingButton) {
    existingButton.remove();
  }
}

function disableSidebar() {
  if (isSidebarVisible && sidebar) {
    sidebar.style.display = "none";
    removeToggleButton();
    isSidebarVisible = false;
  }
}