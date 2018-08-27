let startLightClientFromGenesis = require('./lib/connect-by-address-from-genesis.js')
let GetState = require('./lib/get-state.js')
let SendTx = require('./lib/send-tx.js')
let Proxmise = require('proxmise')
let { parse, stringify } = require('deterministic-json')

function connect(GCI, opts = {}) {
  return new Promise(async (resolve, reject) => {
    let nodes = opts.nodes || []
    let genesis = opts.genesis

    let nodeAddress
    if (nodes.length) {
      // randomly sample from supplied seed nodes
      let randomIndex = Math.floor(Math.random() * nodes.length)
      nodeAddress = nodes[randomIndex]
    } else {
      // gci discovery magic...
      nodeAddress = await getPeerGCI(GCI)
    }

    let lc = await startLightClientFromGenesis(genesis, nodeAddress)
    let getState = GetState(lc)
    let sendTx = SendTx(lc)
    resolve({
      getState,
      send: sendTx,
      state: Proxmise(async path => {
        return await getState(path.join('.'))
      })
    })
  })
}

module.exports = connect
