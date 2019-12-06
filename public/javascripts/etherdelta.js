var fs = require('fs');
var solc = require('solc'); //only 0.4.24 version should be used, npm install solc@0.4.24
var utils = require('./utils.js');
var path = require('path');
var logger = require('./logger');
var scs = require('./scs');

var baseaddr = utils.nconf.get("baseaddr");
var privatekey = utils.nconf.get("privatekey");
var vnodeVia = utils.nconf.get("vnodeVia");

var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../contract.json"), 'utf8'));
var subchainaddr = config['microChainAddr'];
var dappAddr = config['dappAddr'];
var ercAddr = utils.nconf.get('ercAddr');

var solpath = path.resolve(__dirname, '../contract') + "/" + "etherdelta.sol";

var contract = fs.readFileSync(solpath, 'utf-8');
var output = solc.compile(contract, 1);


var contractName = 'EtherDelta';
var abi = output.contracts[':' + contractName].interface;
var bin = output.contracts[':' + contractName].bytecode;

// console.log(abi)
// console.log(bin)
// deploy();

registerDapp('0x3861001aa7abb5c01a3a69d50aa26ae42a5bddb1',baseaddr,JSON.stringify(abi));

function deploy(){
    var inNonce = utils.chain3.scs.getNonce(subchainaddr, baseaddr);
    console.log(inNonce)
    var rawTx = {
        from: baseaddr,
        to: subchainaddr,
        nonce: utils.chain3.toHex(inNonce),
        gasLimit: utils.chain3.toHex("0"),
        gasPrice: utils.chain3.toHex("0"),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        via: vnodeVia,
        shardingFlag: "0x3",
        data: '0x' + bin + utils.chain3.encodeParams(['address', 'address', 'address', 'uint', 'uint', 'uint'], [baseaddr,baseaddr,baseaddr, utils.chain3.toSha(1, 'mc'),utils.chain3.toSha(1, 'mc'),utils.chain3.toSha(1, 'mc')])
    };

    var signtx = utils.chain3.signTransaction(rawTx, privatekey);
    var transHash = utils.chain3.mc.sendRawTransaction(signtx);
    logger.info("transHash:", transHash);
    dappAddr = utils.waitBlockForContractInMicroChain(subchainaddr, transHash);
}

function registerDapp(regDappAddr, dappOwner, dappABI) {
    var inNonce = utils.chain3.scs.getNonce(subchainaddr, baseaddr);
    console.log('nonce', inNonce);
    var rawTx = {
        from: baseaddr,
        to: subchainaddr,
        nonce: utils.chain3.toHex(inNonce),
        gasLimit: utils.chain3.toHex("0"),
        gasPrice: utils.chain3.toHex("0"),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        via: vnodeVia,
        shardingFlag: "0x1",
        data: dappAddr + utils.chain3.sha3('registerDapp(address, address, string)').substr(2, 10)
            + utils.chain3.encodeParams(['address', 'address', 'string'], [regDappAddr, dappOwner, dappABI])
    };

    var signtx = utils.chain3.signTransaction(rawTx, privatekey);
    logger.info("curBlock:", utils.chain3.scs.getBlockNumber(subchainaddr));
    var transHash = utils.chain3.mc.sendRawTransaction(signtx);
    logger.info("transHash:", transHash);
    utils.waitBlockForTransactionInMicroChain(subchainaddr, transHash);
}

