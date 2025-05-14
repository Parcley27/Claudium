// Global variables
let loadingIndicator = null;
let notificationElement = null;
let lastSelection = null;

// Store the selection range when text is selected
document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  if (selection.toString().trim().length > 0) {
    lastSelection = {
      range: selection.getRangeAt(0),
      text: selection.toString()
    };
  }
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'replaceSelectedText':
      replaceSelectedText(message.text);
      showOverlayIndicator('success', 'Text replaced');
      break;

    case 'showNotification':
      showOverlayIndicator('success', message.message);
      break;

    case 'showLoadingIndicator':
      showOverlayIndicator('loading', message.message || 'Processing with Claude...');
      break;

    case 'hideLoadingIndicator':
      // We don't explicitly hide anymore, as the success/error state will handle that
      break;
    
    case 'showLoadingError':
      showOverlayIndicator('error', message.message || 'An error occurred');
      break;
  }
});

// Function to replace selected text
function replaceSelectedText(newText) {
  if (!lastSelection) return;

  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(newText));
    
    // Clear selection after replacing
    selection.removeAllRanges();
  } else if (lastSelection) {
    // Try to use the stored selection if current selection is empty
    try {
      selection.removeAllRanges();
      selection.addRange(lastSelection.range);
      selection.deleteFromDocument();
      
      const textNode = document.createTextNode(newText);
      selection.getRangeAt(0).insertNode(textNode);
      
      // Clear selection after replacing
      selection.removeAllRanges();
    } catch (error) {
      console.error('Failed to replace text using stored selection:', error);
      showOverlayIndicator('error', 'Could not replace text');
    }
  }
}

// Function to show overlay indicator in the bottom-right corner
function showOverlayIndicator(state, message) {
  // Remove existing indicator if any
  if (loadingIndicator) {
    loadingIndicator.remove();
    loadingIndicator = null;
  }

  // Create container for the overlay
  loadingIndicator = document.createElement('div');
  loadingIndicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    padding: 10px 15px;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 10000;
    font-family: 'Segoe UI', Tahoma, sans-serif;
    font-size: 14px;
    min-width: 220px;
    max-width: 280px;
    transition: opacity 0.2s ease;
    animation: slide-in 0.3s ease;
  `;
  
  // Add animation style
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    @keyframes slide-in {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(styleElement);
  
  // Create icon based on state
  const iconElement = document.createElement('div');
  switch(state) {
    case 'loading':
      iconElement.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#E0E0E0" stroke-width="2.5" />
          <path d="M12 2C6.47715 2 2 6.47715 2 12" stroke="#3F66B3" stroke-width="2.5" stroke-linecap="round">
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              from="0 12 12"
              to="360 12 12"
              dur="1s"
              repeatCount="indefinite" />
          </path>
        </svg>
      `;
      break;
    case 'success':
      iconElement.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#E8F5E9" stroke="#4CAF50" stroke-width="2" />
          <path d="M8 12L10.5 14.5L16 9" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      `;
      break;
    case 'error':
      iconElement.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#FFEBEE" stroke="#F44336" stroke-width="2" />
          <path d="M15 9L9 15" stroke="#F44336" stroke-width="2" stroke-linecap="round" />
          <path d="M9 9L15 15" stroke="#F44336" stroke-width="2" stroke-linecap="round" />
        </svg>
      `;
      break;
  }
  
  // Create "Claudium" brand label
  const brandLabel = document.createElement('div');
  brandLabel.textContent = 'Claudium';
  brandLabel.style.cssText = `
    font-weight: 600;
    color: #3f66b3;
  `;
  
  // Create message element
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messageElement.style.cssText = `
    flex: 1;
    color: #333;
  `;
  
  // Create flex container for brand and message
  const textContainer = document.createElement('div');
  textContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    flex: 1;
  `;
  textContainer.appendChild(brandLabel);
  textContainer.appendChild(messageElement);
  
  // Add elements to overlay
  loadingIndicator.appendChild(iconElement);
  loadingIndicator.appendChild(textContainer);
  
  // Add to DOM
  document.body.appendChild(loadingIndicator);
  
  // Auto-dismiss after delay if success or error
  if (state === 'success' || state === 'error') {
    setTimeout(() => {
      if (loadingIndicator) {
        loadingIndicator.style.opacity = '0';
        setTimeout(() => {
          if (loadingIndicator) {
            loadingIndicator.remove();
            loadingIndicator = null;
          }
        }, 300);
      }
    }, 3000);
  }
}