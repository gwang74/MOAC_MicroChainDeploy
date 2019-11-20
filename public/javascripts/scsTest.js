var fs = require('fs');
var solc = require('solc');
const Chain3 = require('chain3');
var utils = require('./utils.js');
var path = require('path');
var logger = require('./logger');

var baseaddr = utils.nconf.get("baseaddr");
var privatekey = utils.nconf.get("privatekey");
var vnodeVia = utils.nconf.get("vnodeVia");

var chain3 = new Chain3();

var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../contract.json"), 'utf8'));
var subchainaddr = config['microChainAddr'];

//Setup the VNODE provider to send the transaction to
// and the SCS provider to get the results

chain3.setProvider(new chain3.providers.HttpProvider('http://localhost:8545'));
chain3.setScsProvider(new chain3.providers.HttpProvider('http://localhost:2345'));

if (!chain3.isConnected()){
    console.log("Chain3 RPC is not connected!");
    return;
}

// Display MicroChain Info on the SCS server
console.log("MicroChain ", subchainaddr,",state:", chain3.scs.getDappState(subchainaddr)," blockNumber:", chain3.scs.getBlockNumber(subchainaddr));
console.log("DAPP list:", chain3.scs.getDappAddrList(subchainaddr), chain3.scs.getNonce(subchainaddr,baseaddr));
