const test = require('ava')
const path = require('path')
const { readFile, writeFile } = require('../src/utils')
const { findChrome } = require('../scripts/chromeDetection')

test('should set location setting for downloaded or local chrome', async t => {
  await findChrome()
  const configData = JSON.parse(await readFile(path.join(__dirname, '..', 'chrome.json')))
  t.is(configData.executablePath.includes('chrome'), true)
  await writeFile(path.join(__dirname, '..', 'chrome.json'), '{ "executablePath": "" }')
})
