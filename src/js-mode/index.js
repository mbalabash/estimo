const { prepareLibrariesForEstimation } = require('./prepare-libs-for-estimo')
const { createChromeTrace } = require('../create-chrome-trace')
const { removeAllFiles } = require('../utils')
const { generatePrettyReport } = require('../reporter')

async function estimoJsMode(libraries, browserOptions) {
  let reports = []

  try {
    let resources = await prepareLibrariesForEstimation(libraries)
    resources = await createChromeTrace(resources, browserOptions)
    reports = await generatePrettyReport(resources)

    await removeAllFiles(resources.map((item) => item.htmlPath))
    await removeAllFiles(resources.map((item) => item.tracePath))
  } catch (error) {
    console.error(error)
  }

  return reports
}

module.exports = { estimoJsMode }
