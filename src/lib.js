const { splitResourcesForEstimo, checkEstimoArgs } = require('./utils')
const { processor } = require('./processor')

async function estimo(resources = [], browserOptions = {}) {
  checkEstimoArgs(resources, browserOptions)
  let reports = []

  try {
    const { pages, libraries } = splitResourcesForEstimo(resources)

    if (libraries.length > 0) {
      reports = reports.concat(await processor(libraries, browserOptions, 'js-mode'))
    }

    if (pages.length > 0) {
      reports = reports.concat(await processor(pages, browserOptions, 'page-mode'))
    }
  } catch (error) {
    console.error(error)
  }

  return reports
}

module.exports = estimo
