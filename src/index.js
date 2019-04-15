const nanoid = require('nanoid')
const { generateHtmlFile } = require('./generateHtmlFile')
const { generateChromeTimelines } = require('./perfTimelineCliAdapter')
const { generateReadableReport } = require('./reporter')
const { deleteFile } = require('./utils')

const checkArgs = (libs, perfCliArgs, removeTempFiles) => {
  if (typeof libs !== 'string' && !Array.isArray(libs)) {
    throw new Error(
      'The first argument should be String or Array of Strings which contains a path to the library',
    )
  }
  if (!Array.isArray(perfCliArgs)) {
    throw new Error(
      'The second argument should be an Array which contains options for perf-timeline-cli',
    )
  }
  if (typeof removeTempFiles !== 'boolean') {
    throw new Error(
      'The third argument should be a Boolean which represents your expectation about removing temporary files',
    )
  }
}

/**
 * @summary Returns Big Rig report for an empty page with passed javascript library.
 *
 * It uses perf-timeline-cli for generating Chrome Performance Timelines.
 * Then node-big-rig uses this information for creating a report.
 *
 * perf-timeline-cli inside the box uses puppeteer.
 * It allows to us use any possible devtools protocol options.
 *
 * We can measure loading/parsing/execution time on the various scenario.
 *
 * @see {@link https://github.com/CondeNast/perf-timeline-cli|perf-timeline-cli}
 * @see {@link https://github.com/googlearchive/node-big-rig|node-big-rig}
 * @see {@link https://github.com/googlearchive/big-rig|big-rig}
 *
 * @param {String|Array} libs Path to the library. Can be local or remote (see example).
 * @param {Array} perfCliArgs Options which will be passed to perf-timeline-cli
 * @param {Boolean} removeTempFiles Default: true. Temp files can help with debugging.
 * @returns {Object} Big Rig report
 *
 * @example
 * const estimo = require('estimo')
 *
 * const report = await estimo([
 *   'https://cdnjs.cloudflare.com/ajax/libs/react/16.8.6/umd/react.production.min.js',
 *   '/absolute/path/to/your/lib.js'
 *   ],
 *   ['--set-cpu-throttling-rate', '--rate', '4']
 * )
 * console.log(report)
 */

const estimo = async (libs = [], perfCliArgs = [], removeTempFiles = true) => {
  checkArgs(libs, perfCliArgs, removeTempFiles)

  const htmlFileName = `${nanoid()}.html`
  const timelinesFileName = `${nanoid()}.json`

  try {
    const html = await generateHtmlFile(htmlFileName, libs)
    const timelines = await generateChromeTimelines(html, timelinesFileName, perfCliArgs)
    const report = await generateReadableReport(timelines)

    if (removeTempFiles) {
      deleteFile(htmlFileName)
      deleteFile(timelinesFileName)
    }

    return report[0]
  } catch (error) {
    console.error(error.stack)
    return process.exit(1)
  }
}

module.exports = estimo
