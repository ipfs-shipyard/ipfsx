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

## Abortable API methods

Methods that may never or may take a long time to resolve are abortable (`cat` and others). They take an [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) as `signal` in their options object. Abort signals are obtained from [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) objects and allow the method call to be aborted externally, because of a timeout, user request or other reason.

`AbortController` is implemented in all modern browsers and there exists an `abort-controller` module in npm for use with Node.js.

Hopefully web developers will already be familiar with this construct as it is used with the `fetch` API to abort HTTP requests.

The caveat with this option right now is that neither js-ipfs nor js-ipfs-api support cancelling method calls, so use of this option will not actually cancel anything, but will allow program flow to continue (an error is thrown) when the `controller.abort()` function is called.

Note, when js-ipfs-api starts using `fetch` it should be easy to pass this option to it.

## A unified `ls`

There's two `ls` commands in IPFS. One that deals with IPFS paths like `/ipfs/QmHash/path/to/file` and another that deals with MFS paths `/path/to/file`. There has long been plans to unify the functionality but it has, so far, not come to pass.

The issue is differentiating between the two different path types - there's a small possibility someone saved something in MFS at `/ipfs/QmHash/path/to/file`. MFS already deals with this in the `cp` command. If the path looks like an IPFS path it assumes it's an IPFS path even if the same path exists in MFS.

It's confusing for `cp` to be able to deal with both path types but for `ls` not to be able to do the same. Similarly, it's confusing to have two `ls` commands that deal with files in IPFS.

### TODO: Consistent sizes

For files, the size property of `ls` _should_ correspond to the total size of the node (including protobuf wrappers) as well as any of its descendant nodes.

For directories, the size property _should_ correspond to the total size of the directory and its contents, (files and directories) and all their descendants.

Essentially, directories are no different to files, since files can be split into multiple DAG nodes. This may happen if they exceed the max chunk size or because a custom chunker was used to build the graph and determined a specific chunk size. The only difference is the unixfs metadata that accompanies the data in the DAG node (which may be none when using the raw-leaves option).

A size property that is just the size of the node is rarely useful in applications. This data should be able to be derived and stored with the node on write so there's no need to calculate it again after the fact.

### Consistent type field

The type field will contain the string "file" or "directory" to differentiate between file/directory nodes. A number is not useful to an application programmer as they'll need to lookup the type each time it is used.

### Streaming output via async iterator

Get listing information as it is calculated - a better user experience.

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

## `dag.put`

### CID codec default value

The default value for CID codec is changed from `dag-pb` to `raw`. This is to encourage users of the API to add correctly formed data.

### Iterator input

This makes adding multiple DAG nodes significantly easier.

## `dag.resolve`

Now exists and will work with an embedded JS node or when talking to the daemon via the API.

## `mkdir` & `cp`

### No format or hashAlg options

These options might be useful in the future when unixfs2 comes along, but right now I don't know what would happen if I chose a format other than `dag-pb`. I'm not aware that there is an MFS implementation that even supports this.

These options are also currently not implemented in js-ipfs-mfs.

## `stat`

### No options

I'm speculating that there's no significant performance gain to be had by only retrieving just the `hash` or the `size` of the node and I'm also speculating that these options will not be missed.

`withLocal` functionality does not exist in either implementation.

There is no need for a `cidBase` option as the returned stats object contains a `cid` property (a CID instance) instead of a `hash` property (a base 58 encoded string). There's no need for IPFS to assume that you want to display the CID of the content added and for that matter what base encoding you'd want to display it in.

## `write`

### Create by default

Similar to Node.js `fs.createWriteStream` or `fs.writeFile`, 99.9% of the time we want to create the file if it doesn't exist, why make this difficult?

### CID version 1

Changed from 0 to 1. This will soon be the default for all new content added to IPFS anyway.
