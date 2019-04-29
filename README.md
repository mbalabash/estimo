## Estimo ![Travis CI Status](https://travis-ci.com/mbalabash/estimo.svg?branch=master)

Estimo was created with idea in mind how to measure parse/compile/execution time for javascript libs.

It uses devtools protocol to [generate Chrome Timelines](https://github.com/CondeNast/perf-timeline-cli). Which can be transformed in human-readable format by [Big Rig](https://github.com/googlearchive/node-big-rig). **Keep in mind** there result depends on your device and available resources.

Inspired by [Size Limit](https://github.com/ai/size-limit). Thanks [@ai](https://github.com/ai/) for support.

## Why?

JavaScript is the most expensive part of our frontend.

**We should** really care about [size](https://evilmartians.com/chronicles/size-limit-make-the-web-lighter). But in additional to size, we also need to think about how long our JavaScript will process.

![3.5 seconds to process 170 KB of JS and 0.1 second for 170 KB of JPEG. @Addy Osmani](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/javascript-startup-optimization/images/1_PRVzNizF9jQ_QADF5lQHpA.png)

3.5 seconds to process 170 KB of JS and 0.1 second for 170 KB of JPEG. [Addy Osmani](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/javascript-startup-optimization/)

- [JavaScript Start-up Optimization](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/javascript-startup-optimization/)

- [The Cost Of JavaScript In 2018](https://medium.com/@addyosmani/the-cost-of-javascript-in-2018-7d8950fbb5d4)

## Install

```js
npm i estimo
```

or

```js
yarn add estimo
```

## JS API

```js
const estimo = require('estimo')
const path = require('path')

;(async () => {
  const report = await estimo(
    path.resolve(path.join(__dirname, '..', 'libs', 'someLib.js'))
  )
  console.log(report)
})()
```

## CLI

```sh
estimo -l ./libs/someLib.js
```

## Output

```json
{
  "parseHTML": 1.55,
  "styleLayout": 64.48,
  "paintCompositeRender": 0.7,
  "scriptParseCompile": 1.14,
  "scriptEvaluation": 8.45,
  "javaScript": 9.59,
  "garbageCollection": 0,
  "other": 12.81,
  "total": 89.13
}
```

## Time

**All metrics in milliseconds**.

We measure system-cpu time. The number of seconds that the process has spent on the CPU.

We not including time spent waiting for its turn on the CPU.

## Fields Description

- **parseHTML** - Time which was spent for `ParseHTML`, `ParseAuthorStyleSheet` events.

- **styleLayout** - Time which was spent for `ScheduleStyleRecalculation`, `UpdateLayoutTree`, `InvalidateLayout`, `Layout` events.

- **paintCompositeRender** - Time which was spent for `Animation`, `HitTest`, `PaintSetup`, `Paint`, `PaintImage`, `RasterTask`, `ScrollLayer`, `UpdateLayer`, `UpdateLayerTree`, `CompositeLayers` events.

- **scriptParseCompile** - Time which was spent for `v8.compile`, `v8.compileModule`, `v8.parseOnBackground` events.

- **scriptEvaluation** - Time which was spent for `EventDispatch`, `EvaluateScript`, `v8.evaluateModule`, `FunctionCall`, `TimerFire`, `FireIdleCallback`, `FireAnimationFrame`, `RunMicrotasks`, `V8.Execute` events.

- **javaScript** - Time which was spent for both event groups (**scriptParseCompile** and **scriptEvaluation**).

- **garbageCollection** - Time which was spent for `MinorGC`, `MajorGC`, `BlinkGC.AtomicPhase`, `ThreadState::performIdleLazySweep`, `ThreadState::completeSweep`, `BlinkGCMarking` events.

- **other** - Time which was spent for `MessageLoop::RunTask`, `TaskQueueManager::ProcessTaskFromWorkQueue`, `ThreadControllerImpl::DoWork` events.

- **total** - Total time.

## CPU Throttling Rate Options

According to [perf-timeline-cli](https://github.com/CondeNast/perf-timeline-cli) documentation.

The CPU Throttling Rate Emulation Options allow you to generate a Performance timeline under specified CPU conditions. To turn on CPU emulation, you must pass the `--set-cpu-throttling-rate` flag along with additional configuration options.

- `--set-cpu-throttling-rate` (optional; `false`) - This flag allows the other CPU Throttling Rate Options to be respected. They will be completely ignored unless this flag is set.

- `--rate` (optional; `1`) - Sets the CPU throttling rate. The number represents the slowdown factor (e.g., 2 is a "2x" slowdown).

**JS API**:

```js
...
await estimo('/absolute/path/to/lib', [
  '--set-cpu-throttling-rate',
  '--rate',
  '4',
])
...
```

**CLI**:

```sh
estimo -l ./libs/someLib.js --perfCliArgs="--set-cpu-throttling-rate --rate 4"
```

## Network Emulation Options

According to [perf-timeline-cli](https://github.com/CondeNast/perf-timeline-cli) documentation.

The Network Emulation Options allow you to generate a Performance timeline under specified network conditions. To turn on network emulation, you must pass the `--emulate-network-conditions` flag along with additional configuration options.

- `--emulate-network-conditions` (optional; `false`) - This flag allows the other Network Emulation Options to be respected. They will be completely ignored unless this flag is set.

- `--offline` (optional; `false`) - Passing the `--offline` flag to the generate command emulate a network disconnect.

- `--latency` (optional; `0`) - Artificial, minimum latency between request sent and response header received expressed in milliseconds (ms).

- `--download-throughput` (optional: `-1`) - The maximum download speed in megabits per second. Note Chrome Headless' version of this argument uses bytes per second. Perf Timeline CLI uses megabits per second as that is a more common measure of network throughput. `-1` disables throttling.

- `--upload-throughput` (optional: `-1`) - The maximum upload speed in megabits per second. Note Chrome Headless' version of this argument uses bytes per second. Perf Timeline CLI uses megabits per second as that is a more common measure of network throughput.`-1` disables throttling.

- `--connection-type` (optional: `none`) - A label of the supposed underlying network connection type that the browser is using. Supported values are documented under Chrome Headless' ConnectType documentation.

**JS API**:

```js
...
await estimo('/absolute/path/to/lib', [
  '--emulate-network-conditions',
  '--latency',
  '150',
  '--upload-throughput',
  '0.75',
  '--download--throughput',
  '1.6',
])
...
```

**CLI**:

```sh
estimo -l ./libs/someLib.js --perfCliArgs="--emulate-network-conditions --latency 150 --upload-throughput 0.75 --download--throughput 1.6"
```

**[More examples](https://github.com/mbalabash/estimo-examples)**

## Contributing

Feel free to ask or open an issue.

## Licence

MIT
