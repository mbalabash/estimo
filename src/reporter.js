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

// Wall time & CPU Time
// https://stackoverflow.com/questions/7335920/what-specifically-are-wall-clock-time-user-cpu-time-and-system-cpu-time-in-uni
function getEventsTime(events, type = 'cpu') {
  const prop = type === 'wall' ? 'duration' : 'selfTime'
  const time = events.reduce((acc, cur) => acc + cur[prop], 0)
  return formatTime(Math.round(time * 100) / 100)
}

async function generateReadableReport(pathToTimelines, timeOption) {
  const tasks = await generateTasksReport(pathToTimelines)

  const htmlEvents = tasks.filter(({ kind }) => kind === 'parseHTML')
  const layoutEvents = tasks.filter(({ kind }) => kind === 'styleLayout')
  const paintCompositeEvents = tasks.filter(({ kind }) => kind === 'paintCompositeRender')
  const scriptParseCompileEvents = tasks.filter(({ kind }) => kind === 'scriptParseCompile')
  const scriptEvaluationEvents = tasks.filter(({ kind }) => kind === 'scriptEvaluation')
  const garbageCollectionEvents = tasks.filter(({ kind }) => kind === 'garbageCollection')
  const otherEvents = tasks.filter(({ kind }) => kind === 'other')

  const scriptParseCompileTime = getEventsTime(scriptParseCompileEvents, timeOption)
  const scriptEvaluationTime = getEventsTime(scriptEvaluationEvents, timeOption)

  const report = {
    parseHTML: getEventsTime(htmlEvents, timeOption),
    styleLayout: getEventsTime(layoutEvents, timeOption),
    paintCompositeRender: getEventsTime(paintCompositeEvents, timeOption),
    scriptParseCompile: scriptParseCompileTime,
    scriptEvaluation: scriptEvaluationTime,
    javaScript: formatTime(scriptParseCompileTime + scriptEvaluationTime),
    garbageCollection: getEventsTime(garbageCollectionEvents, timeOption),
    other: getEventsTime(otherEvents, timeOption),
  }

  return report
}

module.exports = { generateReadableReport }
