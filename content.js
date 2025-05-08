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
      break;

    case 'showNotification':
      showNotification(message.message);
      break;

    case 'showLoadingIndicator':
      showLoadingIndicator(message.position);
      break;

    case 'hideLoadingIndicator':
      hideLoadingIndicator();
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
      showNotification('Could not replace text. Text copied to clipboard instead.');

    }
  }
}

// Function to show notification
function showNotification(message) {
  // Remove existing notification if any
  if (notificationElement) {
    notificationElement.remove();

  }

  // Create notification element
  notificationElement = document.createElement('div');
  notificationElement.textContent = message;
  notificationElement.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #333;
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    z-index: 9999;
    font-family: Arial, sans-serif;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    transition: opacity 0.3s;
  `;

  // Add to DOM
  document.body.appendChild(notificationElement);

  // Remove after 3 seconds
  setTimeout(() => {
    if (notificationElement) {
      notificationElement.style.opacity = '0';
      setTimeout(() => {
        if (notificationElement) {
          notificationElement.remove();
          notificationElement = null;

        }
      }, 300);

    }
  }, 3000);

}

// Function to show loading indicator
function showLoadingIndicator(position = 'notification') {
  // Remove existing indicator if any
  hideLoadingIndicator();

  loadingIndicator = document.createElement('div');
  
  if (position === 'overlay' && lastSelection) {
    // Create an overlay loading indicator near the selection
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    loadingIndicator.style.cssText = `
      position: absolute;
      top: ${rect.bottom + window.scrollY + 10}px;
      left: ${rect.left + window.scrollX}px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 5px 10px;
      border-radius: 3px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      font-size: 12px;
    `;

    loadingIndicator.textContent = "Fetching response from Claude...";

  } else {
    // Create a notification-style loading indicator
    loadingIndicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #333;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      z-index: 9999;
      font-family: Arial, sans-serif;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    
    // Add spinner
    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
    `;
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;

    document.head.appendChild(style);
    
    const text = document.createElement('span');
    text.textContent = "Processing with Claude...";
    
    loadingIndicator.appendChild(spinner);
    loadingIndicator.appendChild(text);

  }
  
  document.body.appendChild(loadingIndicator);

}

// Function to hide loading indicator
function hideLoadingIndicator() {
  if (loadingIndicator) {
    loadingIndicator.remove();
    loadingIndicator = null;
    
  }
}