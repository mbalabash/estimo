const { splitResourcesForEstimo, debugLog, checkEstimoArgs } = require('./utils')
const { estimoPageMode } = require('./page-mode')
const { estimoJsMode } = require('./js-mode')

async function estimo(resources = [], browserOptions = {}) {
  checkEstimoArgs(resources, browserOptions)
  let reports = []

  try {
    const { pages, libraries } = splitResourcesForEstimo(resources)

    debugLog(`\n[estimo]: Found next js files: ${libraries}\n`)
    debugLog(`\n[estimo]: Found next web pages: ${pages}\n`)

    if (libraries.length > 0) {
      reports = reports.concat(await estimoJsMode(libraries, browserOptions))
    }

    if (pages.length > 0) {
      reports = reports.concat(await estimoPageMode(pages, browserOptions))
    }

    debugLog(`\n[estimo]: Result reports: ${JSON.stringify(reports)}\n`)
  } catch (error) {
    console.error(error)
  }

  return reports
}

module.exports = estimo
