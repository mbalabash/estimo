import { createChromeTrace } from './create-chrome-trace.js'
import { prepareLibrariesForEstimation } from './generate-html-file.js'
import { generatePrettyReport } from './reporter.js'
import {
  createDiff,
  estimoMedianExecutor,
  median,
  removeAllFiles
} from './utils.js'

async function reportsProcessor(reports, browserOptions) {
  let runs = browserOptions.runs || 1
  let diffMode = browserOptions.diff || false
  let result = []

  try {
    Object.values(reports).forEach(resourceReports => {
      if (runs > 1) {
        result.push(
          median(resourceReports, report => report.total, estimoMedianExecutor)
        )
      } else {
        result.push(resourceReports[0])
      }
    })

    if (diffMode && result.length > 1) {
      let baseline = result[0]
      for (let i = 1; i < result.length; i += 1) {
        result[i].diff = {
          garbageCollection: `${result[i].garbageCollection} (${createDiff(
            result[i].garbageCollection,
            baseline.garbageCollection
          )})`,
          javaScript: `${result[i].javaScript} (${createDiff(
            result[i].javaScript,
            baseline.javaScript
          )})`,
          other: `${result[i].other} (${createDiff(
            result[i].other,
            baseline.other
          )})`,
          paintCompositeRender: `${
            result[i].paintCompositeRender
          } (${createDiff(
            result[i].paintCompositeRender,
            baseline.paintCompositeRender
          )})`,
          parseHTML: `${result[i].parseHTML} (${createDiff(
            result[i].parseHTML,
            baseline.parseHTML
          )})`,
          scriptEvaluation: `${result[i].scriptEvaluation} (${createDiff(
            result[i].scriptEvaluation,
            baseline.scriptEvaluation
          )})`,
          scriptParseCompile: `${result[i].scriptParseCompile} (${createDiff(
            result[i].scriptParseCompile,
            baseline.scriptParseCompile
          )})`,
          styleLayout: `${result[i].styleLayout} (${createDiff(
            result[i].styleLayout,
            baseline.styleLayout
          )})`,
          total: `${result[i].total} (${createDiff(
            result[i].total,
            baseline.total
          )})`
        }
      }
    }
  } catch (error) {
    console.error(error)
  }

  return result
}

export async function processor(sources, browserOptions, mode) {
  let runs = browserOptions.runs || 1
  let reports = []
  let result = []

  try {
    let resources = []
    if (mode === 'js-mode') {
      resources = await prepareLibrariesForEstimation(sources)
    } else {
      resources = sources.map(page => ({ name: page, url: page }))
    }

    for (let i = 0; i < runs; i += 1) {
      resources = await createChromeTrace(resources, browserOptions)
      reports = reports.concat(await generatePrettyReport(resources))
      await removeAllFiles(resources.map(item => item.tracePath))
    }
    if (mode === 'js-mode') {
      await removeAllFiles(resources.map(item => item.htmlPath))
    }

    let sortedReports = {}
    reports.forEach(report => {
      if (!sortedReports[report.name]) {
        sortedReports[report.name] = []
        sortedReports[report.name].push(report)
      } else {
        sortedReports[report.name].push(report)
      }
    })
    result = await reportsProcessor(sortedReports, browserOptions)
  } catch (error) {
    console.error(error)
  }

  return result
}
