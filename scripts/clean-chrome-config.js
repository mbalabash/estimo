const path = require('path')
const { writeFile } = require('fs')
const { promisify } = require('util')

const writeFileAsync = promisify(writeFile)

module.exports.cleanChromeConfig = function cleanChromeConfig() {
  return writeFileAsync(path.join(__dirname, '..', 'chrome.json'), '{ "executablePath": "" }')
}
