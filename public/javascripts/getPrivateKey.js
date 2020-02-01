
var keythereum = require("keythereum");
// var datadir = "C:\\Users\\lyq2018\\AppData\\Roaming\\MoacNode";  //moacnode目录，根据实际修改
var datadir = "/Users/wanggang/Downloads/mac_11/data/";  
// var datadir = '/Users/wanggang/Documents/子链搭建/'                  //苹果mac系统moacnode目录，根据实际修改
var address = "0x960d6108ace3b64e262de30e2e4507982bf0cafe";       //本地节点账号，根据实际修改
const password = "123456";                                     //账号密码，根据实际修改

var keyObject = keythereum.importFromFile(address, datadir);
var privateKey = keythereum.recover(password, keyObject);        //输出私钥
console.log("0x" + privateKey.toString('hex'));