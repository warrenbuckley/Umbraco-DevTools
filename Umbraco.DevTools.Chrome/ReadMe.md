# Umbraco DevTools - Chrome Extension

## Build Prep
You need to do a couple of steps to get ready & started.

* Run `npm install` in this folder to fetch any dependcies for build tools
* Build depends on gulp. So ensure you have installed using `npm install -g gulp-cli`
* This project uses TypeScript to help develop & catch any JS errors I may have along the way. So you will need to install the transpiler via NPM with `npm install -g typescript`

## Gulp Tasks
There are the following gulp tasks:

* `gulp` aka the default task runs `copy`, `scripts` and `watch`
* `copy`: copies images, manifest.json, and any HTML views to `dist` folder from the `src` folder
* `scripts`: Transpiles TypeScript `*.ts` files into the same filename as `*.js`
* `watch`: Is checking for any changes made to the files and ensures TypeScript is Transpiled again & any relevnt files copied across

## Running/Testing the Extension
* Open Chrome Menu
* Goto Extensions
* Check the `Developer Mode` checkbox
* Then `Load unpacked extenson` and browse to the `dist` folder
* Browse to the Umbraco TestSite in this project with Chrome and Open Developer Tools
* A new tab should appear, where we will be pushing our Umbraco Log4Net messages to

## Developing & Debugging
* With the new DevTools tab open you can do some inception and open DevTools for the DevTools window.
* Here any JS console log messages, JS debugging or HTML inspection can be applied directly to the HTML view of the DevTools tab
* From what I can tell so far any changes made need tobe reloaded via the Extensions overview/dashboard page