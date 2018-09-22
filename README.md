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

JS IPFS supports two types of stream at the API level, but uses pull streams for internals. If I was working on js-ipfs at the time I'd have made the same decision. Since then, async/await became part of the JS language and the majority of JavaScript runtimes now support async/await, async iterators and for/await/of (i.e. no need to transpile). These tools give us the power to stream data without needing to rely on a library.

Just because there are new language features available doesn't mean we should switch to using them. It's a significant upheaval to change the core interface spec and it's implementations (js-ipfs, js-ipfs-api etc.) without good reason. That is why this repository exists: it provides a playground where we can test out new API ideas without having to set them in stone by writing them in the spec.

The big changes are to switch to async/await syntax and to make use of async iterators in place of Node.js/pull streams. I want JS IPFS to feel modern, up to date and cutting edge and I'm willing to bet that this will aid community contributions and adoption.

Part of the reason I'm pro switching to async iterators is because I see parallels between them and pull streams, and I'm super pro pull streams for their simplicity and power:

* Clear story for error propagation and handling
* Backpressure is built in and easy to implement
* No complicated internal state that is difficult to understand

There's actually a bunch of other good reasons to switch to async/await and async iterators:

* Reduction in bundle size - no need to bundle two different stream implementations, and their eco-system helper modules, no need for the `async` module.
* Reduce `npm install` time - fewer dependencies to install.
* Allows us to remove a bunch of plumbing code that converts Node.js streams to pull streams and vice versa.
* Simplifies the API, no `addPullStream`, `addReadableStream`.
* Building an `interface-ipfs-core` compatible interface becomes a whole lot easier, no dual promise/callback API and no multiple stream implementation variations of the same function. It would also reduce the number of tests in the `interface-ipfs-core` test suite for the same reasons.
* [Node.js readable streams are now async iterators](http://2ality.com/2018/04/async-iter-nodejs.html) thanks to [#17755](https://github.com/nodejs/node/pull/17755)!
* Of note, it is trivial to convert from [pull stream to (async) iterator](https://github.com/alanshaw/pull-stream-to-async-iterator) and [vice versa](https://github.com/alanshaw/async-iterator-to-pull-stream).
* Unhandled throws that cannot be caught will no longer be a problem

Something for your consideration - async/await is inevitable for js-ipfs and js-ipfs-api, the CLI tests are already all promise based, when we inevitably upgrade to Hapi 17 the HTTP API will have to become promise based. The whole of the core interface is dual callback/promise based through `promisify`. Maybe it's time to double down on promises?

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
* [`block.get`](#blockget)
* [`block.put`](#blockput)
* [`block.stat`](#blockstat)
* [`cat`](#cat)
* [`get`](#get)
* [`start`](#start)
* [`stop`](#stop)
* TODO: more to come in upcoming releases!

### Getting started

Create a new ipfsx node, that uses an `interface-ipfs-core` compatible `backend`.

#### `ipfsx(backend)`

##### Parameters

| Name | Type | Description |
|------|------|-------------|
| backend | `Ipfs`\|`IpfsApi` | Backing ipfs core interface to use |

##### Returns

| Type | Description |
|------|-------------|
| `Promise<Node>` | An ipfsx node |

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

Add file data to IPFS.

#### `node.add(input, [options])`

##### Parameters

| Name | Type | Description |
|------|------|-------------|
| input | `Buffer`\|`String`\|`Object<{content, path?}>`\|`Iterable`\|`Iterator` | Input files/data |
| options | `Object` | (optional) options |

##### Returns

| Type | Description |
|------|-------------|
| `Iterator<{cid<`[`CID`](https://www.npmjs.com/package/cids)`>, path<String>}>` | Iterator of content IDs and paths of added files/data. It has an async `first()` and `last()` function for returning just the first/last item. |

##### Example

Add a string/buffer/object:

```js
const { cid } = await node.add('hello world').first()
console.log(cid)
```

```js
const { cid } = await node.add(Buffer.from('hello world')).first()
console.log(cid)
```

```js
const { cid } = await node.add({ content: Buffer.from('hello world') }).first()
console.log(cid)
```

Add an (async) iterable/iterator:

```js
// Adding multiple files
// Note: fs.createReadStream is an ASYNC iterator!
const adder = node.add([
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

const { cid } = await node.add(iterator()).first()
console.log(cid)
```

NOTE: if you have pull stream inputs, you can use [pull-stream-to-async-iterator](https://github.com/alanshaw/pull-stream-to-async-iterator) to convert them :D

### block.get

Fetch a raw block from the IPFS block store or the network via bitswap if not local.

#### `node.block.get(cid)`

##### Parameters

| Name | Type | Description |
|------|------|-------------|
| cid | [`CID`](https://www.npmjs.com/package/cids) | CID of block to get |

##### Returns

| Type | Description |
|------|-------------|
| [`Block`](https://www.npmjs.com/package/ipfs-block) | Raw IPFS block |

##### Example

```js
const cid = new CID('zdpuAtpzCB7ma5zNyCN7eh1Vss1dHWuScf91DbE1ix9ZTbjAk')
const block = await node.block.get(cid)

Block.isBlock(block) // true
block.cid.equals(cid) // true
console.log(block.data) // buffer containing block data
```

### block.put

Put a block into the IPFS block store.

#### `node.block.put(data, [options])`

##### Parameters

| Name | Type | Description |
|------|------|-------------|
| data | `Buffer`\|[`Block`](https://www.npmjs.com/package/ipfs-block)\|`Iterable`\|`Iterator` | Block data or block itself to store |
| options | `Object` | (optional) options (ignored if `data` is a `Block`) |
| options.cidCodec | `String` | [Multicodec name](https://github.com/multiformats/js-multicodec/blob/master/src/base-table.js) that describes the data, default: 'raw' |
| options.cidVersion | `Number` | Version number of the CID to return, default: 1 |
| options.hashAlg | `String` | [Multihash hashing algorithm name](https://github.com/multiformats/js-multihash/blob/master/src/constants.js) to use, default: 'sha2-256' |
| options.hashLen | `Number` | Length to truncate the digest to |

##### Returns

| Type | Description |
|------|-------------|
| `Iterator<`[`Block`](https://www.npmjs.com/package/ipfs-block)`>` | Iterator that yields block objects. It has an async `first()` and `last()` function for returning just the first/last item. |

##### Example

Put single block from buffer of data:

```js
const data = Buffer.from('hello world')
const block = await node.block.put(data).first()

Block.isBlock(block) // true
block.cid.codec // raw
console.log(block.data.toString()) // hello world
```

Put an (async) iterable/iterator:

```js
const unixfs = require('js-unixfsv2-draft')
const block = await node.block.put(unixfs.dir(__dirname)).last()
// Last block is a unixfs2 directory
```

### block.stat

Get stats for a block.

#### `node.block.stat(cid)`

##### Parameters

| Name | Type | Description |
|------|------|-------------|
| cid | [`CID`](https://www.npmjs.com/package/cids) | CID of block to get |

##### Returns

| Type | Description |
|------|-------------|
| {size<Number>} | Block stats |

##### Example

```js
const block = await node.block.put(Buffer.from('hello world')).first()
const stats = await node.block.stat(block.cid)
console.log(block.cid.toBaseEncodedString(), stats)
// zb2rhj7crUKTQYRGCRATFaQ6YFLTde2YzdqbbhAASkL9uRDXn { size: 11 }
```

### cat

Get file contents.

#### `node.cat(path, [options])`

##### Parameters

| Name | Type | Description |
|------|------|-------------|
| path | `String`\|`Buffer`\|[`CID`](https://www.npmjs.com/package/cids) | IPFS path or CID to cat data from |
| options | `Object` | (optional) options |

##### Returns

| Type | Description |
|------|-------------|
| `Iterator<Buffer>` | An iterator that can be used to consume all the data |

##### Example

```js
const { cid } = await node.add('hello world').first()

let data = Buffer.alloc(0)

for await (const chunk of node.cat(cid, options)) {
  data = Buffer.concat([data, chunk])
}

console.log(data.toString()) // hello world
```

### get

Get file or directory contents.

#### `node.get(path)`

##### Parameters

| Name | Type | Description |
|------|------|-------------|
| path | `String`\|`Buffer`\|[`CID`](https://www.npmjs.com/package/cids) | IPFS path or CID to get data from |

##### Returns

| Type | Description |
|------|-------------|
| `Iterator<{path<String>, content<Iterator<Buffer>>}>` | An iterator that can be used to consume all the data |

##### Example

Get a single file:

```js
const { cid } = await node.add('hello world').first()
const file = await node.get(cid).first()

let data = Buffer.alloc(0)

for await (const chunk of file.data) {
  data = Buffer.concat([data, chunk])
}

console.log(file.path, data)
```

Get a directory:

```js
const { cid } = await node.add([
  { path: 'root/LICENSE', content: fs.createReadStream('LICENSE') },
  { path: 'root/README.md', content: fs.createReadStream('README.md') }
]).last() // last item will be the root directory

for await (const file of node.get(cid)) {
  console.log('Path:', file.path)

  if (!file.content) continue // Directory has no content

  let data = Buffer.alloc(0)

  for await (const chunk of file.content) {
    data = Buffer.concat([data, chunk])
  }

  console.log('Data:', data)
}
```

### start

Start the IPFS node.

#### `node.start()`

##### Returns

| Type | Description |
|------|-------------|
| `Promise` | Resolved when the node has started |

##### Example

```js
const node = await ipfsx(new IPFS({ start: false }))
await node.start()
```

### stop

Stop the IPFS node.

#### `node.stop()`

##### Returns

| Type | Description |
|------|-------------|
| `Promise` | Resolved when the node has stopped |

##### Example

```js
const node = await ipfsx(new IPFS())
await node.stop()
```

## Contribute

Feel free to dive in! [Open an issue](https://github.com/alanshaw/ipfsx/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Alan Shaw
