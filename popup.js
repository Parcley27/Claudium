document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const apiKeyInput = document.getElementById('apiKey');
    const toggleApiKeyButton = document.getElementById('toggleApiKey');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const testApiKeyButton = document.getElementById('testApiKey');
    const apiStatusElement = document.getElementById('apiStatus');
    const defaultActionSelect = document.getElementById('defaultAction');
    const statusMessageElement = document.getElementById('statusMessage');
  
    // Load saved settings
    loadSettings();
  
    // Event Listeners
    toggleApiKeyButton.addEventListener('click', toggleApiKeyVisibility);
    saveApiKeyButton.addEventListener('click', saveApiKey);
    testApiKeyButton.addEventListener('click', testApiKey);
    defaultActionSelect.addEventListener('change', saveDefaultAction);
  
    // Function to load saved settings
    function loadSettings() {
      chrome.storage.sync.get(['apiKey', 'defaultAction'], function(data) {
        if (data.apiKey) {
          apiKeyInput.value = data.apiKey;
          updateApiStatus('API key is set', 'status-success');

        }
        
        if (data.defaultAction) {
          defaultActionSelect.value = data.defaultAction;

        }
        
      });
    }
  
    // Function to toggle API key visibility
    function toggleApiKeyVisibility() {
      if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        toggleApiKeyButton.textContent = '🔒';

      } else {
        apiKeyInput.type = 'password';
        toggleApiKeyButton.textContent = '👁️';
        
      }
    }
  
    // Function to save API key
    function saveApiKey() {
      const apiKey = apiKeyInput.value.trim();
      
      if (!apiKey) {
        updateApiStatus('Please enter a valid API key', 'status-error');

        return;

      }
      
      updateApiStatus('Saving...', 'status-loading');
      
      chrome.storage.sync.set({ apiKey }, function() {
        updateApiStatus('API key saved', 'status-success');
        showStatusMessage('Settings saved successfully');

      });
    }
  
    // Function to test API key
    function testApiKey() {
      const apiKey = apiKeyInput.value.trim();
      
      if (!apiKey) {
        updateApiStatus('Please enter an API key to test', 'status-error');

        return;

      }
      
      updateApiStatus('Testing connection...', 'status-loading');
      testApiKeyButton.disabled = true;
      
      chrome.runtime.sendMessage(
        { action: 'testApiKey', apiKey },
        function(response) {
          testApiKeyButton.disabled = false;
          
          if (response.success) {
            updateApiStatus('API key is valid', 'status-success');

          } else {
            updateApiStatus(response.message || 'API key is invalid', 'status-error');

          }

        }
      );
    }
  
    // Function to save default action
    function saveDefaultAction() {
      const defaultAction = defaultActionSelect.value;
      
      chrome.storage.sync.set({ defaultAction }, function() {
        showStatusMessage('Default action updated');

      });
    }
  
    // Function to update API status
    function updateApiStatus(message, className) {
      apiStatusElement.textContent = message;
      apiStatusElement.className = 'api-status';
      
      if (className) {
        apiStatusElement.classList.add(className);

      }
    }
  
    // Function to show status message
    function showStatusMessage(message) {
      statusMessageElement.textContent = message;
      
      // Clear after 3 seconds
      setTimeout(() => {
        statusMessageElement.textContent = '';

      }, 3000);
    }
  });