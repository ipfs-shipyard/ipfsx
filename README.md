# ipfx

[![Build Status](https://travis-ci.org/alanshaw/ipfsx.svg?branch=master)](https://travis-ci.org/alanshaw/ipfsx) [![dependencies Status](https://david-dm.org/alanshaw/ipfsx/status.svg)](https://david-dm.org/alanshaw/ipfsx)

> Experimental IPFS API

## Usage

```js
import ipfsx from 'ipfsx'
import IPFS from 'ipfs' // N.B. also works with ipfs-api!

const node = await ipfsx(new IPFS)

// IPFS node now ready to use, see API below
```

## API

```js
// Promote files.* to root

// === ADD ===

const res = await ipfs.add(iterator|buffer|string, options)

// iterator can yield buffers or object of `{path, content: <(async)iterator>}`
// strings get auto converted to buffers
// `res` is just an object with { cid, path } unless iterator yielded objects
// then it's [{cid, path}]

// === CAT ===

let data = Buffer.alloc(0)

for await (const chunk of ipfs.cat(path, options)) {
  data = Buffer.concat(data, chunk)
}

// === LS ===

const listing = await ipfs.ls(path)

// === GET ===

const items = await ipfs.get(path, options)
const item = items[0]

// Where `item` is {path, content: <(async)iterator>}
let data = Buffer.alloc(0)
for await (const chunk of item.content()) {
  data = Buffer.concat(data, chunk)
}
```

## Contribute

Feel free to dive in! [Open an issue](https://github.com/alanshaw/ipfsx/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Alan Shaw
