const tracium = require('tracium')
const { readFile } = require('./utils')

// TODO: Implement RTI when it released to Chrome & Tracium
// https://stackoverflow.com/questions/22368835/what-does-intel-mean-by-retired

async function generateTasksReport(pathToTimelines) {
  const content = JSON.parse(await readFile(pathToTimelines))
  const tasks = tracium.computeMainThreadTasks(content, {
    flatten: true,
  })
  return tasks
}

function formatTime(time) {
  return +parseFloat(time).toFixed(2)
}

function getEventsTime(events) {
  const time = events.reduce((acc, cur) => acc + cur.selfTime, 0)
  return formatTime(Math.round(time * 100) / 100)
}

async function generateReadableReport(pathToTimelines) {
  const tasks = await generateTasksReport(pathToTimelines)

  const htmlTime = getEventsTime(tasks.filter(({ kind }) => kind === 'parseHTML'))
  const styleTime = getEventsTime(tasks.filter(({ kind }) => kind === 'styleLayout'))
  const renderTime = getEventsTime(tasks.filter(({ kind }) => kind === 'paintCompositeRender'))
  const compileTime = getEventsTime(tasks.filter(({ kind }) => kind === 'scriptParseCompile'))
  const evaluationTime = getEventsTime(tasks.filter(({ kind }) => kind === 'scriptEvaluation'))
  const garbageTime = getEventsTime(tasks.filter(({ kind }) => kind === 'garbageCollection'))
  const otherTime = getEventsTime(tasks.filter(({ kind }) => kind === 'other'))

  const report = {
    parseHTML: htmlTime,
    styleLayout: styleTime,
    paintCompositeRender: renderTime,
    scriptParseCompile: compileTime,
    scriptEvaluation: evaluationTime,
    javaScript: formatTime(compileTime + evaluationTime),
    garbageCollection: garbageTime,
    other: otherTime,
    total: formatTime(
      htmlTime + styleTime + renderTime + compileTime + evaluationTime + garbageTime + otherTime,
    ),
  }

  return report
}

module.exports = { generateReadableReport, formatTime, getEventsTime }
