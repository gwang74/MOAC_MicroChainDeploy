var fs = require('fs');
var utils = require('./utils.js');
var path = require('path');
var logger = require('./logger');
var mcABIs = require('./mcABIs');
var Hex = require('crypto-js/enc-hex');


var baseaddr = utils.nconf.get("baseaddr");
var privatekey = utils.nconf.get("privatekey");
var vnodeVia = utils.nconf.get("vnodeVia");

var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../contract.json"), 'utf8'));
var subchainaddr = config['microChainAddr'];
var baseDappAddr = config['dappAddr'];

var tokenGiver = {
    address: '0x67d97d7a1491e3e4d87821d4a86eb51b0ac0ffda',
    privatekey: 'bed8f35a130544c89685ae16adcaece6501e13d46a291e56f958e3627d53a043'
}

var dappAddr = '0x3861001aa7abb5c01a3a69d50aa26ae42a5bddb1';
var token1 = '0x5734fe8c9d345073c2934c1a6126b8824c80cb27';
var token2 = '0x1966aa4b61dcbb1205b001423e9bda98999fd64f';

var dappAbi = [{ "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "accountLevels", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "user", "type": "address" }], "name": "accountLevel", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "user", "type": "address" }, { "name": "level", "type": "uint256" }], "name": "setAccountLevel", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }]
var mcObject = utils.chain3.microchain(mcABIs.asmABI);
mcObject.setVnodeAddress(vnodeVia);
var tokenContract = mcObject.getDapp(subchainaddr, dappAbi, dappAddr);


// dappInfo();
setAccountLevel(tokenGiver.address, 1);
return

/**
 * 获取合约当前设定信息
 */
function dappInfo() {
    console.log('setAccountLevel', tokenContract.accountLevels(tokenGiver.address));
}

function setAccountLevel(address, level) {
    console.log('setAccountLevel');
    console.log('before change', tokenContract.accountLevels(address));
    var data = dappAddr + utils.chain3.sha3('setAccountLevel(address,uint256)').substr(2, 8)
        + utils.chain3.encodeParams(['address', 'uint256'], [address, level]);
    callMethod(baseaddr, privatekey, 0, data);
    console.log('after change', tokenContract.accountLevels(address));
}


/**
 * _data: dappAddr + utils.chain3.sha3('Method(Param1,..)').substr(2, 8)
 * + utils.chain3.encodeParams(['type1',..], [param1,..])
 * 
 * @param {address} _from 
 * @param {string} _privatekey 
 * @param {number} _value 
 * @param {string} _data 
 */
function callMethod(_from, _privatekey, _value, _data) {
    var inNonce = utils.chain3.scs.getNonce(subchainaddr, _from);
    console.log('nonce', inNonce);
    var rawTx = {
        from: _from,
        to: subchainaddr,
        nonce: utils.chain3.toHex(inNonce),
        gasLimit: utils.chain3.toHex("0"),
        gasPrice: utils.chain3.toHex("0"),
        value: utils.chain3.toHex(utils.chain3.toSha(_value, 'mc')),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        via: vnodeVia,
        shardingFlag: "0x1",
        data: _data
    };
    var signtx = utils.chain3.signTransaction(rawTx, _privatekey);
    var transHash = utils.chain3.mc.sendRawTransaction(signtx);
    logger.info("transHash:", transHash);
    utils.waitBlockForTransactionInMicroChain(subchainaddr, transHash);
}

function getVRS(_data) {
    var options = {
        encoding: 'hex'
    }
    var sha3Msg = utils.chain3.sha3(_data, options);
    console.log('sha3Msg', sha3Msg);
    utils.chain3.personal.unlockAccount(baseaddr, '123456', 1000);
    var signtx = utils.chain3.mc.sign(baseaddr, sha3Msg).slice(2);
    console.log('signtx', signtx);
    var r = `0x${signtx.slice(0, 64)}`
    var s = `0x${signtx.slice(64, 128)}`
    var v = `0x${signtx.slice(128, 130)}`
    var v_decimal = utils.chain3.toDecimal(v);
    console.log(v_decimal);
    if (v_decimal != 27 && v_decimal != 28) {
        v_decimal += 27
    }
    console.log(r, s, v_decimal);
    return { v_decimal, r, s }
}


/**
 * 子链token授权
 * 
 * @param {address} _from 
 * @param {address} _to 
 * @param {string} _privatekey 
 * @param {address} _tokenAddr 
 * @param {number} _amount 
 */
function approve(_from, _to, _privatekey, _tokenAddr, _amount) {
    console.log('approve', _tokenAddr);
    var inNonce = utils.chain3.scs.getNonce(subchainaddr, _from);
    console.log('nonce', inNonce);
    var rawTx = {
        from: _from,
        to: subchainaddr,
        nonce: utils.chain3.toHex(inNonce),
        gasLimit: utils.chain3.toHex("0"),
        gasPrice: utils.chain3.toHex("0"),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        via: vnodeVia,
        shardingFlag: "0x1",
        data: _tokenAddr + utils.chain3.sha3('approve(address,uint256)').substr(2, 8) +
            utils.chain3.encodeParams(['address', 'uint256'], [_to, utils.chain3.toSha(_amount, 'mc')])
    };
    var signtx = utils.chain3.signTransaction(rawTx, _privatekey);
    var transHash = utils.chain3.mc.sendRawTransaction(signtx);
    logger.info("transHash:", transHash);
    utils.waitBlockForTransactionInMicroChain(subchainaddr, transHash);
}

return
