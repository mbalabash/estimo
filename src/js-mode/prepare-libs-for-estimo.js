const { createHtmlContent, generateHtmlFile } = require('./generate-html-file')
const { getLibraryName, getUrlToHtmlFile } = require('../utils')

async function prepareLibrariesForEstimation(libraries) {
  const resources = []

  for (const lib of libraries) {
    try {
      const htmlContent = createHtmlContent(lib)
      const htmlFile = await generateHtmlFile(lib, htmlContent)
      resources.push({ name: getLibraryName(lib), url: getUrlToHtmlFile(htmlFile), html: htmlFile })
    } catch (error) {
      console.error(error.stack)
      return process.exit(1)
    }
  }

  return resources
}

module.exports = prepareLibrariesForEstimation
