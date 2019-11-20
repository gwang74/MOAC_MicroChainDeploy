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
var vnodeVia = utils.nconf.get("vnodeVia");
var vnodeConnectUrl = utils.nconf.get("vnodeConnectUrl"); //VNODE connection as parameter to use for VNODE protocols
var minScsRequired = utils.nconf.get("minScsRequired"); // Min number of SCSs in the MicroChain, recommended 3 or more
var rpcLink = utils.nconf.get("rpcLink");

var minVnodeDeposit = utils.nconf.get("minVnodeDeposit"); // number of deposit required for the VNODE proxy to register, unit is mc
var minScsDeposit = utils.nconf.get("minScsDeposit"); // SCS must pay more than this in the register function to get into the SCS pool
var microChainDeposit = utils.nconf.get("microChainDeposit"); // The deposit is required for each SCS to join the MicroChain
var ercAddr = utils.nconf.get('ercAddr');

//===============Check the Blockchain connection===============================

async function deploy(req, result, next) {
    // The known SCS on MOAC network
    // result.send('deploy start!!!');
    utils.refreshInitConfig();
    baseaddr = utils.nconf.get("baseaddr");
    privatekey = utils.nconf.get("privatekey");
    vnodeVia = utils.nconf.get("vnodeVia");
    vnodeConnectUrl = utils.nconf.get("vnodeConnectUrl");
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
    var needMoac = Number(scs.length * 2 * minScsDeposit) + Number(minVnodeDeposit * 2) + Number(microChainDeposit);
    if (!utils.checkBalance(baseaddr, needMoac)) {
        logger.info("Need more balance in baseaddr," + needMoac + " mc at least!");
        result.send('{"status":"error", "msg":"操作账号moac不足！"}')
        return;
    } else {
        logger.info("baseaddr has enough balance!");
    }

    // Unlock the baseaddr for contract deployment
    // utils.unlockAccount(baseaddr, basepsd);

    //===============Step 1. Deploy required Mother Chain contracts=========================
    // If you have all these contracts deployed earlier, you can skip this and go to Step 2.
    // vnode pool
    // scs pool
    vnodePool = deployvnodepool();
    scsPool = deployscspool();

    //===============Step 2. Use the deployed Contracts to start a MicroChain======
    if (ercAddr) {
        microChain = await deployMicroChainwithAST();
    } else {
        microChain = await deployMicroChainwithASM();
    }

    //===============Step 3. Use the deployed Contracts to start a MicroChain======
    if (utils.checkBalance(microChain.address, microChainDeposit)) {
        logger.info("continue...");
    } else {
        // Add balance to microChainAddr for MicroChain running
        logger.info("Add funding to microChain!");
        logger.info("microChain.address", microChain.address);
        utils.addMicroChainFund(microChain.address, microChainDeposit)
        utils.waitBalance(microChain.address, microChainDeposit);
    }

    if (utils.checkBalance(vnodeVia, minVnodeDeposit)) {
        logger.info("VNODE has enough balance continue...")
        // sendtx(baseaddr,vnodecontractaddr,num,data)
    } else {
        // Add balance
        logger.info("Add funding to VNODE!");
        utils.sendtx(baseaddr, vnodeVia, minVnodeDeposit);
        utils.waitBalance(vnodeVia, minVnodeDeposit);
    }


    // Check to make sure all SCSs have enough balance than the min deposit required by 
    // SCS pool
    for (var i = 0; i < scs.length; i++) {
        if (utils.checkBalance(scs[i], minScsDeposit)) {
            logger.info("SCS has enough balance, continue...")
        } else {
            // Add balance
            logger.info("Add funding to SCS!");
            utils.sendtx(baseaddr, scs[i], minScsDeposit);
            utils.waitBalance(scs[i], minScsDeposit);
        }
    }

    utils.vnoderegister(vnodePool, minVnodeDeposit, vnodeConnectUrl, vnodeVia, rpcLink)

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
    utils.waitForBlocks(5);

    // Open the register for the SCSs to join the MicroChain
    utils.registerOpen(microChain.address);
    while (true) {
        let count = microChain.nodeCount();
        if (count >= minScsRequired) {
            logger.info("microChain has enough scs " + count);
            break;
        }
        logger.info("Waiting microChain, current scs count=" + count);
        utils.sleep(5000);
    }

    utils.registerClose(microChain.address);
    saveMicroChain();
    logger.info("all Done!!!");
    result.send('{"status":"success", "msg":"部署完成"}');
}

function addMonitor(req, res, next) {
    utils.refreshInitConfig();
    monitorAddr = utils.nconf.get("monitorAddr");
    monitorLink = utils.nconf.get("monitorLink");
    baseaddr = utils.nconf.get("baseaddr");
    var subchainbase = utils.deployMicroChainWithAddr();
    var data = subchainbase.registerAsMonitor.getData(monitorAddr, monitorLink);
    var boo = utils.sendtx(baseaddr, subchainbase.address, 1, data);
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
    newConfig['privatekey'] = config["privatekey"];
    newConfig['savedAddr'] = config["savedAddr"];
    newConfig['password'] = config["password"];
    newConfig['ercAddr'] = config["ercAddr"];
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
    console.log(req.body.pwd);
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

    let signtx = utils.chain3.signTransaction(rawTx, privatekey);
    var transHash = utils.chain3.mc.sendRawTransaction(signtx);

    logger.info(`VNODE protocol is being deployed at transaction HASH: ${transHash}`);

    // Check for the two POO contract deployments
    var vnodePoolAddr = utils.waitBlockForContract(transHash);
    wirteJson("vnodePoolAddr", vnodePoolAddr);
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

    let signtx = utils.chain3.signTransaction(rawTx, privatekey);
    var transHash = utils.chain3.mc.sendRawTransaction(signtx);

    logger.info("SCS protocol is being deployed at transaction HASH: " + transHash);

    var scsPoolAddr = utils.waitBlockForContract(transHash);
    wirteJson("scsPoolAddr", scsPoolAddr);

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

    var tokensupply = 1000; // MicroChain token amount, used to exchange for native token
    var exchangerate = 100; // the exchange rate bewteen moac and MicroChain token.

    var contractName = 'SubChainBase';

    // Need to read both contract files to compile
    var input = {
        '': fs.readFileSync(path.resolve(__dirname, "../contract/") + "/" + 'ChainBaseASM.sol', 'utf8'),
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