const fs = require('fs')
const test = require('ava')
const nanoid = require('nanoid')
const { getUrlToHtmlFile, resolvePathToTempDir } = require('../src/utils')
const { generateChromeTimelines } = require('../src/perfTimelineCliAdapter')
const { generateReadableReport } = require('../src/reporter')

test('should create Big Rig report', async (t) => {
  const customTempDir = '../test/__mock__/'
  const fileName = `${nanoid()}.json`
  const filePath = resolvePathToTempDir(fileName, customTempDir)
  const urlToHtmlFile = getUrlToHtmlFile(resolvePathToTempDir('test.html', customTempDir))

  let isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, false)

  await generateChromeTimelines(urlToHtmlFile, filePath)
  isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, true)

  const report = await generateReadableReport(filePath)
  const { title, type } = report[0]
  t.is(type, 'Load')
  t.is(title, 'Load')

  fs.unlinkSync(filePath)
  isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, false)
})
