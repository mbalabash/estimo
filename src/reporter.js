import tracium from '@sitespeed.io/tracium'

import { readFile } from './utils.js'

export async function generateTasksReport(pathToTraceFile) {
  let tasks = []

  try {
    let tracelog = JSON.parse(await readFile(pathToTraceFile))
    tasks = tracium.computeMainThreadTasks(tracelog, { flatten: true })
  } catch (error) {
    console.error(error)
  }

  return tasks
}

export function formatTime(time) {
  return +parseFloat(time).toFixed(2)
}

export function getEventsTime(events) {
  let time = events.reduce((acc, cur) => acc + cur.selfTime, 0)
  return formatTime(Math.round(time * 100) / 100)
}

export async function generatePrettyReport(resources) {
  let reports = []

  try {
    for (let item of resources) {
      let tasks = await generateTasksReport(item.tracePath)

      let htmlTime = getEventsTime(
        tasks.filter(({ kind }) => kind === 'parseHTML')
      )
      let styleTime = getEventsTime(
        tasks.filter(({ kind }) => kind === 'styleLayout')
      )
      let renderTime = getEventsTime(
        tasks.filter(({ kind }) => kind === 'paintCompositeRender')
      )
      let compileTime = getEventsTime(
        tasks.filter(({ kind }) => kind === 'scriptParseCompile')
      )
      let evaluationTime = getEventsTime(
        tasks.filter(({ kind }) => kind === 'scriptEvaluation')
      )
      let garbageTime = getEventsTime(
        tasks.filter(({ kind }) => kind === 'garbageCollection')
      )
      let otherTime = getEventsTime(
        tasks.filter(({ kind }) => kind === 'other')
      )

      reports.push({
        garbageCollection: garbageTime,
        javaScript: formatTime(compileTime + evaluationTime),
        name: item.name,
        other: otherTime,
        paintCompositeRender: renderTime,
        parseHTML: htmlTime,
        scriptEvaluation: evaluationTime,
        scriptParseCompile: compileTime,
        styleLayout: styleTime,
        total: formatTime(
          htmlTime +
            styleTime +
            renderTime +
            compileTime +
            evaluationTime +
            garbageTime +
            otherTime
        )
      })
    }
  } catch (error) {
    console.error(error)
  }

  return reports
}
