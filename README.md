# ipfsx

[![Build Status](https://travis-ci.org/alanshaw/ipfsx.svg?branch=master)](https://travis-ci.org/alanshaw/ipfsx) [![dependencies Status](https://david-dm.org/alanshaw/ipfsx/status.svg)](https://david-dm.org/alanshaw/ipfsx)

> Experimental IPFS API

## Table of Contents

* [Background](#background)
* [Install](#install)
* [Usage](#usage)
* [API](#api)
* [Contribute](#contribute)
* [License](#license)

## Background

**!! WIP !!**

JS IPFS supports two types of stream at the API level, but uses pull streams for internals. If I was working on js-ipfs at the time I'd have made the same decision. Since then, async/await became part of the JS language and the majority of JavaScript runtimes now support async/await, async iterators and for/await/of (i.e. no need to transpile). These tools give us the power to stream data without needing to rely on a library.

Just because there are new language features available doesn't mean we should switch to using them. It's a significant upheaval to change the core interface spec and it's implementations (js-ipfs, js-ipfs-api etc.) without good reason. That is why this repository exists: it provides a playground where we can test out new API ideas without having to set them in stone by writing them in the spec.

Part of the reason I'm pro switching to async iterators is because I see parallels between them and pull streams, and I'm super pro pull streams for their simplicity and power.

Reduction in bundle size - no need to bundle two different stream implementations, and their eco-system helper modules, no need for the `async` module.

Reduce `npm install` time - fewer dependencies to install.

Allows us to remove a bunch of plumbing code that converts Node.js streams to pull streams and vice versa.

Simplifies the API, no `addPullStream`, `addReadableStream`.

[Node.js readable streams are now async iterators](https://github.com/nodejs/node/pull/17755)!

Of note, it is trivial to convert from [pull stream to (async) iterator](https://github.com/alanshaw/pull-stream-to-async-iterator) [and vice versa](https://github.com/alanshaw/async-iterator-to-pull-stream) and [Node.js streams are now async iterators](http://2ality.com/2018/04/async-iter-nodejs.html).

Async/await is inevitable for js-ipfs and js-ipfs-api, the CLI tests are already all promise based, when we inevitably upgrade to Hapi 17 the HTTP API will have to become promise based. The whole of the core interface is dual callback/promise based through `promisify`. Maybe it's time to double down on promises?

## Install

```sh
npm install ipfsx
```

## Usage

```js
import ipfsx from 'ipfsx'
import IPFS from 'ipfs' // N.B. also works with ipfs-api!

const node = await ipfsx(new IPFS)

// IPFS node now ready to use, see API below
```

## API

* [Getting started](#getting-started)
* [`add`](#add)
* [`cat`](#cat)
* TODO: more to come in upcoming releases!

### Getting started

#### `ipfsx(backend)`

##### Parameters

| Name | Type | Description |
|------|------|-------------|
| backend | `Ipfs\|IpfsApi` | Backing ipfs core interface to use |

##### Returns

| Type | Description |
|------|-------------|
| `Promise<IpfsxApi>` | An ipfsx API |

##### Example

```js
import ipfsx from 'ipfsx'
import IPFS from 'ipfs' // N.B. also works with ipfs-api!

const node = await ipfsx(new IPFS(/* options */))

// node.add(...)
// node.cat(...)
// etc...
```

### add

#### `ipfsx.add(input, [options])`

##### Parameters

| Name | Type | Description |
|------|------|-------------|
| input | `Buffer\|String\|Object<{content, path?}>\|Iterable\|Iterator` | Input files/data |
| options | `Object` | (optional) options |

##### Returns

| Type | Description |
|------|-------------|
| `Iterator<{cid<CID>,path<String>}>>` | Iterator of content IDs and paths of added files/data. It has an async `first()` and `last()` function for returning just the first/last item. |

##### Example

Add a string/buffer/object:

```js
const { cid } = await ipfsx.add('hello world').first()
console.log(cid)
```

```js
const { cid } = await ipfsx.add(Buffer.from('hello world')).first()
console.log(cid)
```

```js
const { cid } = await ipfsx.add({ content: Buffer.from('hello world') }).first()
console.log(cid)
```

Add an (async) iterable/iterator:

```js
// Adding multiple files
// Note: fs.createReadStream is an ASYNC iterator!
const adder = ipfsx.add([
  { path: 'root/file1', content: fs.createReadStream(/*...*/) },
  { path: 'root/file2', content: fs.createReadStream(/*...*/) }
])

for await (const res of adder)
  console.log(res.cid, res.path)
```

```js
// Single file, regular iterator
const iterator = function * () {
  for (let i = 0; i < 10; i++)
    yield crypto.randomBytes()
}

const { cid } = await ipfsx.add(iterator()).first()
console.log(cid)
```

NOTE: if you have pull stream inputs, you can use [pull-stream-to-async-iterator](https://github.com/alanshaw/pull-stream-to-async-iterator) to convert them :D

### cat

#### `ipfsx.cat(path, [options])`

##### Parameters

| Name | Type | Description |
|------|------|-------------|
| path | `String\|CID` | IPFS path or CID to cat data from |
| options | `Object` | (optional) options |

##### Returns

| Type | Description |
|------|-------------|
| `Iterator<Buffer>` | An iterator that can be used to consume all the data |

##### Example

```js
const { cid } = await ipfsx.add('hello world').first()

let data = Buffer.alloc(0)

for await (const chunk of ipfsx.cat(cid, options)) {
  data = Buffer.concat(data, chunk)
}

console.log(data.toString()) // hello world
```

## Contribute

Feel free to dive in! [Open an issue](https://github.com/alanshaw/ipfsx/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Alan Shaw
