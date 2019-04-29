const fs = require('fs')
const test = require('ava')
const nanoid = require('nanoid')
const { getUrlToHtmlFile, resolvePathToTempDir } = require('../src/utils')
const { generateReadableReport, formatTime, getEventsTime } = require('../src/reporter')
const { createChromeTrace } = require('../src/createChromeTrace')

test('should create valid report', async (t) => {
  const customTempDir = '../test/__mock__/'
  const fileName = `${nanoid()}.json`
  const filePath = resolvePathToTempDir(fileName, customTempDir)
  const urlToHtmlFile = getUrlToHtmlFile(resolvePathToTempDir('test.html', customTempDir))

  let isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, false)

  await createChromeTrace(urlToHtmlFile, filePath)
  isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, true)

  const report = await generateReadableReport(filePath)
  const { total, javaScript } = report

  t.is(typeof report === 'object', true)
  t.is(javaScript > 0, true)
  t.is(total > 0, true)

  fs.unlinkSync(filePath)
  isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, false)
})

test('should correctly format time', (t) => {
  t.is(formatTime(11.2223123131231), 11.22)
  t.is(formatTime('11.226'), 11.23)
  t.is(formatTime(11), 11.0)
})

test('should correctly calculate time', (t) => {
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
