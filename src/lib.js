const { estimoJsMode } = require('./js-mode')
const { estimoPageMode } = require('./page-mode')
const { splitResourcesForEstimo, debugLog } = require('./utils')

function checkInputArgs(resources, browserOptions) {
  if (typeof resources !== 'string' && !Array.isArray(resources)) {
    throw new Error(
      'The first argument should be String or Array<String> which contains a path to the resource (js file or web page).',
    )
  }
  if (Array.isArray(resources)) {
    resources.forEach(item => {
      if (typeof item !== 'string') {
        throw new Error(
          'All resources should be represented as a <String> path to the resource (js file or web page).',
        )
      }
    })
  }
  if (typeof browserOptions !== 'object' || browserOptions.constructor !== Object) {
    throw new Error('The second argument should be an Object which contains browser options (see https://github.com/mbalabash/estimo/blob/master/README.md).')
  }
}


async function estimo(resources = [], browserOptions = {}) {
  checkInputArgs(resources, browserOptions)

  try {
    const { pages, libraries } = splitResourcesForEstimo(resources)
    const reports = []

    debugLog(`[estimo]: Found next js files: ${libraries}`)
    debugLog(`[estimo]: Found next web pages: ${pages}`)

    if (libraries.length > 0) {
      reports.concat(estimoJsMode(libraries, browserOptions))
    }

    if (pages.length > 0) {
      reports.concat(estimoPageMode(pages, browserOptions))
    }

    debugLog(`[estimo]: Result reports: ${JSON.stringify(reports)}`)

    return reports
  } catch (error) {
    console.error(error.stack)
    return process.exit(1)
  }
}

module.exports = estimo
module.exports.estimoJsMode = estimoJsMode
module.exports.estimoPageMode = estimoPageMode

// /**
//  * @summary Evaluates how long the browser will execute your javascript code or web page resources.
//  *
//  * It uses puppeteer to generate Chrome Timelines.
//  * It allows to us use any possible devtools protocol options.
//  *
//  * Then Tracium uses this information for creating a tasks report.
//  * We can measure loading/parsing/execution time on the various scenario.
//  *
//  * @see {@link https://github.com/GoogleChrome/puppeteer|Puppeteer}
//  * @see {@link https://github.com/aslushnikov/tracium|Tracium}
//  *
//  * @param {String|Array} resources Path to the js file or url to web page. Can be local or remote (see example).
//  * @param {Object} browserOptions Options which will be passed to Puppeteer's browser instance.
//  * @returns {Object} Estimo report
//  *
//  * @example
//  * const estimo = require('estimo')
//  *
//  * const report = await estimo([
//  *   'https://cdnjs.cloudflare.com/ajax/libs/react/16.8.6/umd/react.production.min.js',
//  *   'https://www.google.com',
//  *   '/absolute/path/to/your/lib.js'
//  *   ],
//  *   {
//  *     emulateCpuThrottling: true,
//  *     cpuThrottlingRate: 4,
//  *   }
//  * )
//  * console.log(report)
//  */
