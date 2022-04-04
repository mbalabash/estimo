# Change Log

## 2.3.6

- Hotfix for `find-chrome-bin` while supporting node < 16

## 2.3.5

- Upgraded project dependencies.

- Fixed npm security issue.

## 2.3.4

- Removed npm `install` script. From this version, `estimo` won't be looking for or downloading Chrome after npm install. It will be happening on the first launch.

## 2.3.3

- Fixed npm security issues.

- Upgraded project dependencies.

## 2.3.2

- Fixed npm security issues.

- Upgraded project dependencies.

## 2.3.1

- Now using `find-chrome-bin` to find chromium binary.

- Upgraded project dependencies.

## 2.3.0

**Changed**:

- Replaced yargs with commander which lead to removing 15 dependencies and reducing package size on 146kB.

- Fixed bug with network emulation.

- Simplified wording in documentation.

## 2.2.9

**Changed**:

- Fixed issue when chrome detection script fails on win10 (thanks to [@BePo65](https://github.com/BePo65))

- Fixed npm security issues.

## 2.2.8

**Changed**:

- Increased stability on slow CI's.

- Dropped support for Node.js 10.

- Fixed npm security issues.

## 2.2.7

**Changed**:

- Migrated on forked version of trace parcer with patches to avoid errors with navigationStart event. Which is increase stability with newest chromium releases (thanks @sitespeed.io).

- Removed `LATEST_STABLE_CHROME_VERSION` and fixed `chromeDetection` script to work with newest chromium releases.

## 2.2.6

**Changed**:

- Upgraded `puppeteer-core` to v9.1.0 which fixes BrowserFetcher error on Mac M1.

- Removed temporary error when running on Mac M1.

## 2.2.5

**Changed**:

- Added temporary error until puppeteer will fully support M1 Mac ([#6641](https://github.com/puppeteer/puppeteer/issues/6641)).

- Prevented install-script from failure if some error appeared.

## 2.2.4

**Changed**:

- Handle `CHROMIUM_EXECUTABLE_PATH` env variable as a source of information to Chromium binary.

- Upgraded project dependencies.

## 2.2.3

**Changed**:

- Now, it'll show an error when couldn't find Chrome executable path.

- Upgraded project dependencies.

## 2.2.2

**Changed**:

- Fix npm security issue.

## 2.2.1

**Changed**:

- Fix npm security issue.

## 2.2.0

**Added**:

- `diff` - option which enable [`Diff Mode`](https://github.com/mbalabash/estimo#diff-mode).

It will be useful for you if you want to understand how performance metrics are changed between a few versions of js libraries.

## 2.1.2

**Changed**:

- Updated project dependencies.

## 2.1.1

**Changed**:

- Updated project docs.

## 2.1.0

**Added**:

- `runs` - option which you can use to run estimo N times and get median value as a result.

**Changed**:

- Fixed broken types.

- Updated dependencies.

- Removed debug logging.

- Removed useless tests.

- Fixed unhandled exceptions.

## 2.0.4

- Fix estimo types.

- Remove `process.exit` for plugable use cases.

- Get `MIN_CHROME_VERSION` from environment or use predefined version.

## 2.0.3

- Fix npm security issue.

## 2.0.2

- Add temporary fix for Chrome 80 revision.

- Upgrade `puppeteer-core` to **2.1.0**.

- Enhance NODE_ENV `ESTIMO_DEBUG` output.

- Don't remove temp files in `ESTIMO_DEBUG` mode.

- Add Chrome revision info on npm install hook.

- Style refactoring.

- Update tests.

## 2.0.1

- Use `PUPPETEER_EXECUTABLE_PATH` to find chrome execute path if variable available.

## 2.0.0

- Add page-mode for processing web pages by url.
- Change processing logic and split it apart for js files and web pages.
- Add check for inexistent local js files.
- Add `device` option for chrome device emulation.
- Add `width`, `height` options for custom viewport emulation.
- Add `userAgent` option for custom userAgent emulation.
- Add `IncognitoBrowserContext` support for better performance.
- Change `-l` argument to `-r` (**CLI API**).
- Change `library` field in result output to `name` (**JS API**).
- Add debug log via `ESTIMO_DEBUG=true`.
- Add `TypeScript` typings for better DX.
- Update tests.
- Update project documentation.

## 1.1.6

- Fix path resolving to chrome binary when using npx.

## 1.1.5

- Change chrome detection script for not executing if `ESTIMO_DISABLE=true`.

## 1.1.4

- Fix error on windows.
- Fix Travis CI error (`Build terminated after build exited successfully`).
- Update tests.

## 1.1.3

- Fix chrome version check.
- Remove debug code.

## 1.1.1

- Fix security issue with npm packages.

## 1.1.0

- Change Travis CI config for launching test with and without suitable chrome.
- Fix `FP`, `FCP`, `FMP`, `LHError` errors.
- Fix memory error on CI (`'--no-sandbox', '--disable-setuid-sandbox'`).
- Add support for env variables from puppeteer.
- Add script for local chrome detection.
- Drop `puppeteer` support and use `puppeteer-core` instead.
- Add multiple files processing.
- Update project documentation.
- Add usage examples.

## 1.0.0

- Drop `perf-timeline` support and use `puppeteer` instead.
- Drop `bigrig` support and use `tracium` instead.
- Change js/cli api.
- Update project documentation.

## 0.1.9

- Fix path resolving to `perf-timeline` binary.

## 0.1.8

- Update project documentation.
- Code-style refactoring.

## 0.1.7

- Replace `node-npx` to `cross-spawn`.

## 0.1.6

- Run `perf-timeline` via `node-npx`.
- Add Travis CI.

## 0.1.5

- Show processing time when using CLI.
- Add fields description for `estimo` result.
- Add documentation for Network/CPU Emulation.

## 0.1.4

- Fix file path resolving when using CLI.

## 0.1.3

- Initial release.

## 0.1

- PoC implementation.
