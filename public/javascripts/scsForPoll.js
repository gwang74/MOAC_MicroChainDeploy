/* Script to prepare three Global contracts for the example MOAC ASM MicroChain 
 * using example binary codes.
 * Require:
 * 1. Valid account with enough moac to deploy the contracts;
 * 2. A running VNODE can connect and send Transaction to, need turn on personal in rpc api;
 --rpcapi "utils.chain3,mc,net,vnode,personal,
 * 3. At least three SCSs, recommended 5;
 * 4. A VNODE used as proxy for the MicroChain, with VNODE settings in the vnodeconfig.json;
 * Steps:
 * 
 * 1. Deploy the VNODE and SCS pool contracts;
 * 2. Create the MicroChain contract using VNODE and SCS pools;
 * 3. Register the VNODE, SCSs, then open MicroChain to get all the SCSs registered.
 *  
 * This script generates a MicroChain with no DAPP deployed.
 * To deploy the Dappbase and additional DAPP contracts on MicroChain
 * please check online documents:
 * https://moacdocs-chn.readthedocs.io/zh_CN/latest/subchain/%E5%AD%90%E9%93%BE%E4%B8%9A%E5%8A%A1%E9%80%BB%E8%BE%91%E7%9A%84%E9%83%A8%E7%BD%B2.html
 * 
 * 
*/

var fs = require('fs');
var solc = require('solc'); //only 0.4.24 version should be used, npm install solc@0.4.24
var utils = require('./utils.js');
var path = require('path');
var logger = require('./logger');
var schedule = require('node-schedule');

//===============Setup the Parameters==========================================
// need to have a valid account to use for contracts deployment
var baseaddr = utils.nconf.get("baseaddr");
var privatekey = utils.nconf.get("privatekey");
var monitorAddr = utils.nconf.get("monitorAddr");
var monitorLink = utils.nconf.get("monitorLink");
var addScs = utils.nconf.get("addScs");

// The VNODE benificial address, should be found in the vnodeconfig.json 
// var vnodeVia = utils.nconf.get("vnodeVia");
// var vnodeConnectUrl = utils.nconf.get("vnodeConnectUrl"); //VNODE connection as parameter to use for VNODE protocols
var minScsRequired = utils.nconf.get("minScsRequired"); // Min number of SCSs in the MicroChain, recommended 3 or more
var rpcLink = utils.nconf.get("rpcLink");

var minVnodeDeposit = utils.nconf.get("minVnodeDeposit"); // number of deposit required for the VNODE proxy to register, unit is mc
var minScsDeposit = utils.nconf.get("minScsDeposit"); // SCS must pay more than this in the register function to get into the SCS pool
var microChainDeposit = utils.nconf.get("microChainDeposit"); // The deposit is required for each SCS to join the MicroChain
var ercAddr = utils.nconf.get('ercAddr');

//===============Check the Blockchain connection===============================
deploy();
function deploy() {
    baseaddr = utils.nconf.get("baseaddr");
    privatekey = utils.nconf.get("privatekey");
    // vnodeVia = utils.nconf.get("vnodeVia");
    // vnodeConnectUrl = utils.nconf.get("vnodeConnectUrl");
    minScsRequired = utils.nconf.get("minScsRequired");
    rpcLink = utils.nconf.get("rpcLink");
    minVnodeDeposit = utils.nconf.get("minVnodeDeposit");
    minScsDeposit = utils.nconf.get("minScsDeposit");
    microChainDeposit = utils.nconf.get("microChainDeposit");
    var scs = utils.nconf.get("scs");
    if (scs.length == 0) {
        logger.info("Need scs in initConfig .json!!!");
        result.send('{"status":"error", "msg":"配置中无子链地址！"}')
        return;
    }

    // clear config.json
    // var contract = { "data": [] };
    // fs.writeFileSync(path.resolve(__dirname, "../../contract.json"), JSON.stringify(contract, null, '\t'), 'utf8');

    // Min balance of the baseaddr needs to be larger than these numbers if all SCSs need to be funded
    // + SCS deposit (10 mc) * SCS number (=5)
    // + VNODE deposit (1 mc) * VNODE number (=1)
    // + MicroChain deposit (10 mc)
    // var needMoac = Number(scs.length * 2 * minScsDeposit) + Number(minVnodeDeposit * 2) + Number(microChainDeposit);
    // if (!utils.checkBalance(baseaddr, needMoac)) {
    //     logger.info("Need more balance in baseaddr," + needMoac + " mc at least!");
    //     result.send('{"status":"error", "msg":"操作账号moac不足！"}')
    //     return;
    // } else {
    //     logger.info("baseaddr has enough balance!");
    // }

    // Unlock the baseaddr for contract deployment
    // utils.unlockAccount(baseaddr, basepsd);

    //===============Step 1. Deploy required Mother Chain contracts=========================
    // If you have all these contracts deployed earlier, you can skip this and go to Step 2.
    // vnode pool
    // scs pool
    vnodePool = deployvnodepool();
    scsPool = deployscspool();

    //===============Step 2. Use the deployed Contracts to start a MicroChain======
    // if (ercAddr) {
    //     microChain = await deployMicroChainwithAST();
    // } else {
    //     microChain = await deployMicroChainwithASM();
    // }

    //===============Step 3. Use the deployed Contracts to start a MicroChain======
    // if (utils.checkBalance(microChain.address, microChainDeposit)) {
    //     logger.info("continue...");
    // } else {
    //     // Add balance to microChainAddr for MicroChain running
    //     logger.info("Add funding to microChain!");
    //     logger.info("microChain.address", microChain.address);
    //     utils.addMicroChainFund(microChain.address, microChainDeposit);
    //     utils.waitBalance(microChain.address, microChainDeposit);
    // }

    let vnodelist = [{
        vnodeConnectUrl: '39.99.178.42:50062',
        vnodeVia: '0x181f542d0637e8d5130cf0077ce0c22be47f00f7',
        rpcLink: ''
    }, {
        vnodeConnectUrl: '39.99.190.115:50062',
        vnodeVia: '0xa874269d3be3ccfb6b39bfc387cec8783dee283b',
        rpcLink: ''
    }, {
        vnodeConnectUrl: '39.98.138.169:50062',
        vnodeVia: '0xeffd7b6cdf767f5c087816edb3a20a6226981037',
        rpcLink: ''
    }, {
        vnodeConnectUrl: '39.99.164.232:50062',
        vnodeVia: '0x9c3018103c143e8431f102e626a76516e7a98cf3',
        rpcLink: ''
    }]

    for (var i = 0, length = vnodelist.length; i < length; i++) {
        if (utils.checkBalance(vnodelist[i].vnodeVia, minVnodeDeposit)) {
            logger.info("VNODE has enough balance continue...", minVnodeDeposit)
            // sendtx(baseaddr,vnodecontractaddr,num,data)
        } else {
            // Add balance
            logger.info("Add funding to VNODE!");
            utils.sendtx(baseaddr, vnodelist[i].vnodeVia, minVnodeDeposit);
            utils.waitBalance(vnodelist[i].vnodeVia, minVnodeDeposit);
        }
    }

    // Check to make sure all SCSs have enough balance than the min deposit required by 
    // SCS pool
    for (var i = 0; i < scs.length; i++) {
        let fund = 1;
        logger.info("SCS need fund,", fund)
        if (utils.checkBalance(scs[i], fund)) {
            logger.info("SCS has enough balance, continue...")
        } else {
            // Add balance
            logger.info("Add funding to SCS!");
            utils.sendtx(baseaddr, scs[i], fund);
            utils.waitBalance(scs[i], fund);
        }
    }

    for (let i = 0, length = vnodelist.length; i < length; i++) {
        let vnodeConnectUrl = vnodelist[i].vnodeConnectUrl
        let vnodeVia = vnodelist[i].vnodeVia
        let rpcLink = vnodelist[i].rpcLink
        logger.info(vnodeConnectUrl, vnodeVia, rpcLink);
        utils.vnoderegister(vnodePool, minVnodeDeposit, vnodeConnectUrl, vnodeVia, rpcLink)
    }

    logger.info("Registering SCS to the pool", scsPool.address);
    utils.registerScsToPool(scsPool.address, minScsDeposit, scs);

    // Check if the SCS pool have enough nodes registered
    while (true) {
        let count = scsPool.scsCount();
        if (count >= minScsRequired) {
            logger.info("registertopool has enough scs " + count);
            break;
        }
        logger.info("Waiting registertopool, current scs count=" + count);
        utils.sleep(5000);
    }

    // Check the blocks
    utils.waitForBlocks(10);

    // Open the register for the SCSs to join the MicroChain
    // utils.registerOpen(microChain.address);
    // while (true) {
    //     let count = microChain.nodeCount();
    //     if (count >= minScsRequired) {
    //         logger.info("microChain has enough scs " + count);
    //         break;
    //     }
    //     logger.info("Waiting microChain, current scs count=" + count);
    //     utils.sleep(5000);
    // }
    // utils.waitForBlocks(10);
    // utils.registerClose(microChain.address);
    // saveMicroChain();
    logger.info("all Done!!!");
}

function addMonitor(req, res, next) {
    utils.refreshInitConfig();
    monitorAddr = utils.nconf.get("monitorAddr");
    monitorLink = utils.nconf.get("monitorLink");
    baseaddr = utils.nconf.get("baseaddr");
    var subchainbase = utils.deployMicroChainWithAddr();
    var data = subchainbase.registerAsMonitor.getData(monitorAddr, monitorLink);
    var boo = utils.sendtx(baseaddr, subchainbase.address, 1, data); //todo 需要测试是否需要value，-- 测试发现，必须
    if (boo === false) {
        logger.info("add a monitor scs failed!!!");
        res.send('{"status":"error", "msg":"添加监听子链失败！"}');
    } else {
        logger.info(subchainbase.getMonitorInfo.call());
        logger.info("add a monitor scs successfully!!!");
        res.send('{"status":"success", "msg":"添加监听子链完成！"}');
    }

}

function addScss(req, res, next) {
    utils.refreshInitConfig();
    addScs = utils.nconf.get("addScs");
    baseaddr = utils.nconf.get("baseaddr");
    minScsDeposit = utils.nconf.get("minScsDeposit");
    if (addScs.length == 0) {
        logger.info("Need addScs in initConfig .json!!!");
        res.send('{"status":"error", "msg":"配置中无添加的子链地址！"}')
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
    for (var i = 0; i < addScs.length; i++) {
        scsCount = utils.chain3.toDecimal(scspool.scsCount());
        logger.info('scspool.scsCount:', scsCount);
        data = subchainbase.registerAdd.getData(scsCount);
        utils.sendtx(baseaddr, subchainbase.address, 0, data);
        var nodeCount = utils.chain3.toDecimal(subchainbase.nodeCount());
        logger.info('subchainbase.nodeCount():', nodeCount);
    }
    logger.info("waiting for a flush!!!");
    res.send('{"status":"success","msg":"添加子链成功！"}')
}

async function closeMicroChain(req, res, next) {
    var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../contract.json"), 'utf8'));
    baseaddr = utils.nconf.get("baseaddr");
    let microChainAddr = config['microChainAddr'];
    utils.sendtx(baseaddr, microChainAddr, 0, '0x43d726d6');
    // clear config.json
    var contract = {
        "vnodePoolAddr": "",
        "scsPoolAddr": "",
        "microChainAddr": "",
        "savedHash": config["savedHash"]
    };
    fs.writeFileSync(path.resolve(__dirname, "../../contract.json"), JSON.stringify(contract, null, '\t'), 'utf8');
    logger.info("waiting for a flush!!!");

    let hash = config['savedHash'];
    if (hash) {
        let logs = await getSavedMicroChain(hash);
        for (var i = 0; i < logs.length; i++) {
            let log = logs[i];
            if (log["addr"] === microChainAddr) {
                logs.splice(i, 1);
                break;
            }
        }
        reSaveMicroChain(logs);
    }
    res.send('{"status":"success","msg":"关闭子链成功！"}')
}

function config(req, res, next) {
    let newConfig = req.body;
    var configPath = path.resolve(__dirname, "../../initConfig.json");
    var config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    newConfig["privatekey"] = config["privatekey"];
    newConfig["savedAddr"] = config["savedAddr"];
    newConfig["password"] = config["password"];
    newConfig["ercAddr"] = config["ercAddr"];
    newConfig["scsUri"] = config["scsUri"];
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, '\t'), 'utf8');
    res.send('{ code: 0, msg: "init config success!" }')
}

