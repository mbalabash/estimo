import { nanoid } from 'nanoid'

import {
  existsAsync,
  getLibraryName,
  getUrlToHtmlFile,
  isUrl,
  resolvePathToTempDir,
  writeFile
} from './utils.js'

export function createHtmlContent(library) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Estimo Template</title>
  </head>
  <body>
    ${`<script src="${library}"></script>`}
    <h1>Estimo</h1>
  </body>
</html>`
}

export async function generateHtmlFile(htmlContent) {
  let fileName

  try {
    fileName = resolvePathToTempDir(`${nanoid()}.html`)
    await writeFile(fileName, htmlContent)
  } catch (error) {
    console.error(error)
  }

  return fileName
}

export async function prepareLibrariesForEstimation(libraries) {
  let resources = []

  for (let lib of libraries) {
    let isFileExist = await existsAsync(lib)
    if (!isUrl(lib) && !isFileExist) {
      throw new Error(`${lib} - file isn't exist!`)
    }

    let htmlContent = createHtmlContent(lib)
    let html = await generateHtmlFile(htmlContent)

    let name = getLibraryName(lib)
    let url = getUrlToHtmlFile(html)
    resources.push({ htmlPath: html, name, url })
  }

  return resources
}
