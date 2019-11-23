var fs = require('fs');
var utils = require('./utils.js');
var path = require('path');
var logger = require('./logger');

var baseaddr = utils.nconf.get("baseaddr");
var privatekey = utils.nconf.get("privatekey");
var vnodeVia = utils.nconf.get("vnodeVia");

var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../contract.json"), 'utf8'));
var subchainaddr = config['microChainAddr'];

var _to = '0x326a276713ee4125e35a71f4cfcc559fb3ba5083';
// transfer(_to);

var _hash = '0x992fcc5f26773ea4e9821702d0aeb775413e9729b3e8b30754c2d542efc5b690';
getTranscation(_hash);

/**
 * 原生币转账
 */
function transfer(_to) {
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
        value: utils.chain3.toHex(utils.chain3.toSha('10', 'mc')),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        via: vnodeVia,
        shardingFlag: "0x2",
        data: _to + memo
    };
    var signtx = utils.chain3.signTransaction(rawTx, privatekey);
    var transHash = utils.chain3.mc.sendRawTransaction(signtx);
    logger.info("transHash:", transHash);
    utils.waitBlockForTransactionInMicroChain(subchainaddr, transHash);
}


function getTranscation(_hash) {
    // var transcation = utils.chain3.scs.getReceiptByHash(subchainaddr, _hash);
    // logger.info(transcation);
    // utils.chain3.scs.getReceiptByHash(subchainaddr, _hash, function (e, result) {
    //     if (!e) {
    //         console.log(result);
    //         inputData = result.input;
    //         // res_str = Buffer.from(inputData.replace('0x', ''), 'hex').toString();
    //         // res_json = JSON.parse(res_str);
    //         // resolve(res_json);
    //     } else {
    //         reject(e);
    //     }
    // });

    var input = '0x326a276713ee4125e35a71f4cfcc559fb3ba50835b7b226d7367223a22e58e9fe7949fe5b881e8bdace8b4a66d656d6fe6b58be8af95227d5d';
    var memo = input.substr(42);
    logger.info(memo);
    var memoStr = Buffer.from(memo, 'hex').toString();
    logger.info(memoStr);
}

