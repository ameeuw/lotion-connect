let startLightClientFromGenesis = require('./lib/connect-by-address-from-genesis.js')
let GetState = require('./lib/get-state.js')
let SendTx = require('./lib/send-tx.js')
let Proxmise = require('proxmise')
let { parse, stringify } = require('deterministic-json')
var EventEmitter = require('events');

function connect(GCI, opts = {}) {
  return new Promise(async (resolve, reject) => {
    let nodes = opts.nodes || []
    let genesis = opts.genesis

    let nodeAddress
    if (nodes.length) {
      // randomly sample from supplied seed nodes
      let randomIndex = Math.floor(Math.random() * nodes.length)
      nodeAddress = nodes[randomIndex]
    }

    let lc = await startLightClientFromGenesis(genesis, nodeAddress)
    let bus = new EventEmitter()
    lc.on('error', e => bus.emit('error', e))
    let getState = GetState(lc)
    let sendTx = SendTx(lc)
    await delay()
    resolve({
      getState,
      bus,
      send: sendTx,
      state: Proxmise(async path => {
        return await getState(path.join('.'))
      })
    })
  })
}

function delay(ms = 1000) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms)
  })
}

module.exports = connect
