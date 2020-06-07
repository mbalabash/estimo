/* eslint-disable */
const fs = require('fs')
const path = require('path')
const { homedir } = require('os')
const puppeteer = require('puppeteer-core')
const { execSync, execFileSync } = require('child_process')
const puppeteerCorePackageJson = require('puppeteer-core/package.json')
const { writeFile } = require('../src/utils')

const MIN_CHROME_VERSION = parseInt(
  process.env.MIN_CHROME_VERSION ||
    process.env.NPM_CONFIG_MIN_CHROME_VERSION ||
    process.env.npm_config_min_chrome_version ||
    process.env.NPM_PACKAGE_CONFIG_MIN_CHROME_VERSION ||
    process.env.npm_package_config_min_chrome_version ||
    '75',
  10
)

const newLineRegex = /\r?\n/
const chromeTempPath = path.join(__dirname, '..', 'temp', 'chrome')
const chromeConfigPath = path.join(__dirname, '..', 'chrome.json')

const downloadHost =
  process.env.PUPPETEER_DOWNLOAD_HOST ||
  process.env.npm_config_puppeteer_download_host ||
  process.env.npm_package_config_puppeteer_download_host

const isDownloadSkipped =
  process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD ||
  process.env.NPM_CONFIG_PUPPETEER_SKIP_CHROMIUM_DOWNLOAD ||
  process.env.npm_config_puppeteer_skip_chromium_download ||
  process.env.NPM_PACKAGE_CONFIG_PUPPETEER_SKIP_CHROMIUM_DOWNLOAD ||
  process.env.npm_package_config_puppeteer_skip_chromium_download

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
    .filter((a) => a)
    .map((a) => a.trim())

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
  prefixes.forEach((prefix) => {
    const chromePath = path.join(prefix, suffix)
    if (canAccess(chromePath)) result = chromePath
  })

  return result
}

