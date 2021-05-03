// const tracium = require('tracium')
const tracium = require('@sitespeed.io/tracium')
const { readFile } = require('./utils')

async function generateTasksReport(pathToTraceFile) {
  let tasks = []

  try {
    const tracelog = JSON.parse(await readFile(pathToTraceFile))
    // tasks = tracium.computeMainThreadTasks(tracelog, {
    //   flatten: true,
    // })
    tasks = tracium.computeMainThreadTasks(tracelog, {
      flatten: true,
    })
  } catch (error) {
    console.error(error)
  }

  return tasks
}

function formatTime(time) {
  return +parseFloat(time).toFixed(2)
}

function getEventsTime(events) {
  const time = events.reduce((acc, cur) => acc + cur.selfTime, 0)
  return formatTime(Math.round(time * 100) / 100)
}

async function generatePrettyReport(resources) {
  const reports = []

  try {
    for (const item of resources) {
      const tasks = await generateTasksReport(item.tracePath)

      const htmlTime = getEventsTime(tasks.filter(({ kind }) => kind === 'parseHTML'))
      const styleTime = getEventsTime(tasks.filter(({ kind }) => kind === 'styleLayout'))
      const renderTime = getEventsTime(tasks.filter(({ kind }) => kind === 'paintCompositeRender'))
      const compileTime = getEventsTime(tasks.filter(({ kind }) => kind === 'scriptParseCompile'))
      const evaluationTime = getEventsTime(tasks.filter(({ kind }) => kind === 'scriptEvaluation'))
      const garbageTime = getEventsTime(tasks.filter(({ kind }) => kind === 'garbageCollection'))
      const otherTime = getEventsTime(tasks.filter(({ kind }) => kind === 'other'))

      reports.push({
        name: item.name,
        parseHTML: htmlTime,
        styleLayout: styleTime,
        paintCompositeRender: renderTime,
        scriptParseCompile: compileTime,
        scriptEvaluation: evaluationTime,
        javaScript: formatTime(compileTime + evaluationTime),
        garbageCollection: garbageTime,
        other: otherTime,
        total: formatTime(
          htmlTime + styleTime + renderTime + compileTime + evaluationTime + garbageTime + otherTime
        ),
      })
    }
  } catch (error) {
    console.error(error)
  }

  return reports
}

module.exports = { generatePrettyReport, formatTime, getEventsTime }
