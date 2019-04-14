// TODO:
// Input: lib or [...libs] (only path)
// + Generate html file and inject libs
// + Get url to html file
// + Spawn perf-timeline-cli and get timelines
// Use node-big-rig to get human-readable report
// Return json report
// Multithreading example

const chalk = require('chalk')
const nanoid = require('nanoid')
const { generateHtmlFile } = require('./generateHtmlFile')
const { generateChromeTimelines } = require('./perfTimelineCliAdapter')

const estimator = async (libs) => {
  const htmlFileName = `./temp/${nanoid()}.html`
  const timelinesFileName = `./temp/${nanoid()}.json`

  try {
    const html = await generateHtmlFile(htmlFileName, libs)
    const timelines = await generateChromeTimelines(html, ['--path', timelinesFileName])
    console.log(html, '\n', timelines)
  } catch (error) {
    console.error(chalk.red(error.stack))
  }
}

;(() => {
  estimator(['./myLib.js', './myAnotherLib.js'])
})()

module.exports = estimator
