import test from 'ava'
import path from 'path'
import { readFile, deleteFile } from '../../utils'
import { findChrome } from '../../../scripts/chrome-detection'

test('should set location setting for downloaded or local chrome', async t => {
  const tmpPath = path.join(__dirname, 'chrome.json')
  const pathToChrome = await findChrome(tmpPath)
  const configData = JSON.parse(await readFile(tmpPath))

  t.is(typeof pathToChrome === 'string' && pathToChrome.length > 0, true)
  t.is(configData.executablePath.length > 0, true)
  t.is(configData.executablePath === pathToChrome, true)

  await deleteFile(tmpPath)
})
