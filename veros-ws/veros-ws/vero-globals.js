var config = require('config');
var Web3 = require('web3');
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider(config.get("gethIP")));
var block = web3.eth.getBlock('latest');

var gasWallet = config.get("gasWallet.address");
var gasWalletPassword = config.get("gasWallet.password");

var mainWalletAddress = config.get("mainWallet.address");
var mainWalletPassword = config.get("mainWallet.password");

var genesisWalletAddress = config.get("genesisWallet.address");
var genesisWalletPassword = config.get("genesisWallet.password");

var investorWalletAddress = config.get("investorWallet.address");
var investorWalletPassword = config.get("investorWallet.password");

var stakeholderWalletAddress = config.get("stakeholderWallet.address");
var stakeholderWalletPassword = config.get("stakeholderWallet.password");

var stakingWalletAddress = config.get("stakingWallet.address");
var stakingWalletPassword = config.get("stakingWallet.password");

var verocoinContract = web3.eth.contract(config.get("verosContract.abi"));
var veroInstance = verocoinContract.at(config.get("verosContract.address"));

var verosEVMCode = config.get("verosContract.evm");

var transactionCostETH = config.get('settings.transactionCostETH');
var gas = parseInt(block.gasLimit * 0.99);
var gasPrice = parseInt(web3.toWei(transactionCostETH,'ether') / gas);

var minGas = config.get('settings.minGas');
var minTransactionCostETH = config.get('settings.minTransactionCostETH');
var minGasPrice = parseInt(web3.toWei(minTransactionCostETH,'ether') / minGas);

console.log("Transaction cost = " + transactionCostETH + " ETH");
console.log("Default gas = " + gas);
console.log("Gas price = " + gasPrice);


//var minETH = block.gasLimit;

module.exports = {
    gasWallet: gasWallet,
    gasWalletPassword: gasWalletPassword,
    web3: web3,
    verocoinContract: verocoinContract,
    veroInstance: veroInstance,
    verosEVMCode: verosEVMCode,

    gas: gas,
    gasPrice: gasPrice,
    transactionCostETH:transactionCostETH,

    minGas: minGas,
    minGasPrice: minGasPrice,

    genesisWalletAddress: genesisWalletAddress,
    genesisWalletPassword: genesisWalletPassword,

    mainWalletAddress: mainWalletAddress,
    mainWalletPassword: mainWalletPassword,

    stakingWalletAddress: stakingWalletAddress,
    stakingWalletPassword: stakingWalletPassword,

    stakeholderWalletAddress: stakeholderWalletAddress,
    stakeholderWalletPassword: stakeholderWalletPassword,

    investorWalletAddress: investorWalletAddress,
    investorWalletPassword: investorWalletPassword,

    sendPusherEvent:sendPusherEvent
};

var createdAtBlock = web3.eth.getBlock('latest').number;
var BlockAdded = web3.eth.filter({
    topics: [null],
    fromBlock: createdAtBlock,
    toBlock: 'latest'
});

BlockAdded.watch(function(error, log) {
    var block = web3.eth.getBlock('latest');
    if (block.number != createdAtBlock) {
        createdAtBlock = block.number;
        module.exports.gas = parseInt(block.gasLimit * 0.9);
        module.exports.gasPrice = parseInt(web3.toWei(transactionCostETH,'ether') / module.exports.gas);
        console.log("New block. Gas = " + module.exports.gas + " // Gas price = " +module.exports.gasPrice);
        sendPusherEvent("network_notifications","new_block",{
            message: "A new block has been added"
        });
    }
});

var Pusher = require('pusher');

var pusher = new Pusher({
    appId: '263155',
    key: 'c8232accc930eb65dd80',
    secret: '08cc58cb35b299d7131b',
    cluster: 'ap1',
    encrypted: true
});

function sendPusherEvent(channel,event,data) {
    pusher.trigger(channel, event, {
        "message": data.message
    });
}