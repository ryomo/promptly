# Promptly

## Requirements

* Google Chrome Dev
* At least 22 GB of free storage space
* An integrated GPU or a discrete GPU with a minimum of 4 GB Video RAM


### Chrome Configs

chrome://flags

* `optimization-guide-on-device-model` -> "Enabled BypassPerfRequirement"
* `prompt-api-for-gemini-nano` -> "Enabled"
* `translation-api` -> "Enabled without language pack limit"
* `language-detection-api` -> "Enabled"

chrome://components

* `Optimization Guide On Device Model` -> Push "Check for update"


## Usage

1. `npm install`
2. `npm run dev`
3. On the Chrome Extensions page, click "Load unpacked" and select the .output/chrome-mv3 folder.
