import { BrowserOptions } from '../types'
import { removeAllFiles, debugLog } from '../utils'
import { generatePrettyReport, Report } from '../reporter'
import { prepareLibrariesForEstimation } from './prepare-libs-for-estimo'
import { createChromeTrace } from '../create-chrome-trace'

export async function estimoJsMode(
  libraries: string[],
  browserOptions: BrowserOptions = {}
): Promise<Report[]> {
  const resources = await prepareLibrariesForEstimation(libraries)
  const resourcesWithTrace = await createChromeTrace(resources, browserOptions)
  debugLog(
    `\n[js-mode]: Next javascript resources has been prepared: ${JSON.stringify(resources)}\n`
  )

  const reports = await generatePrettyReport(resourcesWithTrace)
  debugLog(`\n[js-mode]: Got reports for js files: ${JSON.stringify(reports)}\n`)

  if (!process.env.ESTIMO_DEBUG) {
    await removeAllFiles(resourcesWithTrace.map(item => item.html))
    await removeAllFiles(resourcesWithTrace.map(item => item.trace))
  }

  return reports
}
