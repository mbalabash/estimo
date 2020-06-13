const { getLibraryName, getUrlToHtmlFile, isUrl, existsAsync } = require('../utils')
const { createHtmlContent, generateHtmlFile } = require('./generate-html-file')

async function prepareLibrariesForEstimation(libraries) {
  const resources = []

  try {
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
  } catch (error) {
    console.error(error)
  }

  return resources
}

module.exports = { prepareLibrariesForEstimation }
