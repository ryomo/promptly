# Promptly

## Requirements

* Google Chrome Dev
* At least 22 GB of free storage space
* An integrated GPU or a discrete GPU with a minimum of 4 GB Video RAM


### Chrome Configs

chrome://flags

* `optimization-guide-on-device-model` -> "Enabled BypassPerfRequirement"
* `prompt-api-for-gemini-nano` -> "Enabled"

chrome://components

* `Optimization Guide On Device Model` -> Push "Check for update"


## Usage

### Development

```sh
npm install
npm run dev
```

On the Chrome Extensions page, click "Load unpacked" and select the dist/chrome-mv3 folder.


### Build for Production

```sh
npm install
npm run build
```

On the Chrome Extensions page, click "Load unpacked" and select the dist/chrome-mv3 folder.
