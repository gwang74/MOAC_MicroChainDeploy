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
chain3.setScsProvider(new chain3.providers.HttpProvider('http://localhost:8547'));

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

abi = '[{"constant":true,"inputs":[],"name":"maxMember","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"maxFlushInRound","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"blockReward","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"per_upload_redeemdata_num","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"index","type":"uint256"}],"name":"removeSyncNode","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"indexInlist","type":"uint256"},{"name":"hashlist","type":"bytes32[]"},{"name":"blocknum","type":"uint256[]"},{"name":"distAmount","type":"uint256[]"},{"name":"badactors","type":"uint256[]"},{"name":"viaNodeAddress","type":"address"},{"name":"preRedeemNum","type":"uint256"}],"name":"createProposal","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"BALANCE","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"nodeList","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMonitorInfo","outputs":[{"name":"","type":"address[]"},{"name":"","type":"string[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"nodeToReleaseCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"scsBeneficiary","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"minMember","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"funcCode","outputs":[{"name":"","type":"bytes"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"senderType","type":"uint256"},{"name":"index","type":"uint256"}],"name":"requestReleaseImmediate","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"senderType","type":"uint256"},{"name":"index","type":"uint256"}],"name":"requestRelease","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"consensusFlag","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"index","type":"uint256"}],"name":"BackupUpToDate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"proposals","outputs":[{"name":"proposedBy","type":"address"},{"name":"lastApproved","type":"bytes32"},{"name":"hash","type":"bytes32"},{"name":"start","type":"uint256"},{"name":"end","type":"uint256"},{"name":"flag","type":"uint256"},{"name":"startingBlock","type":"uint256"},{"name":"votecount","type":"uint256"},{"name":"viaNodeAddress","type":"address"},{"name":"preRedeemNum","type":"uint256"},{"name":"distributeFlag","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"num","type":"uint256"}],"name":"updatePerUploadRedeemNum","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"nodesToDispel","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getVnodeInfo","outputs":[{"components":[{"name":"protocol","type":"address"},{"name":"members","type":"uint256[]"},{"name":"rewards","type":"uint256[]"},{"name":"proposalExpiration","type":"uint256"},{"name":"VnodeProtocolBaseAddr","type":"address"},{"name":"penaltyBond","type":"uint256"},{"name":"subchainstatus","type":"uint256"},{"name":"owner","type":"address"},{"name":"BALANCE","type":"uint256"},{"name":"redeems","type":"uint256[]"},{"name":"nodeList","type":"address[]"},{"name":"nodesToJoin","type":"address[]"}],"name":"","type":"tuple"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"setOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"close","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"monitors","outputs":[{"name":"from","type":"address"},{"name":"bond","type":"uint256"},{"name":"link","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"txReward","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"monitor","type":"address"},{"name":"link","type":"string"}],"name":"registerAsMonitor","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"scs","type":"address"}],"name":"getSCSRole","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"indexInlist","type":"uint256"},{"name":"hash","type":"bytes32"},{"name":"redeem","type":"bool"}],"name":"voteOnProposal","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"nodesWatching","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"registerOpen","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"max_redeemdata_num","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"rebuildFromLastFlushPoint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"num","type":"uint256"}],"name":"updatePerRedeemNum","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"registerClose","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"currentRefundGas","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"buyMintToken","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"num","type":"uint256"}],"name":"updateRechargeCycle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"nodeCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"id","type":"address"},{"name":"link","type":"string"}],"name":"addSyncNode","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"per_recharge_num","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"AUTO_RETIRE","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"penaltyBond","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getholdingPool","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"protocol","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MONITOR_JOIN_FEE","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"beneficiary","type":"address"},{"name":"v","type":"uint8"},{"name":"r","type":"bytes32"},{"name":"s","type":"bytes32"}],"name":"registerAsSCS","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"beneficiary","type":"address"},{"name":"v","type":"uint8"},{"name":"r","type":"bytes32"},{"name":"s","type":"bytes32"}],"name":"registerAsBackup","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalBond","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"recharge_cycle","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"addFund","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"per_redeemdata_num","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"contractNeedFund","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"nodesToJoin","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"nodePerformance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"num","type":"uint256"}],"name":"updatePerRechargeNum","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getFlushStatus","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"viaReward","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"userAddr","type":"address"},{"name":"holdingPoolPos","type":"uint256"}],"name":"getEnteringAmount","outputs":[{"name":"enteringAddr","type":"address[]"},{"name":"enteringAmt","type":"uint256[]"},{"name":"enteringtime","type":"uint256[]"},{"name":"rechargeParam","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalExchange","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"userAddr","type":"address"}],"name":"getRedeemRecords","outputs":[{"components":[{"name":"redeemAmount","type":"uint256[]"},{"name":"redeemtime","type":"uint256[]"}],"name":"","type":"tuple"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"},{"name":"index1","type":"uint8"},{"name":"index2","type":"uint8"}],"name":"matchSelTarget","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"priceOneGInMOAC","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"nodeToAdd","type":"uint256"}],"name":"registerAdd","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"MAX_DELETE_NUM","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"syncNodes","outputs":[{"name":"nodeId","type":"address"},{"name":"link","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getFlushInfo","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getEstFlushBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"syncReward","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"hash","type":"bytes32"}],"name":"checkProposalStatus","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"types","type":"uint256"}],"name":"getProposal","outputs":[{"components":[{"name":"proposedBy","type":"address"},{"name":"lastApproved","type":"bytes32"},{"name":"hash","type":"bytes32"},{"name":"start","type":"uint256"},{"name":"end","type":"uint256"},{"name":"distributionAmount","type":"uint256[]"},{"name":"flag","type":"uint256"},{"name":"startingBlock","type":"uint256"},{"name":"voters","type":"uint256[]"},{"name":"votecount","type":"uint256"},{"name":"badActors","type":"uint256[]"},{"name":"viaNodeAddress","type":"address"},{"name":"preRedeemNum","type":"uint256"},{"name":"redeemAddr","type":"address[]"},{"name":"redeemAmt","type":"uint256[]"},{"name":"minerAddr","type":"address[]"},{"name":"distributeFlag","type":"uint256"},{"name":"redeemAgreeList","type":"address[]"}],"name":"","type":"tuple"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"proposalHashInProgress","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"hash","type":"bytes32"}],"name":"requestEnterAndRedeemAction","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"nodesToRelease","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"randIndex","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"indexInlist","type":"uint256"},{"name":"hash","type":"bytes32"}],"name":"requestProposalAction","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"isMemberValid","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"joinCntNow","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"AUTO_RETIRE_COUNT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"initialFlushInRound","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"selTarget","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"reset","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"proposalHashApprovedLast","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"NODE_INIT_PERFORMANCE","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"VnodeProtocolBaseAddr","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"redeemAddr","type":"address[]"},{"name":"redeemAmt","type":"uint256[]"}],"name":"UploadRedeemData","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"monitor","type":"address"}],"name":"removeMonitorInfo","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"MAX_GAS_PRICE","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"joinCntMax","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"dappRedeemPos","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"proposalExpiration","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"DEFLATOR_VALUE","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MONITOR_MIN_FEE","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"recv","type":"address"},{"name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"txNumInFlush","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalOperation","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"flushInRound","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"proto","type":"address"},{"name":"vnodeProtocolBaseAddr","type":"address"},{"name":"min","type":"uint256"},{"name":"max","type":"uint256"},{"name":"thousandth","type":"uint256"},{"name":"flushRound","type":"uint256"},{"name":"tokensupply","type":"uint256"},{"name":"exchangerate","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"message","type":"string"}],"name":"ReportStatus","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"TransferAmount","type":"event"}]'

var subchainbaseContract = utils.chain3.mc.contract(JSON.parse(abi));
// var res = subchainbaseContract.at(subchainaddr).reset({ from: '0x7a2dc129b3d794e4e8a009c83ffd7a2412f5e326' });
var res = subchainbaseContract.at("0x04a836585c7c0d548971992f086960a594f925ba").BALANCE();
console.log(res);

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

// utils.addMicroChainFund("0x04a836585c7c0d548971992f086960a594f925ba", 2);

// utils.registerOpen(subchainaddr);
// utils.registerClose(subchainaddr);

// addFund
// utils.addMicroChainFund(subchainaddr, 1);

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
