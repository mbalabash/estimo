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
  megabitsToBytes,
  getLibraryName,
} = require('../src/utils')

test('[resolvePathToTempDir]: should correctly resolve path to file in temp directory', (t) => {
  const fileName = 'someFile.txt'
  const customTempDir = '../test/__mock__/'

  t.is(resolvePathToTempDir(fileName), path.join(__dirname, '../temp/', fileName))

  t.is(resolvePathToTempDir(fileName, customTempDir), path.join(__dirname, customTempDir, fileName))
})

test('[getUrlToHtmlFile]: should correctly generate url to file', (t) => {
  const fileName = 'index.html'
  t.is(
    getUrlToHtmlFile(resolvePathToTempDir(fileName)),
    `file://${path.resolve(path.join(__dirname, '../temp/', fileName))}`,
  )
})

test('[writeFile]: should write file in right place', async (t) => {
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

test('[deleteFile]: should delete file in right place', async (t) => {
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

test('[readFile]: should read data from right file', async (t) => {
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

test('[megabitsToBytes]: should correctly transform megabits to bytes', async (t) => {
  t.is(megabitsToBytes(0.75), 98304)
  t.is(megabitsToBytes(1.6), 209715.2)
  t.is(megabitsToBytes(13), 1703936)
  t.is(megabitsToBytes(0.33), 43253.76)
})

test('[getLibraryName]: should correctly extract library name', async (t) => {
  t.is(getLibraryName('http://qwe.asd/myLib.js'), 'myLib.js')
  t.is(getLibraryName('http://qwe.asd/myLib/some/dir/lib.js'), 'lib.js')
  t.is(getLibraryName('https://qwe.asd/myLib.js'), 'myLib.js')
  t.is(getLibraryName('https://qwe.asd/myLib/core.js'), 'core.js')
  t.is(getLibraryName('./dir/dev/lib/index.js'), 'index.js')
  t.is(getLibraryName('/Users/dev/project/myLib.js'), 'myLib.js')
  t.is(getLibraryName('../myLib.js'), 'myLib.js')
})
