export interface BrowserOptions {
  emulateNetworkConditions?: boolean
  offline?: boolean
  latency?: number
  downloadThroughput?: number
  uploadThroughput?: number
  connectionType?: string
  emulateCpuThrottling?: boolean
  cpuThrottlingRate?: number
}
