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
  const time = events.reduce((acc, cur) => acc + cur.duration, 0)
  return formatTime(time)
}

async function generateReadableReport(pathToTimelines) {
  const tasks = await generateTasksReport(pathToTimelines)

  const htmlEvents = tasks.filter(({ kind }) => kind === 'parseHTML')
  const layoutEvents = tasks.filter(({ kind }) => kind === 'styleLayout')
  const paintCompositeEvents = tasks.filter(({ kind }) => kind === 'paintCompositeRender')
  const scriptParseCompileEvents = tasks.filter(({ kind }) => kind === 'scriptParseCompile')
  const scriptEvaluationEvents = tasks.filter(({ kind }) => kind === 'scriptEvaluation')
  const garbageCollectionEvents = tasks.filter(({ kind }) => kind === 'garbageCollection')
  const otherEvents = tasks.filter(({ kind }) => kind === 'other')

  const scriptParseCompileTime = getEventsTime(scriptParseCompileEvents)
  const scriptEvaluationTime = getEventsTime(scriptEvaluationEvents)

  const report = {
    parseHTML: getEventsTime(htmlEvents),
    styleLayout: getEventsTime(layoutEvents),
    paintCompositeRender: getEventsTime(paintCompositeEvents),
    scriptParseCompile: scriptParseCompileTime,
    scriptEvaluation: scriptEvaluationTime,
    javaScript: formatTime(scriptParseCompileTime + scriptEvaluationTime),
    garbageCollection: getEventsTime(garbageCollectionEvents),
    other: getEventsTime(otherEvents),
  }

  return report
}

module.exports = { generateReadableReport }
