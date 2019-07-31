const test = require('ava')
const path = require('path')
const { readFile, writeFile } = require('../src/utils')
const { findChrome } = require('../scripts/chromeDetection')

async function readChromeConfig() {
  return JSON.parse(await readFile(path.join(__dirname, '..', 'chrome.json')))
}

test.afterEach(async () => {
  await writeFile(path.join(__dirname, '..', 'chrome.json'), '{ "executablePath": "" }')
})

test.serial('[chromeDetection]: chrome.json should contains correct empty value', async t => {
  const emptyConfigData = await readChromeConfig()
  t.deepEqual(emptyConfigData, { executablePath: '' })
})

test.serial('[chromeDetection]: should set location setting for downloaded or local chrome', async t => {
  await findChrome()
  const configData = await readChromeConfig()
  t.is(configData.executablePath.includes('chrome'), true)
})
