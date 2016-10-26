//var ip = require('ip');
var veroGlobals = require('./../vero-globals');

function getCurrentUser(req) {
    var fromAddress = req.signedCookies.address;
    if (fromAddress) {
        return fromAddress;
    }
    return null;
}

//function geocodeUser(req) {
//    var userIPAddress = ip.toLong(ip.address()) + "";
//    var address = getCurrentUser(req);
//    veroGlobals.veroInstance.setIP(userIPAddress,{from:address,gas:veroGlobals.gas});
//    return userIPAddress;
//}
//
//function reverseGeocodeUser(address) {
//    var ipAddress = veroGlobals.veroInstance.getIP.call(address,{from:address,gas:veroGlobals.gas});
//    return ipAddress;
//}

module.exports = {
    executeOnNextBlock: executeOnNextBlock,
    getScheduledPaymentAtIndex:getScheduledPaymentAtIndex,
    getCurrentUser: getCurrentUser,
    currentBlock: currentBlock,
    randomAddress: randomAddress,
    getAddressBalance: getAddressBalance,
    getMainWalletAddress: getMainWalletAddress
    //geocodeUser: geocodeUser,
    //reverseGeocodeUser: reverseGeocodeUser
};

function currentBlock(req,res) {
    return res.json({
        "block":veroGlobals.web3.eth.getBlock('latest').number
    });
}

function randomAddress(length)
{
    var text = "";
    var possible = "0123456789abcdef";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function getMainWalletAddress() {
    var mainWalletAddress = veroGlobals.veroInstance.getMainWalletAddress.call();
    return mainWalletAddress;
}

function getAddressBalance(address) {
    var verosBalance = veroGlobals.veroInstance.getBalance.call(address);
    var ethBalance = veroGlobals.web3.fromWei(veroGlobals.web3.eth.getBalance(address),'ether');
    return {
        "success":true,
        "data": {
            'verosBalance': verosBalance,
            'ethBalance': ethBalance
        }
    };
}

function getScheduledPaymentAtIndex(index) {
    var address = veroGlobals.veroInstance.getSchedulePaymentAddress.call(index);
    var amount = veroGlobals.veroInstance.getSchedulePaymentAmount.call(index);
    var datetime = veroGlobals.veroInstance.getSchedulePaymentDate.call(index);
    return {
        "address":address,
        "amount":amount,
        "datetime":datetime
    };
}

function executeOnNextBlock(callback) {
    var createdAtBlock = veroGlobals.web3.eth.getBlock('latest').number;
    var Created = veroGlobals.web3.eth.filter({
        topics: [null],
        fromBlock: createdAtBlock,
        toBlock: 'latest'
    });

    Created.watch(function(error, log) {
        var block = veroGlobals.web3.eth.getBlock('latest');
        if (block.number != createdAtBlock) {
            Created.stopWatching();
            callback();
        }
    });
}