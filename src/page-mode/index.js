const { createChromeTrace } = require('../create-chrome-trace')
const { generatePrettyReport } = require('../reporter')
const { removeAllFiles } = require('../utils')

async function estimoPageMode(pages, browserOptions) {
  try {
    let resources = pages.map((page) => ({ name: page, url: page }))
    resources = await createChromeTrace(resources, browserOptions)
    const report = await generatePrettyReport(resources)

    await removeAllFiles(resources.map(file => file.trace))

    return report
  } catch (error) {
    console.error(error.stack)
    return process.exit(1)
  }
}

module.exports = { estimoPageMode }
