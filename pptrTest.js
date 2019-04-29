const nanoid = require('nanoid')
const { generateHtmlFile } = require('./src/generateHtmlFile')
const { resolvePathToTempDir } = require('./src/utils')
const { createChromeTrace } = require('./src/createChromeTrace')
const { generateReadableReport } = require('./src/reporter')

;

(async () => {
  const htmlFileName = resolvePathToTempDir(`${nanoid()}.html`)
  const timelinesFileName = resolvePathToTempDir(`${nanoid()}.json`)

  const html = await generateHtmlFile(
    htmlFileName,
    'https://cdnjs.cloudflare.com/ajax/libs/react/16.8.6/umd/react.production.min.js',
  )
  const timelines = await createChromeTrace(html, timelinesFileName)
  const report = await generateReadableReport(timelines)

  console.log('Report:', report)
})()

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason)
})
