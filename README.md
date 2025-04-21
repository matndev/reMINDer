> **Disclaimer**: This project was vibe-coded with the assistance of AI for fun and experimentation. It is not intended to be actively maintained or used in production.

# reMINDer

A Chrome extension for highlighting and saving important parts of AI conversations on platforms like Grok, ChatGPT, and Claude.

## Description

reMINDer allows users to select text in AI conversation interfaces, highlight it, and save it with a custom title in a sidebar. Highlights are persisted across page reloads and can be deleted via a trash icon. The extension is designed to be universal, secure, and user-friendly.

## Features

- **Text Highlighting**: Select text and wrap it in a yellow-highlighted `<span>` with a unique ID.
- **Sidebar UI**: Displays saved highlights with titles, content, and links to the original text.
- **Highlight Deletion**: Remove highlights via a trash icon, updating both the sidebar and DOM.
- **Orphan Highlight Detection**: Highlights not found in the DOM are shown in gray in the sidebar.
- **Dynamic DOM Handling**: Uses `MutationObserver` to restore highlights after asynchronous DOM updates.

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" and click "Load unpacked".
4. Select the folder containing the extension files.
5. The reMINDer icon will appear in the toolbar.

## Usage

1. Click the reMINDer icon to enable/disable the extension.
2. Click the toggle button (bottom-left) to show/hide the sidebar.
3. In the sidebar, click the editor mode button to enable text selection.
4. Select text on the page, click "Save Highlight", and enter a title in the popup.
5. Highlights appear in the sidebar with a link to scroll to the text or a trash icon to delete.
6. Orphan highlights (not found in the DOM) are displayed in gray.

## Compatibility

- **Tested Platforms**:
  - Grok (`https://grok.com/*`)
  - ChatGPT (`https://chatgpt.com/*`)
  - Claude (`https://claude.ai/*`)
- **Browsers**: Chrome (other Chromium-based browsers may work but are untested).

## Development

To modify the extension:

1. Edit the source files in the respective folders.
2. Reload the extension in `chrome://extensions/` via "Load unpacked".
3. Test on supported platforms.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

- **matndev**

## Version

- **1.0-RC1** (Release Candidate 1, April 21, 2025)

## Contributing

Contributions are welcome! Please submit issues or pull requests on GitHub.

## Known Issues

- The "Save Highlight" button may persist after clicking in rare cases.
- Highlight restoration may fail for very dynamic pages with continuous DOM updates.

Report issues on the GitHub repository.

## Acknowledgments

- Built with assistance from Grok, created by xAI.
- Icons from Material Design (MIT license).