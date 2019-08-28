const { createHtmlContent, generateHtmlFile } = require('./generate-html-file')
const { getLibraryName, getUrlToHtmlFile, debugLog } = require('../utils')

async function prepareLibrariesForEstimation(libraries) {
  const resources = []

  for (const lib of libraries) {
    try {
      const htmlContent = createHtmlContent(lib)
      const html = await generateHtmlFile(lib, htmlContent)
      const name = getLibraryName(lib)
      const url = getUrlToHtmlFile(html)

      debugLog(`\n[js-mode]: ------------------------------------------`)
      debugLog(`[js-mode]: Creating html content for js file: ${lib}`)
      debugLog(`[js-mode]: Js file name: ${name}`)
      debugLog(`[js-mode]: Html file: ${html}`)
      debugLog(`[js-mode]: Url to html file: ${url}`)
      debugLog(`[js-mode]: Html content: ${htmlContent}`)
      debugLog(`[js-mode]: ------------------------------------------\n`)

      resources.push({ name, url, html })
    } catch (error) {
      console.error(error.stack)
      return process.exit(1)
    }
  }

  return resources
}

module.exports = { prepareLibrariesForEstimation }
