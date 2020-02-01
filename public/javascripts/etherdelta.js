var fs = require('fs');
var utils = require('./utils.js');
var path = require('path');
var logger = require('./logger');
var mcABIs = require('./mcABIs');

var baseaddr = utils.nconf.get("baseaddr");
var privatekey = utils.nconf.get("privatekey");
var vnodeVia = utils.nconf.get("vnodeVia");

var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../contract.json"), 'utf8'));
var subchainaddr = config['microChainAddr'];
var baseDappAddr = config['dappAddr'];

var tokenTaker = {
    address: baseaddr,
    privatekey: privatekey
    // address: '0x67d97d7a1491e3e4d87821d4a86eb51b0ac0ffda',
    // privatekey: 'bed8f35a130544c89685ae16adcaece6501e13d46a291e56f958e3627d53a043'
}

// var tokenGiver = {
//     address: '0x67d97d7a1491e3e4d87821d4a86eb51b0ac0ffda',
//     privatekey: 'bed8f35a130544c89685ae16adcaece6501e13d46a291e56f958e3627d53a043'
// }

var tokenGiver = {
    address: '0x6b4fb976c0a79c2ab5498a1a61e5c25892e74087',
    privatekey: '3a595dafbb1e7008f06b339e2109e8120acae97fe6661c2c19cf0fcf544e14dc'
}

var dappAddr = '0x4628c5c585b5efd3d8a98ad4eae2fda046755e33';
var token1 = '0xc83c5a2a9a9f70c5702db89a969e46099d5707b4';
var token2 = '0xa142fbabdee47e4c029c3fc352ef4ac02699704f';

var dappAbi = [{ "constant": false, "inputs": [{ "name": "tokenGet", "type": "address" }, { "name": "amountGet", "type": "uint256" }, { "name": "tokenGive", "type": "address" }, { "name": "amountGive", "type": "uint256" }, { "name": "expires", "type": "uint256" }, { "name": "nonce", "type": "uint256" }, { "name": "user", "type": "address" }, { "name": "v", "type": "uint8" }, { "name": "r", "type": "bytes32" }, { "name": "s", "type": "bytes32" }, { "name": "amount", "type": "uint256" }], "name": "trade", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "tokenGet", "type": "address" }, { "name": "amountGet", "type": "uint256" }, { "name": "tokenGive", "type": "address" }, { "name": "amountGive", "type": "uint256" }, { "name": "expires", "type": "uint256" }, { "name": "nonce", "type": "uint256" }], "name": "order", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "bytes32" }], "name": "orderFills", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "tokenGet", "type": "address" }, { "name": "amountGet", "type": "uint256" }, { "name": "tokenGive", "type": "address" }, { "name": "amountGive", "type": "uint256" }, { "name": "expires", "type": "uint256" }, { "name": "nonce", "type": "uint256" }, { "name": "v", "type": "uint8" }, { "name": "r", "type": "bytes32" }, { "name": "s", "type": "bytes32" }], "name": "cancelOrder", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "tokenGet", "type": "address" }, { "name": "amountGet", "type": "uint256" }, { "name": "tokenGive", "type": "address" }, { "name": "amountGive", "type": "uint256" }, { "name": "expires", "type": "uint256" }, { "name": "nonce", "type": "uint256" }, { "name": "user", "type": "address" }], "name": "amountFilled", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "token", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "depositToken", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "tokens", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "feeMake_", "type": "uint256" }], "name": "changeFeeMake", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "feeMake", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "feeRebate_", "type": "uint256" }], "name": "changeFeeRebate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "feeAccount", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "tokenGet", "type": "address" }, { "name": "amountGet", "type": "uint256" }, { "name": "tokenGive", "type": "address" }, { "name": "amountGive", "type": "uint256" }, { "name": "expires", "type": "uint256" }, { "name": "nonce", "type": "uint256" }, { "name": "user", "type": "address" }, { "name": "v", "type": "uint8" }, { "name": "r", "type": "bytes32" }, { "name": "s", "type": "bytes32" }, { "name": "amount", "type": "uint256" }, { "name": "sender", "type": "address" }], "name": "testTrade", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "feeAccount_", "type": "address" }], "name": "changeFeeAccount", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "feeRebate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "feeTake_", "type": "uint256" }], "name": "changeFeeTake", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "admin_", "type": "address" }], "name": "changeAdmin", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "token", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "withdrawToken", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "bytes32" }], "name": "orders", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "feeTake", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "deposit", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [{ "name": "accountLevelsAddr_", "type": "address" }], "name": "changeAccountLevelsAddr", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "accountLevelsAddr", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "token", "type": "address" }, { "name": "user", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "admin", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "tokenGet", "type": "address" }, { "name": "amountGet", "type": "uint256" }, { "name": "tokenGive", "type": "address" }, { "name": "amountGive", "type": "uint256" }, { "name": "expires", "type": "uint256" }, { "name": "nonce", "type": "uint256" }, { "name": "user", "type": "address" }, { "name": "v", "type": "uint8" }, { "name": "r", "type": "bytes32" }, { "name": "s", "type": "bytes32" }], "name": "availableVolume", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [{ "name": "admin_", "type": "address" }, { "name": "feeAccount_", "type": "address" }, { "name": "accountLevelsAddr_", "type": "address" }, { "name": "feeMake_", "type": "uint256" }, { "name": "feeTake_", "type": "uint256" }, { "name": "feeRebate_", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "payable": false, "stateMutability": "nonpayable", "type": "fallback" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "tokenGet", "type": "address" }, { "indexed": false, "name": "amountGet", "type": "uint256" }, { "indexed": false, "name": "tokenGive", "type": "address" }, { "indexed": false, "name": "amountGive", "type": "uint256" }, { "indexed": false, "name": "expires", "type": "uint256" }, { "indexed": false, "name": "nonce", "type": "uint256" }, { "indexed": false, "name": "user", "type": "address" }], "name": "Order", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "tokenGet", "type": "address" }, { "indexed": false, "name": "amountGet", "type": "uint256" }, { "indexed": false, "name": "tokenGive", "type": "address" }, { "indexed": false, "name": "amountGive", "type": "uint256" }, { "indexed": false, "name": "expires", "type": "uint256" }, { "indexed": false, "name": "nonce", "type": "uint256" }, { "indexed": false, "name": "user", "type": "address" }, { "indexed": false, "name": "v", "type": "uint8" }, { "indexed": false, "name": "r", "type": "bytes32" }, { "indexed": false, "name": "s", "type": "bytes32" }], "name": "Cancel", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "tokenGet", "type": "address" }, { "indexed": false, "name": "amountGet", "type": "uint256" }, { "indexed": false, "name": "tokenGive", "type": "address" }, { "indexed": false, "name": "amountGive", "type": "uint256" }, { "indexed": false, "name": "get", "type": "address" }, { "indexed": false, "name": "give", "type": "address" }], "name": "Trade", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "token", "type": "address" }, { "indexed": false, "name": "user", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "balance", "type": "uint256" }], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "token", "type": "address" }, { "indexed": false, "name": "user", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "balance", "type": "uint256" }], "name": "Withdraw", "type": "event" }]

