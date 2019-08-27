const test = require('ava')
const path = require('path')
const { estimoPageMode } = require('../../src/page-mode')
const { findChrome } = require('../../scripts/chromeDetection')
const { writeFile } = require('../../src/utils')

test('estimoPageMode - should works properly', async (t) => {
  const chromeLocation = await findChrome()

  const page1 = 'https://www.google.com/'
  const page2 = 'https://developers.google.com/web/tools/puppeteer/'

  const reports = await estimoPageMode([page1, page2], { executablePath: chromeLocation })

  t.is(reports[0].name, 'https://www.google.com/')
  t.is(typeof reports[1].total === 'number' && reports[1].total > 0, true)
  t.is(typeof reports[1].javaScript === 'number' && reports[1].javaScript > 0, true)
  t.is(typeof reports[1].parseHTML === 'number' && reports[1].parseHTML > 0, true)

  t.is(reports[1].name, 'https://developers.google.com/web/tools/puppeteer/')
  t.is(typeof reports[1].total === 'number' && reports[1].total > 0, true)
  t.is(typeof reports[1].javaScript === 'number' && reports[1].javaScript > 0, true)
  t.is(typeof reports[1].parseHTML === 'number' && reports[1].parseHTML > 0, true)

  await writeFile(path.join(__dirname, '../..', 'chrome.json'), '{ "executablePath": "" }')
})
