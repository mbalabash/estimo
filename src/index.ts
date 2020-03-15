import { Report } from './reporter'
import { BrowserOptions } from './types'

import { estimoJsMode } from './js-mode'
import { estimoPageMode } from './page-mode'
import { splitResourcesForEstimo, debugLog } from './utils'

function checkInputArgs(resources: string[], browserOptions: BrowserOptions) {
  if (typeof resources !== 'string' && !Array.isArray(resources)) {
    throw new Error(
      'The first argument should be String or Array<String> which contains a path to the resource (js file or web page).'
    )
  }
  if (Array.isArray(resources)) {
    resources.forEach(item => {
      if (typeof item !== 'string') {
        throw new Error(
          'All resources should be represented as a <String> path to the resource (js file or web page).'
        )
      }
    })
  }
  if (typeof browserOptions !== 'object' || browserOptions.constructor !== Object) {
    throw new Error(
      'The second argument should be an Object which contains browser options (see https://github.com/mbalabash/estimo/blob/master/README.md).'
    )
  }
}

export async function estimo(
  resources: string[] = [],
  browserOptions: BrowserOptions = {}
): Promise<Report[]> {
  checkInputArgs(resources, browserOptions)

  const { pages, libraries } = splitResourcesForEstimo(resources)
  let reports: Report[] = []

  debugLog(`\n[estimo]: Found next js files: ${libraries}\n`)
  debugLog(`\n[estimo]: Found next web pages: ${pages}\n`)

  if (libraries.length > 0) {
    reports = reports.concat(await estimoJsMode(libraries, browserOptions))
  }

  if (pages.length > 0) {
    reports = reports.concat(await estimoPageMode(pages, browserOptions))
  }

  debugLog(`\n[estimo]: Result reports: ${JSON.stringify(reports)}\n`)

  return reports
}

export { isChromeConfigValid } from './create-chrome-trace'
export { Report } from './reporter'
export { estimoJsMode } from './js-mode'
export { estimoPageMode } from './page-mode'
export * from './types'
