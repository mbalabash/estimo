const { nanoid } = require('nanoid')
const { writeFile, resolvePathToTempDir } = require('../utils')

function createHtmlContent(library) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Estimo Template</title>
  </head>
  <body>
    ${`<script src="${library}"></script>`}
    <h1>Estimo</h1>
  </body>
</html>`
}

async function generateHtmlFile(htmlContent) {
  let fileName

  try {
    fileName = resolvePathToTempDir(`${nanoid()}.html`)
    await writeFile(fileName, htmlContent)
  } catch (error) {
    console.error(error)
  }

  return fileName
}

module.exports = { generateHtmlFile, createHtmlContent }
