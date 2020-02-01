var Chain3 = require('chain3');
var fs = require('fs');
var solc = require('solc');

var vnoderpc = 'http://39.99.178.42:8545';
var addr_vnodeprotocolbase = '0x68b21c47a1c2ea6cb8c6d641c17603f929456240'  
// var addr_vnodeprotocolbase = '0xa3dbf5effc42533681856dd382de65ff58990c99'  

// check chain3
var chain3 = new Chain3();
chain3.setProvider(new chain3.providers.HttpProvider(vnoderpc));

if(!chain3.isConnected()){
    throw new Error('unable to connect to vnode' + vnoderpc);
}else{
    console.log('connected to vnode successfully!');
}

//var VnodeBeneficialAddress = '0xf103bc1c054babcecd13e7ac1cf34f029647b08c'  

var abi = '[{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"vnodeList","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"randness","type":"uint256"}],"name":"pickRandomVnode","outputs":[{"name":"target","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"vnode","type":"address"},{"name":"link","type":"string"}],"name":"register","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"withdrawRequest","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"vnodeCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PEDNING_BLOCK_DELAY","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"outageReportList","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"level","type":"uint256"},{"name":"startpos","type":"uint256"},{"name":"count","type":"uint256"}],"name":"sweepOutage","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"bondMin","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_addr","type":"address"}],"name":"isPerforming","outputs":[{"name":"res","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"vnodeStore","outputs":[{"name":"from","type":"address"},{"name":"bond","type":"uint256"},{"name":"state","type":"uint256"},{"name":"registerBlock","type":"uint256"},{"name":"withdrawBlock","type":"uint256"},{"name":"link","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"vnode","type":"address"}],"name":"reportOutage","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"WITHDRAW_BLOCK_DELAY","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"bmin","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"}]'
var VnodeProtocolBaseContract = chain3.mc.contract(JSON.parse(abi));

var vnodeprotocolbase = VnodeProtocolBaseContract.at(addr_vnodeprotocolbase);

var vcount = vnodeprotocolbase.vnodeCount();
console.log(" **********  vnodeprotocolbase current vnode cnt:" + vcount );

//var vlist = vnodeprotocolbase.vnodeList(VnodeBeneficialAddress);
//console.log(" **********  vnodeprotocolbase current vnode vlist:" + vlist);


for (i = 0; i < vcount; i++) {
	vstore = vnodeprotocolbase.vnodeStore(i);
	//console.log(" **********  vnode vstore:" + vstore);
	
	console.log(" **********  vnodeStore via:", vstore);
	//console.log(" **********  vnodeStore via:", vstore.slice(0,1).toString());
}
