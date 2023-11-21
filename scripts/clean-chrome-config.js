import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { writeFile } from '../src/utils.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const chromeConfigPath = join(__dirname, '..', 'chrome.json')

export async function cleanChromeConfig() {
  await writeFile(chromeConfigPath, '{ "executablePath": "", "browser": "" }')
}

cleanChromeConfig()
