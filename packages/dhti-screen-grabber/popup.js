/**
 * Popup JavaScript for DHTI Screen Grabber Extension
 * Handles user interactions and communication with DHTI server
 */

// Default settings
const DEFAULT_SETTINGS = {
  dhtiServerUrl: 'http://localhost:8001/langserve/dhti_elixir_summary/cds-services/dhti-service',
  sendPageData: true,
  displayMode: 'popup'
};

let currentSettings = DEFAULT_SETTINGS;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
});

/**
 * Load settings from Chrome storage
 */
function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
    currentSettings = settings;
    updateStatusInfo();
  });
}

/**
 * Setup event listeners for buttons
 */
function setupEventListeners() {
  document.getElementById('submitButton').addEventListener('click', handleSubmit);
  document.getElementById('optionsButton').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Allow Enter key to submit (with Shift+Enter for new line)
  document.getElementById('queryInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  });
}

/**
 * Update status info display
 */
function updateStatusInfo() {
  const statusInfo = document.getElementById('statusInfo');
  if (currentSettings.sendPageData) {
    statusInfo.textContent = '✓ Page content will be included with your query';
  } else {
    statusInfo.textContent = '⚠ Only your query will be sent (page content disabled)';
  }
}

/**
 * Handle submit button click
 */
async function handleSubmit() {
  const queryInput = document.getElementById('queryInput');
  const query = queryInput.value.trim();
  
  if (!query) {
    showError('Please enter a question');
    return;
  }
  
  // Disable submit button and show loading
  setLoading(true);
  
  try {
    // Get page content if enabled
    let pageContent = '';
    if (currentSettings.sendPageData) {
      pageContent = await capturePageContent();
    }
    
    // Build the message
    let message;
    if (pageContent) {
      message = `Given the following context:\n\n${pageContent}\n\nAnswer the following question: ${query}`;
    } else {
      message = query;
    }
    
    // Send to DHTI server
    const response = await sendToDhtiServer(message);
    
    // Display response
    showResponse(response);
    
  } catch (error) {
    showError(error.message || 'Failed to process your request');
  } finally {
    setLoading(false);
  }
}

/**
 * Capture page content from the active tab
 * @returns {Promise<string>} The page content as markdown
 */
async function capturePageContent() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        reject(new Error('No active tab found'));
        return;
      }
      
      chrome.tabs.sendMessage(tabs[0].id, { action: 'captureContent' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error('Failed to capture page content. Please refresh the page and try again.'));
          return;
        }
        
        if (!response || !response.success) {
          reject(new Error(response?.error || 'Failed to capture page content'));
          return;
        }
        
        // If we have HTML content, convert it to Markdown using Turndown
        if (response.htmlContent) {
          try {
            const turndownService = new TurndownService({
              headingStyle: 'atx',
              codeBlockStyle: 'fenced',
              emDelimiter: '*'
            });
            
            const markdown = turndownService.turndown(response.htmlContent);
            resolve(markdown);
          } catch (error) {
            // If Turndown fails, use the plain text content
            console.warn('Turndown conversion failed:', error);
            resolve(response.content);
          }
        } else {
          // For selected text, just return as-is
          resolve(response.content);
        }
      });
    });
  });
}

/**
 * Send message to DHTI server
 * @param {string} message - The message to send
 * @returns {Promise<Object>} The response from the server
 */
async function sendToDhtiServer(message) {
  // Generate a random UUID for patientId
  const patientId = generateUUID();
  
  // Build CDS Hook Request following the model from esm-dhti-utils
  const cdsHookRequest = {
    hookInstance: generateUUID(),
    hook: 'patient-view',
    context: {
      input: message,
      patientId: patientId
    }
  };
  
  // Wrap the request in the expected format for the DHTI server
  const requestBody = {
    input: {
      input: cdsHookRequest
    },
    config: {},
    kwargs: {}
  };
  
  // Send POST request to DHTI server
  const response = await fetch(currentSettings.dhtiServerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Parse response - handle both card array and direct card format
  if (data.cards && data.cards.length > 0) {
    return data.cards[0];
  } else if (data.summary) {
    return data;
  } else {
    throw new Error('Invalid response format from server');
  }
}

/**
 * Generate a random UUID v4
 * @returns {string} A UUID string
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Show response in the UI
 * @param {Object} response - The response card from DHTI server
 */
function showResponse(response) {
  const container = document.getElementById('responseContainer');
  const responseText = document.getElementById('responseText');
  
  let displayText = response.summary || '';
  if (response.detail) {
    displayText += '\n\n' + response.detail;
  }
  
  responseText.textContent = displayText;
  container.classList.remove('error');
  container.classList.add('visible');
}

/**
 * Show error message in the UI
 * @param {string} message - The error message
 */
function showError(message) {
  const container = document.getElementById('responseContainer');
  const responseText = document.getElementById('responseText');
  
  responseText.textContent = message;
  container.classList.add('error', 'visible');
}

/**
 * Set loading state
 * @param {boolean} isLoading - Whether to show loading state
 */
function setLoading(isLoading) {
  const submitButton = document.getElementById('submitButton');
  const responseContainer = document.getElementById('responseContainer');
  const responseText = document.getElementById('responseText');
  
  submitButton.disabled = isLoading;
  
  if (isLoading) {
    responseContainer.classList.remove('error');
    responseContainer.classList.add('visible');
    responseText.innerHTML = '<div class="spinner"></div><div>Processing your request...</div>';
  }
}
