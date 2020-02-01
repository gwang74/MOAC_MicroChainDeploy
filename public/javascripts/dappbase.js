var fs = require('fs');
var solc = require('solc');
const Chain3 = require('chain3');
// var utils = require('./utils.js');
var path = require('path');
var logger = require('./logger');
var mcABIs = require('./mcABIs');
var utils = require('./utils')

var baseaddr = utils.nconf.get("baseaddr");
var privatekey = utils.nconf.get("privatekey");
var vnodeVia = utils.nconf.get("vnodeVia");

var chain3 = new Chain3();

var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../contract.json"), 'utf8'));
var subchainaddr = config['microChainAddr'];

//Setup the VNODE provider to send the transaction to
// and the SCS provider to get the results

chain3.setProvider(new chain3.providers.HttpProvider('https://moac12jcc7601.jccdex.cn:8550'));
// chain3.setScsProvider(new chain3.providers.HttpProvider('http://localhost:8547'));

if (!chain3.isConnected()) {
    console.log("Chain3 RPC is not connected!");
    return;
}

// Display MicroChain Info on the SCS server
// console.log("MicroChain ", subchainaddr,",state:", chain3.scs.getDappState(subchainaddr)," blockNumber:", chain3.scs.getBlockNumber(subchainaddr));
// console.log("DAPP list:", chain3.scs.getDappAddrList(subchainaddr), chain3.scs.getNonce(subchainaddr,baseaddr));
// while (true) {
//     let receipt = chain3.scs.getReceiptByHash(subchainaddr, "0xf49ab6f64db9cd64ac14befd5a8c58078699c417e9b20cc10c2c24e6f5e72cfa");
//     console.log(receipt)
//     if (receipt && !receipt.failed) {
//         logger.info("contract has been deployed at " + receipt.contractAddress);
//         return receipt.contractAddress;
//     } else if (receipt && receipt.failed) {
//         logger.info("contract deploy failed!!!");
//         break;
//     }
//     logger.info("block " + chain3.mc.blockNumber + "...");
//     sleep(50000);
// }

var subchainbaseContract = chain3.mc.contract(JSON.parse('[{"constant":true,"inputs":[{"name":"addrs","type":"address[]"},{"name":"addr","type":"address"}],"name":"have","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"pos","type":"uint256"},{"name":"tosend","type":"address[]"},{"name":"amount","type":"uint256[]"},{"name":"times","type":"uint256[]"}],"name":"postFlush","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"dappAddr","type":"address"}],"name":"getDappABI","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dappAddr","type":"address"},{"name":"dappOwner","type":"address"},{"name":"dappABI","type":"string"},{"name":"state","type":"uint256"}],"name":"updateDapp","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newlist","type":"address[]"}],"name":"updateNodeList","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"userAddr","type":"address"},{"name":"pos","type":"uint256"}],"name":"getRedeemMapping","outputs":[{"name":"redeemingAddr","type":"address[]"},{"name":"redeemingAmt","type":"uint256[]"},{"name":"redeemingtime","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getCurNodeList","outputs":[{"name":"nodeList","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"curNodeList","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"userAddr","type":"address"}],"name":"getEnterRecords","outputs":[{"name":"enterAmt","type":"uint256[]"},{"name":"entertime","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dappAddr","type":"address"}],"name":"removeDapp","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getDappList","outputs":[{"components":[{"name":"dappAddr","type":"address"},{"name":"owner","type":"address"},{"name":"dappABI","type":"string"},{"name":"state","type":"uint256"}],"name":"","type":"tuple[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"dappRecord","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"dappAddr","type":"address"}],"name":"getDappState","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"dappList","outputs":[{"name":"dappAddr","type":"address"},{"name":"owner","type":"address"},{"name":"dappABI","type":"string"},{"name":"state","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"redeemFromMicroChain","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"coinName","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"allDeploySwitch","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dappAddr","type":"address"},{"name":"dappOwner","type":"address"},{"name":"dappABI","type":"string"}],"name":"registerDapp","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"enterPos","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_name","type":"string"},{"name":"_switch","type":"bool"}],"payable":true,"stateMutability":"payable","type":"constructor"}]'));
// var res = subchainbaseContract.at('0x04a836585c7c0d548971992f086960a594f925ba').reset({ from: '0x7a2dc129b3d794e4e8a009c83ffd7a2412f5e326' });
// var res = subchainbaseContract.at("0x45c247e896cd1d022000cab13fc04a488e7d0aad").getFlushStatus();
// console.log(res);
// var res = subchainbaseContract.at("0x45c247e896cd1d022000cab13fc04a488e7d0aad").contractNeedFund();
// console.log(res);
// var res = subchainbaseContract.at("0x45c247e896cd1d022000cab13fc04a488e7d0aad").totalOperation();
// console.log(res);
// var res = subchainbaseContract.at("0x45c247e896cd1d022000cab13fc04a488e7d0aad").flushInRound();
// console.log(res);
var res = subchainbaseContract.at("0x45c247e896cd1d022000cab13fc04a488e7d0aad").getMonitorInfo().toString();
// var res = subchainbaseContract.at("0x8d77c846be155d39119c38c7e4d18226d736583d").contractNeedFund();

