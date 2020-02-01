var fs = require('fs');
var utils = require('./utils.js');
var path = require('path');
var logger = require('./logger');
var mcABIs = require('./mcABIs')
var SHA256 = require('crypto-js/sha256');
var SHA3 = require('crypto-js/sha3');
var _ = require('underscore');
var Hex = require('crypto-js/enc-hex');

var baseaddr = utils.nconf.get("baseaddr");
var privatekey = utils.nconf.get("privatekey");
var vnodeVia = utils.nconf.get("vnodeVia");

var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../contract.json"), 'utf8'));
var subchainaddr = config['microChainAddr'];
var baseDappAddr = config['dappAddr'];

var dappAddr = '0x1f303ef00208523ac5c6e966fdfa6cff002b8808';
var token1 = '0x5e47a776a39492c045183b32ad26b44963892eb3';
var token2 = '0x856bdffa534d654894deed8e127d31d5eb70182e';

var dappAbi = [{ "constant": true, "inputs": [], "name": "hash", "outputs": [{ "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "tokenGet", "type": "address" }, { "name": "amountGet", "type": "uint256" }, { "name": "tokenGive", "type": "address" }, { "name": "amountGive", "type": "uint256" }, { "name": "expires", "type": "uint256" }, { "name": "nonce", "type": "uint256" }, { "name": "v", "type": "uint8" }, { "name": "r", "type": "bytes32" }, { "name": "s", "type": "bytes32" }], "name": "trade", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "pure", "type": "function" }, { "constant": true, "inputs": [{ "name": "tokenGet", "type": "address" }, { "name": "amountGet", "type": "uint256" }, { "name": "tokenGive", "type": "address" }, { "name": "amountGive", "type": "uint256" }, { "name": "expires", "type": "uint256" }, { "name": "nonce", "type": "uint256" }], "name": "shaMsg", "outputs": [{ "name": "", "type": "bytes" }], "payable": false, "stateMutability": "pure", "type": "function" }, { "constant": true, "inputs": [{ "name": "massage", "type": "string" }], "name": "verify2", "outputs": [{ "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "pure", "type": "function" }, { "constant": true, "inputs": [{ "name": "x", "type": "uint256" }], "name": "toAscii", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "pure", "type": "function" }]
var mcObject = utils.chain3.microchain();
mcObject.setVnodeAddress(vnodeVia);
var tokenContract = mcObject.getDapp(subchainaddr, dappAbi, dappAddr);



test();
return

function test() {
    // console.log('ether', utils.chain3.fromSha(tokenContract.test(utils.chain3.toSha(10), utils.chain3.toSha(0.01))));
    // console.log('10**18', utils.chain3.fromSha(tokenContract.tes1t(utils.chain3.toSha(10), utils.chain3.toSha(0.01))));

    var inNonce = 20;
    var blockNum = 1327;

    var data = '0x' + utils.chain3.encodeParams(['address', 'address', 'uint256', 'address', 'uint256', 'uint256', 'uint256'],
        ['0x1f303ef00208523ac5c6e966fdfa6cff002b8808', token1, utils.chain3.toHex(utils.chain3.toSha(66, 'mc')), token2, utils.chain3.toHex(utils.chain3.toSha(660, 'mc')), blockNum, inNonce]);
    // var data = '0x' + utils.chain3.encodeParams(['string'], ['abc']);

    // console.log('data', data)
    // var hexArgs = _.map(['abc'], _processSoliditySha3Args);
    // console.log(hexArgs);
    // var sha3Msg = utils.chain3.sha3('0x' + hexArgs.join(''));
    // console.log('sha3Msg', sha3Msg);
    var options = {
        encoding: 'hex'
    }
    // var sha3Msg = utils.chain3.sha3(data, options);
    var sha3Msg = utils.chain3.sha3(Hex.parse(data.slice(2)))
    console.log('encodeParams', sha3Msg);
    utils.chain3.personal.unlockAccount(baseaddr, '123456', 1000);
    var signtx = utils.chain3.mc.sign(baseaddr, sha3Msg).slice(2);
    console.log(signtx);
    return
    var r = `0x${signtx.slice(0, 64)}`
    var s = `0x${signtx.slice(64, 128)}`
    var v = `0x${signtx.slice(128, 130)}` // todo 还需进一步校验
    var v_decimal = utils.chain3.toDecimal(v);
    console.log(v_decimal);
    if (v_decimal != 27 && v_decimal != 28) {
        v_decimal += 27
    }
    console.log(r, s, v_decimal);

    console.log('user', tokenContract.trade(token1, utils.chain3.toSha(66), token2, utils.chain3.toSha(660), blockNum, inNonce, v_decimal, r, s));
}


function test1() {
    // console.log('ether', utils.chain3.fromSha(tokenContract.test(utils.chain3.toSha(10), utils.chain3.toSha(0.01))));
    // console.log('10**18', utils.chain3.fromSha(tokenContract.tes1t(utils.chain3.toSha(10), utils.chain3.toSha(0.01))));
    utils.chain3.personal.unlockAccount(baseaddr, '123456', 1000);
    var massage = 'abc';
    var sha3Msg = utils.chain3.sha3(massage);
    var signedData = utils.chain3.mc.sign(baseaddr, sha3Msg).slice(2);


    console.log("sha3Msg: " + sha3Msg);
    console.log("Signed data: " + signedData);

    var r = `0x${signedData.slice(0, 64)}`
    var s = `0x${signedData.slice(64, 128)}`
    var v = `0x${signedData.slice(128, 130)}` // todo 还需进一步校验
    var v_decimal = utils.chain3.toDecimal(v);
    console.log(v_decimal)
    if (v_decimal != 27 && v_decimal != 28) {
        v_decimal += 27
    }
    console.log(r, s, v_decimal);
    console.log('user', tokenContract.verify1(sha3Msg, v_decimal, r, s));
}

function test2() {
    // console.log('ether', utils.chain3.fromSha(tokenContract.test(utils.chain3.toSha(10), utils.chain3.toSha(0.01))));
    // console.log('10**18', utils.chain3.fromSha(tokenContract.tes1t(utils.chain3.toSha(10), utils.chain3.toSha(0.01))));
    utils.chain3.personal.unlockAccount(baseaddr, '123456', 1000);
    var massage = 'abc';
    var sha3Msg = SHA256(massage).toString();
    var signedData = utils.chain3.mc.sign(baseaddr, sha3Msg).slice(2);


    console.log("sha3Msg: " + sha3Msg);
    console.log("Signed data: " + signedData);

    var r = `0x${signedData.slice(0, 64)}`
    var s = `0x${signedData.slice(64, 128)}`
    var v = `0x${signedData.slice(128, 130)}` // todo 还需进一步校验
    var v_decimal = utils.chain3.toDecimal(v);
    console.log(v_decimal)
    if (v_decimal != 27 && v_decimal != 28) {
        v_decimal += 27
    }
    console.log(r, s, v_decimal);
    return
    console.log('user', tokenContract.verify2(massage, v_decimal, r, s));
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

function getSign(_from, _privatekey, _nonce, _data) {
    // var rawTx = {
    //     from: _from,
    //     to: subchainaddr,
    //     nonce: utils.chain3.toHex(_nonce),
    //     gasLimit: utils.chain3.toHex("0"),
    //     gasPrice: utils.chain3.toHex("0"),
    //     chainId: utils.chain3.toHex(utils.chain3.version.network),
    //     via: vnodeVia,
    //     shardingFlag: "0x1",
    //     data: _data
    // };
    utils.chain3.personal.unlockAccount(_from, '123456', 1000);
    console.log(utils.chain3.mc.sign(_from, _data));
    // var signtx = utils.chain3.mc.signTransaction(_data, _privatekey);
    // console.log(utils.chain3.signTransaction(_data, _privatekey));
    // console.log(signtx);

    // return signtx
}

function testsign() {

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
