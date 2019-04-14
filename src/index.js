const nanoid = require('nanoid')
const { generateHtmlFile } = require('./generateHtmlFile')
const { generateChromeTimelines } = require('./perfTimelineCliAdapter')
const { generateReadableReport } = require('./reporter')
const { deleteFile } = require('./utils')

const estimo = async (libs = [], perfCliArgs = []) => {
  const htmlFileName = `./temp/${nanoid()}.html`
  const timelinesFileName = `./temp/${nanoid()}.json`

  try {
    const html = await generateHtmlFile(htmlFileName, libs)
    const timelines = await generateChromeTimelines(html, [
      ...perfCliArgs,
      '--path',
      timelinesFileName,
    ])
    const jsonReport = await generateReadableReport(timelines)
    deleteFile(htmlFileName)
    deleteFile(timelinesFileName)
    return jsonReport
  } catch (error) {
    console.error(error.stack)
    return process.exit(1)
  }
}

module.exports = estimo
