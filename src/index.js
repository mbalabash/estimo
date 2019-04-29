const nanoid = require('nanoid')
const { generateHtmlFile } = require('./generateHtmlFile')
const { createChromeTrace } = require('./createChromeTrace')
const { generateReadableReport } = require('./reporter')
const { deleteFile, resolvePathToTempDir } = require('./utils')

function checkArgs(libs, browserOptions, removeTempFiles) {
  if (typeof libs !== 'string' && !Array.isArray(libs)) {
    throw new Error(
      'The first argument should be String or Array of Strings which contains a path to the library',
    )
  }
  if (typeof browserOptions !== 'object' || browserOptions.constructor !== Object) {
    throw new Error('The second argument should be an Object which contains browser options')
  }
  if (typeof removeTempFiles !== 'boolean') {
    throw new Error(
      'The third argument should be a Boolean which represents your expectation about removing temporary files',
    )
  }
}

/**
 * @summary Evaluates how long the browser will execute your javascript code.
 *
 * It uses puppeteer to generate Chrome Timelines.
 * It allows to us use any possible devtools protocol options.
 *
 * Then Tracium uses this information for creating a tasks report.
 * We can measure loading/parsing/execution time on the various scenario.
 *
 * @see {@link https://github.com/GoogleChrome/puppeteer|Puppeteer}
 * @see {@link https://github.com/aslushnikov/tracium|Tracium}
 *
 * @param {String|Array} libs Path to the library. Can be local or remote (see example).
 * @param {Object} browserOptions Options which will be passed to Puppeteer's browser instance.
 * @param {Boolean} removeTempFiles Default: true. Temp files can help with debugging.
 * @returns {Object} Estimo report
 *
 * @example
 * const estimo = require('estimo')
 *
 * const report = await estimo([
 *   'https://cdnjs.cloudflare.com/ajax/libs/react/16.8.6/umd/react.production.min.js',
 *   '/absolute/path/to/your/lib.js'
 *   ],
 *   {
 *     emulateCpuThrottling: true,
 *     cpuThrottlingRate: 4,
 *   }
 * )
 * console.log(report)
 */
async function estimo(libs = [], browserOptions = {}, removeTempFiles = true) {
  checkArgs(libs, browserOptions, removeTempFiles)

  const htmlFileName = resolvePathToTempDir(`${nanoid()}.html`)
  const timelinesFileName = resolvePathToTempDir(`${nanoid()}.json`)

  try {
    const html = await generateHtmlFile(htmlFileName, libs)
    const timelines = await createChromeTrace(html, timelinesFileName, browserOptions)
    const report = await generateReadableReport(timelines)

    if (removeTempFiles) {
      await deleteFile(htmlFileName)
      await deleteFile(timelinesFileName)
    }

    return report
  } catch (error) {
    console.error(error.stack)
    return process.exit(1)
  }
}

module.exports = estimo
