# DHTI Screen Grabber Chrome Extension - Implementation Summary

## Overview
This Chrome extension was built to capture webpage content and send it to a DHTI (Digital Health Transformation Initiative) server for AI-powered analysis. The extension follows Chrome's Manifest V3 specifications and integrates seamlessly with the DHTI CDS Hooks service.

## Files Created

### Core Extension Files
1. **manifest.json** - Extension configuration with permissions and metadata
2. **background.js** - Service worker for extension lifecycle management
3. **content.js** - Content script injected into web pages for content capture
4. **popup.html** - Main user interface (popup mode)
5. **popup.js** - Logic for handling user interactions and DHTI communication
6. **sidepanel.html** - Alternative UI for side panel mode
7. **options.html** - Settings configuration page
8. **options.js** - Logic for managing user preferences
9. **package.json** - Package metadata for monorepo consistency

### Supporting Files
10. **lib/turndown.js** - External library for HTML to Markdown conversion
11. **icon16.png, icon48.png, icon128.png** - Extension icons (placeholder)
12. **README.md** - Installation and usage documentation
13. **TESTING.md** - Manual testing guide and checklist
14. **.gitignore** - Git ignore rules for the extension directory

## Key Features Implemented

### 1. Content Capture
- Captures selected text when user highlights content
- Falls back to full page content if no selection
- Filters out unwanted elements (scripts, styles, navigation, ads)
- Provides both HTML and plain text versions

### 2. Markdown Conversion
- Uses Turndown.js to convert HTML to clean Markdown
- Configurable conversion options (ATX headings, fenced code blocks)
- Graceful fallback to plain text if conversion fails

### 3. DHTI Server Integration
- Implements CDS Hooks protocol for communication
- Sends requests in the format expected by DHTI server:
  ```json
  {
    "input": {
      "input": {
        "hookInstance": "uuid",
        "hook": "patient-view",
        "context": {
          "input": "context + query",
          "patientId": "uuid"
        }
      }
    }
  }
  ```
- Handles both card array and direct card responses
- Generates random UUIDs for hookInstance and patientId

### 4. User Interface
- **Popup Mode**: Compact interface (400x300px) for quick access
- **Side Panel Mode**: Expanded interface for extended interactions
- Clean, modern design with proper loading states
- Error messages with helpful guidance
- Status indicators showing configuration state

### 5. Configuration Options
- **Server URL**: Customizable DHTI server endpoint
- **Send Page Data**: Toggle to include/exclude webpage content
- **Display Mode**: Switch between popup and side panel
- Settings persist across browser sessions

### 6. Error Handling
- Network errors (server unreachable)
- Content capture failures (permission issues)
- Invalid server responses
- Missing query validation
- User-friendly error messages

## Technical Highlights

### Chrome Extension Best Practices
- ✅ Manifest V3 compliance
- ✅ Proper permission declarations
- ✅ Service worker for background tasks
- ✅ Message passing between components
- ✅ Chrome Storage API for settings
- ✅ Async/await for cleaner code

### Code Quality
- ✅ Comprehensive JSDoc comments
- ✅ Clear function naming and structure
- ✅ Proper error handling throughout
- ✅ Separation of concerns (content/popup/background)
- ✅ Consistent code style
- ✅ No hardcoded values (configurable)

### Security & Privacy
- ✅ User controls what data is sent
- ✅ Explicit permission requirements
- ✅ Content only sent on user action
- ✅ Configurable server endpoint
- ✅ No data collection by extension

## Integration with OpenMRS ESM DHTI

The extension integrates with the existing DHTI infrastructure:

1. **Uses CDSHookRequest Model**: Follows the same structure as `esm-dhti-utils`
2. **Compatible with DHTI Server**: Works with the LangServe DHTI service
3. **Monorepo Structure**: Placed in `packages/` like other ESM modules
4. **Consistent Naming**: Uses `@openmrs/dhti-screen-grabber` namespace

## How It Works - Flow Diagram

```
User clicks extension icon
         ↓
Popup/Side Panel opens
         ↓
User enters query and clicks Submit
         ↓
Extension checks settings:
  - Should send page data? → Yes/No
         ↓
If Yes: Content script captures page
         ↓
Content cleaned and converted to Markdown
         ↓
Query + Context formatted as CDS Hook request
         ↓
POST to DHTI server
         ↓
Server processes with AI
         ↓
Response parsed and displayed
         ↓
User sees AI-generated answer
```

## Installation Instructions (from README)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `packages/dhti-screen-grabber` directory
5. Extension icon appears in toolbar
6. Configure settings via Options page

## Testing Requirements

The extension requires **manual testing** as it's a browser extension:

1. Load in Chrome Developer Mode
2. Test content capture on various websites
3. Verify DHTI server integration with running server
4. Test error scenarios (offline server, invalid URLs)
5. Validate settings persistence
6. Test both popup and side panel modes

See `TESTING.md` for complete test scenarios.

## Future Enhancement Opportunities

1. **Improved Content Selection**:
   - Smart content extraction (article detection)
   - Custom CSS selectors for specific sites
   - Better handling of single-page applications

2. **Enhanced UI**:
   - History of previous queries
   - Bookmarking responses
   - Customizable themes

3. **Additional Features**:
   - Export responses to PDF/Markdown
   - Multiple DHTI server profiles
   - Keyboard shortcuts
   - Context menu integration

4. **Performance**:
   - Caching of responses
   - Background processing for large pages
   - Progressive content loading

## Compliance & Standards

- ✅ Chrome Manifest V3
- ✅ CDS Hooks 1.0 specification
- ✅ FHIR-compatible (via CDS Hooks)
- ✅ OpenMRS ESM conventions
- ✅ Modern JavaScript (ES6+)
- ✅ Accessible HTML structure

## Dependencies

### External Libraries
- **Turndown.js**: HTML to Markdown converter (v7.x)

### Chrome APIs Used
- `chrome.storage.sync`: For settings persistence
- `chrome.tabs`: For tab management and querying
- `chrome.runtime`: For messaging and options
- `chrome.action`: For extension icon behavior
- `chrome.sidePanel`: For side panel mode
- `chrome.scripting`: For content script injection

### Browser Requirements
- Chrome 88+ (Manifest V3 support)
- Edge (Chromium-based)
- Other Chromium browsers

## Notes

1. **No Build Step**: Extension works directly without compilation
2. **Manual Testing Only**: Automated tests not applicable for Chrome extensions
3. **Server Required**: Needs running DHTI server for functionality
4. **CORS Considerations**: Server must allow browser requests
5. **Icons are Placeholders**: Production use should have proper icons

## Conclusion

The DHTI Screen Grabber extension successfully implements all requested features:
- ✅ Content capture (selected or full page)
- ✅ Markdown conversion
- ✅ DHTI server integration
- ✅ Configurable options
- ✅ Multiple display modes
- ✅ Error handling
- ✅ Comprehensive documentation

The extension is ready for manual testing and integration with a running DHTI server.
