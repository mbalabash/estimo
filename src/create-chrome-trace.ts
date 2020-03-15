import puppeteer from 'puppeteer-core'
import nanoid from 'nanoid'

import { megabitsToBytes, resolvePathToTempDir } from './utils'
import { BrowserOptions } from './types'
import { Resource } from './js-mode/prepare-libs-for-estimo'

export let chromeConfig: { executablePath: string }

try {
  chromeConfig = require('../chrome.json')
} catch {
  console.info('Chrome has not been detected')
  chromeConfig = { executablePath: '' }
}

export function isChromeConfigValid() {
  return Boolean(chromeConfig.executablePath)
}

export interface ResourceWithTrace extends Resource {
  trace: string
}

const defaultBrowserOptions = {
  headless: true,
  timeout: 20000,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || chromeConfig.executablePath,
}

const chromeLaunchArgs = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']

async function createBrowserEntity(options: BrowserOptions) {
  if (options.width && options.height) {
    chromeLaunchArgs.push(`--window-size=${options.width},${options.height}`)
  }
  const browserConfig: puppeteer.LaunchOptions = {
    headless: options.headless,
    executablePath: options.executablePath,
    args: chromeLaunchArgs,
    ignoreDefaultArgs: ['--disable-extensions'],
  }
  if (process.env.ESTIMO_DEBUG) {
    browserConfig.dumpio = true
  }
  return puppeteer.launch(browserConfig)
}

async function setupPageEntity(page: puppeteer.Page, options: BrowserOptions) {
  if (options.userAgent) {
    await page.setUserAgent(options.userAgent)
  }
  if (options.width && options.height) {
    await page.setViewport({
      width: options.width,
      height: options.height,
    })
  }
  if (options.device) {
    if (puppeteer.devices[options.device]) {
      await page.emulate(puppeteer.devices[options.device])
    } else {
      throw new Error(`${options.device} - unknown Device option!`)
    }
  }
  page.on('error', msg => {
    throw msg
  })
}

async function setupCdpEntity(cdpSession: puppeteer.CDPSession, options: BrowserOptions) {
  // Enable Network Emulation
  if (options.emulateNetworkConditions) {
    await cdpSession.send('Network.emulateNetworkConditions', {
      offline: options.offline,
      latency: options.latency,
      downloadThroughput: megabitsToBytes(options.downloadThroughput!),
      uploadThroughput: megabitsToBytes(options.uploadThroughput!),
      connectionType: options.connectionType,
    })
  }

  // Enable CPU Emulation
  if (options.emulateCpuThrottling) {
    await cdpSession.send('Emulation.setCPUThrottlingRate', { rate: options.cpuThrottlingRate })
  }
}

export async function createChromeTrace(
  resources: Resource[],
  browserOptions: BrowserOptions
): Promise<ResourceWithTrace[]> {
  const options = { ...defaultBrowserOptions, ...browserOptions }
  const browser = await createBrowserEntity(options)
  const context = await browser.createIncognitoBrowserContext()

  const page = await context.newPage()
  await setupPageEntity(page, options)

  const cdpSession = await page.target().createCDPSession()
  await setupCdpEntity(cdpSession, options)

  const resourcesWithTrace: ResourceWithTrace[] = []
  try {
    for (const item of resources) {
      const traceFile = resolvePathToTempDir(`${nanoid()}.json`)
      await page.tracing.start({ path: traceFile })
      await page.goto(item.url, { timeout: options.timeout })
      await page.tracing.stop()
      resourcesWithTrace.push({ ...item, trace: traceFile })
    }
  } finally {
    await page.close()
    await context.close()
    await browser.close()
  }

  return resourcesWithTrace
}