var mcObject = utils.chain3.microchain(mcABIs.asmABI);
mcObject.setVnodeAddress(vnodeVia);
var tokenContract = mcObject.getDapp(subchainaddr, dappAbi, dappAddr);

console.log(balanceOf(token1, '0x7a2dc129b3d794e4e8a009c83ffd7a2412f5e326'));
dappInfo();
// changeAccountLevelsAddr('0x457ab76fb81a4c4bcb2793f5c7d2879ef67c5d4d');
// changeFeeAccount('0x67d97d7a1491e3e4d87821d4a86eb51b0ac0ffda');
// changeFeeMake(0.0011);
// changeFeeTake(0.0009);
// changeFeeRebate(0.0006);
// deposit(tokenTaker, 10);
// withdraw(tokenTaker, 2);
// depositToken(tokenTaker, token1, 89.999999999);
// withdrawToken(tokenTaker, token1, 90);
// depositToken(tokenGiver, token2, 1000);
// withdrawToken(tokenGiver, token2, 20);
// console.log(balanceOf(token1, baseaddr));
// order(tokenTaker, token2, 66, token1, 660, 1000);
trade(tokenGiver, token1, 7, token2, 11, '0x67d97d7a1491e3e4d87821d4a86eb51b0ac0ffda', 2);
// console.log(amountFilled(token2, 1, token1, 23, '0x67d97d7a1491e3e4d87821d4a86eb51b0ac0ffda'));
// cancelOrder(tokenTaker, token2, 66, token1, 66);
// console.log(availableVolume(token2, 1, token1, 23, '0x67d97d7a1491e3e4d87821d4a86eb51b0ac0ffda'));
return

/**
 * 获取合约当前设定信息
 */
function dappInfo() {
    console.log('admin', tokenContract.admin());
    console.log('feeAccount', tokenContract.feeAccount());
    console.log('accountLevelsAddr', tokenContract.accountLevelsAddr());
    console.log('feeMake', utils.chain3.fromSha(tokenContract.feeMake()));
    console.log('feeTake', utils.chain3.fromSha(tokenContract.feeTake()));
    console.log('feeRebate', utils.chain3.fromSha(tokenContract.feeRebate()));
}

