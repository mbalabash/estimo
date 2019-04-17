const spawn = require('cross-spawn')
const { findPerfTimelineTool } = require('./utils')

const spawnTool = args => new Promise((resolve, reject) => {
  try {
    const pathToPerfTool = findPerfTimelineTool(process.cwd())
    const proc = spawn(pathToPerfTool, args, { stdio: 'inherit' })
    proc.on('close', (code) => {
      if (code === 0) resolve()
      else {
        reject(new Error(`Can't execute 'npx ${pathToPerfTool}'\nArgs: ${JSON.stringify(args)}`))
      }
    })
  } catch (error) {
    console.error(error.stack)
  }
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
