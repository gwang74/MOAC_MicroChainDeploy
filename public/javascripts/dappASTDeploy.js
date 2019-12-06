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

/**
 * dapp deploy
 * 
 * @param {number} ercTotalSupply 
 * @param {number} ercRate 
 */
function deployDapp(ercTotalSupply, ercRate) {
    var contractName = 'DappBase';
    var solpath = path.resolve(__dirname, '../contract') + "/" + "DappBasePrivate.sol";

    var contract = fs.readFileSync(solpath, 'utf-8');
    var output = solc.compile(contract, 1);

    var abi = output.contracts[':' + contractName].interface;
    var bin = output.contracts[':' + contractName].bytecode;

    var _value = ercTotalSupply * ercRate;
    var inNonce = utils.chain3.scs.getNonce(subchainaddr, baseaddr);
    console.log(inNonce)
    var rawTx = {
        from: baseaddr,
        to: subchainaddr,
        nonce: utils.chain3.toHex(inNonce),
        gasLimit: utils.chain3.toHex("0"),
        gasPrice: utils.chain3.toHex("0"),
        value: utils.chain3.toHex(utils.chain3.toSha(_value, 'mc')),
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
 * @param {number} amount （moac数量）
 */
function buyMintToken(amount) {
    var baseaddr = '0x67d97d7a1491e3e4d87821d4a86eb51b0ac0ffda';
    var privatekey = 'bed8f35a130544c89685ae16adcaece6501e13d46a291e56f958e3627d53a043';
    // 授权应用链相应数量的erc token
    logger.info('approve to microChain');
    var rawTx = {
        from: baseaddr,
        to: ercAddr,
        nonce: utils.chain3.toHex(utils.getNonce(baseaddr)),
        gasLimit: utils.chain3.toHex("2000000"),
        gasPrice: utils.chain3.toHex(utils.chain3.mc.gasPrice),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        data: utils.chain3.sha3('approve(address,uint256)').substr(0, 10) + utils.chain3.encodeParams(['address', 'uint256'], [subchainaddr, utils.chain3.toSha(amount, 'mc')])
    };

    var signtx = utils.chain3.signTransaction(rawTx, privatekey);
    var transHash = utils.chain3.mc.sendRawTransaction(signtx);
    logger.info("transHash:", transHash);
    utils.waitBlockForTransaction(transHash);

    // 充值
    rawTx = {
        from: baseaddr,
        to: subchainaddr,
        nonce: utils.chain3.toHex(utils.getNonce(baseaddr)),
        gasLimit: utils.chain3.toHex("2000000"),
        gasPrice: utils.chain3.toHex(utils.chain3.mc.gasPrice),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        data: utils.chain3.sha3('buyMintToken(uint256)').substr(0, 10) + utils.chain3.encodeParams(['uint256'], [utils.chain3.toSha(amount, 'mc')])
    };

    var signtx = utils.chain3.signTransaction(rawTx, privatekey);
    var transHash = utils.chain3.mc.sendRawTransaction(signtx);
    logger.info("transHash:", transHash);
    utils.waitBlockForTransaction(transHash);
}

/**
 * dapp 提币,需等待一轮flush
 * 
 * @param {number} amount （原生币数量）
 */
function redeemFromMicroChain(amount) {
    // var baseaddr = '0x67d97d7a1491e3e4d87821d4a86eb51b0ac0ffda';
    // var privatekey = 'bed8f35a130544c89685ae16adcaece6501e13d46a291e56f958e3627d53a043';
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
        data: dappAddr + utils.chain3.sha3('redeemFromMicroChain()').substr(2, 8)
    };

    var signtx = utils.chain3.signTransaction(rawTx, privatekey);
    logger.info("curBlock:", utils.chain3.scs.getBlockNumber(subchainaddr));
    var transHash = utils.chain3.mc.sendRawTransaction(signtx);
    logger.info("transHash:", transHash);
    utils.waitBlockForTransactionInMicroChain(subchainaddr, transHash);
}

/**
 * 原生币转账
 * 
 * @param {address} _to 
 * @param {number} _amount （原生币数量）
 */
function transfer(_to, _amount) {
    var logs = [{
        msg: "原生币转账memo测试"
    }];
    //转换log数据格式
    var str = JSON.stringify(logs);
    logger.info(str);
    let memo = Buffer.from(str).toString('hex');
    logger.info(memo);
    var inNonce = utils.chain3.scs.getNonce(subchainaddr, baseaddr);
    console.log('nonce', inNonce);
    var rawTx = {
        from: baseaddr,
        to: subchainaddr,
        nonce: utils.chain3.toHex(inNonce),
        gasLimit: utils.chain3.toHex("0"),
        gasPrice: utils.chain3.toHex("0"),
        value: utils.chain3.toHex(utils.chain3.toSha(_amount, 'mc')),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        via: vnodeVia, //需测试是否必须，必须
        shardingFlag: "0x2",
        data: _to + memo
    };
    var signtx = utils.chain3.signTransaction(rawTx, privatekey);
    var transHash = utils.chain3.mc.sendRawTransaction(signtx);
    logger.info("transHash:", transHash);
    utils.waitBlockForTransactionInMicroChain(subchainaddr, transHash);
}

/**
 * 解析转账memo
 * 
 * @param {string} _txHash 
 */
function getMemo(_txHash) {
    var transaction = utils.chain3.scs.getTransactionByHash(subchainaddr, _txHash);
    var input = transaction.input;
    var memo = input.substr(42);
    logger.info(memo);
    var memoStr = Buffer.from(memo, 'hex').toString();
    logger.info(memoStr);
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
        value: utils.chain3.toHex("0"),
        shardingFlag: "0x1",
        data: dappAddr + utils.chain3.sha3('registerDapp(address, address, string)').substr(2, 8)
            + utils.chain3.encodeParams(['address', 'address', 'string'], [regDappAddr, dappOwner, dappABI])
    };

    var signtx = utils.chain3.signTransaction(rawTx, privatekey);
    logger.info("curBlock:", utils.chain3.scs.getBlockNumber(subchainaddr));
    var transHash = utils.chain3.mc.sendRawTransaction(signtx);
    logger.info("transHash:", transHash);
    utils.waitBlockForTransactionInMicroChain(subchainaddr, transHash);
}

// deployDapp(123456, 100);

// buyMintToken(50);

// redeemFromMicroChain(10000);

// transfer('0x67d97d7a1491e3e4d87821d4a86eb51b0ac0ffda', 10000);

// getMemo('0xf49ab6f64db9cd64ac14befd5a8c58078699c417e9b20cc10c2c24e6f5e72cfa');

var dappABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_subtractedValue", "type": "uint256" }], "name": "decreaseApproval", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_addedValue", "type": "uint256" }], "name": "increaseApproval", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [{ "name": "_name", "type": "string" }, { "name": "_symbol", "type": "string" }, { "name": "_decimals", "type": "uint8" }, { "name": "_supply", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_owner", "type": "address" }, { "indexed": false, "name": "_spender", "type": "address" }, { "indexed": false, "name": "_vaule", "type": "uint256" }], "name": "Approval", "type": "event" }]
// registerDapp('0x226181662dcf24cc7eee0c6d194dc3ee882ce7b0', baseaddr, JSON.stringify(dappABI));