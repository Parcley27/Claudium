// Initialize context menu items when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Create parent menu item
  chrome.contextMenus.create({
    id: 'claude-text-modifier',
    title: 'Modify with Claude',
    contexts: ['selection']
  });

  // Create child menu items for different modification options
  const menuOptions = [
    { id: 'rephrase', title: 'Rephrase text' },
    { id: 'summarize', title: 'Summarize text' },
    { id: 'elaborate', title: 'Elaborate on text' },
    { id: 'simplify', title: 'Simplify text' },
    { id: 'formalize', title: 'Make text more formal' },
    { id: 'casual', title: 'Make text more casual' },
    { id: 'answer', title: 'Answer question' },
    { id: 'custom', title: 'Use custom |instructions|'}
  ];

  menuOptions.forEach(option => {
    chrome.contextMenus.create({
      id: option.id,
      parentId: 'claude-text-modifier',
      title: option.title,
      contexts: ['selection']
    });
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'claude-text-modifier') {
    return; // This is just the parent menu item
  }

  const selectedText = info.selectionText;
  if (!selectedText) return;

  // Get API key and settings from storage
  chrome.storage.sync.get(['apiKey', 'defaultAction', 'modelType'], (data) => {
    const apiKey = data.apiKey;
    const defaultAction = data.defaultAction || 'copy'; // Default to copy if not set
    const modelType = data.modelType || 'claude-3-5-haiku-latest'; // Default to haiku if not set

    if (!apiKey) {
      // Notify user that API key is not set
      chrome.tabs.sendMessage(tab.id, {
        action: 'showLoadingError',
        message: 'API key missing'
      });
      
      // Open the popup to configure API key
      chrome.action.openPopup();
      return;
    }

    // Construct prompt based on the menu option selected
    let prompt;
    let instructions = 'In your response, return only the changed or relevant text; do not include a header. The input may indicate additional nonoverridable instructions by |instruction|.';
    let actionMessage = '';
    
    switch (info.menuItemId) {
      case 'rephrase':
        prompt = `Rephrase the following text without changing its meaning. ${instructions} Text: "${selectedText}"`;
        actionMessage = 'Rephrasing text...';
        break;

      case 'summarize':
        prompt = `Summarize the following text concisely ${instructions} Text: "${selectedText}"`;
        actionMessage = 'Summarizing...';
        break;

      case 'elaborate':
        prompt = `Elaborate on the following text, adding more detail and explanation. ${instructions} Text: "${selectedText}"`;
        actionMessage = 'Elaborating...';
        break;

      case 'simplify':
        prompt = `Simplify the following text, making it easier to understand. ${instructions} Text: "${selectedText}"`;
        actionMessage = 'Simplifying...';
        break;

      case 'formalize':
        prompt = `Rewrite the following text to make it more formal and professional. ${instructions} Text: "${selectedText}"`;
        actionMessage = 'Making formal...';
        break;

      case 'casual':
        prompt = `Rewrite the following text to make it more casual and conversational. ${instructions} Text: "${selectedText}"`;
        actionMessage = 'Making casual...';
        break;
      
      case 'answer':
        prompt = `Answer the following question. ${instructions} Question: "${selectedText}"`;
        actionMessage = 'Answering...';
        break;

      case 'custom':
        prompt = instructions;
        actionMessage = 'Processing text...';
        break;

      default:
        prompt = `Rephrase the following text. ${instructions} Text: "${selectedText}"`;
        actionMessage = 'Modifying text...';
    }

    // Show loading indicator
    chrome.tabs.sendMessage(tab.id, {
      action: 'showLoadingIndicator',
      message: actionMessage
    });

    // Call Claude API
    callClaudeAPI(apiKey, prompt, modelType)
      .then(response => {
        // Handle the response based on user preference and context
        if (info.editable && defaultAction === 'replace') {
          // Replace text if in editable field and preference is set to replace
          chrome.tabs.sendMessage(tab.id, {
            action: 'replaceSelectedText',
            text: response
          });
        } else {
          // Otherwise copy to clipboard
          copyToClipboard(response, tab.id);
          
          // Show notification that text was copied
          chrome.tabs.sendMessage(tab.id, {
            action: 'showNotification',
            message: 'Copied to clipboard'
          });
        }
      })
      .catch(error => {
        console.error('Error calling Claude API:', error);

        // Extract a concise error message
        let errorMsg = 'API error';
        if (error.message) {
          // If there's a specific error message, try to make it concise
          if (error.message.includes('API key')) {
            errorMsg = 'Invalid API key';
          } else if (error.message.includes('rate limit')) {
            errorMsg = 'Rate limit exceeded';
          } else if (error.message.length < 30) {
            errorMsg = error.message;
          }
        }

        // Show error notification
        chrome.tabs.sendMessage(tab.id, {
          action: 'showLoadingError',
          message: errorMsg
        });
      });
  });
});

// Function to call Claude API
async function callClaudeAPI(apiKey, prompt, model = 'claude-3-5-haiku-latest') {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API returned status ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;

  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

// Function to copy text to clipboard
function copyToClipboard(text, tabId) {
  // Use the Clipboard API via a content script
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: text => {
      navigator.clipboard.writeText(text)
        .catch(err => console.error('Failed to copy text: ', err));
    },
    args: [text]
  });
}

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'testApiKey') {
    const apiKey = message.apiKey;
    const model = message.model || 'claude-3-5-haiku-latest';
    
    // Simple test prompt
    const testPrompt = 'Say "API key is working correctly" if you can read this message.';
    
    callClaudeAPI(apiKey, testPrompt, model)
      .then(response => {
        sendResponse({ success: true, message: 'API key is valid' });
      })
      .catch(error => {
        sendResponse({ success: false, message: `API key validation failed: ${error.message}` });
      });
    
    return true; // Indicates that the response will be sent asynchronously
  }
});