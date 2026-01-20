/**
 * Options Page JavaScript for DHTI Screen Grabber Extension
 * Handles saving and loading user preferences
 */

// Default settings
const DEFAULT_SETTINGS = {
  dhtiServerUrl: 'http://localhost:8001/langserve/dhti_elixir_summary/cds-services/dhti-service',
  sendPageData: true,
  displayMode: 'popup'
};

// Load saved settings when the page loads
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  
  // Add event listener to save button
  document.getElementById('saveButton').addEventListener('click', saveSettings);
});

/**
 * Load settings from Chrome storage and populate the form
 */
function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    document.getElementById('serverUrl').value = settings.dhtiServerUrl;
    document.getElementById('sendPageData').checked = settings.sendPageData;
    document.getElementById('displayMode').value = settings.displayMode;
  });
}

/**
 * Save settings to Chrome storage
 */
function saveSettings() {
  const settings = {
    dhtiServerUrl: document.getElementById('serverUrl').value.trim(),
    sendPageData: document.getElementById('sendPageData').checked,
    displayMode: document.getElementById('displayMode').value
  };
  
  // Validate server URL
  if (!settings.dhtiServerUrl) {
    showStatus('Please enter a valid server URL', false);
    return;
  }
  
  // Save to Chrome storage
  chrome.storage.sync.set(settings, () => {
    showStatus('Settings saved successfully!', true);
  });
}

/**
 * Show status message to user
 * @param {string} message - The message to display
 * @param {boolean} isSuccess - Whether this is a success message
 */
function showStatus(message, isSuccess) {
  const statusElement = document.getElementById('statusMessage');
  statusElement.textContent = message;
  statusElement.className = 'status-message ' + (isSuccess ? 'success' : 'error');
  statusElement.style.display = 'block';
  
  // Hide the message after 3 seconds
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
}
