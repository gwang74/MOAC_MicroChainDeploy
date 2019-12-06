var fs = require('fs');
var utils = require('./utils.js');
var path = require('path');
var logger = require('./logger');
var mcABIs = require('./mcABIs')


var baseaddr = utils.nconf.get("baseaddr");
var privatekey = utils.nconf.get("privatekey");
var vnodeVia = utils.nconf.get("vnodeVia");

var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../contract.json"), 'utf8'));
var subchainaddr = config['microChainAddr'];
var dappAddr = config['dappAddr'];

var tokenAddr = '0x5e47a776a39492c045183b32ad26b44963892eb3'

var dappAbi = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_subtractedValue", "type": "uint256" }], "name": "decreaseApproval", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_addedValue", "type": "uint256" }], "name": "increaseApproval", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [{ "name": "_name", "type": "string" }, { "name": "_symbol", "type": "string" }, { "name": "_decimals", "type": "uint8" }, { "name": "_supply", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "_owner", "type": "address" }, { "indexed": false, "name": "_spender", "type": "address" }, { "indexed": false, "name": "_vaule", "type": "uint256" }], "name": "Approval", "type": "event" }]

var mcObject = utils.chain3.microchain(mcABIs.asmABI);
mcObject.setVnodeAddress(vnodeVia);
var tokenContract = mcObject.getDapp('0x04a836585c7c0d548971992f086960a594f925ba', dappAbi, tokenAddr);


function getTokenInfo() {
    console.log(tokenContract.symbol());
    console.log(tokenContract.name());
    console.log(tokenContract.totalSupply());
}

function getBalance(address) {
    console.log(tokenContract.balanceOf(address));
    return
    // console.log(tokenContract.transfer('0x67d97d7a1491e3e4d87821d4a86eb51b0ac0ffda', 100000, { from: baseaddr }));

    // data = tokenAddr + tokenContract.transfer.getData(address, 100000).substring(2);
    // console.log(tokenAddr, tokenContract.transfer.getData(address, 100000).substring(2))

    // var transHash = utils.chain3.mc.sendTransaction({ nonce: inNonce, from: baseaddr, value: 0, to: subchainaddr, gas: 0, shardingFlag: '0x1', data: data, via: vnodeVia });
    // logger.info("transHash:", transHash);
    // utils.waitBlockForTransactionInMicroChain(subchainaddr, transHash);
    // console.log(tokenContract.balanceOf(address));
}


function transfer(to, amount) {
    var logs = [{
        msg: "测试应用链ERC20转账"
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
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        via: vnodeVia, //需测试是否必须，必须
        shardingFlag: "0x1",
        data: tokenAddr + utils.chain3.sha3('transfer(address,uint256)').substr(2, 8) +
            utils.chain3.encodeParams(['address', 'uint256'], [to, utils.chain3.toSha(amount, 'mc')]) + memo
    };
    var signtx = utils.chain3.signTransaction(rawTx, privatekey);
    var transHash = utils.chain3.mc.sendRawTransaction(signtx);
    logger.info("transHash:", transHash);
    utils.waitBlockForTransactionInMicroChain(subchainaddr, transHash);
}

function getMemo(_hash) {
    var transcation = utils.chain3.scs.getTransactionByHash(subchainaddr, _hash);
    logger.info(transcation);

    var input = transcation.input;
    var memo = input.substr(42 + 8 + 64 + 64);
    logger.info(memo);
    var memoStr = Buffer.from(memo, 'hex').toString();
    logger.info(memoStr);
}

// getTokenInfo();

// getBalance('0x7a2dc129b3d794e4e8a009c83ffd7a2412f5e326');

// transfer('0x67d97d7a1491e3e4d87821d4a86eb51b0ac0ffda', 100000);

// getMemo('0x7833f7a259d0599396631eedbbd4084261a309633b6fd7958336f4697cd7f552');
return
