const { createChromeTrace } = require('../create-chrome-trace')
const { generatePrettyReport } = require('../reporter')
const { removeAllFiles, debugLog } = require('../utils')

async function estimoPageMode(pages, browserOptions) {
  let resources = pages.map((page) => ({ name: page, url: page }))
  resources = await createChromeTrace(resources, browserOptions)
  debugLog(`\n[page-mode]: Web pages have prepared for estimation: ${JSON.stringify(resources)}\n`)

  const reports = await generatePrettyReport(resources)
  debugLog(`\n[page-mode]: Have got reports: ${JSON.stringify(reports)}\n`)

  await removeAllFiles(resources.map((file) => file.tracePath))

  return reports
}

module.exports = { estimoPageMode }
