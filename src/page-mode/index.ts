import { createChromeTrace } from '../create-chrome-trace'
import { generatePrettyReport } from '../reporter'
import { removeAllFiles, debugLog } from '../utils'
import { BrowserOptions } from '../types'

export async function estimoPageMode(pages: string[], browserOptions: BrowserOptions = {}) {
  const resources = pages.map(page => ({ name: page, url: page, html: '' }))
  const resourcesWithTracer = await createChromeTrace(resources, browserOptions)
  debugLog(`\n[page-mode]: Next url's resources has been prepared: ${JSON.stringify(resources)}\n`)

  const reports = await generatePrettyReport(resourcesWithTracer)
  debugLog(`\n[page-mode]: Got reports for web pages: ${JSON.stringify(reports)}\n`)

  if (!process.env.ESTIMO_DEBUG) {
    await removeAllFiles(resourcesWithTracer.map(file => file.trace))
  }

  return reports
}
