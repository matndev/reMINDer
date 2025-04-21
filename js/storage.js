/**
 * reMINDer - Storage Script
 * Author: matndev
 * License: MIT
 * Last Modified: April 21, 2025
 * Description: Restores highlights by wrapping saved text in <span> elements on page load.
 */

/**
 * Restores highlights by searching for saved text in the DOM and wrapping it with <span> elements.
 */
function restoreHighlightIds() {
  chrome.storage.local.get(["highlights"], result => {

    const highlights = result.highlights || [];
    const currentUrl = window.location.href.split("#")[0];
    highlights.forEach((highlight) => {

      const textNodes = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => !node.parentNode.closest("script, style") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      });

      if (highlight.highlightId && highlight.url.split("#")[0] === currentUrl) {
        while (node = textNodes.nextNode()) {

          const highlightTextFoundInNode = node.textContent.includes(highlight.content);
          const highlightTextHasExactCorrespondance = node.textContent === highlight.content && node.parentNode.hasAttribute("data-highlight-id");
          
          if (highlightTextFoundInNode && !highlightTextHasExactCorrespondance) {
            const index = node.textContent.indexOf(highlight.content);
            const span = document.createElement("span");
            span.setAttribute("data-highlight-id", highlight.highlightId);
            const range = document.createRange();
            const startOffset = index;
            const endOffset = index + highlight.content.length;
            if (endOffset <= node.textContent.length) {
              range.setStart(node, startOffset);
              range.setEnd(node, endOffset);
              try {
                range.surroundContents(span);
              } catch (e) {
                console.error("Failed to restore span:", e);
              }
              return;
            }
          }
        }
      }
    });
  })
}