const path = require('path')
const test = require('ava')
const { resolvePathToTempDir, getUrlToHtmlFile } = require('../src/utils')

test('should correctly resolve path to file in temp directory', (t) => {
  const fileName = 'someFile.txt'
  t.is(resolvePathToTempDir(fileName), path.join(__dirname, '../temp/', fileName))
})

test('should correctly generate url to file', (t) => {
  const fileName = 'index.html'
  t.is(
    getUrlToHtmlFile(resolvePathToTempDir(fileName)),
    `file://${path.resolve(path.join(__dirname, '../temp/', fileName))}`,
  )
})
