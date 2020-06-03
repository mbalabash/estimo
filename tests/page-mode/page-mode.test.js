const test = require('ava')
const path = require('path')
const { estimoPageMode } = require('../../src/page-mode')
const { findChrome } = require('../../scripts/chromeDetection')
const { writeFile, getUrlToHtmlFile } = require('../../src/utils')

test('estimoPageMode - should works properly', async (t) => {
  const chromeLocation = await findChrome()

  const page = getUrlToHtmlFile(path.join(__dirname, '..', '__mock__', 'test.html'))
  const reports = await estimoPageMode([page], { executablePath: chromeLocation })

  t.is(reports[0].name, page)
  t.is(typeof reports[0].parseHTML === 'number' && reports[0].parseHTML >= 0, true)
  t.is(typeof reports[0].styleLayout === 'number' && reports[0].styleLayout >= 0, true)
  t.is(
    typeof reports[0].paintCompositeRender === 'number' && reports[0].paintCompositeRender >= 0,
    true
  )
  t.is(
    typeof reports[0].scriptParseCompile === 'number' && reports[0].scriptParseCompile >= 0,
    true
  )
  t.is(typeof reports[0].scriptEvaluation === 'number' && reports[0].scriptEvaluation >= 0, true)
  t.is(typeof reports[0].javaScript === 'number' && reports[0].javaScript > 0, true)
  t.is(typeof reports[0].garbageCollection === 'number' && reports[0].garbageCollection >= 0, true)
  t.is(typeof reports[0].other === 'number' && reports[0].other >= 0, true)
  t.is(typeof reports[0].total === 'number' && reports[0].total > 0, true)

  await writeFile(path.join(__dirname, '../..', 'chrome.json'), '{ "executablePath": "" }')
})
