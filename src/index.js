const { createChromeTrace } = require('./createChromeTrace')
const { generateHtmlFiles } = require('./generateHtmlFiles')
const { generateReadableReport } = require('./reporter')
const { removeTempFiles } = require('./utils')

function checkArgs(libs, browserOptions) {
  if (typeof libs !== 'string' && !Array.isArray(libs)) {
    throw new Error(
      'The first argument should be String or Array<String> which contains a path to the library'
    )
  }
  if (Array.isArray(libs)) {
    libs.forEach(lib => {
      if (typeof lib !== 'string') {
        throw new Error(
          'The first argument should be String or Array<String> which contains a path to the libraries'
        )
      }
    })
  }
  if (typeof browserOptions !== 'object' || browserOptions.constructor !== Object) {
    throw new Error('The second argument should be an Object which contains browser options')
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
async function estimo(libs = [], browserOptions = {}) {
  checkArgs(libs, browserOptions)

  try {
    const htmlFiles = await generateHtmlFiles(libs)
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

module.exports = estimo
