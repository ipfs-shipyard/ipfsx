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

Specific rationale for deviations from the `interface-ipfs-core` API is documented in [RATIONALE.md](RATIONALE.md).

## Install

```sh
npm install ipfsx
```

## Usage

```js
import ipfsx from 'ipfsx'
import IPFS from 'ipfs' // N.B. also works with ipfs-api!

const node = await ipfsx(new IPFS)

// IPFS node now ready to use!

// Add something to IPFS
const { cid } = await node.add('hello world').first()

// Stream content from IPFs using async iterators
let data = Buffer.alloc(0)
for await (const chunk of node.cat(cid)) {
  data = Buffer.concat([data, chunk])
}

// for more, see API below
```

## API

* [Getting started](API.md#getting-started)
* [`add`](API.md#add)
* [`block.get`](API.md#blockget)
* [`block.put`](API.md#blockput)
* [`block.stat`](API.md#blockstat)
* [`cat`](API.md#cat)
* [`get`](API.md#get)
* [`id`](API.md#id)
* [`start`](API.md#start)
* [`stop`](API.md#stop)
* [`version`](API.md#version)
* TODO: more to come in upcoming releases!

## Contribute

Feel free to dive in! [Open an issue](https://github.com/alanshaw/ipfsx/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Alan Shaw