console.log(res);
// reSet();

// utils.registerOpen('0x226181662dcf24cc7eee0c6d194dc3ee882ce7b0');
// while (true) {
//     let count = subchainbaseContract.at('0x04a836585c7c0d548971992f086960a594f925ba').nodeCount();
//     if (count >= 3) {
//         logger.info("microChain has enough scs " + count);
//         break;
//     }
//     logger.info("Waiting microChain, current scs count=" + count);
//     utils.sleep(10000);
// }

// utils.registerClose("0x226181662dcf24cc7eee0c6d194dc3ee882ce7b0");
// // saveMicroChain();
// logger.info("all Done!!!");

// var scspool = utils.deployscspoolWithAddr();
// console.log(scspool.scsList('0x9abc26cb2657a5134f88de841d55a5d73e796651'));
// for (var i = 0; i < 20; i++) {
//     // console.log(scspool.scsArray(i));
//     var res = subchainbaseContract.at(subchainaddr).nodeList(i);
//     console.log(res)
// }


// utils.registerScsToPool(config['scsPoolAddr'], 1, ['0x61706b16bfa2e57fc07e3161920cfe0b3debbe8c', '0x54309b5a93519795cf08c019b728439482834587']);
// while (true) {
//     let count = subchainbaseContract.at(subchainaddr).nodeCount();
//     if (count >= 3) {
//         logger.info("microChain has enough scs " + count);
//         break;
//     }
//     logger.info("Waiting microChain, current scs count=" + count);
//     utils.sleep(5000);
// }

// utils.addMicroChainFund("0xa593da7377aac9aad1d15658abd465a1f8ff6bc2", 3);

// utils.registerOpen(subchainaddr);
// utils.registerClose(subchainaddr);

// addFund
// utils.addMicroChainFund(subchainaddr, 4);

// addScss();

function addScss() {
    addScs = utils.nconf.get("addScs");
    baseaddr = utils.nconf.get("baseaddr");
    minScsDeposit = utils.nconf.get("minScsDeposit");
    if (addScs.length == 0) {
        logger.info("Need addScs in initConfig .json!!!");
        return;
    }

    for (var i = 0; i < addScs.length; i++) {
        if (utils.checkBalance(addScs[i], minScsDeposit)) {
            logger.info("SCS has enough balance, continue...")
        } else {
            // Add balance
            logger.info("Add funding to SCS!");
            utils.sendtx(baseaddr, addScs[i], minScsDeposit);
            utils.waitBalance(addScs[i], minScsDeposit);
        }
    }

    var scspool = utils.deployscspoolWithAddr();
    var scsCount = utils.chain3.toDecimal(scspool.scsCount());
    logger.info('scspool.scsCount:', scsCount);
    for (var i = 0; i < addScs.length; i++) {
        logger.info("Registering SCS to the pool", scsPool.address);
        let data = scspool.register.getData(addScs[i]);
        logger.info(data)
        utils.sendtx(baseaddr, scspool.address, minScsDeposit, data);
    }

    while (true) {
        let count = utils.chain3.toDecimal(scsPool.scsCount());
        let toCount = Number(scsCount) + Number(addScs.length);
        if (count >= toCount) {
            logger.info("registertopool has enough scs " + count);
            break;
        }
        logger.info("Waiting registertopool, current scs count=" + count);
        utils.sleep(5000);
    }

    var subchainbase = utils.deployMicroChainWithAddr();
    // for (var i = 0; i < addScs.length; i++) {
    scsCount = utils.chain3.toDecimal(scspool.scsCount());
    logger.info('scspool.scsCount:', scsCount);
    data = subchainbase.registerAdd.getData(scsCount);
    console.log(subchainbase.address)
    utils.sendtx(baseaddr, subchainbase.address, 0, data);
    var nodeCount = utils.chain3.toDecimal(subchainbase.nodeCount());
    logger.info('subchainbase.nodeCount():', nodeCount);
    // }
    logger.info("waiting for a flush!!!");
}

