// TODO:
// Input: lib or [...libs] (only path)
// Check arg types
// Option to save html file
// Option to save timelines file
// Option to save report file
// + Generate html file and inject libs
// + Get url to html file
// + Spawn perf-timeline-cli and get timelines
// + Use node-big-rig to get human-readable report
// + Return json report
// + Remove temp files

const nanoid = require('nanoid')
const { generateHtmlFile } = require('./generateHtmlFile')
const { generateChromeTimelines } = require('./perfTimelineCliAdapter')
const { generateReadableReport } = require('./reporter')
const { deleteFile } = require('./utils')

const estimator = async (libs = [], options = {}) => {
  const htmlFileName = `./temp/${nanoid()}.html`
  const timelinesFileName = `./temp/${nanoid()}.json`

  const { perfCliArgs } = options

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

;(async () => {
  const result = await estimator([
    'https://cdnjs.cloudflare.com/ajax/libs/react/16.8.6/umd/react.production.min.js',
  ])
  console.log(result)
})()

module.exports = estimator