function sort(installations, priorities) {
  const defaultPriority = 10
  return installations
    .map((inst) => {
      for (const pair of priorities) {
        if (pair.regex.test(inst)) return { path: inst, weight: pair.weight }
      }
      return { path: inst, weight: defaultPriority }
    })
    .sort((a, b) => b.weight - a.weight)
    .map((pair) => pair.path)
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
      .map((execPath) => execPath.replace(argumentsRegex, '$1'))

    execPaths.forEach((execPath) => canAccess(execPath) && installations.push(execPath))
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

  desktopInstallationFolders.forEach((folder) => {
    installations = installations.concat(findChromeExecutables(folder))
  })

  // Look for google-chrome(-stable) & chromium(-browser) executables by using the which command
  const executables = ['google-chrome-stable', 'google-chrome', 'chromium-browser', 'chromium']
  executables.forEach((executable) => {
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
    return undefined
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
    host: downloadHost,
  })

  const revision = '722234'
  // const revision = '722274'

  // 85.0.4165.0
  // 85.0.4162.0
  // mac,canary,85.0.4162.0,2020-06-02 05:28:01.438812
  // win64,canary_asan,85.0.4161.2,2020-06-01 06:30:01.813638
  // cros,stable,81.0.4044.141,2020-05-29 18:15:34.827799
  // mac,canary,85.0.4158.4,2020-05-28 19:49:01.438140
  // mac,stable,81.0.4044.138,2020-05-27 17:56:00.526659
  // win,canary,85.0.4157.0,2020-05-27 06:28:01.481852
  // mac,dev,84.0.4147.21,2020-05-26 17:16:00.844813
  // win,canary,85.0.4156.0,2020-05-26 06:32:02.081786
  // win,canary_asan,85.0.4155.1,2020-05-25 06:34:02.981061
  // win64,canary_asan,85.0.4154.1,2020-05-24 06:34:01.681339
  // mac,canary,85.0.4153.0,2020-05-23 05:05:00.668152
  // webview,beta,81.0.4044.138,2020-05-20 23:09:32.590756
  // webview,stable,81.0.4044.138,2020-05-20 23:09:32.124672
  // android,stable,81.0.4044.138,2020-05-20 23:08:02.575619
  // win,canary_asan,85.0.4150.1,2020-05-20 07:23:02.481419
  // mac,canary,85.0.4149.0,2020-05-19 05:26:00.810409
  // win,canary_asan,85.0.4148.3,2020-05-18 08:32:02.898148
  // win64,canary_asan,84.0.4138.1,2020-05-07 08:33:01.815750
  // linux,stable,81.0.4044.138,2020-05-05 18:53:03.527141
  // win,stable,81.0.4044.138,2020-05-05 18:53:01.825258
  // win64,stable,81.0.4044.138,2020-05-05 18:53:01.042404
  // win64,canary_asan,84.0.4136.2,2020-05-05 09:10:00.981659
  // linux,stable,81.0.4044.129,2020-04-27 22:25:04.454090
  // win,stable,81.0.4044.129,2020-04-27 22:25:02.748941
  // win64,stable,81.0.4044.129,2020-04-27 22:25:01.968376
  // mac,stable,81.0.4044.129,2020-04-27 22:25:01.160441
  // win64,canary,84.0.4127.0,2020-04-26 05:12:01.881375
  // cros,stable,81.0.4044.127,2020-04-24 19:44:31.491949
  // ios,stable,81.0.4044.124,2020-04-21 23:38:07.980478
  // linux,stable,81.0.4044.122,2020-04-21 19:53:03.550285
  // mac,stable,81.0.4044.122,2020-04-21 19:53:00.456103
  // win,stable,81.0.4044.122,2020-04-21 19:38:02.092042
  // win64,stable,81.0.4044.122,2020-04-21 19:38:01.239790
  // webview,stable,81.0.4044.117,2020-04-21 18:39:05.208744
  // android,stable,81.0.4044.117,2020-04-21 18:38:02.565462
  // linux,beta,81.0.4044.113,2020-04-15 19:45:03.647912
  // win,beta,81.0.4044.113,2020-04-15 19:30:02.956026
  // win64,beta,81.0.4044.113,2020-04-15 19:30:02.245190
  // mac,beta,81.0.4044.113,2020-04-15 19:30:01.572784
  // linux,stable,81.0.4044.113,2020-04-15 19:15:03.907205
  // win,stable,81.0.4044.113,2020-04-15 19:00:02.177537
  // win64,stable,81.0.4044.113,2020-04-15 19:00:01.325813
  // mac,stable,81.0.4044.113,2020-04-15 18:45:01.056026
  // webview,beta,81.0.4044.111,2020-04-15 18:31:34.336330
  // webview,stable,81.0.4044.111,2020-04-15 18:31:33.755327
  // android,stable,81.0.4044.111,2020-04-15 18:30:02.772910
  // cros,stable,81.0.4044.103,2020-04-13 18:34:32.069709
  // cros,stable,81.0.4044.95,2020-04-08 19:12:35.256391
  // win,canary,84.0.4108.0,2020-04-08 05:13:02.081501
  // ios,stable,81.0.4044.62,2020-04-07 20:43:04.309177
  // webview,stable,81.0.4044.96,2020-04-07 19:00:16.179115
  // linux,stable,81.0.4044.92,2020-04-07 18:59:04.796497
  // android,stable,81.0.4044.96,2020-04-07 18:59:02.886853
  // win,stable,81.0.4044.92,2020-04-07 18:59:01.886453
  // win64,stable,81.0.4044.92,2020-04-07 18:59:01.248720
  // mac,stable,81.0.4044.92,2020-04-07 18:59:00.599225
  // android,canary,84.0.4107.0,2020-04-07 08:59:02.381659
  // win64,canary,84.0.4107.0,2020-04-07 04:59:01.091819
  // webview,beta,81.0.4044.96,2020-04-06 22:00:34.198136
  // android,beta,81.0.4044.96,2020-04-06 21:59:01.982728
  // cros,beta,81.0.4044.95,2020-04-06 18:30:00.190502
  // android,canary,83.0.4103.5,2020-04-06 07:00:03.881133
  // webview,beta,81.0.4044.91,2020-04-02 22:06:47.168493
  // android,beta,81.0.4044.91,2020-04-02 22:05:14.139403
  // linux,beta,81.0.4044.92,2020-04-02 20:05:03.413939
  // win,beta,81.0.4044.92,2020-04-02 19:50:03.146279
  // win64,beta,81.0.4044.92,2020-04-02 19:50:01.826148
  // mac,beta,81.0.4044.92,2020-04-02 19:50:00.703193
  // android,dev,83.0.4099.5,2020-04-01 23:07:03.608167
  // mac,canary,83.0.4101.0,2020-04-01 05:37:01.481589
  // cros,beta,81.0.4044.81,2020-03-27 23:42:03.361100
  // win64,canary,83.0.4097.0,2020-03-27 05:12:01.281556
  // win64,canary,83.0.4096.3,2020-03-26 20:57:01.810225
  // ios,dev,83.0.4094.0,2020-03-26 18:42:06.819727
  // linux,beta,81.0.4044.83,2020-03-26 18:27:03.803793
  // win,beta,81.0.4044.83,2020-03-26 18:12:01.939082
  // win64,beta,81.0.4044.83,2020-03-26 18:12:01.044618
  // mac,beta,81.0.4044.83,2020-03-26 18:12:00.445242
  // webview,beta,81.0.4044.71,2020-03-24 19:29:29.959005
  // android,beta,81.0.4044.71,2020-03-24 19:28:02.466656
  // cros,beta,81.0.4044.72,2020-03-19 18:30:59.178876

  // const revision =
  //   process.env.PUPPETEER_CHROMIUM_REVISION ||
  //   process.env.npm_config_puppeteer_chromium_revision ||
  //   process.env.npm_package_config_puppeteer_chromium_revision ||
  //   puppeteerCorePackageJson.puppeteer.chromium_revision

  const revisionInfo = browserFetcher.revisionInfo(revision)

  // If already downloaded
  if (revisionInfo.local) return revisionInfo

  try {
    console.info(`Downloading Chromium r${revision}...`)
    const newRevisionInfo = await browserFetcher.download(revisionInfo.revision)
    console.info(`Chromium downloaded to ${newRevisionInfo.folderPath}`)

    let localRevisions = await browserFetcher.localRevisions()
    localRevisions = localRevisions.filter((r) => r !== revisionInfo.revision)

    // Remove previous revisions
    const cleanupOldVersions = localRevisions.map((r) => browserFetcher.remove(r))
    await Promise.all(cleanupOldVersions)

    return newRevisionInfo
  } catch (error) {
    console.error(`ERROR: Failed to download Chromium r${revision}!`)
    console.error(error)
    return null
  }
}