/**
 * 修改合约管理员
 * 
 * @param {address} admin_ 
 */
function changeAdmin(admin_) {

}

/**
 * 修改账户等级控制合约地址
 * 
 * @param {address} accountLevelsAddr_ 
 */
function changeAccountLevelsAddr(accountLevelsAddr_) {
    console.log('AccountLevelsAddr');
    console.log('before change', tokenContract.accountLevelsAddr());
    var data = dappAddr + utils.chain3.sha3('changeAccountLevelsAddr(address)').substr(2, 8)
        + utils.chain3.encodeParams(['address'], [accountLevelsAddr_]);
    callMethod(baseaddr, privatekey, 0, data);
    console.log('after change', tokenContract.accountLevelsAddr());

}

/**
 * 修改手续费缴纳账户
 * 
 * @param {address} feeAccount_ 
 */
function changeFeeAccount(feeAccount_) {
    console.log('feeAccount');
    console.log('before change', tokenContract.feeAccount());
    if (utils.chain3.isAddress(feeAccount_)) {
        var data = dappAddr + utils.chain3.sha3('changeFeeAccount(address)').substr(2, 8)
            + utils.chain3.encodeParams(['address'], [feeAccount_]);
        callMethod(baseaddr, privatekey, 0, data);
        console.log('after change', tokenContract.feeAccount());
        return
    }
    console.log(feeAccount + ' is a invalid address!');

}

/**
 * 修改成交方手续费,需不高于当前值
 * 
 * @param {number} feeMake_ 
 */
function changeFeeMake(feeMake_) {
    console.log('feeMake');
    var before = utils.chain3.fromSha(tokenContract.feeMake());
    console.log('before change', before);
    if (feeMake_ < before) {
        var data = dappAddr + utils.chain3.sha3('changeFeeMake(uint256)').substr(2, 8)
            + utils.chain3.encodeParams(['address'], [utils.chain3.toSha(feeMake_, 'mc')]);
        callMethod(baseaddr, privatekey, 0, data);
        console.log('after change', utils.chain3.fromSha(tokenContract.feeMake()));
    }

}

/**
 * 修改被成交方手续费，需不高于当前值且不小于当前回扣值（feeRebate）
 * 
 * @param {number} feeTake_ 
 */
function changeFeeTake(feeTake_) {

    console.log('feeTake')
    var beforeFeeTake = utils.chain3.fromSha(tokenContract.feeTake());
    var beforeFeeRebate = utils.chain3.fromSha(tokenContract.feeRebate());
    console.log('before change', beforeFeeTake);
    if (feeTake_ < beforeFeeTake && feeTake_ > beforeFeeRebate) {
        var data = dappAddr + utils.chain3.sha3('changeFeeTake(uint256)').substr(2, 8)
            + utils.chain3.encodeParams(['address'], [utils.chain3.toSha(feeTake_, 'mc')]);
        callMethod(baseaddr, privatekey, 0, data);
        console.log('after change', utils.chain3.fromSha(tokenContract.feeTake()));
    }

}

/**
 * 修改回扣值，需不小于当前值且不高于被成交方手续费（feeTake）
 * 
 * @param {number} feeRebate_ 
 */
function changeFeeRebate(feeRebate_) {

    console.log('feeRebate')
    var beforeFeeTake = utils.chain3.fromSha(tokenContract.feeTake());
    var beforeFeeRebate = utils.chain3.fromSha(tokenContract.feeRebate());
    console.log('before change', beforeFeeRebate);
    if (feeRebate_ > beforeFeeRebate && feeRebate_ < beforeFeeTake) {
        var data = dappAddr + utils.chain3.sha3('changeFeeRebate(uint256)').substr(2, 8)
            + utils.chain3.encodeParams(['address'], [utils.chain3.toSha(feeRebate_, 'mc')]);
        callMethod(baseaddr, privatekey, 0, data);
        console.log('after change', utils.chain3.fromSha(tokenContract.feeRebate()));
    }

}

/**
 * 子链原生币合约充值
 * 
 * @param {object} account
 * @param {number} value 
 */
function deposit(account, value) {
    console.log('balance before deposit', balanceOf(0, account.address));
    var data = dappAddr + utils.chain3.sha3('deposit()').substr(2, 8);
    callMethod(account.address, account.privatekey, value, data);
    console.log('balance after deposit', balanceOf(0, account.address));

}

