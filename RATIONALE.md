# Rationale

**NOTE: this is all WIP**

## `await ipfsx(...)`

Most people working with js-ipfs nowadays will create a helper function `getIpfs` (or similar) that simply wraps the `node.on('ready', cb)` in a `Promise`. This simply provides this function so that everyone can use it and ensures that it is done properly.

## Iterators vs (pull) streams

This is covered in the [README.md](README.md#background).

## `iterator.first()` and `iterator.last()`

API calls that return an iterator will be decorated with these functions. They are simply convenience functions enabling the user to `await` on the first or last item in an iterator.

For example, if adding a single file, the iterator will only ever yield one result, using `first`/`last` reduces this boilerplate:

```js
let result
for await (const res of node.add('hello world')) {
  result = res
}
console.log(result.cid.toBaseEncodedString())
```

to:

```js
const result = await node.add('hello world').first()
console.log(result.cid.toBaseEncodedString())
```

Another example is if adding multiple items to a directory, often times you're only interested in the last item yielded from the iterator i.e. the hash of the directory.

## No `files.*`

Methods in `files` namespace in js-ipfs have been hoisted to the root namespace. IPFS's prime purpose is to deal with files, so we privilege these calls. They are also the most widely used calls so saving on typing helps developers.

## `add`

### Add a `String`

`String` as an input param has no other meaning in this context, just allow people to add strings so they don't have to type `Buffer.from(...)` every time.

### Added content object

The object contains a `cid` property (a CID instance) instead of a `hash` property (a base 58 encoded string). There's no need for IPFS to assume that you want to display the CID of the content added and for that matter what base encoding you'd want to display it in.

## `block.put`

### Option names

Are the same options but they have been renamed to be less cryptic.

### CID codec default value

The default value for CID codec is changed from `dag-pb` to `raw`. This is to encourage users of the API to add correctly formed data.

### CID version 1

Changed from 0 to 1. This will soon be the default for all new content added to IPFS anyway.

### Iterator input

This makes adding multiple blocks significantly easier and allows us to easily integrate with [`js-unixfsv2-draft`](https://github.com/mikeal/js-unixfsv2-draft).

## `write`

### Create by default

Similar to Node.js `fs.createWriteStream` or `fs.writeFile`, 99.9% of the time we want to create the file if it doesn't exist, why make this difficult?

### CID version 1

Changed from 0 to 1. This will soon be the default for all new content added to IPFS anyway.

## `stat`

### No options

I'm speculating that there's no significant performance gain to be had by only retrieving just the `hash` or the `size` of the node and I'm also speculating that these options will not be missed.

`withLocal` functionality does not exist in either implementation.

There is no need for a `cidBase` option as the returned stats object contains a `cid` property (a CID instance) instead of a `hash` property (a base 58 encoded string). There's no need for IPFS to assume that you want to display the CID of the content added and for that matter what base encoding you'd want to display it in.
