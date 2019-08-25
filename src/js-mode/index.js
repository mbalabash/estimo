const { prepareLibrariesForEstimation } = require('./prepare-libs-for-estimo')
const { createChromeTrace } = require('../create-chrome-trace')
const { generatePrettyReport } = require('../reporter')
const { removeTempFiles } = require('../utils')

async function estimoJsMode(libraries, browserOptions) {
  try {
    const resources = await prepareLibrariesForEstimation(libraries)
    const traces = await createChromeTrace(resources, browserOptions)
    const report = await generatePrettyReport(traces)

    await removeTempFiles(resources.map(item => item.html))
    await removeTempFiles(resources.map(item => item.trace))

    return report
  } catch (error) {
    console.error(error.stack)
    return process.exit(1)
  }
}

module.exports = estimoJsMode
