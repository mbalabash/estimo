const { getLibraryName, getUrlToHtmlFile, debugLog, isUrl, existsAsync } = require('../utils')
const { createHtmlContent, generateHtmlFile } = require('./generate-html-file')

async function prepareLibrariesForEstimation(libraries) {
  const resources = []

  for (const lib of libraries) {
    debugLog(`\n[js-mode]: ------------------------------------------`)
    debugLog(`[js-mode]: Preparing the file: ${lib}`)

    const isFileExist = await existsAsync(lib)
    if (!isUrl(lib) && !isFileExist) {
      debugLog(`[js-mode]: Local file: ${lib} - isn't exist!`)
      throw new Error(`${lib} - file isn't exist!`)
    }

    debugLog(`[js-mode]: Creating HTML content for JS file: ${lib}`)
    const htmlContent = createHtmlContent(lib)
    const html = await generateHtmlFile(htmlContent)

    const name = getLibraryName(lib)
    debugLog(`[js-mode]: JS file: ${name}`)
    debugLog(`[js-mode]: HTML file: ${html}`)

    const url = getUrlToHtmlFile(html)
    debugLog(`[js-mode]: Url to HTML file: ${url}`)
    debugLog(`[js-mode]: HTML content: ${htmlContent}`)
    debugLog(`[js-mode]: ------------------------------------------\n`)

    resources.push({ name, url, htmlPath: html })
  }

  return resources
}

module.exports = { prepareLibrariesForEstimation }
