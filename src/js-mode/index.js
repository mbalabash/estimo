const { prepareLibrariesForEstimation } = require('./prepare-libs-for-estimo')
const { createChromeTrace } = require('../create-chrome-trace')
const { removeAllFiles, debugLog } = require('../utils')
const { generatePrettyReport } = require('../reporter')

async function estimoJsMode(libraries, browserOptions) {
  let resources = await prepareLibrariesForEstimation(libraries)
  resources = await createChromeTrace(resources, browserOptions)
  debugLog(`\n[js-mode]: Js files have prepared for estimation: ${JSON.stringify(resources)}\n`)

  const reports = await generatePrettyReport(resources)
  debugLog(`\n[js-mode]: Have got reports: ${JSON.stringify(reports)}\n`)

  await removeAllFiles(resources.map((item) => item.htmlPath))
  await removeAllFiles(resources.map((item) => item.tracePath))

  return reports
}

module.exports = { estimoJsMode }
