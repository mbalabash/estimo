const { splitResourcesForEstimo, checkEstimoArgs } = require('./utils')
const { estimoPageMode } = require('./page-mode')
const { estimoJsMode } = require('./js-mode')

async function estimo(resources = [], browserOptions = {}) {
  checkEstimoArgs(resources, browserOptions)
  let reports = []

  try {
    const { pages, libraries } = splitResourcesForEstimo(resources)

    if (libraries.length > 0) {
      reports = reports.concat(await estimoJsMode(libraries, browserOptions))
    }

    if (pages.length > 0) {
      reports = reports.concat(await estimoPageMode(pages, browserOptions))
    }
  } catch (error) {
    console.error(error)
  }

  return reports
}

module.exports = estimo
