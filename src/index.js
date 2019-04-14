// TODO:
// Input: lib or [...libs] (only path)
// + Generate html file and inject libs
// + Get url to html file
// + Spawn perf-timeline-cli and get timelines
// + Use node-big-rig to get human-readable report
// + Return json report
// Remove temp files
// Multithreading example

const chalk = require('chalk')
const nanoid = require('nanoid')
const { generateHtmlFile } = require('./generateHtmlFile')
const { generateChromeTimelines } = require('./perfTimelineCliAdapter')
const { generateReadableReport } = require('./reporter')

const estimator = async (libs) => {
  const htmlFileName = `./temp/${nanoid()}.html`
  const timelinesFileName = `./temp/${nanoid()}.json`

  try {
    const html = await generateHtmlFile(htmlFileName, libs)
    const timelines = await generateChromeTimelines(html, ['--path', timelinesFileName])
    const jsonReport = await generateReadableReport(timelines)
    return jsonReport
  } catch (error) {
    console.error(chalk.red(error.stack))
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
