/**
 * Background Service Worker for DHTI Screen Grabber Extension
 * Handles extension initialization and coordinates between different components
 */

// Initialize default settings on extension install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    dhtiServerUrl: 'http://localhost:8001/langserve/dhti_elixir_summary/cds-services/dhti-service',
    sendPageData: true,
    displayMode: 'popup'
  });
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    // Forward the request to the content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'captureContent' }, (response) => {
          sendResponse(response);
        });
      }
    });
    return true; // Keep the message channel open for async response
  }
});

// Handle side panel opening
chrome.action.onClicked.addListener(async (tab) => {
  const settings = await chrome.storage.sync.get(['displayMode']);
  
  if (settings.displayMode === 'sidepanel') {
    // Open side panel
    await chrome.sidePanel.open({ windowId: tab.windowId });
  }
  // For popup mode, the default action (opening popup) will occur automatically
});