function getContract(req, res, next) {
    var contractPath = path.resolve(__dirname, "../../contract.json");
    const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    res.send(contract)
}

function getInitConfig(req, res, next) {
    var configPath = path.resolve(__dirname, "../../initConfig.json");
    const initConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    delete initConfig["privatekey"];
    delete initConfig["savedAddr"];
    delete initConfig["password"];
    res.send(initConfig)
}

function verifyPwd(req, res, next) {
    let configPath = path.resolve(__dirname, "../../initConfig.json");
    let initConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    let password = initConfig["password"];
    let verifyPwd = req.body.pwd;
    if (verifyPwd === password) {
        res.send(true)
    } else {
        res.send(false)
    }
}

//===============SCS Functions===============================================
// utils for the program
// Check if the input address has enough balance for the mc amount

function wirteJson(name, value) {
    var contractPath = path.resolve(__dirname, "../../contract.json");
    var config = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    config[name] = value;
    fs.writeFileSync(contractPath, JSON.stringify(config, null, '\t'), 'utf8');
}

// Deploy the VNODE pool contract to allow VNODE join as proxy to the microchain, 
function deployvnodepool() {

    var contractName = 'VnodeProtocolBase';
    var solpath = path.resolve(__dirname, "../contract/") + "/" + contractName + '.sol';

    contract = fs.readFileSync(solpath, 'utf8');

    output = solc.compile(contract, 1);

    abi = output.contracts[':' + contractName].interface;
    bin = output.contracts[':' + contractName].bytecode;


    var vnodeprotocolbaseContract = utils.chain3.mc.contract(JSON.parse(abi));

    // var vnodeprotocolbase = vnodeprotocolbaseContract.new(
    //   minVnodeDeposit,
    //   {
    //     from: baseaddr,
    //     data: '0x' + bin,
    //     gas: '8000000'
    //   }
    // );

    var nonce = utils.getNonce(baseaddr);
    var types = ['uint256'];
    var args = [minVnodeDeposit];
    let parameter = utils.chain3.encodeParams(types, args);
    let rawTx = {
        nonce: utils.chain3.toHex(nonce),
        gasLimit: utils.chain3.toHex("9000000"),
        gasPrice: utils.chain3.toHex(utils.chain3.mc.gasPrice),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        data: '0x' + bin + parameter
    };

    // let signtx = utils.chain3.signTransaction(rawTx, privatekey);
    // var transHash = utils.chain3.mc.sendRawTransaction(signtx);

    // logger.info(`VNODE protocol is being deployed at transaction HASH: ${transHash}`);

    // // Check for the two POO contract deployments
    // var vnodePoolAddr = utils.waitBlockForContract(transHash);
    var vnodePoolAddr = '0x68b21c47a1c2ea6cb8c6d641c17603f929456240';
    // wirteJson("vnodePoolAddr", vnodePoolAddr);
    vnodeprotocolbase = vnodeprotocolbaseContract.at(vnodePoolAddr)
    logger.info("vnodeprotocolbase contract address:", vnodeprotocolbase.address);

    return vnodeprotocolbase;
}

// Deploy the MicroChain protocol pool to allow SCS join the pool to form the MicroChain 
function deployscspool() {

    var protocol = "POR"; //Name of the SCS pool, don't change
    var _protocolType = 0; // type of the MicroChain protocol, don't change

    contractName = 'SubChainProtocolBase';
    solpath = path.resolve(__dirname, "../contract/") + "/" + contractName + '.sol';

    contract = fs.readFileSync(solpath, 'utf8');

    output = solc.compile(contract, 1);

    abi = output.contracts[':' + contractName].interface;
    bin = output.contracts[':' + contractName].bytecode;

    var subchainprotocolbaseContract = utils.chain3.mc.contract(JSON.parse(abi));

    // var subchainprotocolbase = subchainprotocolbaseContract.new(
    //   protocol,
    //   minScsDeposit,
    //   _protocolType,
    //   {
    //     from: baseaddr,
    //     data: '0x' + bin,
    //     gas: '8000000'
    //   }
    // );

    var types = ['string', 'uint256', 'uint256'];
    var args = [protocol, minScsDeposit, _protocolType];
    let parameter = utils.chain3.encodeParams(types, args);
    let rawTx = {
        nonce: utils.chain3.toHex(utils.getNonce(baseaddr)),
        gasLimit: utils.chain3.toHex("9000000"),
        gasPrice: utils.chain3.toHex(utils.chain3.mc.gasPrice),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        data: '0x' + bin + parameter
    };

    // let signtx = utils.chain3.signTransaction(rawTx, privatekey);
    // var transHash = utils.chain3.mc.sendRawTransaction(signtx);

    // logger.info("SCS protocol is being deployed at transaction HASH: " + transHash);

    // var scsPoolAddr = utils.waitBlockForContract(transHash);
    // wirteJson("scsPoolAddr", scsPoolAddr);
    var scsPoolAddr = '0xfc9a941dde1b9783f01e093206165e5f1c96b71e';

    subchainprotocolbase = subchainprotocolbaseContract.at(scsPoolAddr);
    logger.info("subchainprotocolbase contract address:", subchainprotocolbase.address);
    logger.info("Please use the mined contract addresses in deploying the MicroChain contract!!!")

    return subchainprotocolbase;
}