async function isSuitableVersion(executablePath) {
  let versionOutput

  try {
    // In case installed Chrome is not runnable
    versionOutput = execSync(`"${executablePath}" --version`).toString()
  } catch (e) {
    return false
  }

  const versionRe = /(Google Chrome|Chromium) ([0-9]{2}).*/
  const match = versionOutput.match(versionRe)
  if (match && match[2]) {
    const version = +match[2]
    return version >= MIN_CHROME_VERSION
  }

  return false
}

async function findChrome() {
  let executablePath

  if (process.platform === 'linux') executablePath = linux()
  else if (process.platform === 'win32') executablePath = win32()
  else if (process.platform === 'darwin') executablePath = darwin()

  // if (typeof executablePath === 'string' && executablePath.length > 0) {
  //   if (await isSuitableVersion(executablePath)) {
  //     await writeFile(chromeConfigPath, JSON.stringify({ executablePath }))
  //     console.info(`Local Chrome location: ${executablePath}`)
  //     if (process.platform !== 'win32') {
  //       console.info(
  //         `Local Chrome version: ${execSync(`"${executablePath}" --version`).toString()}`
  //       )
  //     }
  //     return executablePath
  //   }
  //   console.info('Local Chrome version is not suitable')
  // }

  if (isDownloadSkipped) {
    console.info(
      'Skipping Chromium download. "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD" was set in either env variables, ' +
        'npm config or project config.'
    )
    return undefined
  }

  const revisionInfo = await downloadChromium()
  await writeFile(chromeConfigPath, JSON.stringify({ executablePath: revisionInfo.executablePath }))

  console.info(`Downloaded Chrome location: ${revisionInfo.executablePath}`)
  if (process.platform !== 'win32') {
    console.info(
      `Downloaded Chrome version: ${execSync(
        `"${revisionInfo.executablePath}" --version`
      ).toString()}`
    )
  }

  return revisionInfo.executablePath
}

module.exports = { findChrome }
