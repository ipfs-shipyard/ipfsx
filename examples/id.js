const Os = require('os')
const Path = require('path')
const Ipfs = require('ipfs')
const ipfsx = require('../')

async function main () {
  const node = await ipfsx(new Ipfs({ repo: Path.join(Os.tmpdir(), `${Date.now()}`) }))
  const info = await node.id()
  console.log(info)
  /*
  { id: 'QmTq6pfziFuG2Twi5FnVQwua5mNtSXbEXuExjYy6XZd5Qt',
    publicKey:
     'CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCEgPFgwTrphILHGQo0AErm/F3Awwl6Pxa9TTlkJShEu0swQq6ENTcT34YmiJ/DiC+a+HmbUeisi0B+ebzhW3MnZSXWb5mCQC4yz22MChedWYSieQq0/jFGRezhAZnZ7PYFw0MEEHLaXHDuJRF3NvrddcFxBWBlk0mu9FMv75c/QUN5aqnnZ7fiVpKqO78W5xKXcOyCdxCAb1ul0YZWUp4HjIcn4g+Fw6lQEh/kLjubTB3rKH41dcOPhv41nUKSQIqAaDeakFQfADEz86+mUaW2xTL931mtWWeBLI36KaLNG5uSnGMhqykxqy9/9LzVTEMa8r6U7kMcfRl2m+xCVWlRAgMBAAE=',
    addresses:
     [ '/ip4/127.0.0.1/tcp/4002/ipfs/QmTq6pfziFuG2Twi5FnVQwua5mNtSXbEXuExjYy6XZd5Qt',
       '/ip4/127.0.0.1/tcp/4003/ws/ipfs/QmTq6pfziFuG2Twi5FnVQwua5mNtSXbEXuExjYy6XZd5Qt',
       '/ip4/192.168.0.17/tcp/4002/ipfs/QmTq6pfziFuG2Twi5FnVQwua5mNtSXbEXuExjYy6XZd5Qt' ],
    agentVersion: 'js-ipfs/0.32.2',
    protocolVersion: '9000' }
  */
  await node.stop()
}

main()
