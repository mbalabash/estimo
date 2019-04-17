const { npx } = require('node-npx')

const spawnTool = args => new Promise((resolve, reject) => {
  const proc = npx('perf-timeline', args)
  proc.on('close', (code) => {
    if (code === 0) resolve()
    else {
      reject(new Error(`Can't execute 'npx perf-timeline'\nArgs: ${JSON.stringify(args)}`))
    }
  })
})

const generateChromeTimelines = async (urlToHtmlFile, timelinesFilePath, options = []) => {
  try {
    await spawnTool(['generate', urlToHtmlFile, ...options, '--path', timelinesFilePath])
    return timelinesFilePath
  } catch (error) {
    console.error(error.stack)
    return process.exit(1)
  }
}

module.exports = { generateChromeTimelines }
