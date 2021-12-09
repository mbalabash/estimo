const { join } = require('path')

const { writeFile } = require('../src/utils')

const chromeConfigPath = join(__dirname, '..', 'chrome.json')

async function cleanChromeConfig() {
  await writeFile(chromeConfigPath, '{ "executablePath": "", "browser": "" }')
}

cleanChromeConfig()

module.exports = { cleanChromeConfig }
