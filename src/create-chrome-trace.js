const puppeteer = require('puppeteer-core')
const nanoid = require('nanoid')
const { megabitsToBytes, resolvePathToTempDir, handlePuppeteerSessionError } = require('./utils')
const chromeConfig = require('../chrome.json')

const defaultBrowserOptions = {
  width: 1366,
  height: 768,
  headless: true,
  timeout: 20000,
  emulateNetworkConditions: false,
  emulateCpuThrottling: false,
  offline: false,
  latency: 0,
  downloadThroughput: 0,
  uploadThroughput: 0,
  connectionType: 'none',
  cpuThrottlingRate: 1,
  executablePath: chromeConfig.executablePath,
}

async function createChromeTrace(resources, browserOptions) {
  const options = { ...defaultBrowserOptions, ...browserOptions }

  // Create Chrome entities
  const browser = await puppeteer.launch({
    headless: options.headless,
    executablePath: options.executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', `--window-size=${options.width},${options.height}`],
    ignoreDefaultArgs: ['--disable-extensions'],
  })
  const page = await browser.newPage()
  await page.setViewport({
    width: options.width, height: options.height,
  })
  page.on('error', handlePuppeteerSessionError)
  const client = await page.target().createCDPSession()

  // Enable Network Emulation
  if (options.emulateNetworkConditions) {
    await client.send('Network.emulateNetworkConditions', {
      offline: options.offline,
      latency: options.latency,
      downloadThroughput: megabitsToBytes(options.downloadThroughput),
      uploadThroughput: megabitsToBytes(options.uploadThroughput),
      connectionType: options.connectionType,
    })
  }

  // Enable CPU Emulation
  if (options.emulateCpuThrottling) {
    await client.send('Emulation.setCPUThrottlingRate', { rate: options.cpuThrottlingRate })
  }

  // Generate trace files
  const resourcesWithTrace = []
  try {
    for (const item of resources) {
      const traceFile = resolvePathToTempDir(`${nanoid()}.json`)
      await page.tracing.start({ path: traceFile })
      await page.goto(item.url, { timeout: options.timeout })
      await page.tracing.stop()
      resourcesWithTrace.push({ ...item, trace: traceFile })
    }
  } catch (err) {
    handlePuppeteerSessionError(err, browser)
  }

  await browser.close()
  return resourcesWithTrace
}

module.exports = { createChromeTrace }
