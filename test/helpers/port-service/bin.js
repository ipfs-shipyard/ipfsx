#! /usr/bin/env node

const { createPortServiceServer } = require('./')

createPortServiceServer()
  .then(({ addr }) => console.log(`Port service listening on ${addr}`))
