const { createChromeTrace } = require('../create-chrome-trace')
const { generatePrettyReport } = require('../reporter')
const { removeAllFiles, debugLog } = require('../utils')

async function estimoPageMode(pages, browserOptions) {
  try {
    let resources = pages.map((page) => ({ name: page, url: page }))
    resources = await createChromeTrace(resources, browserOptions)

    debugLog(`[page-mode]: Next url's resources has been prepared: ${JSON.stringify(resources)}`)

    const report = await generatePrettyReport(resources)

    await removeAllFiles(resources.map(file => file.trace))

    return report
  } catch (error) {
    console.error(error.stack)
    return process.exit(1)
  }
}

module.exports = { estimoPageMode }
