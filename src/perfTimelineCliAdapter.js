const { spawn } = require('child_process')
const { preparePathForTempDir } = require('./utils')

const PATH_TO_PERF_TOOL = './node_modules/.bin/perf-timeline'

const spawnTool = args => new Promise((resolve, reject) => {
  const proc = spawn(PATH_TO_PERF_TOOL, args)
  proc.on('close', (code) => {
    if (code === 0) resolve()
    else {
      reject(new Error(`Can't execute ${PATH_TO_PERF_TOOL}\nArgs: ${JSON.stringify(args)}`))
    }
  })
})

const generateChromeTimelines = async (urlToHtmlFile, timelinesFileName, options) => {
  try {
    const timelinesFilePath = preparePathForTempDir(timelinesFileName)
    await spawnTool(['generate', urlToHtmlFile, ...options, '--path', timelinesFilePath])
    return timelinesFilePath
  } catch (error) {
    console.error(error.stack)
    return process.exit(1)
  }
}

module.exports = { generateChromeTimelines }
