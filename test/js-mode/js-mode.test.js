const test = require('ava')
const path = require('path')
const { findChrome } = require('../../scripts/chromeDetection')
const { estimoJsMode } = require('../../src/js-mode')
const { writeFile } = require('../../src/utils')

test('estimoJsMode - should works properly', async (t) => {
  const chromeLocation = await findChrome()

  const lib1 = path.join(__dirname, '..', '__mock__', '19kb.js')
  const lib2 = path.join(__dirname, '..', '__mock__', '13kb.js')
  const lib3 = 'https://unpkg.com/react@16/umd/react.development.js'

  const reports = await estimoJsMode([lib1, lib2, lib3], { executablePath: chromeLocation })

  t.is(reports[0].name, '19kb.js')
  t.is(typeof reports[0].total === 'number' && reports[0].total > 0, true)
  t.is(typeof reports[0].javaScript === 'number' && reports[0].javaScript > 0, true)
  t.is(typeof reports[0].parseHTML === 'number' && reports[0].parseHTML > 0, true)

  t.is(reports[1].name, '13kb.js')
  t.is(typeof reports[1].total === 'number' && reports[1].total > 0, true)
  t.is(typeof reports[1].javaScript === 'number' && reports[1].javaScript > 0, true)
  t.is(typeof reports[1].parseHTML === 'number' && reports[1].parseHTML > 0, true)

  t.is(reports[2].name, 'react.development.js')
  t.is(typeof reports[2].total === 'number' && reports[2].total > 0, true)
  t.is(typeof reports[2].javaScript === 'number' && reports[2].javaScript > 0, true)
  t.is(typeof reports[2].parseHTML === 'number' && reports[2].parseHTML > 0, true)

  await writeFile(path.join(__dirname, '../..', 'chrome.json'), '{ "executablePath": "" }')
})
