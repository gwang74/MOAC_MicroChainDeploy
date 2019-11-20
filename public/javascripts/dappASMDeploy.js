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

/**
 * dapp deploy
 * 
 * @param {number} totalSupply 
 */
function deployDapp(totalSupply) {
    var contractName = 'DappBase';
    var solpath = path.resolve(__dirname, '../contract') + "/" + "DappBasePrivate.sol";

    var contract = fs.readFileSync(solpath, 'utf-8');
    var output = solc.compile(contract, 1);

    var abi = output.contracts[':' + contractName].interface;
    var bin = output.contracts[':' + contractName].bytecode;

    var inNonce = utils.chain3.scs.getNonce(subchainaddr, baseaddr);
    console.log('nonce', inNonce);
    var rawTx = {
        from: baseaddr,
        to: subchainaddr,
        nonce: utils.chain3.toHex(inNonce),
        gasLimit: utils.chain3.toHex("0"),
        gasPrice: utils.chain3.toHex("0"),
        value: utils.chain3.toHex(utils.chain3.toSha(totalSupply, 'mc')),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        via: vnodeVia,
        shardingFlag: "0x3",
        data: '0x' + bin
    };

    var signtx = utils.chain3.signTransaction(rawTx, privatekey);
    var transHash = utils.chain3.mc.sendRawTransaction(signtx);
    logger.info("transHash:", transHash);
    dappAddr = utils.waitBlockForContractInMicroChain(subchainaddr, transHash);
    logger.info("dappAddr:", dappAddr);
    scs.wirteJson('dappAddr', dappAddr);
}

/**
 * dapp 充值
 * 
 * @param {number} amount 
 */
function buyMintToken(amount) {

    var rawTx = {
        from: baseaddr,
        to: subchainaddr,
        nonce: utils.chain3.toHex(utils.getNonce(baseaddr)),
        gasLimit: utils.chain3.toHex("9000000"),
        gasPrice: utils.chain3.toHex(utils.chain3.mc.gasPrice),
        value: utils.chain3.toHex(utils.chain3.toSha(amount, 'mc')),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        data: utils.chain3.sha3('buyMintToken()').substr(0, 10)
    };

    var signtx = utils.chain3.signTransaction(rawTx, privatekey);
    var transHash = utils.chain3.mc.sendRawTransaction(signtx);
    logger.info("transHash:", transHash);
    utils.waitBlockForTransaction(transHash);
}

/**
 * dapp 提币，需等待一轮flush
 * 
 * @param {number} amount 
 */
function redeemFromMicroChain(amount) {
    var inNonce = utils.chain3.scs.getNonce(subchainaddr, baseaddr);
    console.log('nonce', inNonce);
    var rawTx = {
        from: baseaddr,
        to: subchainaddr,
        nonce: utils.chain3.toHex(inNonce),
        gasLimit: utils.chain3.toHex("0"),
        gasPrice: utils.chain3.toHex("0"),
        value: utils.chain3.toHex(utils.chain3.toSha(amount, 'mc')),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        via: vnodeVia,
        shardingFlag: "0x1",
        data: dappAddr + utils.chain3.sha3('redeemFromMicroChain()').substr(2, 10)
    };

    var signtx = utils.chain3.signTransaction(rawTx, privatekey);
    var transHash = utils.chain3.mc.sendRawTransaction(signtx);
    logger.info("transHash:", transHash);
}

// deployDapp(1000);
// buyMintToken(2);
redeemFromMicroChain(100);


