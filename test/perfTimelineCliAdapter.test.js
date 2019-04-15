const fs = require('fs')
const test = require('ava')
const nanoid = require('nanoid')
const { getUrlToHtmlFile, resolvePathToTempDir } = require('../src/utils')
const { generateChromeTimelines } = require('../src/perfTimelineCliAdapter')

test('should generate Chrome Performance Timelines without any options', async (t) => {
  const customTempDir = '../test/__mock__/'
  const fileName = `${nanoid()}.json`
  const filePath = resolvePathToTempDir(fileName, customTempDir)
  const urlToHtmlFile = getUrlToHtmlFile(resolvePathToTempDir('test.html', customTempDir))

  let isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, false)

  await generateChromeTimelines(urlToHtmlFile, filePath)
  isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, true)

  fs.unlinkSync(filePath)
  isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, false)
})

test('should generate Chrome Performance Timelines with options', async (t) => {
  const customTempDir = '../test/__mock__/'
  const fileName = `${nanoid()}.json`
  const filePath = resolvePathToTempDir(fileName, customTempDir)
  const urlToHtmlFile = getUrlToHtmlFile(resolvePathToTempDir('test.html', customTempDir))
  const perfCliArgs = [
    '--set-cpu-throttling-rate',
    '--rate',
    4,
    '--emulate-network-conditions',
    '--latency',
    '150',
  ]

  let isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, false)

  await generateChromeTimelines(urlToHtmlFile, filePath, perfCliArgs)
  isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, true)

  fs.unlinkSync(filePath)
  isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, false)
})
