const { createChromeTrace } = require('../create-chrome-trace')
const { generatePrettyReport } = require('../reporter')
const { removeAllFiles } = require('../utils')

async function estimoPageMode(pages, browserOptions) {
  let reports = []

  try {
    let resources = pages.map((page) => ({ name: page, url: page }))
    resources = await createChromeTrace(resources, browserOptions)
    reports = await generatePrettyReport(resources)

    await removeAllFiles(resources.map((file) => file.tracePath))
  } catch (error) {
    console.error(error)
  }

  return reports
}

module.exports = { estimoPageMode }
