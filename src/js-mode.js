const { createChromeTrace } = require('./create-chrome-trace')
const { generateHtmlFiles } = require('./generate-html-files')
const { generateReadableReport } = require('./reporter')
const { removeTempFiles } = require('./utils')

async function estimoJsMode(libraries, browserOptions) {
  try {
    const htmlFiles = generateHtmlFiles(libraries)
    const traceFiles = await createChromeTrace(htmlFiles, browserOptions)
    const report = await generateReadableReport(traceFiles)

    await removeTempFiles(htmlFiles.map(file => file.html))
    await removeTempFiles(traceFiles.map(file => file.traceFile))

    return report
  } catch (error) {
    console.error(error.stack)
    return process.exit(1)
  }
}

module.exports = { estimoJsMode }
