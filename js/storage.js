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