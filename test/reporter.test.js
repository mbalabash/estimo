const test = require('ava')
const path = require('path')
const { generatePrettyReport, formatTime, getEventsTime } = require('../src/reporter')
const { createChromeTrace } = require('../src/create-chrome-trace')
const { prepareLibrariesForEstimation } = require('../src/js-mode/prepare-libs-for-estimo')
const { findChrome } = require('../scripts/chromeDetection')
const { removeAllFiles, writeFile } = require('../src/utils')

test('[formatTime]: should properly format time', t => {
  t.is(formatTime(11.2223123131231), 11.22)
  t.is(formatTime('11.226'), 11.23)
  t.is(formatTime(11), 11.0)
})

test('[getEventsTime]: should properly calculate time which spent by some group of tasks', t => {
  const events1 = [{ selfTime: 11.11 }, { selfTime: 2.43 }, { selfTime: 7.16 }]
  const events2 = [{ selfTime: 80.0 }]
  const events3 = [
    { selfTime: 21.3 },
    { selfTime: 43.0 },
    { selfTime: 0.16 },
    { selfTime: 9.41 },
    { selfTime: 0.40003 },
    { selfTime: 0.0002 },
  ]
  const events4 = []

  t.is(getEventsTime(events1), 20.7)
  t.is(getEventsTime(events2), 80.0)
  t.is(getEventsTime(events3), 74.27)
  t.is(getEventsTime(events4), 0)
})

test('[report] should create correct Estimo report for one library', async t => {
  const chromeLocation = await findChrome()
  const lib1 = path.join(__dirname, '__mock__', '13kb.js')

  let resources = await prepareLibrariesForEstimation([lib1])
  resources = await createChromeTrace(resources, { executablePath: chromeLocation })
  const reports = await generatePrettyReport(resources)

  t.is(reports[0].name, '13kb.js')
  t.is(typeof reports[0].parseHTML === 'number' && reports[0].parseHTML >= 0, true)
  t.is(typeof reports[0].styleLayout === 'number' && reports[0].styleLayout >= 0, true)
  t.is(typeof reports[0].paintCompositeRender === 'number' && reports[0].paintCompositeRender >= 0, true)
  t.is(typeof reports[0].scriptParseCompile === 'number' && reports[0].scriptParseCompile >= 0, true)
  t.is(typeof reports[0].scriptEvaluation === 'number' && reports[0].scriptEvaluation >= 0, true)
  t.is(typeof reports[0].javaScript === 'number' && reports[0].javaScript > 0, true)
  t.is(typeof reports[0].garbageCollection === 'number' && reports[0].garbageCollection >= 0, true)
  t.is(typeof reports[0].other === 'number' && reports[0].other >= 0, true)
  t.is(typeof reports[0].total === 'number' && reports[0].total > 0, true)

  await removeAllFiles(resources.map(file => file.html))
  await removeAllFiles(resources.map(file => file.trace))
  await writeFile(path.join(__dirname, '..', 'chrome.json'), '{ "executablePath": "" }')
})

test('[report] should create correct Estimo report for few libraries', async t => {
  const chromeLocation = await findChrome()
  const lib1 = path.join(__dirname, '__mock__', '19kb.js')
  const lib2 = path.join(__dirname, '__mock__', '13kb.js')

  let resources = await prepareLibrariesForEstimation([lib1, lib2])
  resources = await createChromeTrace(resources, { executablePath: chromeLocation })
  const reports = await generatePrettyReport(resources)

  t.is(reports[0].name, '19kb.js')
  t.is(typeof reports[0].parseHTML === 'number' && reports[0].parseHTML >= 0, true)
  t.is(typeof reports[0].styleLayout === 'number' && reports[0].styleLayout >= 0, true)
  t.is(typeof reports[0].paintCompositeRender === 'number' && reports[0].paintCompositeRender >= 0, true)
  t.is(typeof reports[0].scriptParseCompile === 'number' && reports[0].scriptParseCompile >= 0, true)
  t.is(typeof reports[0].scriptEvaluation === 'number' && reports[0].scriptEvaluation >= 0, true)
  t.is(typeof reports[0].javaScript === 'number' && reports[0].javaScript > 0, true)
  t.is(typeof reports[0].garbageCollection === 'number' && reports[0].garbageCollection >= 0, true)
  t.is(typeof reports[0].other === 'number' && reports[0].other >= 0, true)
  t.is(typeof reports[0].total === 'number' && reports[0].total > 0, true)

  t.is(reports[1].name, '13kb.js')
  t.is(typeof reports[1].parseHTML === 'number' && reports[1].parseHTML >= 0, true)
  t.is(typeof reports[1].styleLayout === 'number' && reports[1].styleLayout >= 0, true)
  t.is(typeof reports[1].paintCompositeRender === 'number' && reports[1].paintCompositeRender >= 0, true)
  t.is(typeof reports[1].scriptParseCompile === 'number' && reports[1].scriptParseCompile >= 0, true)
  t.is(typeof reports[1].scriptEvaluation === 'number' && reports[1].scriptEvaluation >= 0, true)
  t.is(typeof reports[1].javaScript === 'number' && reports[1].javaScript > 0, true)
  t.is(typeof reports[1].garbageCollection === 'number' && reports[1].garbageCollection >= 0, true)
  t.is(typeof reports[1].other === 'number' && reports[1].other >= 0, true)
  t.is(typeof reports[1].total === 'number' && reports[1].total > 0, true)

  await removeAllFiles(resources.map(file => file.html))
  await removeAllFiles(resources.map(file => file.trace))
  await writeFile(path.join(__dirname, '..', 'chrome.json'), '{ "executablePath": "" }')
})

