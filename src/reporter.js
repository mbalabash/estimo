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

async function generateReadableReport(pathToTimelines) {
  const tasks = await generateTasksReport(pathToTimelines)
  const report = {}

  const eventTypes = []
  tasks.forEach((task) => {
    if (!eventTypes.includes(task.kind)) {
      eventTypes.push(task.kind)
    }
  })
  console.log(eventTypes)

  return report
}

module.exports = { generateReadableReport }