// Deploy the MicroChain contract to form a MicroChain with Atomic Swap of Token (ASM) function
async function deployMicroChainwithASM() {

    var min = minScsRequired; //Min SCSs required in the MicroChain, only 1,3,5,7 should be used`
    var max = 11; //Max SCSs needed in the MicroChain, Only 11, 21, 31, 51, 99
    var thousandth = 1000; //Fixed, do not need change
    var flushRound = 40; //Number of MotherChain rounds, must between 40 and 500

    // these address should be pass from Step 1. If you use previously deployed contract, then input the address here.
    // var scsPoolAddr = vnodePool.address;
    // var vnodePoolAddr = scsPool.address;

    var tokensupply = 10000000000; // MicroChain token amount, used to exchange for native token
    var exchangerate = 100; // the exchange rate bewteen moac and MicroChain token.

    var contractName = 'SubChainBase';

    // Need to read both contract files to compile
    // var input = {
    //     '': fs.readFileSync(path.resolve(__dirname, "../contract/") + "/" + 'ChainBaseASM.sol', 'utf8'),
    //     'SubChainProtocolBase.sol': fs.readFileSync(path.resolve(__dirname, "../contract/") + "/" + 'SubChainProtocolBase.sol', 'utf8')
    // };

    // var output = solc.compile({ sources: input }, 1);

    // abi = output.contracts[':' + contractName].interface;
    // bin = output.contracts[':' + contractName].bytecode;

    abi = [{ "constant": true, "inputs": [], "name": "maxMember", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "maxFlushInRound", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "blockReward", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "per_upload_redeemdata_num", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "index", "type": "uint256" }], "name": "removeSyncNode", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "indexInlist", "type": "uint256" }, { "name": "hashlist", "type": "bytes32[]" }, { "name": "blocknum", "type": "uint256[]" }, { "name": "distAmount", "type": "uint256[]" }, { "name": "badactors", "type": "uint256[]" }, { "name": "viaNodeAddress", "type": "address" }, { "name": "preRedeemNum", "type": "uint256" }], "name": "createProposal", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "BALANCE", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "uint256" }], "name": "nodeList", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getMonitorInfo", "outputs": [{ "name": "", "type": "address[]" }, { "name": "", "type": "string[]" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "nodeToReleaseCount", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "scsBeneficiary", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "minMember", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "funcCode", "outputs": [{ "name": "", "type": "bytes" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "senderType", "type": "uint256" }, { "name": "index", "type": "uint256" }], "name": "requestReleaseImmediate", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "senderType", "type": "uint256" }, { "name": "index", "type": "uint256" }], "name": "requestRelease", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "consensusFlag", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "index", "type": "uint256" }], "name": "BackupUpToDate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "bytes32" }], "name": "proposals", "outputs": [{ "name": "proposedBy", "type": "address" }, { "name": "lastApproved", "type": "bytes32" }, { "name": "hash", "type": "bytes32" }, { "name": "start", "type": "uint256" }, { "name": "end", "type": "uint256" }, { "name": "flag", "type": "uint256" }, { "name": "startingBlock", "type": "uint256" }, { "name": "votecount", "type": "uint256" }, { "name": "viaNodeAddress", "type": "address" }, { "name": "preRedeemNum", "type": "uint256" }, { "name": "distributeFlag", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "num", "type": "uint256" }], "name": "updatePerUploadRedeemNum", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "uint256" }], "name": "nodesToDispel", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getVnodeInfo", "outputs": [{ "components": [{ "name": "protocol", "type": "address" }, { "name": "members", "type": "uint256[]" }, { "name": "rewards", "type": "uint256[]" }, { "name": "proposalExpiration", "type": "uint256" }, { "name": "VnodeProtocolBaseAddr", "type": "address" }, { "name": "penaltyBond", "type": "uint256" }, { "name": "subchainstatus", "type": "uint256" }, { "name": "owner", "type": "address" }, { "name": "BALANCE", "type": "uint256" }, { "name": "redeems", "type": "uint256[]" }, { "name": "nodeList", "type": "address[]" }, { "name": "nodesToJoin", "type": "address[]" }], "name": "", "type": "tuple" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "setOwner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "close", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "uint256" }], "name": "monitors", "outputs": [{ "name": "from", "type": "address" }, { "name": "bond", "type": "uint256" }, { "name": "link", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "txReward", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "monitor", "type": "address" }, { "name": "link", "type": "string" }], "name": "registerAsMonitor", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [{ "name": "scs", "type": "address" }], "name": "getSCSRole", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "indexInlist", "type": "uint256" }, { "name": "hash", "type": "bytes32" }, { "name": "redeem", "type": "bool" }], "name": "voteOnProposal", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "nodesWatching", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "registerOpen", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "max_redeemdata_num", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "rebuildFromLastFlushPoint", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "num", "type": "uint256" }], "name": "updatePerRedeemNum", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "registerClose", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "currentRefundGas", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "buyMintToken", "outputs": [{ "name": "", "type": "bool" }], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [{ "name": "num", "type": "uint256" }], "name": "updateRechargeCycle", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "nodeCount", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "id", "type": "address" }, { "name": "link", "type": "string" }], "name": "addSyncNode", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "per_recharge_num", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "AUTO_RETIRE", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "penaltyBond", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getholdingPool", "outputs": [{ "name": "", "type": "address[]" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "protocol", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "MONITOR_JOIN_FEE", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "beneficiary", "type": "address" }, { "name": "v", "type": "uint8" }, { "name": "r", "type": "bytes32" }, { "name": "s", "type": "bytes32" }], "name": "registerAsSCS", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "beneficiary", "type": "address" }, { "name": "v", "type": "uint8" }, { "name": "r", "type": "bytes32" }, { "name": "s", "type": "bytes32" }], "name": "registerAsBackup", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalBond", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "recharge_cycle", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "addFund", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [], "name": "per_redeemdata_num", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "contractNeedFund", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "uint256" }], "name": "nodesToJoin", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "nodePerformance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "num", "type": "uint256" }], "name": "updatePerRechargeNum", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getFlushStatus", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "viaReward", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "userAddr", "type": "address" }, { "name": "holdingPoolPos", "type": "uint256" }], "name": "getEnteringAmount", "outputs": [{ "name": "enteringAddr", "type": "address[]" }, { "name": "enteringAmt", "type": "uint256[]" }, { "name": "enteringtime", "type": "uint256[]" }, { "name": "rechargeParam", "type": "uint256[]" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalExchange", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "userAddr", "type": "address" }], "name": "getRedeemRecords", "outputs": [{ "components": [{ "name": "redeemAmount", "type": "uint256[]" }, { "name": "redeemtime", "type": "uint256[]" }], "name": "", "type": "tuple" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "addr", "type": "address" }, { "name": "index1", "type": "uint8" }, { "name": "index2", "type": "uint8" }], "name": "matchSelTarget", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "priceOneGInMOAC", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "nodeToAdd", "type": "uint256" }], "name": "registerAdd", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_DELETE_NUM", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "uint256" }], "name": "syncNodes", "outputs": [{ "name": "nodeId", "type": "address" }, { "name": "link", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getFlushInfo", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "index", "type": "uint256" }], "name": "getEstFlushBlock", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "syncReward", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "hash", "type": "bytes32" }], "name": "checkProposalStatus", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "types", "type": "uint256" }], "name": "getProposal", "outputs": [{ "components": [{ "name": "proposedBy", "type": "address" }, { "name": "lastApproved", "type": "bytes32" }, { "name": "hash", "type": "bytes32" }, { "name": "start", "type": "uint256" }, { "name": "end", "type": "uint256" }, { "name": "distributionAmount", "type": "uint256[]" }, { "name": "flag", "type": "uint256" }, { "name": "startingBlock", "type": "uint256" }, { "name": "voters", "type": "uint256[]" }, { "name": "votecount", "type": "uint256" }, { "name": "badActors", "type": "uint256[]" }, { "name": "viaNodeAddress", "type": "address" }, { "name": "preRedeemNum", "type": "uint256" }, { "name": "redeemAddr", "type": "address[]" }, { "name": "redeemAmt", "type": "uint256[]" }, { "name": "minerAddr", "type": "address[]" }, { "name": "distributeFlag", "type": "uint256" }, { "name": "redeemAgreeList", "type": "address[]" }], "name": "", "type": "tuple" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "proposalHashInProgress", "outputs": [{ "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "hash", "type": "bytes32" }], "name": "requestEnterAndRedeemAction", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "uint256" }], "name": "nodesToRelease", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "uint256" }], "name": "randIndex", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "indexInlist", "type": "uint256" }, { "name": "hash", "type": "bytes32" }], "name": "requestProposalAction", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "addr", "type": "address" }], "name": "isMemberValid", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "joinCntNow", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "AUTO_RETIRE_COUNT", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "initialFlushInRound", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "selTarget", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "reset", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "proposalHashApprovedLast", "outputs": [{ "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "NODE_INIT_PERFORMANCE", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "VnodeProtocolBaseAddr", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "redeemAddr", "type": "address[]" }, { "name": "redeemAmt", "type": "uint256[]" }], "name": "UploadRedeemData", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "monitor", "type": "address" }], "name": "removeMonitorInfo", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_GAS_PRICE", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "joinCntMax", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "dappRedeemPos", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "proposalExpiration", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "DEFLATOR_VALUE", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "MONITOR_MIN_FEE", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "recv", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "txNumInFlush", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalOperation", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "flushInRound", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [{ "name": "proto", "type": "address" }, { "name": "vnodeProtocolBaseAddr", "type": "address" }, { "name": "min", "type": "uint256" }, { "name": "max", "type": "uint256" }, { "name": "thousandth", "type": "uint256" }, { "name": "flushRound", "type": "uint256" }, { "name": "tokensupply", "type": "uint256" }, { "name": "exchangerate", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "message", "type": "string" }], "name": "ReportStatus", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "addr", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }], "name": "TransferAmount", "type": "event" }]
    bin = "60806040526018601655670de0b6b3a76400006017556601c6bf5263400060195564174876e800601a55662386f26fc10000601b55662386f26fc1000060275564e8d4a51000602c5564174876e800602d556404a817c800602e556050602f55600060315560fa60355560066036556005603a556000603b5560a0603c556082603d556101f4603e556101f4603f556064604055348015620000a057600080fd5b5060405161010080620073cf8339810180604052620000c39190810190620003b2565b60008660011480620000d55750866003145b80620000e15750866005145b80620000ed5750866007145b1515620000f957600080fd5b85600b1480620001095750856015145b8062000115575085601f145b80620001215750856033145b806200012d5750856063145b15156200013957600080fd5b602884101580156200014d57506101f48411155b15156200015957600080fd5b5060058390556006839055602b8054600160a060020a031916600160a060020a03898116919091179091556040517fde42f13c000000000000000000000000000000000000000000000000000000008152899182169063de42f13c90620001c79088908b90600401620004c3565b602060405180830381600087803b158015620001e257600080fd5b505af1158015620001f7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052506200021d919081019062000473565b60038190555080600160a060020a031663365bfb9e6040518163ffffffff167c0100000000000000000000000000000000000000000000000000000000028152600401600060405180830381600087803b1580156200027b57600080fd5b505af115801562000290573d6000803e3d6000fd5b505050600188905550600286905560008054600160a060020a031916600160a060020a038b161781556004908155600e8054600160a060020a03191633179055600580546040517fb8a167e6000000000000000000000000000000000000000000000000000000008152600160a060020a0385169363b8a167e6936200031993029101620004ad565b600060405180830381600087803b1580156200033457600080fd5b505af115801562000349573d6000803e3d6000fd5b5050600019600d555050670de0b6b3a7640000830260315560418290556011805461ffff19166101001790556000602a81905560305550620004f1975050505050505050565b60006200039d8251620004e5565b9392505050565b60006200039d8251620004e2565b600080600080600080600080610100898b031215620003d057600080fd5b6000620003de8b8b6200038f565b9850506020620003f18b828c016200038f565b9750506040620004048b828c01620003a4565b9650506060620004178b828c01620003a4565b95505060806200042a8b828c01620003a4565b94505060a06200043d8b828c01620003a4565b93505060c0620004508b828c01620003a4565b92505060e0620004638b828c01620003a4565b9150509295985092959890939650565b6000602082840312156200048657600080fd5b6000620004948484620003a4565b949350505050565b620004a781620004e2565b82525050565b60208101620004bd82846200049c565b92915050565b60408101620004d382856200049c565b6200039d60208301846200049c565b90565b600160a060020a031690565b616ece80620005016000396000f30060806040526004361061043c5763ffffffff60e060020a60003504166303e3c9ac811461045557806307289245146104805780630ac168a1146104955780630be6075a146104aa578063110afc0f146104bf5780631463ef07146104df57806315e9977e1461050c578063208f2a311461052157806321a1b4951461054e57806326009deb146105715780632ad0f79b146105865780632b114a7c146105a65780632da03719146105bb578063301b4887146105dd57806330be5944146105fd57806330e7f8ef1461061d578063312e014b1461063257806332ed5b12146106525780633a46492a146106895780633b082706146106a95780633c1f16aa146106c957806340caae06146106eb57806343d726d61461070057806344a587811461071557806346d63676146107445780634d13deae1461075957806350859fd91461076c578063517549a01461078c57806357365df2146107ac5780635defc56c146107cc5780635fd652db146107e1578063634eaea6146107f6578063689b00ed1461080b57806369f3576f1461082b5780636b35d367146108405780636bbded70146108605780636d9817eb146108685780636da49b83146108885780636f7e15da1461089d578063793ebd89146108bd5780637a813833146108d257806383d6f697146108e75780638640c8b1146108fc5780638ce744261461091e578063950f78791461093357806399d53d43146109485780639a911393146109685780639b09723e146109885780639eb34e431461099d578063a2f09dfa146109b2578063a53dae59146109ba578063a7fc1161146109cf578063a94f7a70146109e4578063a9555e6c14610a04578063aa7e298614610a24578063ab3c7d8714610a44578063b062a92714610a59578063b19932c014610a6e578063b55845e714610a9e578063b74c3eff14610ab3578063b859889614610ae0578063b8697fe214610b00578063be93f1b314610b15578063bff92d7014610b35578063c063d98714610b4a578063c067247c14610b78578063c20b124614610b8d578063c4474a5914610bad578063c66da99714610bc2578063c7f758a814610be2578063ca3b852f14610c0f578063ca5e56aa14610c24578063cae56d5814610c44578063cbe5b2a414610c64578063cc819ad014610c91578063d0fab88514610cb1578063d12ff2eb14610cd1578063d4f79bd514610ce6578063d736b38214610cfb578063d7c3dc5f14610d10578063d826f88f14610d25578063db22ccad14610d3a578063dc393c0914610d4f578063dc82c54f14610d64578063dcd338ca14610d79578063df4b780d14610d99578063e3bbb4f114610db9578063e5df842514610dce578063e9e150d014610de3578063eba308f814610df8578063f21df01214610e0d578063f2faa2a614610e22578063f3fef3a314610e37578063f9326cf514610e57578063fae67d4014610e6c578063fcac00bc14610e81575b600054600160a060020a0316331461045357600080fd5b005b34801561046157600080fd5b5061046a610e96565b6040516104779190616d5d565b60405180910390f35b34801561048c57600080fd5b5061046a610e9c565b3480156104a157600080fd5b5061046a610ea2565b3480156104b657600080fd5b5061046a610ea8565b3480156104cb57600080fd5b506104536104da3660046164dd565b610eae565b3480156104eb57600080fd5b506104ff6104fa366004616519565b610fb3565b6040516104779190616d4f565b34801561051857600080fd5b5061046a6114f3565b34801561052d57600080fd5b5061054161053c3660046164dd565b6114f9565b6040516104779190616b60565b34801561055a57600080fd5b50610563611521565b604051610477929190616cdd565b34801561057d57600080fd5b5061046a6116ca565b34801561059257600080fd5b506105416105a136600461630a565b6116d0565b3480156105b257600080fd5b5061046a6116eb565b3480156105c757600080fd5b506105d06116f1565b6040516104779190616d6b565b3480156105e957600080fd5b506104ff6105f8366004616615565b61177f565b34801561060957600080fd5b506104ff610618366004616615565b611a30565b34801561062957600080fd5b5061046a611b3c565b34801561063e57600080fd5b5061045361064d3660046164dd565b611b42565b34801561065e57600080fd5b5061067261066d3660046164dd565b611b97565b6040516104779b9a99989796959493929190616b74565b34801561069557600080fd5b506104536106a43660046164dd565b611bfc565b3480156106b557600080fd5b5061046a6106c43660046164dd565b611c18565b3480156106d557600080fd5b506106de611c37565b6040516104779190616d9e565b3480156106f757600080fd5b506104536120c9565b34801561070c57600080fd5b506104536120f0565b34801561072157600080fd5b506107356107303660046164dd565b61219d565b60405161047793929190616c53565b34801561075057600080fd5b5061046a612266565b610453610767366004616330565b61226c565b34801561077857600080fd5b5061046a61078736600461630a565b61245b565b34801561079857600080fd5b506104ff6107a7366004616634565b61260d565b3480156107b857600080fd5b5061046a6107c736600461630a565b612784565b3480156107d857600080fd5b50610453612796565b3480156107ed57600080fd5b5061046a6127ce565b34801561080257600080fd5b506104536127d4565b34801561081757600080fd5b506104536108263660046164dd565b6127f2565b34801561083757600080fd5b506104ff61280e565b34801561084c57600080fd5b5061046a61085b36600461630a565b6129e7565b6104ff6129f9565b34801561087457600080fd5b506104536108833660046164dd565b612b0b565b34801561089457600080fd5b5061046a612b27565b3480156108a957600080fd5b506104536108b8366004616330565b612b2d565b3480156108c957600080fd5b5061046a612bf1565b3480156108de57600080fd5b506104ff612bf7565b3480156108f357600080fd5b5061046a612bfc565b34801561090857600080fd5b50610911612c02565b6040516104779190616ccc565b34801561092a57600080fd5b50610541612c68565b34801561093f57600080fd5b5061046a612c77565b34801561095457600080fd5b506104ff6109633660046163b2565b612c7d565b34801561097457600080fd5b506104ff6109833660046163b2565b612f43565b34801561099457600080fd5b5061046a6132cb565b3480156109a957600080fd5b5061046a6132d1565b6104536132d7565b3480156109c657600080fd5b5061046a6133a3565b3480156109db57600080fd5b5061046a6133a9565b3480156109f057600080fd5b506105416109ff3660046164dd565b6133af565b348015610a1057600080fd5b5061046a610a1f36600461630a565b6133bd565b348015610a3057600080fd5b50610453610a3f3660046164dd565b6133cf565b348015610a5057600080fd5b506104ff6133eb565b348015610a6557600080fd5b5061046a613408565b348015610a7a57600080fd5b50610a8e610a89366004616382565b61340e565b6040516104779493929190616d02565b348015610aaa57600080fd5b5061046a613702565b348015610abf57600080fd5b50610ad3610ace36600461630a565b613708565b6040516104779190616d8d565b348015610aec57600080fd5b506104ff610afb366004616413565b6137e1565b348015610b0c57600080fd5b5061046a61389c565b348015610b2157600080fd5b50610453610b303660046164dd565b6138a2565b348015610b4157600080fd5b5061046a6139aa565b348015610b5657600080fd5b50610b6a610b653660046164dd565b6139b0565b604051610477929190616c18565b348015610b8457600080fd5b5061046a613a73565b348015610b9957600080fd5b5061046a610ba83660046164dd565b613abb565b348015610bb957600080fd5b5061046a613b00565b348015610bce57600080fd5b5061046a610bdd3660046164dd565b613b06565b348015610bee57600080fd5b50610c02610bfd3660046164dd565b613b63565b6040516104779190616d7c565b348015610c1b57600080fd5b5061046a6141ed565b348015610c3057600080fd5b506104ff610c3f3660046164dd565b6141f3565b348015610c5057600080fd5b5061046a610c5f3660046164dd565b614588565b348015610c7057600080fd5b50610c84610c7f3660046164dd565b61459c565b6040516104779190616daf565b348015610c9d57600080fd5b506104ff610cac366004616615565b6145c3565b348015610cbd57600080fd5b506104ff610ccc36600461630a565b614c67565b348015610cdd57600080fd5b5061046a614c83565b348015610cf257600080fd5b5061046a614c89565b348015610d0757600080fd5b5061046a614c8e565b348015610d1c57600080fd5b5061046a614c94565b348015610d3157600080fd5b50610453614c9a565b348015610d4657600080fd5b5061046a614cc9565b348015610d5b57600080fd5b5061046a614ccf565b348015610d7057600080fd5b50610541614cd4565b348015610d8557600080fd5b506104ff610d94366004616460565b614ce3565b348015610da557600080fd5b50610453610db436600461630a565b614f0d565b348015610dc557600080fd5b5061046a6150f7565b348015610dda57600080fd5b5061046a6150fd565b348015610def57600080fd5b5061046a615103565b348015610e0457600080fd5b5061046a615109565b348015610e1957600080fd5b5061046a61510f565b348015610e2e57600080fd5b5061046a615115565b348015610e4357600080fd5b50610453610e52366004616382565b61511b565b348015610e6357600080fd5b5061046a615176565b348015610e7857600080fd5b5061046a61517c565b348015610e8d57600080fd5b5061046a615182565b60025481565b603f5481565b60195481565b603c5481565b600e54600160a060020a031633148015610ec9575060295481105b1515610ed457600080fd5b602980546000198101908110610ee657fe5b9060005260206000209060020201602982815481101515610f0357fe5b60009182526020909120825460029283029091018054600160a060020a031916600160a060020a03909216919091178155600180840180549293610f5893838601936000199082161561010002011604615cfc565b5050602980549091506000198101908110610f6f57fe5b6000918252602082206002909102018054600160a060020a031916815590610f9a6001830182615d7d565b50506029805490610faf906000198301615dc1565b5050565b6000806000805a9250600f548b108015610fee5750601080548c908110610fd657fe5b600091825260209091200154600160a060020a031633145b1515610ff957600080fd5b6110028b613abb565b431015801561101f575060165460020261101b8c613abb565b0143105b151561102a57600080fd5b600f5488511461103957600080fd5b600f5460029004875110151561104e57600080fd5b602e543a111561105d57600080fd5b6043546037541061106d57600080fd5b600160075460009081526013602052604090206006015414156110f85760078054600090815260136020908152604080832060056006909101559254825282822054600160a060020a03168252601290529081205411156110f857600754600090815260136020908152604080832054600160a060020a031683526012909152902080546000190190555b6008548a518b90600090811061110a57fe5b602090810290910101511461112257600093506114e5565b61112b33615188565b151561113a57600093506114e5565b89600181518110151561114957fe5b60209081029091010151915060008083815260136020526040902060060154111561117757600093506114e5565b60008281526013602052604081208054600160a060020a03191633178155600854600182015560020183905589518a919081106111b057fe5b6020908102909101810151600084815260139092526040909120600301558851899060019081106111dd57fe5b602090810290910181015160008481526013909252604082206004015590505b600f548110156112a7576000828152601360205260409020885160059091019089908390811061122957fe5b6020908102909101810151825460018101845560009384528284200155838252601390526040902060108054600f909201918390811061126557fe5b600091825260208083209091015483546001818101865594845291909220018054600160a060020a031916600160a060020a03909216919091179055016111fd565b60016000838152601360205260409020600601556112c48b613abb565b60008381526013602090815260408220600781019390935560088301805460018181018355918452828420018f905560098401805482019055601190930180549384018155825281209091018054600160a060020a0319163317905590505b86518110156113785760008281526013602052604090208751600a9091019088908390811061134e57fe5b60209081029091018101518254600181810185556000948552929093209092019190915501611323565b6000828152601360205260408120600b81018054600160a060020a031916600160a060020a038a16179055600c8101879055601001558415156114375760405160e560020a63010cee25028152600d9063219dc4a0906113df903090600290600401616c38565b602060405180830381600087803b1580156113f957600080fd5b505af115801561140d573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525061143191908101906164bf565b506114b5565b60405160e560020a63010cee25028152600d9063219dc4a090611461903090600b90600401616c38565b602060405180830381600087803b15801561147b57600080fd5b505af115801561148f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052506114b391908101906164bf565b505b6007829055600a8b90553a5a33600090815260146020526040902080549186036153ee0192909202019055600193505b505050979650505050505050565b60315481565b601080548290811061150757fe5b600091825260209091200154600160a060020a0316905081565b6060806000606080600060398054905093508360405190808252806020026020018201604052801561155d578160200160208202803883390190505b5092508360405190808252806020026020018201604052801561159457816020015b606081526020019060019003908161157f5790505b509150600090505b838110156116bf5760398054829081106115b257fe5b60009182526020909120600390910201548351600160a060020a03909116908490839081106115dd57fe5b600160a060020a03909216602092830290910190910152603980548290811061160257fe5b600091825260209182902060026003909202018101805460408051601f60001961010060018616150201909316949094049182018590048502840185019052808352919290919083018282801561169a5780601f1061166f5761010080835404028352916020019161169a565b820191906000526020600020905b81548152906001019060200180831161167d57829003601f168201915b505050505082828151811015156116ad57fe5b6020908102909101015260010161159c565b509094909350915050565b601c5481565b601860205260009081526040902054600160a060020a031681565b60015481565b600b805460408051602060026001851615610100026000190190941693909304601f810184900484028201840190925281815292918301828280156117775780601f1061174c57610100808354040283529160200191611777565b820191906000526020600020905b81548152906001019060200180831161175a57829003601f168201915b505050505081565b600080600084600114156117c657601080543391908690811061179e57fe5b600091825260209091200154600160a060020a0316146117c15760009250611a28565b61182e565b84600214156118255733600160a060020a0316601860006010878154811015156117ec57fe5b6000918252602080832090910154600160a060020a03908116845290830193909352604090910190205416146117c15760009250611a28565b60009250611a28565b601654600f54600554600d540191026002020143116118505760009250611a28565b601080548590811061185e57fe5b6000918252602082200154905460175460405160e060020a63202cc5e1028152600160a060020a039384169550919092169250829163202cc5e1916118a7918691600401616c38565b602060405180830381600087803b1580156118c157600080fd5b505af11580156118d5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052506118f991908101906164bf565b50600f8054600019019081905560108054909190811061191557fe5b60009182526020909120015460108054600160a060020a03909216918690811061193b57fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a031602179055506010600f5481548110151561197a57fe5b60009182526020909120018054600160a060020a031916905560108054906119a6906000198301615ded565b5060405160e560020a63010cee25028152600d9063219dc4a0906119d09030908490600401616c38565b602060405180830381600087803b1580156119ea57600080fd5b505af11580156119fe573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250611a2291908101906164bf565b50600192505b505092915050565b6000808360011415611a75576010805433919085908110611a4d57fe5b600091825260209091200154600160a060020a031614611a705760009150611b35565b611add565b8360021415611ad45733600160a060020a031660186000601086815481101515611a9b57fe5b6000918252602080832090910154600160a060020a0390811684529083019390935260409091019020541614611a705760009150611b35565b60009150611b35565b5060005b601c54811015611b125782601d8260058110611af957fe5b01541415611b0a5760009150611b35565b600101611ae1565b82601d601c54600581101515611b2457fe5b0155601c8054600190810190915591505b5092915050565b60045481565b601554600214611b5157600080fd5b6024805433919083908110611b6257fe5b600091825260209091200154600160a060020a031614611b8157600080fd5b5033600090815260126020526040902060059055565b601360205260009081526040902080546001820154600283015460038401546004850154600686015460078701546009880154600b890154600c8a01546010909a0154600160a060020a03998a169a989997989697959694959394929390911691908b565b600e54600160a060020a03163314611c1357600080fd5b603c55565b6023805482908110611c2657fe5b600091825260209091200154905081565b611c3f615e11565b60008054600160a060020a03198116600160a060020a03909116178155604080516002808252606082810190935282918291816020016020820280388339019050509250600154836000815181101515611c9557fe5b60209081029091010152600254835184906001908110611cb157fe5b60209081029091018101919091528351611cd391600187019190860190615e8e565b50604080516003808252608082019092529060208201606080388339019050509150601954826000815181101515611d0757fe5b60209081029091010152601a54825183906001908110611d2357fe5b60209081029091010152601b54825183906002908110611d3f57fe5b60209081029091018101919091528251611d6191600287019190850190615e8e565b506016546003850155602b5460048086018054600160a060020a03938416600160a060020a03199182161790915560175460058801556030546006880155600e546007880180549190941691161790915560315460088601556040805182815260a081019091529060208201608080388339019050509050603b54816000815181101515611deb57fe5b60209081029091010152603c54815182906001908110611e0757fe5b60209081029091010152603d54815182906002908110611e2357fe5b60209081029091010152603e54815182906003908110611e3f57fe5b60209081029091018101919091528151611e6191600987019190840190615e8e565b5060108054611e7491600a870191615ec9565b5060248054611e8791600b870191615ec9565b5060408051610180810182528554600160a060020a031681526001860180548351602082810282018101909552818152929388938186019390929091830182828015611ef257602002820191906000526020600020905b815481526020019060010190808311611ede575b5050505050815260200160028201805480602002602001604051908101604052809291908181526020018280548015611f4a57602002820191906000526020600020905b815481526020019060010190808311611f36575b505050918352505060038201546020808301919091526004830154600160a060020a039081166040808501919091526005850154606085015260068501546080850152600785015490911660a0840152600884015460c084015260098401805482518185028101850190935280835260e0909401939192909190830182828015611ff357602002820191906000526020600020905b815481526020019060010190808311611fdf575b50505050508152602001600a820180548060200260200160405190810160405280929190818152602001828054801561205557602002820191906000526020600020905b8154600160a060020a03168152600190910190602001808311612037575b50505050508152602001600b82018054806020026020016040519081016040528092919081815260200182805480156120b757602002820191906000526020600020905b8154600160a060020a03168152600190910190602001808311612099575b50505050508152505094505050505090565b600e54600160a060020a031615156120ee57600e8054600160a060020a031916331790555b565b600e54600160a060020a0316331461210757600080fd5b600160305560075415156120ee576005544303600d90815563219dc4a03060085b6040518363ffffffff1660e060020a028152600401612148929190616c38565b602060405180830381600087803b15801561216257600080fd5b505af1158015612176573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525061219a91908101906164bf565b50565b60398054829081106121ab57fe5b6000918252602091829020600391909102018054600180830154600280850180546040805161010096831615969096026000190190911692909204601f8101889004880285018801909252818452600160a060020a039094169650909491929183018282801561225c5780601f106122315761010080835404028352916020019161225c565b820191906000526020600020905b81548152906001019060200180831161223f57829003601f168201915b5050505050905083565b601a5481565b6030541561227957600080fd5b602c5434101561228857600080fd5b600160a060020a038216600090815260286020526040902054156122ab57600080fd5b600160a060020a03821615156122c057600080fd5b6122c98261245b565b600414806122dd57506122db8261245b565b155b15156122e857600080fd5b600160a060020a03828116600081815260286020908152604080832034908190556044805482019055815160608101835294855284830190815290840186815260398054600181018083559190955285517fdc16fef70f8d5ddbc01ee3d903d1e69c18a3c7be080eb86a81e0578814ee58d360039096029586018054600160a060020a0319169190981617875591517fdc16fef70f8d5ddbc01ee3d903d1e69c18a3c7be080eb86a81e0578814ee58d48501555180519195936123d2937fdc16fef70f8d5ddbc01ee3d903d1e69c18a3c7be080eb86a81e0578814ee58d590910192910190615f15565b50600d925063219dc4a0915030905060065b6040518363ffffffff1660e060020a028152600401612404929190616c38565b602060405180830381600087803b15801561241e57600080fd5b505af1158015612432573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525061245691908101906164bf565b505050565b600080805b6010548210156124b25783600160a060020a031660108381548110151561248357fe5b600091825260209091200154600160a060020a031614156124a75760019250612606565b600190910190612460565b600160a060020a038416600090815260286020526040902054633b9aca00116124de5760029250612606565b600091505b6024548210156125355783600160a060020a031660248381548110151561250657fe5b600091825260209091200154600160a060020a0316141561252a5760039250612606565b6001909101906124e3565b5060005460405160e060020a63ce9d9bd7028152600160a060020a0390911690819063ce9d9bd79061256b908790600401616b60565b602060405180830381600087803b15801561258557600080fd5b505af1158015612599573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052506125bd91908101906164bf565b15612601576125f384601160005b60208104919091015460115460ff601f90931661010090810a909204831692919004166137e1565b156126015760049250612606565b600092505b5050919050565b6000806000805a6000878152601360205260409020600f549194509250871080156126595750601080548890811061264157fe5b600091825260209091200154600160a060020a031633145b151561266457600080fd5b602e543a111561267357600080fd5b61267c33615188565b151561268b576000935061277a565b60016006830154146126a0576000935061277a565b4360165460020283600701540110156126bc576000935061277a565b5060005b8160090154811015612700578682600801828154811015156126de57fe5b906000526020600020015414156126f8576000935061277a565b6001016126c0565b841561272e5760118201805460018101825560009182526020909120018054600160a060020a031916331790555b60088201805460018181018355600092835260209092200188905560098301805490910190553a5a33600090815260146020526040902080549186036153ee0192909202019055600193505b5050509392505050565b60286020526000908152604090205481565b603054156127a357600080fd5b600e54600160a060020a031633146127ba57600080fd5b6001601555600d63219dc4a0306000612128565b603e5481565b600e54600160a060020a031633146127eb57600080fd5b6000600955565b600e54600160a060020a0316331461280957600080fd5b603d55565b6000808080806030541461282157600080fd5b600e54600160a060020a0316331461283857600080fd5b6000601555600154600f54101561295757600054600f54600160a060020a03909116935091505b60008211156129495760108054600019840190811061287a57fe5b60009182526020909120015460175460405160e060020a63202cc5e1028152600160a060020a0392831693509185169163202cc5e1916128bf91859190600401616c38565b602060405180830381600087803b1580156128d957600080fd5b505af11580156128ed573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525061291191908101906164bf565b5060108054600019840190811061292457fe5b60009182526020909120018054600160a060020a03191690556000199091019061285f565b6000600f81905593506129e1565b43600d908155600060095560405160e560020a63010cee2502815263219dc4a090612989903090600190600401616c38565b602060405180830381600087803b1580156129a357600080fd5b505af11580156129b7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052506129db91908101906164bf565b50600193505b50505090565b60146020526000908152604090205481565b60415460425460315460009234029190038281831115612a5957604154828403811515612a2257fe5b6040519190049150339082156108fc029083906000818181858888f19350505050158015612a54573d6000803e3d6000fd5b508192505b60428054840190556032805460018181019092557f11df491316f14931039edfd4f8964c9a443b862f02d4c7611d18c2bc4e6ff697018054600160a060020a03191633179055603380548083019091557f82a75bdeeae8604d839476ae9efd8b0e15aa447e21bfd7f41283bb54e22c9a8201849055603480548083018255600091909152427f46bddb1178e94d7f2892ff5f366840eb658911794f2c3a44c450aa2c505186c190910155935050505090565b600e54600160a060020a03163314612b2257600080fd5b603655565b600f5481565b600e54600160a060020a03163314612b4457600080fd5b60408051808201909152600160a060020a0383811682526020808301848152602980546001810180835560009290925285517fcb7c14ce178f56e2e8d86ab33ebc0ae081ba8556a00cd122038841867181caac60029092029182018054600160a060020a031916919096161785559151805191959493612be9937fcb7c14ce178f56e2e8d86ab33ebc0ae081ba8556a00cd122038841867181caad0192910190615f15565b505050505050565b60355481565b600081565b60175481565b60606032600001805480602002602001604051908101604052809291908181526020018280548015612c5d57602002820191906000526020600020905b8154600160a060020a03168152600190910190602001808311612c3f575b505050505090505b90565b600054600160a060020a031681565b60275481565b600080808060305414612c8f57600080fd5b612c983361245b565b600414612ca457600080fd5b601554600114612cb75760009250612f39565b60005460405160e060020a63ce9d9bd7028152600160a060020a039091169250829063ce9d9bd790612ced903390600401616b60565b602060405180830381600087803b158015612d0757600080fd5b505af1158015612d1b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250612d3f91908101906164bf565b1515612d4e5760009250612f39565b612d5b33601160006125cb565b1515612d6a5760009250612f39565b600254600f541115612d7f5760009250612f39565b5060005b600f54811015612dca576010805433919083908110612d9e57fe5b600091825260209091200154600160a060020a03161415612dc25760009250612f39565b600101612d83565b6017546040517f6220fb1d000000000000000000000000000000000000000000000000000000008152600160a060020a03841691636220fb1d91612e189133918b908b908b90600401616c80565b602060405180830381600087803b158015612e3257600080fd5b505af1158015612e46573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250612e6a91908101906164bf565b1515612e795760009250612f39565b6010805460018181019092557f1b6847dc741a1b0cd08d278845f9d819d87b734759afb55fe2de5cb82a9ae672018054600160a060020a03191633908117909155600f8054909201909155600090815260126020526040902060059055600160a060020a0387161515612f0b573360008181526018602052604090208054600160a060020a0319169091179055612f34565b3360009081526018602052604090208054600160a060020a031916600160a060020a0389161790555b600192505b5050949350505050565b600080808060305414612f5557600080fd5b612f5e3361245b565b600414612f6a57600080fd5b601554600214612f7d5760009250612f39565b60005460405160e060020a63ce9d9bd7028152600160a060020a039091169250829063ce9d9bd790612fb3903390600401616b60565b602060405180830381600087803b158015612fcd57600080fd5b505af1158015612fe1573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525061300591908101906164bf565b15156130145760009250612f39565b61302133601160006125cb565b15156130305760009250612f39565b602554602654106130445760009250612f39565b5060005b600f5481101561308f57601080543391908390811061306357fe5b600091825260209091200154600160a060020a031614156130875760009250612f39565b600101613048565b5060005b6024548110156130da5760248054339190839081106130ae57fe5b600091825260209091200154600160a060020a031614156130d25760009250612f39565b600101613093565b6017546040517f6220fb1d000000000000000000000000000000000000000000000000000000008152600160a060020a03841691636220fb1d916131289133918b908b908b90600401616c80565b602060405180830381600087803b15801561314257600080fd5b505af1158015613156573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525061317a91908101906164bf565b15156131895760009250612f39565b6024805460018181019092557f7cd332d19b93bcabe3cce7ca0c18a052f57e5fd03b4758a09f30f5ddc4b22ec4018054600160a060020a0319163390811790915560268054909201909155600090815260126020526040812055600160a060020a0387161515613218573360008181526018602052604090208054600160a060020a0319169091179055613241565b3360009081526018602052604090208054600160a060020a031916600160a060020a0389161790555b60405160e560020a63010cee25028152600d9063219dc4a09061326b903090600790600401616c38565b602060405180830381600087803b15801561328557600080fd5b505af1158015613299573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052506132bd91908101906164bf565b506001979650505050505050565b60445481565b60365481565b600e54600090600160a060020a031633146132f157600080fd5b60438054340190819055603754101561219a57506000603755601654600f54600554600d540191026002020143811161219a5743600d90815560405160e560020a63010cee2502815263219dc4a090613351903090600890600401616c38565b602060405180830381600087803b15801561336b57600080fd5b505af115801561337f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250610faf91908101906164bf565b603d5481565b60375481565b602480548290811061150757fe5b60126020526000908152604090205481565b600e54600160a060020a031633146133e657600080fd5b603555565b601654600f54600554600d540191026002020143811015905b5090565b601b5481565b606080808060008082808080600160a060020a038c1615613483578a95505b60325486101561347e5760328054600160a060020a038e1691908890811061345157fe5b600091825260209091200154600160a060020a03161415613473576001909401935b60019095019461342d565b61348c565b6032548b900394505b846040519080825280602002602001820160405280156134b6578160200160208202803883390190505b509350846040519080825280602002602001820160405280156134e3578160200160208202803883390190505b50925084604051908082528060200260200182016040528015613510578160200160208202803883390190505b506040805160028082526060820183529294509190602083019080388339019050509050600094508a95505b6032548610156136b757600160a060020a038c16156135f85760328054600160a060020a038e1691908890811061356f57fe5b600091825260209091200154600160a060020a031614156135f357603380548790811061359857fe5b906000526020600020015483868151811015156135b157fe5b6020908102909101015260348054879081106135c957fe5b906000526020600020015482868151811015156135e257fe5b602090810290910101526001909401935b6136ac565b603280548790811061360657fe5b6000918252602090912001548451600160a060020a039091169085908790811061362c57fe5b600160a060020a03909216602092830290910190910152603380548790811061365157fe5b9060005260206000200154838681518110151561366a57fe5b60209081029091010152603480548790811061368257fe5b9060005260206000200154828681518110151561369b57fe5b602090810290910101526001909401935b60019095019461353c565b6035548160008151811015156136c957fe5b602090810290910101526036548151829060019081106136e557fe5b6020908102919091010152929b919a509850909650945050505050565b60425481565b613710615f82565b600160a060020a038216600090815260386020908152604091829020825181546060938102820184018552938101848152909391928492849184018282801561377857602002820191906000526020600020905b815481526020019060010190808311613764575b50505050508152602001600182018054806020026020016040519081016040528092919081815260200182805480156137d057602002820191906000526020600020905b8154815260200190600101908083116137bc575b50505050508152505090505b919050565b60008060006137f1868686615243565b91506137fe308686615243565b905060035460ff14156138145760019250613893565b80821061385d576003548183031161382f5760019250613893565b6000600354820310156138545760035461010003818303106138545760019250613893565b60009250613893565b600354828203116138715760019250613893565b6003546101009082011061385457600354610100038282031061385457600192505b50509392505050565b60415481565b600080603054146138b257600080fd5b600e54600160a060020a031633146138c957600080fd5b600254600f5460265401106138dd57600080fd5b5060026015819055600f54602680549254929092030360255560245490556000546040517fe17095a4000000000000000000000000000000000000000000000000000000008152600160a060020a0390911690819063e17095a490613946908590600401616d5d565b602060405180830381600087803b15801561396057600080fd5b505af1158015613974573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525061399891908101906164fb565b600355600d63219dc4a03060056123e4565b603a5481565b60298054829081106139be57fe5b600091825260209182902060029182020180546001808301805460408051601f60001995841615610100029590950190921696909604928301879004870281018701909552818552600160a060020a0390921695509193909190830182828015613a695780601f10613a3e57610100808354040283529160200191613a69565b820191906000526020600020905b815481529060010190602001808311613a4c57829003601f168201915b5050505050905082565b60006001815b600f548211613ab1576016548260020202600554600d540101905043811115613aa6574381039250613ab6565b600190910190613a79565b600092505b505090565b600080600554600d5401905060095483101515613ae45760165460095484030260020201613af6565b601654600954600f5485010302600202015b8091505b50919050565b602d5481565b60165460008281526013602052604081206007015490914360029091029091011015613b365760025b90506137dc565b600f546000838152601360205260409020600901546002021115613b5b576001613b2f565b600092915050565b613b6b615f99565b8160011415613eb3576007546000908152601360209081526040918290208251610240810184528154600160a060020a0316815260018201548184015260028201548185015260038201546060820152600482015460808201526005820180548551818602810186019096528086529194929360a08601939290830182828015613c1457602002820191906000526020600020905b815481526020019060010190808311613c00575b50505050508152602001600682015481526020016007820154815260200160088201805480602002602001604051908101604052809291908181526020018280548015613c8057602002820191906000526020600020905b815481526020019060010190808311613c6c575b5050505050815260200160098201548152602001600a8201805480602002602001604051908101604052809291908181526020018280548015613ce257602002820191906000526020600020905b815481526020019060010190808311613cce575b50505050508152602001600b820160009054906101000a9004600160a060020a0316600160a060020a0316600160a060020a03168152602001600c8201548152602001600d8201805480602002602001604051908101604052809291908181526020018280548015613d7d57602002820191906000526020600020905b8154600160a060020a03168152600190910190602001808311613d5f575b50505050508152602001600e8201805480602002602001604051908101604052809291908181526020018280548015613dd557602002820191906000526020600020905b815481526020019060010190808311613dc1575b50505050508152602001600f8201805480602002602001604051908101604052809291908181526020018280548015613e3757602002820191906000526020600020905b8154600160a060020a03168152600190910190602001808311613e19575b505050505081526020016010820154815260200160118201805480602002602001604051908101604052809291908181526020018280548015613ea357602002820191906000526020600020905b8154600160a060020a03168152600190910190602001808311613e85575b50505050508152505090506137dc565b81600214156137dc576008546000908152601360209081526040918290208251610240810184528154600160a060020a0316815260018201548184015260028201548185015260038201546060820152600482015460808201526005820180548551818602810186019096528086529194929360a08601939290830182828015613c145760200282019190600052602060002090815481526020019060010190808311613c005750505050508152602001600682015481526020016007820154815260200160088201805480602002602001604051908101604052809291908181526020018280548015613c805760200282019190600052602060002090815481526020019060010190808311613c6c575050505050815260200160098201548152602001600a8201805480602002602001604051908101604052809291908181526020018280548015613ce25760200282019190600052602060002090815481526020019060010190808311613cce5750505050508152602001600b820160009054906101000a9004600160a060020a0316600160a060020a0316600160a060020a03168152602001600c8201548152602001600d8201805480602002602001604051908101604052809291908181526020018280548015613d7d57602002820191906000526020600020908154600160a060020a03168152600190910190602001808311613d5f5750505050508152602001600e8201805480602002602001604051908101604052809291908181526020018280548015613dd55760200282019190600052602060002090815481526020019060010190808311613dc15750505050508152602001600f8201805480602002602001604051908101604052809291908181526020018280548015613e3757602002820191906000526020600020908154600160a060020a03168152600190910190602001808311613e1957505050505081526020016010820154815260200160118201805480602002602001604051908101604052809291908181526020018280548015613ea357602002820191906000526020600020908154600160a060020a03168152600190910190602001808311613e855750505050508152505090506137dc565b60075481565b60008060008060008060008060008060005a60008d8152601360205260409020603154919b509950151561422657600080fd5b601089015460011461423757600080fd5b600160068a01541461424857600080fd5b6142518c613b06565b97508715156142635760009a50614579565b60028814156142c057600560068a01558854600160a060020a031660008181526012602052604081205491985010156142b757600160a060020a038716600090815260126020526040902080546000190190555b60009a50614579565b600f5460118a01546001965060029091041080156142e15750600c89015415155b156144195788600c01549350603d548411156142fd57603d5493505b600c890154600d8a01540395508592505b83830186101561440157600d890180548790811061432857fe5b600091825260209091200154600e8a018054600160a060020a039092169350908790811061435257fe5b600091825260209091200154604280548290039055604154909150600160a060020a038316906108fc908381151561438657fe5b049081150290604051600060405180830381858888f193505050501580156143b2573d6000803e3d6000fd5b50600160a060020a03821660009081526038602090815260408220805460018181018355828552838520909101859055908101805480830182559084529190922042910155959095019461430e565b600c890180548590039055603b805485019055600094505b8415614436576144288c6152be565b6144318c6155f7565b6144b4565b60405160e560020a63010cee25028152600d9063219dc4a090614460903090600c90600401616c38565b602060405180830381600087803b15801561447a57600080fd5b505af115801561448e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052506144b291908101906164bf565b505b3a5a60438054918d03613a98019290920290039055336108fc3a5a8d03613a9801029081150290604051600060405180830381858888f19350505050158015614501573d6000803e3d6000fd5b506002603054141561457457600e54604454604154604254600160a060020a03909316926108fc92919081151561453457fe5b0430600160a060020a03163103039081150290604051600060405180830381858888f1935050505015801561456d573d6000803e3d6000fd5b5060006043555b60019a505b50505050505050505050919050565b601d816005811061459557fe5b0154905081565b601181600281106145a957fe5b60209182820401919006915054906101000a900460ff1681565b60008060008060008060008060008060005a60008d8152601360205260409020600f54919b5099508d10801561461a5750601080548e90811061460257fe5b600091825260209091200154600160a060020a031633145b151561462557600080fd5b600160068a01541461463657600080fd5b602e543a111561464557600080fd5b61464e33615188565b151561465d5760009a50614c57565b6007548c1461466f5760009a50614c57565b6146788c613b06565b975087151561468a5760009a50614c57565b60028814156146e757600560068a01558854600160a060020a031660008181526012602052604081205491985010156146de57600160a060020a038716600090815260126020526040902080546000190190555b60009a50614c57565b60008054600160a060020a0316965094505b600a89015485101561476857600a890180548690811061471557fe5b9060005260206000200154935060006012600060108781548110151561473757fe5b6000918252602080832090910154600160a060020a03168352820192909252604001902055600194909401936146f9565b603a5460235410156148d457602354603a54600096500392505b600f548510156148d457821515614798576148d4565b601260006010878154811015156147ab57fe5b6000918252602080832090910154600160a060020a0316835282019290925260400190205415156148c957602380546001810182556000919091527fd57b2b5166478fd4318d2acc6cc2c704584312bdd8781b32d5d06abda57f42300185905560108054600160a060020a038816916364f3ef46918890811061482a57fe5b60009182526020909120015460175460405160e060020a63ffffffff851602815261486292600160a060020a03169190600401616c38565b602060405180830381600087803b15801561487c57600080fd5b505af1158015614890573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052506148b491908101906164bf565b50601754604380549091019055600019909201915b600190940193614782565b600094505b886009015485101561496a57601089600801868154811015156148f857fe5b906000526020600020015481548110151561490f57fe5b6000918252602080832090910154600160a060020a031680835260129091526040909120549092506005111561495f57600160a060020a0382166000908152601260205260409020805460010190555b6001909401936148d9565b614974600061565d565b61497e600161565d565b604080518d81524360208083019190915282516002938381019382900301816000865af11580156149b3573d6000803e3d6000fd5b5050506040513d601f19601f820116820180604052506149d691908101906164fb565b9050600860ff60f860020a600084901a810204166011805460ff19169290910460ff1691909117905560088160011a60f860020a0260f860020a900460ff16811515614a1e57fe5b6011805461ff0019166101009390920460ff169290920217905560155460021415614a4b57614a4b615924565b614a8e565b6002851015614a8e57600f54602a5410614a6a576000602a555b614a776001602a54611a30565b50602a805460019081019091559490940193614a50565b600d8901541515614ab057614aa28c6152be565b614aab8c6155f7565b614b2d565b60405160e560020a63010cee25028152600d9063219dc4a090614ad99030906004908101616c38565b602060405180830381600087803b158015614af357600080fd5b505af1158015614b07573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250614b2b91908101906164bf565b505b85600160a060020a031663365bfb9e6040518163ffffffff1660e060020a028152600401600060405180830381600087803b158015614b6b57600080fd5b505af1158015614b7f573d6000803e3d6000fd5b50505050614b8b615a96565b600160108a01553a5a60438054918d03613a98019290920290039055336108fc3a5a8d03613a9801029081150290604051600060405180830381858888f19350505050158015614bdf573d6000803e3d6000fd5b5060026030541415614c5257600e54604454604154604254600160a060020a03909316926108fc929190811515614c1257fe5b0430600160a060020a03163103039081150290604051600060405180830381858888f19350505050158015614c4b573d6000803e3d6000fd5b5060006043555b60019a505b5050505050505050505092915050565b600160a060020a03166000908152601260205260408120541190565b60265481565b600281565b60065481565b60035481565b600e54600160a060020a03163314614cb157600080fd5b43600d908155603c60055563219dc4a030600a612128565b60085481565b600581565b602b54600160a060020a031681565b600754600090815260136020526040812081805a8354909250600160a060020a03163314614d1057600080fd5b600c830154600d8401548751011115614d2857600080fd5b602e543a1115614d3757600080fd5b5060005b8551811015614dce5782600d018682815181101515614d5657fe5b6020908102919091018101518254600181018455600093845291909220018054600160a060020a031916600160a060020a039092169190911790558451600e840190869083908110614da457fe5b60209081029091018101518254600181810185556000948552929093209092019190915501614d3b565b600c830154600d8401541415614e605760405160e560020a63010cee25028152600d9063219dc4a090614e08903090600290600401616c38565b602060405180830381600087803b158015614e2257600080fd5b505af1158015614e36573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250614e5a91908101906164bf565b50614ede565b60405160e560020a63010cee25028152600d9063219dc4a090614e8a903090600b90600401616c38565b602060405180830381600087803b158015614ea457600080fd5b505af1158015614eb8573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250614edc91908101906164bf565b505b3a5a33600090815260146020526040902080549185036153ee0192909202019055600193505b50505092915050565b603954805b60008211156124565782600160a060020a0316603960018403815481101515614f3757fe5b6000918252602090912060039091020154600160a060020a031614156150eb5782600160a060020a03166108fc603960018503815481101515614f7657fe5b9060005260206000209060030201600101549081150290604051600060405180830381858888f19350505050158015614fb3573d6000803e3d6000fd5b50603980546000198401908110614fc657fe5b600091825260209091206001600390920201015460448054919091039055603980546000198301908110614ff657fe5b906000526020600020906003020160396001840381548110151561501657fe5b6000918252602090912082546003909202018054600160a060020a031916600160a060020a039092169190911781556001808301548183015560028084018054615073938386019390821615610100026000190190911604615cfc565b5090505060396001820381548110151561508957fe5b6000918252602082206003909102018054600160a060020a031916815560018101829055906150bb6002830182615d7d565b505060398054906150d090600019830161603d565b50600160a060020a0383166000908152602860205260408120555b60001990910190614f12565b602e5481565b60255481565b603b5481565b60165481565b602f5481565b602c5481565b600e54600160a060020a0316331461513257600080fd5b604051600160a060020a0383169082156108fc029083906000818181858888f19350505050158015615168573d6000803e3d6000fd5b506043805491909103905550565b60405481565b60435481565b60055481565b60008061519483614c67565b15156151a35760009150613afa565b5060005460405160e060020a63ce9d9bd7028152600160a060020a0390911690819063ce9d9bd7906151d9908690600401616b60565b602060405180830381600087803b1580156151f357600080fd5b505af1158015615207573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525061522b91908101906164bf565b151561523a5760009150613afa565b50600192915050565b60008060008460ff1660270360040260020a86600160a060020a031681151561526857fe5b04601002915060108460ff1660270360040260020a87600160a060020a031681151561529057fe5b0460100260ff168115156152a057fe5b04905080820160f860020a0260f860020a9004925050509392505050565b6000818152601360205260408120601b54909190818080805b600f87015484101561534b57600f87018054859081106152f357fe5b6000918252602080832090910154600160a060020a03168083526014909152604090912054600589018054929850960195908590811061532f57fe5b90600052602060002001548501945083806001019450506152d7565b6043548511156153625760378054860190556155ed565b600b870154601b54604051600160a060020a039092169181156108fc0291906000818181858888f193505050501580156153a0573d6000803e3d6000fd5b50601b54604380548290039055600b8801546040517fde99e00421493d0d0c5935ad4b7c0809921e0890edda089a7bd0d16ddaa95ba7926153ea92600160a060020a031691616c38565b60405180910390a1600093505b600f87015484101561558357600f870180548590811061541357fe5b6000918252602080832090910154600160a060020a03168083526014909152604080832080549084905590519198509350879184156108fc02918591818181858888f1935050505015801561546c573d6000803e3d6000fd5b506043805483900390556040517fde99e00421493d0d0c5935ad4b7c0809921e0890edda089a7bd0d16ddaa95ba7906154a89088908590616c38565b60405180910390a1600587018054859081106154c057fe5b6000918252602080832090910154600160a060020a03808a168452601890925260408084205490519195509091169184156108fc02918591818181858888f19350505050158015615515573d6000803e3d6000fd5b50604380548390039055600160a060020a0380871660009081526018602052604090819020549051948401947fde99e00421493d0d0c5935ad4b7c0809921e0890edda089a7bd0d16ddaa95ba7926155709216908590616c38565b60405180910390a16001909301926153f7565b601a5487600301548860040154036001016019540284038115156155a357fe5b049050604054811115156155d1576005805460280190819055603f5410156155cc57603f546005555b6155ed565b60055460029004600581905560065411156155ed576006546005555b5050505050505050565b600081815260136020526040902060026010820155600360068201556000600755600882905543600d55600a546001016009819055600f54101561563b5760006009555b6001603054141561564e5761564e615adc565b600d63219dc4a03060096123e4565b60008054602354600160a060020a03909116916060908080600187141561568457601c5494505b8415156156905761591b565b600f546040519080825280602002602001820160405280156156bc578160200160208202803883390190505b509350600092508291505b8482101561580b5786151561570e576001846023848154811015156156e857fe5b90600052602060002001548151811015156156ff57fe5b60209081029091010152615800565b601d826005811061571b57fe5b01549250838381518110151561572d57fe5b9060200190602002015160001415615800576001848481518110151561574f57fe5b60209081029091010152601080548490811061576757fe5b60009182526020909120015460175460405160e060020a63202cc5e1028152600160a060020a0392831693509188169163202cc5e1916157ac91859190600401616c38565b602060405180830381600087803b1580156157c657600080fd5b505af11580156157da573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052506157fe91908101906164bf565b505b6001909101906156c7565b600f5491505b60008211156158fb57836001830381518110151561582b57fe5b90602001906020020151600114156158ef57600f8054600019019081905560108054909190811061585857fe5b60009182526020909120015460108054600160a060020a0390921691600019850190811061588257fe5b9060005260206000200160006101000a815481600160a060020a030219169083600160a060020a031602179055506010600f548154811015156158c157fe5b60009182526020909120018054600160a060020a031916905560108054906158ed906000198301615ded565b505b60001990910190615811565b86151561591557600061590f602382615ded565b5061591b565b6000601c555b50505050505050565b6026545b6000811115615a7b5760056012600060246001850381548110151561594957fe5b6000918252602080832090910154600160a060020a031683528201929092526040019020541415615a7257601060246001830381548110151561598857fe5b600091825260208083209091015483546001818101865594845291909220018054600160a060020a031916600160a060020a03909216919091179055600f805490910190556024805460001981019081106159df57fe5b60009182526020909120015460248054600160a060020a03909216916000198401908110615a0957fe5b60009182526020909120018054600160a060020a031916600160a060020a0392909216919091179055602480546000198101908110615a4457fe5b60009182526020909120018054600160a060020a03191690556024805490615a70906000198301615ded565b505b60001901615928565b6024546026819055151561219a576000602581905560155550565b602f5460198054620f4240818402819004909103909155601a805480840283900490039055601b805480840283900490039055602d5490910204602d5403602d81905550565b6002603055600060158190558054600f54600160a060020a03909116915b6000821115615be457601080546000198401908110615b1557fe5b60009182526020909120015460175460405160e060020a63202cc5e1028152600160a060020a0392831693509185169163202cc5e191615b5a91859190600401616c38565b602060405180830381600087803b158015615b7457600080fd5b505af1158015615b88573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250615bac91908101906164bf565b50601080546000198401908110615bbf57fe5b60009182526020909120018054600160a060020a031916905560001990910190615afa565b6000600f5560265491505b6000821115615ced57602480546000198401908110615c0a57fe5b60009182526020909120015460175460405160e060020a63202cc5e1028152600160a060020a0392831693509185169163202cc5e191615c4f91859190600401616c38565b602060405180830381600087803b158015615c6957600080fd5b505af1158015615c7d573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250615ca191908101906164bf565b50602480546000198401908110615cb457fe5b60009182526020909120018054600160a060020a03191690556024805490615ce0906000198301615ded565b5060001990910190615bef565b50506000602681905560255550565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10615d355780548555615d71565b82800160010185558215615d7157600052602060002091601f016020900482015b82811115615d71578254825591600101919060010190615d56565b50613404929150616069565b50805460018160011615610100020316600290046000825580601f10615da3575061219a565b601f01602090049060005260206000209081019061219a9190616069565b815481835581811115612456576002028160020283600052602060002091820191016124569190616083565b81548183558181111561245657600083815260209020612456918101908301616069565b610180604051908101604052806000600160a060020a031681526020016060815260200160608152602001600081526020016000600160a060020a0316815260200160008152602001600081526020016000600160a060020a03168152602001600081526020016060815260200160608152602001606081525090565b828054828255906000526020600020908101928215615d71579160200282015b82811115615d71578251825591602001919060010190615eae565b828054828255906000526020600020908101928215615f095760005260206000209182015b82811115615f09578254825591600101919060010190615eee565b506134049291506160b7565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10615f5657805160ff1916838001178555615d71565b82800160010185558215615d715791820182811115615d71578251825591602001919060010190615eae565b604080518082019091526060808252602082015290565b610240604051908101604052806000600160a060020a03168152602001600080191681526020016000801916815260200160008152602001600081526020016060815260200160008152602001600081526020016060815260200160008152602001606081526020016000600160a060020a031681526020016000815260200160608152602001606081526020016060815260200160008152602001606081525090565b8154818355818111156124565760030281600302836000526020600020918201910161245691906160db565b612c6591905b80821115613404576000815560010161606f565b612c6591905b80821115613404578054600160a060020a031916815560006160ae6001830182615d7d565b50600201616089565b612c6591905b80821115613404578054600160a060020a03191681556001016160bd565b612c6591905b80821115613404578054600160a060020a031916815560006001820181905561610d6002830182615d7d565b506003016160e1565b60006161228235616e37565b9392505050565b6000601f8201831361613a57600080fd5b813561614d61614882616de4565b616dbd565b9150818183526020840193506020810190508385602084028201111561617257600080fd5b60005b8381101561619e57816161888882616116565b8452506020928301929190910190600101616175565b5050505092915050565b6000601f820183136161b957600080fd5b81356161c761614882616de4565b915081818352602084019350602081019050838560208402820111156161ec57600080fd5b60005b8381101561619e578161620288826162a0565b84525060209283019291909101906001016161ef565b6000601f8201831361622957600080fd5b813561623761614882616de4565b9150818183526020840193506020810190508385602084028201111561625c57600080fd5b60005b8381101561619e578161627288826162a0565b845250602092830192919091019060010161625f565b60006161228235616e43565b60006161228251616e43565b60006161228235612c65565b60006161228251612c65565b6000601f820183136162c957600080fd5b81356162d761614882616e05565b915080825260208301602083018583830111156162f357600080fd5b614f04838284616e4e565b60006161228235616e48565b60006020828403121561631c57600080fd5b60006163288484616116565b949350505050565b6000806040838503121561634357600080fd5b600061634f8585616116565b925050602083013567ffffffffffffffff81111561636c57600080fd5b616378858286016162b8565b9150509250929050565b6000806040838503121561639557600080fd5b60006163a18585616116565b9250506020616378858286016162a0565b600080600080608085870312156163c857600080fd5b60006163d48787616116565b94505060206163e5878288016162fe565b93505060406163f6878288016162a0565b9250506060616407878288016162a0565b91505092959194509250565b60008060006060848603121561642857600080fd5b60006164348686616116565b9350506020616445868287016162fe565b9250506040616456868287016162fe565b9150509250925092565b6000806040838503121561647357600080fd5b823567ffffffffffffffff81111561648a57600080fd5b61649685828601616129565b925050602083013567ffffffffffffffff8111156164b357600080fd5b61637885828601616218565b6000602082840312156164d157600080fd5b60006163288484616294565b6000602082840312156164ef57600080fd5b600061632884846162a0565b60006020828403121561650d57600080fd5b600061632884846162ac565b600080600080600080600060e0888a03121561653457600080fd5b60006165408a8a6162a0565b975050602088013567ffffffffffffffff81111561655d57600080fd5b6165698a828b016161a8565b965050604088013567ffffffffffffffff81111561658657600080fd5b6165928a828b01616218565b955050606088013567ffffffffffffffff8111156165af57600080fd5b6165bb8a828b01616218565b945050608088013567ffffffffffffffff8111156165d857600080fd5b6165e48a828b01616218565b93505060a06165f58a828b01616116565b92505060c06166068a828b016162a0565b91505092959891949750929550565b6000806040838503121561662857600080fd5b60006163a185856162a0565b60008060006060848603121561664957600080fd5b600061665586866162a0565b9350506020616666868287016162a0565b925050604061645686828701616288565b61668081616e37565b82525050565b600061669182616e33565b8084526020840193506166a383616e2d565b60005b828110156166d3576166b9868351616677565b6166c282616e2d565b6020969096019591506001016166a6565b5093949350505050565b60006166e882616e33565b8084526020840193506166fa83616e2d565b60005b828110156166d357616710868351616677565b61671982616e2d565b6020969096019591506001016166fd565b600061673582616e33565b8084526020840193508360208202850161674e85616e2d565b60005b8481101561678557838303885261676983835161683d565b925061677482616e2d565b602098909801979150600101616751565b50909695505050505050565b600061679c82616e33565b8084526020840193506167ae83616e2d565b60005b828110156166d3576167c4868351616834565b6167cd82616e2d565b6020969096019591506001016167b1565b60006167e982616e33565b8084526020840193506167fb83616e2d565b60005b828110156166d357616811868351616834565b61681a82616e2d565b6020969096019591506001016167fe565b61668081616e43565b61668081612c65565b600061684882616e33565b80845261685c816020860160208601616e5a565b61686581616e8a565b9093016020019392505050565b80516000906102408401906168878582616677565b50602083015161689a6020860182616834565b5060408301516168ad6040860182616834565b5060608301516168c06060860182616834565b5060808301516168d36080860182616834565b5060a083015184820360a08601526168eb82826167de565b91505060c083015161690060c0860182616834565b5060e083015161691360e0860182616834565b5061010083015184820361010086015261692d82826167de565b915050610120830151616944610120860182616834565b5061014083015184820361014086015261695e82826167de565b915050610160830151616975610160860182616677565b5061018083015161698a610180860182616834565b506101a08301518482036101a08601526169a482826166dd565b9150506101c08301518482036101c08601526169c082826167de565b9150506101e08301518482036101e08601526169dc82826166dd565b9150506102008301516169f3610200860182616834565b50610220830151848203610220860152616a0d82826166dd565b95945050505050565b8051604080845260009190840190616a2e82826167de565b91505060208301518482036020860152616a0d82826167de565b8051600090610180840190616a5d8582616677565b5060208301518482036020860152616a7582826167de565b91505060408301518482036040860152616a8f82826167de565b9150506060830151616aa46060860182616834565b506080830151616ab76080860182616677565b5060a0830151616aca60a0860182616834565b5060c0830151616add60c0860182616834565b5060e0830151616af060e0860182616677565b50610100830151616b05610100860182616834565b50610120830151848203610120860152616b1f82826167de565b915050610140830151848203610140860152616b3b82826166dd565b915050610160830151848203610160860152616a0d82826166dd565b61668081616e48565b60208101616b6e8284616677565b92915050565b6101608101616b83828e616677565b616b90602083018d616834565b616b9d604083018c616834565b616baa606083018b616834565b616bb7608083018a616834565b616bc460a0830189616834565b616bd160c0830188616834565b616bde60e0830187616834565b616bec610100830186616677565b616bfa610120830185616834565b616c08610140830184616834565b9c9b505050505050505050505050565b60408101616c268285616677565b8181036020830152616328818461683d565b60408101616c468285616677565b6161226020830184616834565b60608101616c618286616677565b616c6e6020830185616834565b8181036040830152616a0d818461683d565b60a08101616c8e8288616677565b616c9b6020830187616834565b616ca86040830186616b57565b616cb56060830185616834565b616cc26080830184616834565b9695505050505050565b602080825281016161228184616686565b60408082528101616cee8185616686565b90508181036020830152616328818461672a565b60808082528101616d138187616686565b90508181036020830152616d278186616791565b90508181036040830152616d3b8185616791565b90508181036060830152616cc28184616791565b60208101616b6e828461682b565b60208101616b6e8284616834565b60208082528101616122818461683d565b602080825281016161228184616872565b602080825281016161228184616a16565b602080825281016161228184616a48565b60208101616b6e8284616b57565b60405181810167ffffffffffffffff81118282101715616ddc57600080fd5b604052919050565b600067ffffffffffffffff821115616dfb57600080fd5b5060209081020190565b600067ffffffffffffffff821115616e1c57600080fd5b506020601f91909101601f19160190565b60200190565b5190565b600160a060020a031690565b151590565b60ff1690565b82818337506000910152565b60005b83811015616e75578181015183820152602001616e5d565b83811115616e84576000848401525b50505050565b601f01601f1916905600a265627a7a7230582037035dad72cccff2667fac83fe00fd420ef8a46de188ac32d8d716f979653a916c6578706572696d656e74616cf50037"

    var subchainbaseContract = utils.chain3.mc.contract(abi);
    // var subchainbaseContract = utils.chain3.mc.contract(JSON.parse(abi));
    var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../contract.json"), 'utf8'));
    // var subchainbase = subchainbaseContract.new(
    //   config.data[1]['scsPoolAddr'],
    //   config.data[0]['vnodePoolAddr'],
    //   min,
    //   max,
    //   thousandth,
    //   flushRound,
    //   tokensupply,
    //   exchangerate,
    //   {
    //     from: baseaddr,
    //     data: '0x' + bin,
    //     gas: '9000000'
    //   }
    // );

    var types = ['address', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256'];
    var args = [config['scsPoolAddr'], config['vnodePoolAddr'], min, max, thousandth, flushRound, tokensupply, exchangerate];
    let parameter = utils.chain3.encodeParams(types, args);
    let rawTx = {
        nonce: utils.chain3.toHex(utils.getNonce(baseaddr)),
        gasLimit: utils.chain3.toHex("9000000"),
        gasPrice: utils.chain3.toHex(utils.chain3.mc.gasPrice),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        data: '0x' + bin + parameter
    };

    let signtx = utils.chain3.signTransaction(rawTx, privatekey);
    // var transHash = utils.chain3.mc.sendRawTransaction(signtx); //windows下ENAMETOOLONG err
    var microChainAddr = await new Promise((resolve, reject) => {
        utils.chain3.mc.sendRawTransaction(signtx, (e, transactionHash) => {
            if (!e) {
                logger.info('transactionHash', transactionHash);
                var microChainAddr = utils.waitBlockForContract(transactionHash);
                resolve(microChainAddr);
            } else {
                reject(e);
            }
        });
    });

    // var microChainAddr = utils.waitBlockForContract(transHash);
    wirteJson("microChainAddr", microChainAddr);
    subchainbase = subchainbaseContract.at(microChainAddr);
    logger.info("microChain created at address:", subchainbase.address);

    return subchainbase;
}

// Deploy the MicroChain contract to form a MicroChain with Atomic Swap of Token (AST) function
async function deployMicroChainwithAST() {

    var ercRate = 100;       //Exchange rate between ERC20 token and MicroChain native token, must be int large than 1
    var min = minScsRequired; //Min SCSs required in the MicroChain, only 1,3,5,7 should be used`
    var max = 11; //Max SCSs needed in the MicroChain, Only 11, 21, 31, 51, 99
    var thousandth = 1000; //Fixed, do not need change
    var flushRound = 40; //Number of MotherChain rounds, must between 40 and 500

    // these address should be pass from Step 1. If you use previously deployed contract, then input the address here.
    // var scsPoolAddr = vnodePool.address;
    // var vnodePoolAddr = scsPool.address;

    var contractName = 'SubChainBase';

    // Need to read both contract files to compile
    var input = {
        '': fs.readFileSync(path.resolve(__dirname, "../contract/") + "/" + 'ChainBaseAST.sol', 'utf8'),
        'SubChainProtocolBase.sol': fs.readFileSync(path.resolve(__dirname, "../contract/") + "/" + 'SubChainProtocolBase.sol', 'utf8')
    };

    var output = solc.compile({ sources: input }, 1);

    abi = output.contracts[':' + contractName].interface;
    bin = output.contracts[':' + contractName].bytecode;

    var subchainbaseContract = utils.chain3.mc.contract(JSON.parse(abi));
    var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../contract.json"), 'utf8'));
    // var subchainbase = subchainbaseContract.new(
    //   config.data[1]['scsPoolAddr'],
    //   config.data[0]['vnodePoolAddr'],
    //   min,
    //   max,
    //   thousandth,
    //   flushRound,
    //   tokensupply,
    //   exchangerate,
    //   {
    //     from: baseaddr,
    //     data: '0x' + bin,
    //     gas: '9000000'
    //   }
    // );

    var types = ['address', 'address', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256'];
    var args = [config['scsPoolAddr'], config['vnodePoolAddr'], ercAddr, ercRate, min, max, thousandth, flushRound];
    let parameter = utils.chain3.encodeParams(types, args);
    let rawTx = {
        nonce: utils.chain3.toHex(utils.getNonce(baseaddr)),
        gasLimit: utils.chain3.toHex("9000000"),
        gasPrice: utils.chain3.toHex(utils.chain3.mc.gasPrice),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        data: '0x' + bin + parameter
    };

    let signtx = utils.chain3.signTransaction(rawTx, privatekey);
    // var transHash = utils.chain3.mc.sendRawTransaction(signtx); //windows下ENAMETOOLONG err
    var microChainAddr = await new Promise((resolve, reject) => {
        utils.chain3.mc.sendRawTransaction(signtx, (e, transactionHash) => {
            if (!e) {
                logger.info('transactionHash', transactionHash);
                var microChainAddr = utils.waitBlockForContract(transactionHash);
                resolve(microChainAddr);
            } else {
                reject(e);
            }
        });
    });

    // var microChainAddr = utils.waitBlockForContract(transHash);
    wirteJson("microChainAddr", microChainAddr);
    subchainbase = subchainbaseContract.at(microChainAddr);
    logger.info("microChain created at address:", subchainbase.address);

    return subchainbase;
}

// save MicroChain address to the blockChain.
async function saveMicroChain() {

    let config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../contract.json"), 'utf8'));
    let hash = config['savedHash'];
    let logs;
    if (hash) {
        logs = await getSavedMicroChain(hash);
        //以下为写入数据log
        let log = {
            type: "MicroChainAddr",
            addr: config['microChainAddr'],
            time: (new Date).getTime()
        };
        logs.push(log);
    } else {
        //以下为写入数据log
        logs = [{
            type: "MicroChainAddr",
            addr: config['microChainAddr'],
            time: (new Date).getTime(),
        }];
    }

    //转换log数据格式
    let str = JSON.stringify(logs);
    logger.info(str);
    let data = Buffer.from(str).toString('hex');
    data = '0x' + data;
    logger.info(data);

    let rawTx = {
        to: utils.nconf.get("savedAddr"),
        nonce: utils.chain3.toHex(utils.getNonce(baseaddr)),
        gasLimit: utils.chain3.toHex("9000000"),
        gasPrice: utils.chain3.toHex(utils.chain3.mc.gasPrice),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        data: data
    };

    let signtx = utils.chain3.signTransaction(rawTx, privatekey);
    utils.chain3.mc.sendRawTransaction(signtx, function (err, hash) {
        if (!err) {
            logger.info("succeed: ", hash);
            wirteJson("savedHash", hash);
        } else {
            logger.info("error:", err);
            logger.info('raw tx:', rawTx);
        }
    });

}

// re-save MicroChain address to the blockChain.
async function reSaveMicroChain(logs) {

    //转换log数据格式
    let str = JSON.stringify(logs);
    logger.info(str);
    let data = Buffer.from(str).toString('hex');
    data = '0x' + data;

    let rawTx = {
        to: utils.nconf.get("savedAddr"),
        nonce: utils.chain3.toHex(utils.getNonce(baseaddr)),
        gasLimit: utils.chain3.toHex("9000000"),
        gasPrice: utils.chain3.toHex(utils.chain3.mc.gasPrice),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        data: data
    };

    let signtx = utils.chain3.signTransaction(rawTx, privatekey);
    await new Promise((resolve, reject) => {
        utils.chain3.mc.sendRawTransaction(signtx, function (err, hash) {
            if (!err) {
                logger.info("succeed: ", hash);
                wirteJson("savedHash", hash);
                resolve(hash);
            } else {
                logger.info("error:", err);
                logger.info('raw tx:', rawTx);
                reject(err);
            }
        });
    });

}

// get saved MicroChain address.
async function getSavedMicroChain() {
    let config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../contract.json"), 'utf8'));
    //获取交易信息
    let hash = config['savedHash'];
    return data = await new Promise((resolve, reject) => {
        utils.chain3.mc.getTransaction(hash, function (e, result) {
            if (!e) {
                inputData = result.input;
                res_str = Buffer.from(inputData.replace('0x', ''), 'hex').toString();
                res_json = JSON.parse(res_str);
                resolve(res_json);
            } else {
                reject(e);
            }
        });
    });
}

// clear the MicroChain.
async function clearMicroChain() {

    let config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../contract.json"), 'utf8'));
    let hash = config['savedHash'];
    if (hash) {
        let logs = await getSavedMicroChain(hash);
        let length = logs.length;
        if (length === 0) {
            return;
        }
        for (var i = logs.length - 1; i >= 0; i--) {
            let log = logs[i];
            let microChain = log["addr"];
            let time = log["time"];
            let now = (new Date).getTime();
            let hours = (now - time) / 3600000;
            if (hours >= 4) {
                await closeMicroChain(microChain);
                logs.splice(i, 1);
            }
        }
        if (length > logs.length) {
            reSaveMicroChain(logs);
        }
    }
}

async function closeMicroChain(microChain) {
    var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../contract.json"), 'utf8'));
    let microChainAddr = config['microChainAddr'];
    baseaddr = utils.nconf.get("baseaddr");
    utils.sendtx(baseaddr, microChain, 0, '0x43d726d6');
    // clear config.json
    if (microChain === microChainAddr) {
        var contract = {
            "vnodePoolAddr": "",
            "scsPoolAddr": "",
            "microChainAddr": "",
            "savedHash": config["savedHash"]
        };
        fs.writeFileSync(path.resolve(__dirname, "../../contract.json"), JSON.stringify(contract, null, '\t'), 'utf8');
    }
    logger.info("waiting for a flush!!!");
}

function scheduleCronstyle() {
    // 每隔4小时执行一次应用链清理
    var rule = new schedule.RecurrenceRule();
    rule.hour = [0, 4, 8, 12, 16, 20];
    logger.info('scheduleCronstyle-start:', new Date().getHours());
    schedule.scheduleJob(rule, () => {
        logger.info('scheduleCronstyle-do:', new Date().getHours());
        clearMicroChain();
    });
}

// scheduleCronstyle();

module.exports = {
    deploy: deploy,
    addMonitor: addMonitor,
    addScs: addScss,
    closeMicroChain: closeMicroChain,
    config: config,
    getContract: getContract,
    getInitConfig: getInitConfig,
    verifyPwd: verifyPwd,
    wirteJson: wirteJson
}