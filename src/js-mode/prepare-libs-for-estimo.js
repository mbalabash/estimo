const { createHtmlContent, generateHtmlFiles } = require('./generate-html-files')
const { getLibraryName } = require('../utils')

async function prepareLibrariesForEstimation(libraries) {
  const resources = []

  for (const lib of libraries) {
    try {
      const htmlContent = createHtmlContent(lib)
      const htmlFile = generateHtmlFiles(lib, htmlContent)
      resources.push({ name: getLibraryName(lib), html: htmlFile })
    } catch (error) {
      console.error(error.stack)
      return process.exit(1)
    }
  }

  return resources
}

module.exports = prepareLibrariesForEstimation
