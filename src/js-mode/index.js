const { prepareLibrariesForEstimation } = require('./prepare-libs-for-estimo')
const { createChromeTrace } = require('../create-chrome-trace')
const { generatePrettyReport } = require('../reporter')
const { removeAllFiles, debugLog } = require('../utils')

async function estimoJsMode(libraries, browserOptions) {
  try {
    let resources = await prepareLibrariesForEstimation(libraries)
    resources = await createChromeTrace(resources, browserOptions)

    debugLog(`[js-mode]: Next javascript resources has been prepared: ${JSON.stringify(resources)}`)

    const report = await generatePrettyReport(resources)

    await removeAllFiles(resources.map(item => item.html))
    await removeAllFiles(resources.map(item => item.trace))

    return report
  } catch (error) {
    console.error(error.stack)
    return process.exit(1)
  }
}

module.exports = { estimoJsMode }
