const Chain3 = require('chain3');

var vnoderpc = 'https://moac12jcc7601.jccdex.cn:8550';
var addr_subchainprotocolbase = '0x43c6e564187687377fc3935d3e857c9c05e70463'  // subchainprotocolbase 


// check chain3
var chain3 = new Chain3();
chain3.setProvider(new chain3.providers.HttpProvider(vnoderpc));

if (!chain3.isConnected()) {
    throw new Error('unable to connect to vnode' + vnoderpc);
} else {
    console.log('connected to vnode successfully!');
}


var abi = '[{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"approvalAddresses","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"scs","type":"address"},{"name":"amount","type":"uint256"}],"name":"releaseFromSubchain","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_size","type":"uint256"}],"name":"updatePoolSize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"setSubchainActiveBlock","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"withdrawRequest","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"approvalAmounts","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"scs","type":"address"}],"name":"register","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"poolSize","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"scs","type":"address"},{"name":"amount","type":"uint256"},{"name":"v","type":"uint8"},{"name":"r","type":"bytes32"},{"name":"s","type":"bytes32"}],"name":"approveBond","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"scs","type":"address"},{"name":"amount","type":"uint256"}],"name":"forfeitBond","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"subChainLastActiveBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"scsCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"scsApprovalList","outputs":[{"name":"bondApproved","type":"uint256"},{"name":"bondedCount","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PENDING_BLOCK_DELAY","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"scs","type":"address"},{"name":"subchain","type":"address"}],"name":"releaseRequest","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"scsArray","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"blk","type":"uint256"}],"name":"setSubchainExpireBlock","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"protocolType","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"subChainExpireBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"scsList","outputs":[{"name":"from","type":"address"},{"name":"bond","type":"uint256"},{"name":"state","type":"uint256"},{"name":"registerBlock","type":"uint256"},{"name":"withdrawBlock","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"bondMin","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_addr","type":"address"}],"name":"isPerforming","outputs":[{"name":"res","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"thousandth","type":"uint256"},{"name":"minnum","type":"uint256"}],"name":"getSelectionTarget","outputs":[{"name":"target","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"targetnum","type":"uint256"}],"name":"getSelectionTargetByCount","outputs":[{"name":"target","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"subChainProtocol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"WITHDRAW_BLOCK_DELAY","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"protocol","type":"string"},{"name":"bmin","type":"uint256"},{"name":"_protocolType","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"scs","type":"address"}],"name":"Registered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"sender","type":"address"}],"name":"UnRegistered","type":"event"}]';

var subchainprotocolbaseContract = chain3.mc.contract(JSON.parse(abi));


var subchainprotocolbase = subchainprotocolbaseContract.at(addr_subchainprotocolbase);


var count = subchainprotocolbase.subChainProtocol();

console.log(" **********  subchainprotocolbase Contract scs count: " + count);

// for (i = 0; i < count; i++) {
//     scs = subchainprotocolbase.scsArray(i);
//     console.log(" **********  vnode scs:", subchainprotocolbase.scsApprovalList(scs).subchainAddr[0]);
// }


// console.log(subchainprotocolbase.bondMin());