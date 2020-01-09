const puppeteer = require('puppeteer-core')
const nanoid = require('nanoid')
const { megabitsToBytes, resolvePathToTempDir } = require('./utils')
const chromeConfig = require('../chrome.json')

const defaultBrowserOptions = {
  headless: true,
  timeout: 20000,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || chromeConfig.executablePath,
}

const chromeLaunchArgs = [
  '--enable-thread-instruction-count',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
]

async function createBrowserEntity(options) {
  if (options.width && options.height) {
    chromeLaunchArgs.push(`--window-size=${options.width},${options.height}`)
  }
  const browserConfig = {
    headless: options.headless,
    executablePath: options.executablePath,
    args: chromeLaunchArgs,
    ignoreDefaultArgs: ['--disable-extensions'],
  }
  if (process.env.ESTIMO_DEBUG) {
    browserConfig.dumpio = true
  }
  const browser = await puppeteer.launch(browserConfig)
  return browser
}

async function setupPageEntity(page, options) {
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

async function setupCdpEntity(cdpSession, options) {
  // Enable Network Emulation
  if (options.emulateNetworkConditions) {
    await cdpSession.send('Network.emulateNetworkConditions', {
      offline: options.offline,
      latency: options.latency,
      downloadThroughput: megabitsToBytes(options.downloadThroughput),
      uploadThroughput: megabitsToBytes(options.uploadThroughput),
      connectionType: options.connectionType,
    })
  }

  // Enable CPU Emulation
  if (options.emulateCpuThrottling) {
    await cdpSession.send('Emulation.setCPUThrottlingRate', { rate: options.cpuThrottlingRate })
  }
}

async function createChromeTrace(resources, browserOptions) {
  const options = { ...defaultBrowserOptions, ...browserOptions }
  const browser = await createBrowserEntity(options)
  const context = await browser.createIncognitoBrowserContext()

  const page = await context.newPage()
  await setupPageEntity(page, options)

  const cdpSession = await page.target().createCDPSession()
  await setupCdpEntity(cdpSession, options)

  const resourcesWithTrace = []
  try {
    for (const item of resources) {
      const traceFile = resolvePathToTempDir(`${nanoid()}.json`)
      await page.tracing.start({ path: traceFile })
      await page.goto(item.url, { timeout: options.timeout })
      await page.tracing.stop()
      resourcesWithTrace.push({ ...item, trace: traceFile })
    }
  } catch (error) {
    console.error(error)
    return process.exit(1)
  } finally {
    await page.close()
    await browser.close()
  }

  return resourcesWithTrace
}

module.exports = { createChromeTrace }
