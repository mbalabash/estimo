const fs = require('fs')
const test = require('ava')
const nanoid = require('nanoid')
const { prepareHtmlContent, generateHtmlFile } = require('../src/generateHtmlFile')
const { resolvePathToTempDir, readFile } = require('../src/utils')

test('should generate correct content for html file', (t) => {
  const lib1 = 'https://unpkg.com/react@16/umd/react.development.js'
  const lib2 = 'https://unpkg.com/react-dom@16/umd/react-dom.development.js'

  t.is(
    prepareHtmlContent([lib1]),
    `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Estimo</title>
  </head>
  <body>
    <script src="https://unpkg.com/react@16/umd/react.development.js"></script>
  </body>
</html>
`,
  )

  t.is(
    prepareHtmlContent([lib1, lib2]),
    `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Estimo</title>
  </head>
  <body>
    <script src="https://unpkg.com/react@16/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
  </body>
</html>
`,
  )
})

test('should generate correct html with one lib', async (t) => {
  const customTempDir = '../test/__mock__/'
  const fileName = `${nanoid()}.html`
  const filePath = resolvePathToTempDir(fileName, customTempDir)
  const lib = 'https://unpkg.com/react@16/umd/react.development.js'

  let isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, false)

  await generateHtmlFile(filePath, lib)
  isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, true)

  const content = await readFile(filePath)
  t.is(
    content,
    `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Estimo</title>
  </head>
  <body>
    <script src="https://unpkg.com/react@16/umd/react.development.js"></script>
  </body>
</html>
`,
  )

  fs.unlinkSync(filePath)
  isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, false)
})

test('should generate correct html with many libs', async (t) => {
  const customTempDir = '../test/__mock__/'
  const fileName = `${nanoid()}.html`
  const filePath = resolvePathToTempDir(fileName, customTempDir)
  const lib1 = 'https://unpkg.com/react@16/umd/react.development.js'
  const lib2 = 'https://unpkg.com/react-dom@16/umd/react-dom.development.js'

  let isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, false)

  await generateHtmlFile(filePath, [lib1, lib2])
  isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, true)

  const content = await readFile(filePath)
  t.is(
    content,
    `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Estimo</title>
  </head>
  <body>
    <script src="https://unpkg.com/react@16/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
  </body>
</html>
`,
  )

  fs.unlinkSync(filePath)
  isFileExist = fs.existsSync(filePath)
  t.is(isFileExist, false)
})
