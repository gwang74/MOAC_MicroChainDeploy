const EthCrypto = require('eth-crypto');
const Chain3 = require('chain3');
var chain3 = new Chain3(new Chain3.providers.HttpProvider('http://localhost:8545'));

let amount = {
    address: "0x67d97d7a1491e3e4d87821d4a86eb51b0ac0ffda",
    secret: "bed8f35a130544c89685ae16adcaece6501e13d46a291e56f958e3627d53a043"
}

function trade(amount, tokenGet, amountGet, tokenGive, amountGive) {
    var inNonce = 15;
    var blockNum = 1356;

    var _data = chain3.encodeParams(['address', 'address', 'uint256', 'address', 'uint256', 'uint256', 'uint256'],
        [amount, tokenGet, chain3.toSha(amountGet, 'mc'), tokenGive, chain3.toSha(amountGive, 'mc'), blockNum, inNonce]);
    getVRS1(amount, _data)
    getVRS2(amount, tokenGet, amountGet, tokenGive, amountGive, _data)
}

function getVRS1(amount, _data) {
    var options = {
        encoding: 'hex'
    }
    var sha3Msg = chain3.sha3(_data, options);
    console.log('111111111 sha3Msg', sha3Msg);
    chain3.personal.unlockAccount(amount.address, '123456', 1000);
    var signtx = chain3.mc.sign(amount.address, sha3Msg).slice(2);
    console.log('111111111  signtx', signtx);
    // var r = `0x${signtx.slice(0, 64)}`
    // var s = `0x${signtx.slice(64, 128)}`
    // var v = `0x${signtx.slice(128, 130)}`
    // var v_decimal = utils.chain3.toDecimal(v);
    // console.log(v_decimal);
    // if (v_decimal != 27 && v_decimal != 28) {
    //     v_decimal += 27
    // }
    // console.log(r, s, v_decimal);
    // return { v_decimal, r, s }
}

function getVRS2(amount, tokenGet, amountGet, tokenGive, amountGive, data) {
    var inNonce = 15;
    var blockNum = 1356;
    var TypedValue = [{
        value: amount.address,
        type: 'address'
    }, {
        value: tokenGet,
        type: 'address'
    },
    {
        value: chain3.toSha(amountGet, 'mc'),
        type: 'uint256'
    },
    {
        value: tokenGive,
        type: 'address'
    },
    {
        value: chain3.toSha(amountGive, 'mc'),
        type: 'uint256'
    },
    {
        value: blockNum,
        type: 'uint256'
    }, {
        value: inNonce,
        type: 'uint256'
    }];
    // const sha3Msg = EthCrypto.hash.keccak256(TypedValue);
    var options = {
        encoding: 'hex'
    }
    var sha3Msg = chain3.sha3(data, options);

    console.log("2222222 sha3Msg", sha3Msg)
    let prefix = "\x19MoacNode Signed Message:\n32";
    // let prefixHash = chain3.encodeParams(['string', 'bytes32'], [prefix, sha3Msg])
    console.log("prefixHash is", prefixHash)
    let hash = EthCrypto.hash.keccak256(prefixHash)
    // console.log(pHash)
    const signature = EthCrypto.sign(
        amount.secret,
        hash
    );
    console.log("2222222 befor sign", signature)
}

trade(amount, "0x61d199728ace7f4334516612f99373bda78da84e", "100", "0x5c6a65814773367865f07d1e509c7e8ebb373919", "100")