import nanoid from 'nanoid'

import { writeFile, resolvePathToTempDir } from '../utils'

export function createHtmlContent(library: string) {
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

export async function generateHtmlFile(htmlContent: string) {
  const fileName = resolvePathToTempDir(`${nanoid()}.html`)
  await writeFile(fileName, htmlContent)
  return fileName
}
