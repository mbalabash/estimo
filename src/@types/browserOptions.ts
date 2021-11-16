export interface BrowserOptions {
  width?: number
  height?: number
  userAgent?: string
  device?: string

  emulateNetworkConditions?: string
  emulateCpuThrottling?: number

  headless?: boolean
  timeout?: number
  executablePath?: string

  runs?: number
  diff?: boolean
}