/**
 * 子链原生币合约提币
 * 
 * @param {object} account
 * @param {number} amount 
 */
function withdraw(account, amount) {
    console.log('balance before withdraw', balanceOf(0, account.address));
    var data = dappAddr + utils.chain3.sha3('withdraw(uint256)').substr(2, 8)
        + utils.chain3.encodeParams(['uint256'], [utils.chain3.toSha(amount, 'mc')]);
    callMethod(account.address, account.privatekey, 0, data);
    console.log('balance after withdraw', balanceOf(0, baseaddr));

}

/**
 * 子链token合约充值
 * 
 * @param {object} account
 * @param {address} token 
 * @param {number} amount 
 */
function depositToken(account, token, amount) {
    // approve etherdelta
    approve(account.address, dappAddr, account.privatekey, token, amount)

    // depositToken
    console.log('balance before depositToken', balanceOf(token, account.address));
    var data = dappAddr + utils.chain3.sha3('depositToken(address,uint256)').substr(2, 8)
        + utils.chain3.encodeParams(['address', 'uint256'], [token, utils.chain3.toSha(amount, 'mc')]);
    callMethod(account.address, account.privatekey, 0, data);
    console.log('balance after depositToken', balanceOf(token, account.address));

}

/**
 * 子链token合约提现
 * 
 * @param {object} account
 * @param {address} token 
 * @param {number} amount 
 */
function withdrawToken(account, token, amount) {
    console.log('balance before withdrawToken', balanceOf(token, account.address));
    var data = dappAddr + utils.chain3.sha3('withdrawToken(address,uint256)').substr(2, 8)
        + utils.chain3.encodeParams(['address', 'uint256'], [token, utils.chain3.toSha(amount, 'mc')]);
    callMethod(account.address, account.privatekey, 0, data);
    console.log('balance after withdrawToken', balanceOf(token, account.address));

}

/**
 * 合约余额查询
 * 
 * @param {address} token 0 mean 子链原生币
 * @param {address} user 
 */
function balanceOf(token, user) {
    return utils.chain3.fromSha(tokenContract.balanceOf(token, user))
}

/**
 * 创建挂单
 * 
 * @param {object} account
 * @param {address} tokenGet 
 * @param {number} amountGet 
 * @param {address} tokenGive 
 * @param {number} amountGive 
 * @param {number} expires 
 */
function order(account, tokenGet, amountGet, tokenGive, amountGive, expires) {
    var inNonce = utils.chain3.scs.getNonce(subchainaddr, account.address);
    var blockNum = utils.chain3.scs.getBlockNumber(subchainaddr) + expires;
    console.log(inNonce, blockNum);
    var data = dappAddr + utils.chain3.sha3('order(address,uint256,address,uint256,uint256,uint256)').substr(2, 8)
        + utils.chain3.encodeParams(['address', 'uint256', 'address', 'uint256', 'uint256', 'uint256'],
            [tokenGet, utils.chain3.toSha(amountGet, 'mc'), tokenGive, utils.chain3.toSha(amountGive, 'mc'), blockNum, inNonce]);
    callMethod(account.address, account.privatekey, 0, data);
}

/**
 * 挂单买卖
 * 
 * @param {object} account
 * @param {address} tokenGet 
 * @param {number} amountGet 
 * @param {address} tokenGive 
 * @param {number} amountGive 
 * @param {address} user 
 * @param {number} amount 
 */
