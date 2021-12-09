const path = require('path')
const { writeFile } = require('../src/utils')

async function cleanChromeConfig() {
  await writeFile(path.join(__dirname, '..', 'chrome.json'), '{ "executablePath": "", "browser": "" }')
}

cleanChromeConfig()
