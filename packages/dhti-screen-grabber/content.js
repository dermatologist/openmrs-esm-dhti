/**
 * Content Script for DHTI Screen Grabber Extension
 * Captures webpage content and converts it to markdown
 */

// Listen for messages from the background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureContent') {
    try {
      // Get selected text or full page content
      const selectedText = window.getSelection().toString().trim();
      
      let content;
      if (selectedText) {
        content = selectedText;
      } else {
        // Get the main content of the page (exclude scripts, styles, etc.)
        const body = document.body.cloneNode(true);
        
        // Remove script and style elements
        const scripts = body.querySelectorAll('script, style, noscript');
        scripts.forEach(el => el.remove());
        
        content = body.innerText || body.textContent || '';
      }
      
      sendResponse({ success: true, content: content, isSelected: !!selectedText });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // Keep the message channel open for async response
});
