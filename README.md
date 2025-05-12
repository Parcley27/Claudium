# Text Modifier with Claude API

A Chrome extension that adds Claude AI-powered text modification to your right-click menu. Select text on any webpage, right-click, and transform it using Claude's natural language capabilities.

## Features

- Multiple text modification options (rephrase, summarize, elaborate, simplify, formalize, make casual)
- Custom commands using |*instruction here*| to detail exactly what you want
- Works on any website
- Option to replace text directly or copy to clipboard
- Simple configuration via a popup interface
- Visual feedback with loading indicators and notifications

## Installation

### Load as an Unpacked Extension

1. Download or clone this repository to your local machine
2. Open any Chromium based browser and navigate to `chrome://extensions/`
    1. Including Chrome, Arc, Edge, Opera, Brave, etc
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the folder containing the extension files
5. The extension should now appear in your extensions list and its icon should be visible in the toolbar

### Configure the Extension

1. Click the extension icon in the toolbar to open the popup
2. Enter your Claude API key in the provided field and click "Save API Key"
3. (Optional) Click "Test Connection" to verify that your API key works
    1. A message detailing the error will be displayed if it doesn't
4. Choose your preferred default action (copy to clipboard or replace text)

## How to Use

1. Select some text on any webpage
2. Right-click on the selected text
3. Hover over "Modify with Claude" in the context menu
4. Choose a modification option (rephrase, summarize, etc.)
5. Wait for Claude to process your text
6. The modified text will either replace your selection (if in an editable field and your settings allow) or be copied to your clipboard
    1. The default behaviour can also be changed in the extension settings, accessed by clicking on the extension icon

## Getting a Claude API Key

To use this extension, you need a Claude API key:

1. Sign up for an Anthropic API account at [https://console.anthropic.com/](https://console.anthropic.com/)
2. Once registered, you can find your API key in your account dashboard
3. Copy the API key and paste it into the extension settings
    1. Save the key somewhere safe, in case it is lost during an update

## Privacy Note

Your Claude API key is stored locally in your browser using Chrome's storage API. The extension only uses your API key to send/recieve your requests to/from Anthropic's API, though a seperate key with a smaller rate limit can be used if you're worried. 

API access and usage can be monitored at [https://console.anthropic.com/](https://console.anthropic.com/) 

The extension does not collect, store, transmit, or otherwise save any personal data.