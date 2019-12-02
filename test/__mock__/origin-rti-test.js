const path = require('path')
const puppeteer = require('puppeteer-core')

const chromeConfig = require(path.join(__dirname, '../..', 'chrome.json'))

;(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || chromeConfig.executablePath,
    args: ['--enable-thread-instruction-count', '--no-sandbox'],
  })
  const page = await browser.newPage()
  await page.tracing.start({ path: './temp/trace.json' })
  await page.goto('https://www.google.com/')
  await page.tracing.stop()
  await browser.close()
})()
