const { nanoid } = require('nanoid')
const {
  writeFile,
  resolvePathToTempDir,
  getLibraryName,
  getUrlToHtmlFile,
  isUrl,
  existsAsync,
} = require('./utils')

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

async function prepareLibrariesForEstimation(libraries) {
  const resources = []

  for (const lib of libraries) {
    const isFileExist = await existsAsync(lib)
    if (!isUrl(lib) && !isFileExist) {
      throw new Error(`${lib} - file isn't exist!`)
    }

    const htmlContent = createHtmlContent(lib)
    const html = await generateHtmlFile(htmlContent)

    const name = getLibraryName(lib)
    const url = getUrlToHtmlFile(html)
    resources.push({ name, url, htmlPath: html })
  }

  return resources
}

module.exports = { generateHtmlFile, createHtmlContent, prepareLibrariesForEstimation }
