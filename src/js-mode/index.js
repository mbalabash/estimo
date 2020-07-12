const { prepareLibrariesForEstimation } = require('./prepare-libs-for-estimo')
const { createChromeTrace } = require('../create-chrome-trace')
const { median, removeAllFiles } = require('../utils')
const { generatePrettyReport } = require('../reporter')

async function estimoJsMode(libraries, browserOptions) {
  const runs = browserOptions.runs || 1
  const result = []

  try {
    let resources = await prepareLibrariesForEstimation(libraries)
    let reports = []

    for (let i = 0; i < runs; i += 1) {
      resources = await createChromeTrace(resources, browserOptions)
      reports = reports.concat(await generatePrettyReport(resources))
      await removeAllFiles(resources.map((item) => item.tracePath))
    }

    await removeAllFiles(resources.map((item) => item.htmlPath))

    const sortedReports = {}
    reports.forEach((report) => {
      if (!sortedReports[report.name]) {
        sortedReports[report.name] = []
        sortedReports[report.name].push(report)
      } else {
        sortedReports[report.name].push(report)
      }
    })

    Object.values(sortedReports).forEach((resourceReports) => {
      result.push(median(resourceReports, (report) => report.total))
    })
  } catch (error) {
    console.error(error)
  }

  return result
}

module.exports = { estimoJsMode }
