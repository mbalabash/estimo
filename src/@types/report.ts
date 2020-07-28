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

  diff?: {
    parseHTML: string
    styleLayout: string
    paintCompositeRender: string
    scriptParseCompile: string
    scriptEvaluation: string
    javaScript: string
    garbageCollection: string
    other: string
    total: string
  }
}