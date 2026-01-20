/**
 * Content Script for DHTI Screen Grabber Extension
 * Captures webpage content and prepares it for markdown conversion
 */

// Listen for messages from the background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureContent') {
    try {
      // Get selected text or full page content
      const selectedText = window.getSelection().toString().trim();
      
      let content;
      let htmlContent;
      
      if (selectedText) {
        // Use the selected text directly
        content = selectedText;
        htmlContent = null; // Plain text, no HTML needed
      } else {
        // Clone the body to avoid modifying the actual page
        const body = document.body.cloneNode(true);
        
        // Remove unwanted elements
        const unwantedSelectors = [
          'script',
          'style',
          'noscript',
          'iframe',
          'nav',
          'header',
          'footer',
          '.advertisement',
          '.ad',
          '.social-share',
          '[role="navigation"]',
          '[role="banner"]',
          '[role="complementary"]'
        ];
        
        unwantedSelectors.forEach(selector => {
          const elements = body.querySelectorAll(selector);
          elements.forEach(el => el.remove());
        });
        
        // Get the HTML for Turndown conversion
        htmlContent = body.innerHTML;
        
        // Also get plain text as fallback
        content = body.innerText || body.textContent || '';
      }
      
      sendResponse({ 
        success: true, 
        content: content,
        htmlContent: htmlContent,
        isSelected: !!selectedText 
      });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // Keep the message channel open for async response
});
