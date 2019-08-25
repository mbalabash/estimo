const test = require('ava')
const path = require('path')
const { generateReadableReport, formatTime, getEventsTime } = require('../src/reporter')
const { createChromeTrace } = require('../src/create-chrome-trace')
const { generateHtmlFiles } = require('../src/js-mode/generate-html-files')
const { findChrome } = require('../scripts/chromeDetection')
const { removeTempFiles, writeFile } = require('../src/utils')

test('should create valid Estimo report for one library', async t => {
  const chromeLocation = await findChrome()
  const lib1 = path.resolve(path.join(__dirname, '__mock__', '13kb.js'))

  const htmlFiles = await generateHtmlFiles([lib1])
  const traceFiles = await createChromeTrace(htmlFiles, { executablePath: chromeLocation })
  const report = await generateReadableReport(traceFiles)

  const { library, total, javaScript, parseHTML } = report[0]
  t.is(library, '13kb.js')
  t.is(typeof total === 'number' && total > 0, true)
  t.is(typeof javaScript === 'number' && javaScript > 0, true)
  t.is(typeof parseHTML === 'number' && parseHTML > 0, true)

  await removeTempFiles(htmlFiles.map(file => file.html))
  await removeTempFiles(traceFiles.map(file => file.traceFile))
  await writeFile(path.join(__dirname, '..', 'chrome.json'), '{ "executablePath": "" }')
})

test('should create valid Estimo report for few libraries', async t => {
  const chromeLocation = await findChrome()
  const lib1 = path.resolve(path.join(__dirname, '__mock__', '19kb.js'))
  const lib2 = path.resolve(path.join(__dirname, '__mock__', '13kb.js'))

  const htmlFiles = await generateHtmlFiles([lib1, lib2])
  const traceFiles = await createChromeTrace(htmlFiles, { executablePath: chromeLocation })
  const report = await generateReadableReport(traceFiles)

  const {
    library: library1,
    total: total1,
    javaScript: javaScript1,
    parseHTML: parseHTML1,
  } = report[0]
  t.is(library1, '19kb.js')
  t.is(typeof total1 === 'number' && total1 > 0, true)
  t.is(typeof javaScript1 === 'number' && javaScript1 > 0, true)
  t.is(typeof parseHTML1 === 'number' && parseHTML1 > 0, true)

  const {
    library: library2,
    total: total2,
    javaScript: javaScript2,
    parseHTML: parseHTML2,
  } = report[1]
  t.is(library2, '13kb.js')
  t.is(typeof total2 === 'number' && total2 > 0, true)
  t.is(typeof javaScript2 === 'number' && javaScript2 > 0, true)
  t.is(typeof parseHTML2 === 'number' && parseHTML2 > 0, true)

  await removeTempFiles(htmlFiles.map(file => file.html))
  await removeTempFiles(traceFiles.map(file => file.traceFile))
  await writeFile(path.join(__dirname, '..', 'chrome.json'), '{ "executablePath": "" }')
})

test('[formatTime]: should correctly format time', t => {
  t.is(formatTime(11.2223123131231), 11.22)
  t.is(formatTime('11.226'), 11.23)
  t.is(formatTime(11), 11.0)
})

test('[getEventsTime]: should correctly calculate time', t => {
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
