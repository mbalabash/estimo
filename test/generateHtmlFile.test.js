const test = require('ava')
const { prepareHtmlContent } = require('../src/generateHtmlFile')

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
