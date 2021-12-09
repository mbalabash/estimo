const test = require('ava')
const path = require('path')

const { readFile } = require('../../src/utils')
const { findChromeBinary } = require('../../scripts/find-chrome-binary')
const { cleanChromeConfig } = require('../../scripts/clean-chrome-config')

test('should set location setting for downloaded or local chrome', async (t) => {
  let chromeInfo = await findChromeBinary()
  let configData = JSON.parse(await readFile(path.join(__dirname, '../..', 'chrome.json')))

  t.is(typeof chromeInfo === 'object' && Object.keys(chromeInfo).length === 2, true)
  t.is(configData.browser.length > 0, true)
  t.is(configData.executablePath.length > 0, true)
  t.is(configData.executablePath === chromeInfo.executablePath, true)

  await cleanChromeConfig()
})
