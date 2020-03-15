// @ts-ignore
import tracium from 'tracium'

import { readFile, debugLog } from './utils'
import { ResourceWithTrace } from './create-chrome-trace'
import { TaskEvent } from './types'

export interface Report {
  name: string
  parseHTML: number
  styleLayout: number
  paintCompositeRender: number
  scriptParseCompile: number
  scriptEvaluation: number
  javaScript: number
  garbageCollection: number
  other: number
  total: number
}

export async function generateTasksReport(pathToTraceFile: string): Promise<TaskEvent[]> {
  const content = JSON.parse(await readFile(pathToTraceFile))
  return tracium.computeMainThreadTasks(content, {
    flatten: true,
  })
}

export function formatTime(time: number | string) {
  return +parseFloat(`${time}`).toFixed(2)
}

export function getEventsTime(events: TaskEvent[]) {
  const time = events.reduce((acc, cur) => acc + cur.selfTime, 0)
  return formatTime(Math.round(time * 100) / 100)
}

export async function generatePrettyReport(resources: ResourceWithTrace[]): Promise<Report[]> {
  const report: Report[] = []

  for (const item of resources) {
    debugLog(`\n[report]: Processing resource: ${JSON.stringify(item)}\n`)
    const tasks = await generateTasksReport(item.trace)
    const htmlTime = getEventsTime(tasks.filter(({ kind }) => kind === 'parseHTML'))
    const styleTime = getEventsTime(tasks.filter(({ kind }) => kind === 'styleLayout'))
    const renderTime = getEventsTime(tasks.filter(({ kind }) => kind === 'paintCompositeRender'))
    const compileTime = getEventsTime(tasks.filter(({ kind }) => kind === 'scriptParseCompile'))
    const evaluationTime = getEventsTime(tasks.filter(({ kind }) => kind === 'scriptEvaluation'))
    const garbageTime = getEventsTime(tasks.filter(({ kind }) => kind === 'garbageCollection'))
    const otherTime = getEventsTime(tasks.filter(({ kind }) => kind === 'other'))

    report.push({
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

  return report
}
