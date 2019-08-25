const fs = require('fs')
const test = require('ava')
const { removeAllFiles } = require('../src/utils')
const { prepareHtmlContent, generateHtmlFiles } = require('../src/js-mode/generate-html-file')

test('should generate correct html for one library', async (t) => {
  const lib1 = 'https://unpkg.com/react@16/umd/react.development.js'

  const htmlFiles = await generateHtmlFiles([lib1])

  for (const file of htmlFiles) {
    t.is(fs.existsSync(file.html), true)
  }

  await removeAllFiles(htmlFiles.map(file => file.html))
})

test('should generate correct html for few libraries', async (t) => {
  const lib1 = 'https://unpkg.com/react@16/umd/react.development.js'
  const lib2 = 'https://cdnjs.cloudflare.com/ajax/libs/react/16.8.6/umd/react.production.min.js'

  const htmlFiles = await generateHtmlFiles([lib1, lib2])

  for (const file of htmlFiles) {
    t.is(fs.existsSync(file.html), true)
  }

  await removeAllFiles(htmlFiles.map(file => file.html))
})

test('should generate correct content for html file', (t) => {
  const lib1 = 'https://unpkg.com/react@16/umd/react.development.js'

  t.is(
    prepareHtmlContent([lib1]),
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
</html>
`,
  )
})
