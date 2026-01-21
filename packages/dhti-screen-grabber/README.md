# DHTI Screen Grabber - Chrome Extension

A Chrome extension that captures webpage content and sends it to a DHTI (Digital Health Transformation Initiative) server for AI-powered analysis.

## Features

- 📄 **Content Capture**: Automatically captures selected text or entire page content
- 🔄 **HTML to Markdown**: Converts webpage content to clean Markdown format for LLM processing
- 🤖 **AI Analysis**: Sends content to DHTI server for intelligent responses
- ⚙️ **Configurable**: Customize server URL, content sending preferences, and display mode
- 🎨 **Flexible Display**: Choose between popup or side panel interface
- 🔒 **Privacy Focused**: Control what data is sent to the server

## Installation

### Prerequisites

- Google Chrome browser (version 88 or later)
- A running DHTI server instance (default: `http://localhost:8001`)

### Loading the Extension

1. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/` in your Chrome browser
   - Or click the three-dot menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load Unpacked Extension**
   - Click the "Load unpacked" button
   - Navigate to the `packages/dhti-screen-grabber` directory in this repository
   - Click "Select Folder"

4. **Verify Installation**
   - You should see "DHTI Screen Grabber" appear in your extensions list
   - The extension icon should appear in your Chrome toolbar

## Usage

### Basic Usage

1. **Navigate to any webpage** you want to analyze

2. **Click the DHTI Screen Grabber icon** in your Chrome toolbar
   - For popup mode: A popup window will appear
   - For side panel mode: A side panel will open

3. **Enter your question** in the text box
   - Example: "What is the main topic of this page?"
   - Example: "Summarize the key points"

4. **Click Submit**
   - The extension will capture the page content (if enabled)
   - Send your query to the DHTI server
   - Display the AI-generated response

### Advanced Features

#### Selecting Specific Text

- **Highlight text** on the page before clicking Submit
- The extension will only send the selected text instead of the entire page

#### Configuration Options

Access the options page by:
- Clicking the "Options" button in the popup/side panel
- Right-clicking the extension icon → Options
- Going to `chrome://extensions/` → DHTI Screen Grabber → Details → Extension options

**Available Settings:**

1. **DHTI Server URL**
   - Default: `http://localhost:8001/langserve/dhti_elixir_summary/cds-services/dhti-service`
   - Change this to point to your DHTI server instance

2. **Send Page Data**
   - Enabled: Webpage content is included with your query for context-aware responses
   - Disabled: Only your query text is sent to the server
   - Default: Enabled

3. **Display Mode**
   - Popup: Traditional popup window (default)
   - Side Panel: Opens in Chrome's side panel for a larger workspace

## Architecture

### Components

- **manifest.json**: Extension configuration and permissions
- **background.js**: Service worker for extension lifecycle management
- **content.js**: Content script that captures webpage content
- **popup.html/popup.js**: Popup interface for user interaction
- **sidepanel.html**: Side panel interface (shares popup.js logic)
- **options.html/options.js**: Settings configuration page
- **lib/turndown.js**: HTML to Markdown conversion library

### Data Flow

```
User Query → Content Script → Background Script → DHTI Server
                ↓                                      ↓
            Page Content ────────────────────→ AI Response
                                                      ↓
                                              Display to User
```

### DHTI Integration

The extension uses the CDS Hooks protocol to communicate with the DHTI server:

1. **Request Format**:
   ```json
   {
     "input": {
       "input": {
         "hookInstance": "uuid-v4",
         "hook": "patient-view",
         "context": {
           "input": "Given the {context}, answer: {query}",
           "patientId": "uuid-v4"
         }
       }
     },
     "config": {},
     "kwargs": {}
   }
   ```

2. **Response Format**:
   ```json
   {
     "cards": [
       {
         "summary": "AI response summary",
         "detail": "Detailed response (optional)",
         "indicator": "info"
       }
     ]
   }
   ```

## Development

### File Structure

```
dhti-screen-grabber/
├── manifest.json           # Extension manifest
├── background.js          # Background service worker
├── content.js            # Content script
├── popup.html            # Popup interface
├── popup.js              # Popup logic
├── sidepanel.html        # Side panel interface
├── options.html          # Options page
├── options.js            # Options logic
├── lib/
│   └── turndown.js       # HTML to Markdown converter
├── icon16.png            # Extension icon (16x16)
├── icon48.png            # Extension icon (48x48)
├── icon128.png           # Extension icon (128x128)
└── README.md             # This file
```

### Testing

1. **Test Content Capture**:
   - Open any webpage with text content
   - Select text or leave unselected
   - Verify content is captured correctly

2. **Test DHTI Integration**:
   - Ensure DHTI server is running
   - Submit a query
   - Verify response is displayed

3. **Test Error Handling**:
   - Try with DHTI server offline
   - Try with invalid server URL
   - Verify appropriate error messages

4. **Test Settings**:
   - Change server URL
   - Toggle "Send Page Data"
   - Switch display modes
   - Verify settings persist

### Debugging

1. **View Extension Logs**:
   - Go to `chrome://extensions/`
   - Find DHTI Screen Grabber
   - Click "Inspect views: service worker"

2. **View Popup Logs**:
   - Right-click the popup
   - Select "Inspect"

3. **View Content Script Logs**:
   - Open DevTools on any webpage (F12)
   - Check Console for content script messages

## Troubleshooting

### Extension Not Loading

- Ensure Developer Mode is enabled
- Check for error messages in `chrome://extensions/`
- Verify all required files are present

### Content Not Captured

- Refresh the webpage after loading the extension
- Check browser console for errors
- Verify content script is injected (check DevTools)

### Server Connection Failed

- Verify DHTI server is running
- Check server URL in options
- Ensure server accepts requests from browser (CORS)
- Check network tab in DevTools for request details

### No Response Displayed

- Check server response format matches expected structure
- View browser console for errors
- Verify server is returning valid CDS Hook response

## Security & Privacy

- The extension only sends data when you explicitly click "Submit"
- You can disable page content sending in options
- All data is sent only to the configured DHTI server URL
- No data is collected or stored by the extension itself
- Content is processed locally before sending to server

## Requirements

- Chrome 88+ (for Manifest V3 support)
- DHTI server implementing CDS Hooks protocol
- Internet connectivity to reach DHTI server

## License

This extension is part of the OpenMRS ESM DHTI project and follows the same license.

## Support

For issues, questions, or contributions:
- Check the main repository documentation
- Review existing issues
- Contact the OpenMRS development team

## Version History

### 1.0.0 (Initial Release)
- Content capture (selected text or full page)
- HTML to Markdown conversion
- DHTI server integration
- Configurable settings
- Popup and side panel modes
- Error handling and user feedback
