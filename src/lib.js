import { processor } from './processor.js'
import {
  checkEstimoArgs,
  findChromeBinary,
  splitResourcesForEstimo
} from './utils.js'

export async function estimo(resources = [], browserOptions = {}) {
  if (process.env.ESTIMO_DISABLE) process.exit()
  checkEstimoArgs(resources, browserOptions)
  let reports = []

  try {
    let { executablePath } = await findChromeBinary()
    browserOptions.executablePath = executablePath

    let { libraries, pages } = splitResourcesForEstimo(resources)

    if (libraries.length > 0) {
      reports = reports.concat(
        await processor(libraries, browserOptions, 'js-mode')
      )
    }

    if (pages.length > 0) {
      reports = reports.concat(
        await processor(pages, browserOptions, 'page-mode')
      )
    }
  } catch (error) {
    console.error(error)
    console.log(
      'Please, file an issues related to estimo here: https://github.com/mbalabash/estimo'
    )
  }

  return reports
}

export default estimo