// requestRelease();

/**
 * 应用链节点退出
 */
function requestRelease() {
    var wallet = {
        "index": 2,
        "address": "0x69889265c2c498e57a5c6aa4ff8b46e0997a8ee8",
        "privatekey": "9ab91c5c01cec49e5ecb2b347a2e68726e477b48bb38f672613c7ec411c0f97c"
        // "index": 1,
        // "address": "0xd7ccddc1a67e2910b3974144087ceff3ef635fb4",
        // "privatekey": "6c6a6d2ace2995d0b85d9059299b8f5a2f588037e91bbc3fdd83edbe092e6a76"
        // "index": 0,
        // "address": "0x6af3ea1d7e8109c32ac54cc14ccddd2e1faa73e3",
        // "privatekey": "a844f7d61677fddf2b01ff7984952d8cc44da28d9c3dca6f6b1340bee25a7ab1"
    }
    rawTx = {
        to: subchainaddr,
        nonce: utils.chain3.toHex(utils.getNonce(wallet.address)),
        gasLimit: utils.chain3.toHex("2000000"),
        gasPrice: utils.chain3.toHex(utils.chain3.mc.gasPrice),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        data: utils.chain3.sha3('requestReleaseImmediate(uint256,uint256)').substr(0, 10) + utils.chain3.encodeParams(['uint256', 'uint256'], ['1', wallet.index])
    };

    var signtx = utils.chain3.signTransaction(rawTx, wallet.privatekey);
    var transHash = utils.chain3.mc.sendRawTransaction(signtx);
    logger.info("transHash:", transHash);
    utils.waitBlockForTransaction(transHash);
}


// releaseRequest();

function releaseRequest() {

    var wallet = {
        "index": 4,
        "address": "0x87fddfb68a26491d1dadd99a17ab940452281a9f",
        "privatekey": "7a05723d23a4b2964408b1663d618de0a1ed97630a9e811d98091fa5d430ad1a"
        // "index": 3,
        // "address": "0x941992471e8490d80a7621fd58890574738a6add",
        // "privatekey": "616220145cc7dabe38dc75d5b28731350b3d901064621452526d590a83edf3b9"
    }
    rawTx = {
        to: config['scsPoolAddr'],
        nonce: utils.chain3.toHex(utils.getNonce(wallet.address)),
        gasLimit: utils.chain3.toHex("2000000"),
        gasPrice: utils.chain3.toHex(utils.chain3.mc.gasPrice),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        data: utils.chain3.sha3('releaseRequest(address,address)').substr(0, 10) + utils.chain3.encodeParams(['address', 'address'], [wallet.address, subchainaddr])
    };

    var signtx = utils.chain3.signTransaction(rawTx, wallet.privatekey);
    var transHash = utils.chain3.mc.sendRawTransaction(signtx);
    logger.info("transHash:", transHash);
    utils.waitBlockForTransaction(transHash);
}

function reSet() {

    var rawTx = {
        from: baseaddr,
        to: subchainaddr,
        nonce: utils.chain3.toHex(utils.getNonce(baseaddr)),
        gasLimit: utils.chain3.toHex("9000000"),
        gasPrice: utils.chain3.toHex(utils.chain3.mc.gasPrice),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        data: utils.chain3.sha3('reset()').substr(0, 10)
    };

    var signtx = utils.chain3.signTransaction(rawTx, privatekey);
    var transHash = utils.chain3.mc.sendRawTransaction(signtx);
    logger.info("transHash:", transHash);
    utils.waitBlockForTransaction(transHash);
}
