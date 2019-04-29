const fs = require('fs')
const test = require('ava')
const path = require('path')
const nanoid = require('nanoid')
const {
  resolvePathToTempDir,
  getUrlToHtmlFile,
  deleteFile,
  writeFile,
  readFile,
} = require('../src/utils')

test('should correctly resolve path to file in temp directory', (t) => {
  const fileName = 'someFile.txt'
  const customTempDir = '../test/__mock__/'

  t.is(resolvePathToTempDir(fileName), path.join(__dirname, '../temp/', fileName))

  t.is(resolvePathToTempDir(fileName, customTempDir), path.join(__dirname, customTempDir, fileName))
})

test('should correctly generate url to file', (t) => {
  const fileName = 'index.html'
  t.is(
    getUrlToHtmlFile(resolvePathToTempDir(fileName)),
    `file://${path.resolve(path.join(__dirname, '../temp/', fileName))}`,
  )
})

test('should write file in right place', async (t) => {
  const customTempDir = '../test/__mock__/'
  const fileName = `${nanoid()}.txt`
  const fileContent = 'information'
  const filePath = resolvePathToTempDir(fileName, customTempDir)

  let isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, false)

  await writeFile(filePath, fileContent)
  isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, true)

  fs.unlinkSync(filePath)
  isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, false)
})

test('should delete file in right place', async (t) => {
  const customTempDir = '../test/__mock__/'
  const fileName = `${nanoid()}.txt`
  const fileContent = 'information'
  const filePath = resolvePathToTempDir(fileName, customTempDir)

  let isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, false)

  await writeFile(filePath, fileContent)
  isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, true)

  await deleteFile(filePath)
  isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, false)
})

test('should correctly read data from file', async (t) => {
  const customTempDir = '../test/__mock__/'
  const fileName = `${nanoid()}.txt`
  const fileContent = 'information'
  const filePath = resolvePathToTempDir(fileName, customTempDir)

  let isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, false)

  await writeFile(filePath, fileContent)
  isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, true)

  const content = await readFile(filePath)
  t.is(content, 'information')

  await deleteFile(filePath)
  isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, false)
})
