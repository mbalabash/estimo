const nanoid = require('nanoid')
const { getLibraryName, writeFile, resolvePathToTempDir, assureFileExists } = require('./utils')

function prepareHtmlContent(lib) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Estimo Template</title>
  </head>
  <body>
    ${`<script src="${lib}"></script>`}
    <h1>Estimo</h1>
  </body>
</html>
`
}

async function generateHtmlFiles(libs) {
  const modules = Array.isArray(libs) ? libs : [libs]
  const htmlFiles = []

  for (const lib of modules) {
    try {
      assureFileExists(lib)
      const fileName = resolvePathToTempDir(`${nanoid()}.html`)
      const fileContent = prepareHtmlContent(lib)
      await writeFile(fileName, fileContent)
      htmlFiles.push({ name: getLibraryName(lib), html: fileName })
    } catch (error) {
      console.error(error.stack)
      return process.exit(1)
    }
  }

  return htmlFiles
}

module.exports = { generateHtmlFiles, prepareHtmlContent }
