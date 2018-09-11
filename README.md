# ipfsx

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

* [Getting started](#getting-started)
* [`add`](#add)
* [`cat`](#cat)
* TODO: more to come in upcoming releases!

### Getting started

#### `ipfsx(backend)`

##### Parameters

| Name | Type | Description |
|------|------|-------------|
| backend | `Ipfs|IpfsApi` | Backing ipfs core interface to use |

##### Returns

| Type | Description |
|------|-------------|
| `Promise<IpfsxApi>` | An ipfsx API |

##### Example

```js
import ipfsx from 'ipfsx'
import IPFS from 'ipfs' // N.B. also works with ipfs-api!

const node = await ipfsx(new IPFS(/* options */))

// await node.add(...)
// await node.cat(...)
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
| `Promise<{cid,path}\|Array<{cid,path}>>` | Content IDs and paths of added files/data |

##### Example

Add a string/buffer/object:

```js
const { cid } = await ipfsx.add('hello world')
console.log(cid)
```

```js
const { cid } = await ipfsx.add(Buffer.from('hello world'))
console.log(cid)
```

```js
const { cid } = await ipfsx.add({ content: Buffer.from('hello world') })
console.log(cid)
```

Add an (async) iterable/iterator:

```js
// Adding multiple files
// Note: fs.createReadStream is an ASYNC iterator!
const res = await ipfsx.add([
  { path: 'root/file1', content: fs.createReadStream(/*...*/) },
  { path: 'root/file2', content: fs.createReadStream(/*...*/) }
])
res.forEach(({ cid, path }) => console.log(cid, path))
```

```js
// Single file, regular iterator
const iterator = function * () {
  for (let i = 0; i < 10; i++) yield crypto.randomBytes()
}
const res = await ipfsx.add(iterator())
res.forEach(({ cid, path }) => console.log(cid, path))
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
const { cid } = await ipfsx.add('hello world')

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
