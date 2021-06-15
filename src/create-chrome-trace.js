const { nanoid } = require('nanoid')
const puppeteer = require('puppeteer-core')
const { megabitsToBytes, resolvePathToTempDir } = require('./utils')
const chromeConfig = require('../chrome.json')

const defaultBrowserOptions = {
  headless: true,
  timeout: 20000,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || chromeConfig.executablePath,
}

const chromeLaunchArgs = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']

async function createBrowserEntity(options) {
  if (options.executablePath.length === 0) {
    throw new Error(`Chromium revision is not downloaded. Run "npm install" or "yarn install"`)
  }

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

  return await puppeteer.launch(browserConfig)
}

async function createPageEntity(context, options) {
  const page = await context.newPage()

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

  page.on('error', (msg) => {
    throw msg
  })

  return page
}

async function setupCdpEntity(cdpSession, options) {
  try {
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
  } catch (error) {
    console.error(error)
  }
}

async function createChromeTrace(resources, browserOptions) {
  const options = { ...defaultBrowserOptions, ...browserOptions }
  const resourcesWithTrace = []
  let browser
  let context
  let page
  let cdpSession

  try {
    browser = await createBrowserEntity(options)
    context = await browser.createIncognitoBrowserContext()

    for (const item of resources) {
      page = await createPageEntity(context, options)
      cdpSession = await page.target().createCDPSession()
      await setupCdpEntity(cdpSession, options)

      const traceFile = resolvePathToTempDir(`${nanoid()}.json`)

      await page.tracing.start({ path: traceFile })
      await page.goto(item.url, { timeout: options.timeout })
      await page.tracing.stop()
      await cdpSession.detach()
      await page.close()

      resourcesWithTrace.push({ ...item, tracePath: traceFile })
    }
  } catch (error) {
    console.error(error)
  } finally {
    if (browser) {
      const pages = await browser.pages()
      await Promise.all(pages.map((item) => item.close()))

      if (context) {
        await context.close()
      }

      await browser.close()
    }
  }

  return resourcesWithTrace
}

module.exports = { createChromeTrace }
