const { writeFile, getUrlToHtmlFile } = require('./utils')

const LIB_HTML_SEPARATOR = '\n    '

const prepareHtmlContent = libs => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Estimo</title>
  </head>
  <body>
    ${libs.map(lib => `<script src="${lib}"></script>`).join(LIB_HTML_SEPARATOR)}
  </body>
</html>
`

const generateHtmlFile = async (fileName, libs) => {
  const files = Array.isArray(libs) ? libs : [libs]
  try {
    await writeFile(fileName, prepareHtmlContent(files))
    return getUrlToHtmlFile(fileName)
  } catch (error) {
    console.error(error.stack)
    return process.exit(1)
  }
}

module.exports = { generateHtmlFile }
