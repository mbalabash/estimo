import { existsSync } from 'fs'

import { getLibraryName, getUrlToHtmlFile, debugLog, isUrl } from '../utils'
import { createHtmlContent, generateHtmlFile } from './generate-html-file'

export interface Resource {
  name: string
  url: string
  html: string
}

export async function prepareLibrariesForEstimation(libraries: string[]) {
  const resources = []

  for (const lib of libraries) {
    debugLog(`\n[js-mode]: ------------------------------------------`)
    debugLog(`[js-mode]: Preparing file: ${lib}`)

    if (!isUrl(lib) && !existsSync(lib)) {
      debugLog(`[js-mode]: Local file: ${lib} - not exist!`)
      throw new Error(`${lib} - file not exist!`)
    }

    const htmlContent = createHtmlContent(lib)
    const html = await generateHtmlFile(htmlContent)
    const name = getLibraryName(lib)
    const url = getUrlToHtmlFile(html)

    debugLog(`[js-mode]: Creating html content for js file: ${lib}`)
    debugLog(`[js-mode]: Js file name: ${name}`)
    debugLog(`[js-mode]: Html file: ${html}`)
    debugLog(`[js-mode]: Url to html file: ${url}`)
    debugLog(`[js-mode]: Html content: ${htmlContent}`)
    debugLog(`[js-mode]: ------------------------------------------\n`)

    resources.push({ name, url, html })
  }

  return resources
}
