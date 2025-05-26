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

1. Download or clone this repository to your  machine
2. Open any Chromium based browser and navigate to 'chrome://extensions/'
    1. Browsers include Chrome, Arc, Edge, Opera, Brave, etc
3. Enable "Developer mode" using the toggle in the top-right corner
4. Click "Load unpacked" and select the folder containing the extension files
5. The extension should now appear in your extensions list, and its icon should be visible in the toolbar

### Configure the Extension

1. Click the extension icon in the toolbar to open the popup
2. Enter your Claude API key in the provided field and click "Save API Key"
    1. See below for how to get an API key.
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
2. Once registered, you can find/create an API key in your account dashboard
    1. You may have been gifted free tokens on sign up. Otherwise, typical usage costs between $0.05 and $0.10 per month
3. Copy the API key and paste it into the extension settings
    1. Save the key somewhere safe, in case it is lost during an update

### Tokens and Costs
1. While Claude is a relativly expensive model compared to some others, typical use of this extension only costs between $0.05 and $0.10 USD per month with Claude Haiku 3.5
    1. At the time of writing, Claude Haiku 3.5 costs $0.80/MTok in and $4.00/MTok out. Claude Sonnet 4 costs $3.00/MTok in and $15.00/MTok out.
2. Anthropic may have gifted $5 worth of tokens when you made your account. This amount of tokens will be able to generate ~4 years of use with Haiku 3.5, unless the tokens expire.
3. Responses are capped at 1000 tokens output, with typical output around . Since 1 token is \~4 english letters, you can expect a cost of \~75 Tok/100 words, or \~250 Tok per typical responce (\~330 words).

## Final Notes

### Privacy
Your Claude API key is stored locally in your browser using Chrome's built-in storage API. The extension only uses your API key to send/recieve your requests to/from Anthropic's API, though a seperate key with a smaller rate limit can be used if you're worried about improper use. 

API access and usage can be monitored at [https://console.anthropic.com/](https://console.anthropic.com/) 

The extension does not collect, store, transmit, or otherwise save any personal data.

### Usage Agreement :(
Please use this responsably. By using Claudium, you agree that the creator of the extension, Pierce Nestibo-Oxley, is not responsable for any and all repercussions related to the use of the extension, including modifications made by any party to the code. You also agree that you are aware that the extension, and the API's behaviour, can be modified at any time without notice, and that the creater of the extension is again not responsable for any damages this may involve.
