
var utils = require('./utils')
var logger = require('./logger')

let account = [{
    address: '0x077137bb18583be4cf6cf6970738e54bb3ef2cba',
    privatekey: 'b16fed2cbd47cf418d486e9bc550a33292afea109065d9eabb37081a7844bc33'
},
{
    address: '0x3e0d176a89d49ba723b6e5cf0456bbdf3b8fdc8c',
    privatekey: '7996e529bd80b9ad95ad3d69142cf5fd4866ce74440b527daf80841882478e01'
},
{
    address: '0xe545a84c7e932a7c6d8bbe157dfb546a40f5fff8',
    privatekey: '3ae79b446f5cd322c81c61009d054517f87647135c291c43c21273315a046ccc'
},
{
    address: '0x839e9b99da3c295b8af374ecc14d58b2eed51a5b',
    privatekey: '25ec2ea2497a2840ae2b1892f2699e9c285692594d5d793e587898de74aa7725'
},
{
    address: '0x44e6418b2d193250a193eaa289f0e9a6df749aa5',
    privatekey: 'ebd5e586f4e01e3b8816be9f6f85b6bc481fa7b9e9c0bb3c9507ccbeef34f2bc'
},
{
    address: '0xcebcc7aa59dac30700366204b7a9b47b6e23f5c4',
    privatekey: 'f796f644270aa64475e68b3a46e630c84dacb46af96f7c968cfac47173963a2e'
},
{
    address: '0x7d4f20dc0712d13c8c2b9b195134938f4940722c',
    privatekey: 'fb2b0010993a6c3415b8de1fa23bd06b71650e8ba4a4a814294622b6fae0a122'
},
{
    address: '0xccca3e92275a1f1b07d01b182c88ef9efd7c030c',
    privatekey: '019b8fb9e69d95337a06b0bd1f7a14f8dc6b978d999178f5505bd67ee9c32c63'
},
{
    address: '0x38c1856b18b6da87c3225e0231731ba442ff5318',
    privatekey: '8e64119bbefe0fa5f02004ab8de48dc9840b3c630e0edb0f0f71d34af1123814'
}]

for (let i = 2, length = account.length; i < length; i++) {
    sendtx(account[i].address, account[i].privatekey, '0x8aacb5febf12546ca47fc5e9aa1bd1407378ad7a', 4.9, Buffer.from('子链搭建用多余mc撤回').toString('hex'))
}

function sendtx(from, privatekey, tgtaddr, amount, strData) {

    let rawTx = {
        nonce: utils.chain3.toHex(utils.getNonce(from)),
        value: utils.chain3.toHex(utils.chain3.toSha(amount, 'mc')),
        to: tgtaddr,
        gasLimit: utils.chain3.toHex("2000000"),
        gasPrice: utils.chain3.toHex(utils.chain3.mc.gasPrice),
        chainId: utils.chain3.toHex(utils.chain3.version.network),
        data: strData
    };
    let signtx = utils.chain3.signTransaction(rawTx, privatekey);
    var transHash = utils.chain3.mc.sendRawTransaction(signtx);
    logger.info('sending from:' + from + ' to:' + tgtaddr + ' amount:' + amount + ' with data:' + strData);
    return utils.waitBlockForTransaction(transHash);
}