export interface BrowserOptions {
  width?: number
  height?: number
  userAgent?: string
  device?: string

  emulateNetworkConditions?: boolean
  offline?: boolean
  latency?: number
  downloadThroughput?: number
  uploadThroughput?: number
  connectionType?: string

  emulateCpuThrottling?: boolean
  cpuThrottlingRate?: number

  headless?: boolean
  timeout?: number
  executablePath?: string
}

export interface TaskEvent {
  kind:
    | 'parseHTML'
    | 'styleLayout'
    | 'paintCompositeRender'
    | 'scriptParseCompile'
    | 'scriptEvaluation'
    | 'garbageCollection'
    | 'other'
  /**
   * Monotonic start time in milliseconds
   */
  startTime: number
  /**
   * Monotonic end time in milliseconds
   */
  endTime: number
  /**
   * Task duration in milliseconds, a.k.a. "wall time"
   */
  duration: number
  /**
   * Time spent in the task at the current level of the task tree
   */
  selfTime: number
  /**
   * Original trace event object associated with the task
   */
  event: object
  /**
   * An array of child tasks
   */
  children: TaskEvent[]
  /**
   * A parent task if anya parent task if any
   */
  parent?: TaskEvent
}
