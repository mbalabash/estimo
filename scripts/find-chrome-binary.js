if (process.env.ESTIMO_DISABLE) process.exit()

const { join } = require('path')
const puppeteer = require('puppeteer-core')
const { findChrome } = require('find-chrome-bin')
const { PUPPETEER_REVISIONS } = require('puppeteer-core/lib/cjs/puppeteer/revisions')

const { writeFile } = require('../src/utils')

const chromeTempPath = join(__dirname, '..', 'temp', 'chrome')
const chromeConfigPath = join(__dirname, '..', 'chrome.json')

async function findChromeBinary() {
  try {
    let chromeInfo = await findChrome({
      min: 75,
      download: { puppeteer, revision: PUPPETEER_REVISIONS.chromium, path: chromeTempPath },
    })

    await writeFile(chromeConfigPath, JSON.stringify(chromeInfo))

    return chromeInfo
  } catch (error) {
    console.info()
    console.error(error)
    console.info()
    return { executablePath: '', browser: '' }
  }
}

findChromeBinary()

module.exports = { findChromeBinary }