function trade(account, tokenGet, amountGet, tokenGive, amountGive, user, amount) {
    var inNonce = 300;
    var blockNum = 134813;

    var _data = utils.chain3.encodeParams(['address', 'address', 'uint256', 'address', 'uint256', 'uint256', 'uint256'],
        [dappAddr, tokenGet, utils.chain3.toSha(amountGet, 'mc'), tokenGive, utils.chain3.toSha(amountGive, 'mc'), blockNum, inNonce]);
    // var VRS = getVRS(_data);
    var VRS = {};
    var data = dappAddr + utils.chain3.sha3('trade(address,uint256,address,uint256,uint256,uint256,address,uint8,bytes32,bytes32,uint256)').substr(2, 8)
        + utils.chain3.encodeParams(['address', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address', 'uint8', 'bytes32', 'bytes32', 'uint256'],
            [tokenGet, utils.chain3.toSha(amountGet, 'mc'), tokenGive, utils.chain3.toSha(amountGive, 'mc'), blockNum, inNonce, user,
                VRS.v_decimal, VRS.r, VRS.s, utils.chain3.toSha(amount, 'mc')]);
    callMethod(account.address, account.privatekey, 0, data);
    console.log(balanceOf(tokenGive, account.address));
    console.log(balanceOf(tokenGive, user));
    console.log(balanceOf(tokenGet, account.address));
    console.log(balanceOf(tokenGet, user));
    console.log(balanceOf(tokenGive, tokenContract.feeAccount()));
    console.log(balanceOf(tokenGet, tokenContract.feeAccount()));
}

// function tradeBalances(tokenGet, amountGet, tokenGive, amountGive, user, amount) {

//     console.log(balanceOf(tokenGive, '0x67d97d7a1491e3e4d87821d4a86eb51b0ac0ffda'));
//     console.log(balanceOf(tokenGive, user));
//     console.log(balanceOf(tokenGet, '0x67d97d7a1491e3e4d87821d4a86eb51b0ac0ffda'));
//     console.log(balanceOf(tokenGet, user));
//     // var data = dappAddr + utils.chain3.sha3('tradeBalances(address,uint256,address,uint256,address,uint256)').substr(2, 8)
//     //     + utils.chain3.encodeParams(['address', 'uint256', 'address', 'uint256', 'address', 'uint256'],
//     //         [tokenGet, utils.chain3.toSha(amountGet, 'mc'), tokenGive, utils.chain3.toSha(amountGive, 'mc'), user, utils.chain3.toSha(amount, 'mc')]);
//     // callMethod(tokenGiver.address, tokenGiver.privatekey, 0, data);
// }


function testTrade(tokenGet, amountGet, tokenGive, amountGive, expires, nonce, user, v, r, s, amount, sender) {

}

/**
 * 交挂余额
 * 
 * @param {address} tokenGet 
 * @param {number} amountGet 
 * @param {address} tokenGive 
 * @param {number} amountGive 
 * @param {address} user 
 */
function availableVolume(tokenGet, amountGet, tokenGive, amountGive, user) {

    var inNonce = 233;
    var blockNum = 85905;

    var _data = utils.chain3.encodeParams(['address', 'address', 'uint256', 'address', 'uint256', 'uint256', 'uint256'],
        [dappAddr, tokenGet, utils.chain3.toSha(amountGet, 'mc'), tokenGive, utils.chain3.toSha(amountGive, 'mc'), blockNum, inNonce]);
    // var VRS = getVRS(_data);
    var VRS = {};
    var res = tokenContract.availableVolume(tokenGet, utils.chain3.toSha(amountGet, 'mc'), tokenGive, utils.chain3.toSha(amountGive, 'mc'), blockNum, inNonce, user,
        '', '', '');
    return utils.chain3.fromSha(res);

}

/**
 * 挂单成交额
 * 
 * @param {address} tokenGet 
 * @param {number} amountGet 
 * @param {address} tokenGive 
 * @param {number} amountGive 
 * @param {address} user  
 */
function amountFilled(tokenGet, amountGet, tokenGive, amountGive, user) {

    var inNonce = 233;
    var blockNum = 85905;

    var res = tokenContract.amountFilled(tokenGet, utils.chain3.toSha(amountGet, 'mc'), tokenGive, utils.chain3.toSha(amountGive, 'mc'), blockNum, inNonce, user);
    return utils.chain3.fromSha(res);

}

/**
 * 取消挂单
 * 
 * @param {object} account 
 * @param {address} tokenGet 
 * @param {number} amountGet 
 * @param {address} tokenGive 
 * @param {number} amountGive 
 */
function cancelOrder(account, tokenGet, amountGet, tokenGive, amountGive) {

    var inNonce = 15;
    var blockNum = 1356;

    var _data = utils.chain3.encodeParams(['address', 'address', 'uint256', 'address', 'uint256', 'uint256', 'uint256'],
        [dappAddr, tokenGet, utils.chain3.toSha(amountGet, 'mc'), tokenGive, utils.chain3.toSha(amountGive, 'mc'), blockNum, inNonce]);
    var VRS = getVRS(_data);
    var data = dappAddr + utils.chain3.sha3('cancelOrder(address,uint256,address,uint256,uint256,uint256,uint8,bytes32,bytes32)').substr(2, 8)
        + utils.chain3.encodeParams(['address', 'uint256', 'address', 'uint256', 'uint256', 'uint256', 'address', 'uint8', 'bytes32', 'bytes32', 'uint256'],
            [tokenGet, utils.chain3.toSha(amountGet, 'mc'), tokenGive, utils.chain3.toSha(amountGive, 'mc'), blockNum, inNonce,
                VRS.v_decimal, VRS.r, VRS.s]);
    callMethod(account.address, account.privatekey, 0, data);

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
