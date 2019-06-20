const fs = require('fs')
const path = require('path')
const { homedir } = require('os')
const puppeteer = require('puppeteer-core')
const { execSync, execFileSync } = require('child_process')
const pptrCoreJson = require('puppeteer-core/package.json')
const { writeFile } = require('../src/utils')

const newLineRegex = /\r?\n/
const chromeTempPath = path.join(process.cwd(), 'temp', 'chrome')
const chromeConfigPath = path.join(process.cwd(), 'chrome.json')

function canAccess(file) {
  if (!file) {
    return false
  }

  try {
    fs.accessSync(file)
    return true
  } catch (e) {
    return false
  }
}

function uniq(arr) {
  return Array.from(new Set(arr))
}

function darwin(canary) {
  const LSREGISTER =
    '/System/Library/Frameworks/CoreServices.framework' +
    '/Versions/A/Frameworks/LaunchServices.framework' +
    '/Versions/A/Support/lsregister'
  const grepexpr = canary ? 'google chrome canary' : 'google chrome'
  const result = execSync(
    `${LSREGISTER} -dump  | grep -i '${grepexpr}?.app$' | awk '{$1=""; print $0}'`
  )

  const paths = result
    .toString()
    .split(newLineRegex)
    .filter(a => a)
    .map(a => a.trim())

  paths.unshift(
    canary ? '/Applications/Google Chrome Canary.app' : '/Applications/Google Chrome.app'
  )

  for (const p of paths) {
    // eslint-disable-next-line no-continue
    if (p.startsWith('/Volumes')) continue
    const inst = path.join(
      p,
      canary ? '/Contents/MacOS/Google Chrome Canary' : '/Contents/MacOS/Google Chrome'
    )
    if (canAccess(inst)) return inst
  }

  return undefined
}

function win32(canary) {
  const suffix = canary
    ? `${path.sep}Google${path.sep}Chrome SxS${path.sep}Application${path.sep}chrome.exe`
    : `${path.sep}Google${path.sep}Chrome${path.sep}Application${path.sep}chrome.exe`

  const prefixes = [
    process.env.LOCALAPPDATA,
    process.env.PROGRAMFILES,
    process.env['PROGRAMFILES(X86)'],
  ].filter(Boolean)

  let result
  prefixes.forEach(prefix => {
    const chromePath = path.join(prefix, suffix)
    if (canAccess(chromePath)) result = chromePath
  })

  return result
}

function sort(installations, priorities) {
  const defaultPriority = 10
  return installations
    .map(inst => {
      for (const pair of priorities) {
        if (pair.regex.test(inst)) return { path: inst, weight: pair.weight }
      }
      return { path: inst, weight: defaultPriority }
    })
    .sort((a, b) => b.weight - a.weight)
    .map(pair => pair.path)
}

function findChromeExecutables(folder) {
  const installations = []
  const argumentsRegex = /(^[^ ]+).*/
  const chromeExecRegex = '^Exec=/.*/(google-chrome|chrome|chromium)-.*'

  if (canAccess(folder)) {
    let execPaths

    try {
      execPaths = execSync(`grep -ER "${chromeExecRegex}" ${folder} | awk -F '=' '{print $2}'`)
    } catch (e) {
      execPaths = execSync(`grep -Er "${chromeExecRegex}" ${folder} | awk -F '=' '{print $2}'`)
    }

    execPaths = execPaths
      .toString()
      .split(newLineRegex)
      .map(execPath => execPath.replace(argumentsRegex, '$1'))

    execPaths.forEach(execPath => canAccess(execPath) && installations.push(execPath))
  }

  return installations
}

function linux() {
  let installations = []

  // Look into the directories where .desktop are saved on gnome based distro's
  const desktopInstallationFolders = [
    path.join(homedir(), '.local/share/applications/'),
    '/usr/share/applications/',
  ]

  desktopInstallationFolders.forEach(folder => {
    installations = installations.concat(findChromeExecutables(folder))
  })

  // Look for google-chrome(-stable) & chromium(-browser) executables by using the which command
  const executables = ['google-chrome-stable', 'google-chrome', 'chromium-browser', 'chromium']
  executables.forEach(executable => {
    try {
      const chromePath = execFileSync('which', [executable], { stdio: 'pipe' })
        .toString()
        .split(newLineRegex)[0]
      if (canAccess(chromePath)) installations.push(chromePath)
    } catch (e) {
      // Not installed.
    }
  })

  if (!installations.length) {
    throw new Error(
      'The environment variable CHROME_PATH must be set to executable of a build of Chromium version 54.0 or later.'
    )
  }

  const priorities = [
    { regex: /chrome-wrapper$/, weight: 51 },
    { regex: /google-chrome-stable$/, weight: 50 },
    { regex: /google-chrome$/, weight: 49 },
    { regex: /chromium-browser$/, weight: 48 },
    { regex: /chromium$/, weight: 47 },
  ]

  if (process.env.CHROME_PATH) {
    priorities.unshift({
      regex: new RegExp(`${process.env.CHROME_PATH}`),
      weight: 101,
    })
  }

  return sort(uniq(installations.filter(Boolean)), priorities)[0]
}

async function downloadChromium() {
  const browserFetcher = puppeteer.createBrowserFetcher({
    path: chromeTempPath,
  })

  const revision = pptrCoreJson.puppeteer.chromium_revision
  const revisionInfo = browserFetcher.revisionInfo(revision)

  // If already downloaded
  if (revisionInfo.local) return revisionInfo

  try {
    console.log(`Downloading Chromium r${revision}...`)
    const newRevisionInfo = await browserFetcher.download(revisionInfo.revision)
    console.log(`Chromium downloaded to ${newRevisionInfo.folderPath}`)

    let localRevisions = await browserFetcher.localRevisions()
    localRevisions = localRevisions.filter(r => r !== revisionInfo.revision)

    // Remove previous revisions
    const cleanupOldVersions = localRevisions.map(r => browserFetcher.remove(r))
    await Promise.all(cleanupOldVersions)

    return newRevisionInfo
  } catch (error) {
    console.error(`ERROR: Failed to download Chromium r${revision}!`)
    console.error(error)
    return null
  }
}

async function findChrome() {
  let executablePath

  if (process.platform === 'linux') executablePath = linux()
  else if (process.platform === 'win32') executablePath = win32()
  else if (process.platform === 'darwin') executablePath = darwin()

  if (typeof executablePath === 'string' && executablePath.length > 0) {
    await writeFile(chromeConfigPath, JSON.stringify({ executablePath }))
    console.log(`Local Chrome location: ${executablePath}`)
    return executablePath
  }

  const revisionInfo = await downloadChromium()
  await writeFile(chromeConfigPath, JSON.stringify({ executablePath: revisionInfo.executablePath }))
  console.log(`Downloaded Chrome location: ${revisionInfo.executablePath}`)
  return revisionInfo.executablePath
}

findChrome()
