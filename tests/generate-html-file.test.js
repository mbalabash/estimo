const fs = require('fs')
const test = require('ava')
const path = require('path')

const { removeAllFiles } = require('../src/utils')
const { resolvePathToTempDir } = require('../src/utils')
const {
  generateHtmlFile,
  createHtmlContent,
  prepareLibrariesForEstimation,
} = require('../src/generate-html-file')

test('should properly prepare resources for Estimo', async (t) => {
  let lib1 = path.join(__dirname, '__mock__', '19kb.js')
  let lib2 = path.join(__dirname, '__mock__', '13kb.js')
  let lib3 = 'https://unpkg.com/react@16/umd/react.development.js'

  t.deepEqual(await prepareLibrariesForEstimation([]), [])

  let resources = await prepareLibrariesForEstimation([lib1, lib2, lib3])
  t.is(resources[0].name, '19kb.js')
  t.is(resources[0].url.includes('file://'), true)
  t.is(resources[0].url.includes('temp'), true)
  t.is(resources[0].url.includes('.html'), true)
  t.is(resources[0].htmlPath.includes('temp'), true)
  t.is(resources[0].htmlPath.includes('.html'), true)

  t.is(resources[1].name, '13kb.js')
  t.is(resources[1].url.includes('file://'), true)
  t.is(resources[1].url.includes('temp'), true)
  t.is(resources[1].url.includes('.html'), true)
  t.is(resources[1].htmlPath.includes('temp'), true)
  t.is(resources[1].htmlPath.includes('.html'), true)

  t.is(resources[2].name, 'react.development.js')
  t.is(resources[2].url.includes('file://'), true)
  t.is(resources[2].url.includes('temp'), true)
  t.is(resources[2].url.includes('.html'), true)
  t.is(resources[2].htmlPath.includes('temp'), true)
  t.is(resources[2].htmlPath.includes('.html'), true)

  await removeAllFiles(resources.map((item) => item.htmlPath))
  await removeAllFiles(resources.map((item) => item.tracePath))
})

test('should throw an error for not existed local js files', async (t) => {
  let error = await t.throwsAsync(prepareLibrariesForEstimation(['some/not/existed/file.js']))
  t.is(error.message, `some/not/existed/file.js - file isn't exist!`)
})

test('should properly generate content for html file', (t) => {
  let lib1 = 'https://unpkg.com/react@16/umd/react.development.js'

  t.is(
    createHtmlContent(lib1),
    `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Estimo Template</title>
  </head>
  <body>
    <script src="https://unpkg.com/react@16/umd/react.development.js"></script>
    <h1>Estimo</h1>
  </body>
</html>`
  )
})

test('should properly create html file for one library', async (t) => {
  let lib1 = 'https://unpkg.com/react@16/umd/react.development.js'
  let htmlFile = await generateHtmlFile(createHtmlContent(lib1))

  t.is(fs.existsSync(htmlFile), true)
  t.is(htmlFile, resolvePathToTempDir(path.basename(htmlFile)))

  await removeAllFiles([htmlFile])
})

test('should properly create html for few libraries', async (t) => {
  let lib1 = 'https://unpkg.com/react@16/umd/react.development.js'
  let lib2 = 'https://cdnjs.cloudflare.com/ajax/libs/react/16.8.6/umd/react.production.min.js'

  let htmlFile1 = await generateHtmlFile(createHtmlContent(lib1))
  let htmlFile2 = await generateHtmlFile(createHtmlContent(lib2))

  t.is(fs.existsSync(htmlFile1), true)
  t.is(htmlFile1, resolvePathToTempDir(path.basename(htmlFile1)))

  t.is(fs.existsSync(htmlFile2), true)
  t.is(htmlFile2, resolvePathToTempDir(path.basename(htmlFile2)))

  await removeAllFiles([htmlFile1, htmlFile2])
})
