const { createChromeTrace } = require('../create-chrome-trace')
const { generatePrettyReport } = require('../reporter')
const { median, removeAllFiles } = require('../utils')

async function estimoPageMode(pages, browserOptions) {
  const runs = browserOptions.runs || 1
  const result = []

  try {
    let resources = pages.map((page) => ({ name: page, url: page }))
    let reports = []

    for (let i = 0; i < runs; i += 1) {
      resources = await createChromeTrace(resources, browserOptions)
      reports = reports.concat(await generatePrettyReport(resources))
      await removeAllFiles(resources.map((item) => item.tracePath))
    }

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

module.exports = { estimoPageMode }
