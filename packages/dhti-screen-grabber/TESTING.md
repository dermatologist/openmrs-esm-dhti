# DHTI Screen Grabber - Testing Guide

## Manual Testing Checklist

### Installation Testing
- [ ] Extension loads without errors in Chrome
- [ ] Extension icon appears in toolbar
- [ ] All permissions are granted

### Basic Functionality
- [ ] Popup opens when clicking extension icon
- [ ] Options page opens from popup
- [ ] Side panel can be opened (after switching mode in options)
- [ ] Text input field accepts text
- [ ] Submit button is clickable

### Content Capture
- [ ] Full page content is captured when no text is selected
- [ ] Selected text is captured when text is highlighted
- [ ] Content is properly converted to markdown format
- [ ] Script and style elements are excluded from capture

### DHTI Server Integration
- [ ] Request is sent to configured server URL
- [ ] Request follows CDS Hook format
- [ ] Response is properly parsed
- [ ] Response is displayed in UI
- [ ] Error messages show when server is unreachable

### Settings/Options
- [ ] Server URL can be changed and saved
- [ ] "Send page data" checkbox toggles correctly
- [ ] Display mode switch between popup and side panel works
- [ ] Settings persist after browser restart

### Error Handling
- [ ] Error message shown when server is offline
- [ ] Error message shown when no query is entered
- [ ] Error message shown when content capture fails
- [ ] Error message shown when server returns invalid response

### UI/UX
- [ ] Loading spinner shows during request
- [ ] Submit button is disabled during loading
- [ ] Response text is readable and properly formatted
- [ ] Status info shows correct state
- [ ] Keyboard shortcuts work (Enter to submit)

## Test Scenarios

### Scenario 1: Basic Usage with Page Content
1. Navigate to any webpage (e.g., Wikipedia article)
2. Click extension icon
3. Enter query: "What is the main topic of this page?"
4. Click Submit
5. **Expected**: Page content sent with query, AI response displayed

### Scenario 2: Selected Text Only
1. Navigate to any webpage
2. Select a paragraph of text
3. Click extension icon
4. Enter query: "Summarize this text"
5. Click Submit
6. **Expected**: Only selected text sent, relevant summary displayed

### Scenario 3: Query Without Page Content
1. Open extension
2. Go to Options
3. Uncheck "Send page data"
4. Save settings
5. Return to popup
6. Enter query: "What is AI?"
7. Click Submit
8. **Expected**: Only query sent, general AI response displayed

### Scenario 4: Side Panel Mode
1. Go to Options
2. Change Display Mode to "Side Panel"
3. Save settings
4. Click extension icon
5. **Expected**: Side panel opens instead of popup

### Scenario 5: Server Error Handling
1. Go to Options
2. Change server URL to invalid address (e.g., http://invalid.local)
3. Save settings
4. Try to submit a query
5. **Expected**: Clear error message about server connection failure

## Performance Testing
- [ ] Extension loads quickly (<1 second)
- [ ] Content capture is fast (<500ms)
- [ ] UI remains responsive during server request
- [ ] Large pages don't crash the extension
- [ ] Multiple queries can be sent in succession

## Security Testing
- [ ] Content is only sent when Submit is clicked
- [ ] No data is sent to unexpected URLs
- [ ] CORS errors are handled gracefully
- [ ] Extension doesn't leak sensitive data

## Browser Compatibility
- [ ] Works on Chrome 88+
- [ ] Works on Edge (Chromium-based)
- [ ] Works on Brave
- [ ] Works on other Chromium browsers

## Notes
- Manual testing required as extension doesn't have automated tests
- Test with real DHTI server running on localhost:8001
- Test with different types of web pages (simple, complex, SPA)
- Test error scenarios thoroughly
