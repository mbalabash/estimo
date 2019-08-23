const { createChromeTrace } = require('./create-chrome-trace')
const { generateReadableReport } = require('./reporter')
const { removeTempFiles, getLibraryName } = require('./utils')

async function estimoPageMode(pages, browserOptions) {
  try {
    const items = pages.map((page) => ({ name: getLibraryName(page), html: page }))
    const traceFiles = await createChromeTrace(items, browserOptions)
    const report = await generateReadableReport(traceFiles)

    await removeTempFiles(traceFiles.map(file => file.traceFile))

    return report
  } catch (error) {
    console.error(error.stack)
    return process.exit(1)
  }
}

module.exports = { estimoPageMode }
