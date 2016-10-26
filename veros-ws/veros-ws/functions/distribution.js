var utils = require('./utils');
var veroGlobals = require('./../vero-globals');

module.exports = {
    addScheduledPayment: addScheduledPayment,
    getScheduledPaymentActiveCount: getScheduledPaymentActiveCount,
    getScheduledPaymentActiveCountJSON: getScheduledPaymentActiveCountJSON,
    runScheduledPayment: runScheduledPayment
};

function getScheduledPaymentActiveCountJSON(req,res) {
    return res.json(getScheduledPaymentActiveCount());
}

function runScheduledPayment() {
    if (parseInt(getScheduledPaymentActiveCount().activeCount)) {
        console.log("Run scheduled payments = " + getScheduledPaymentActiveCount().activeCount);
        var mainWalletAddress = utils.getMainWalletAddress();
        var unlockResult = veroGlobals.web3.personal.unlockAccount(mainWalletAddress, veroGlobals.mainWalletPassword);
        if (unlockResult) {
            veroGlobals.veroInstance.runScheduledPayments({
                from: mainWalletAddress,
                gas: veroGlobals.gas
            }, function (err, address) {
                console.log("error = " + err);
                console.log("address = " + address);
            });
        }
    }
}

function getScheduledPaymentActiveCount() {
    var activeCount = veroGlobals.veroInstance.getScheduledPaymentsActiveCount.call();
    return {
        "totalCount":0,
        "activeCount":parseInt(activeCount)
    };
}

function addScheduledPayment(req,res) {
    var user = utils.getCurrentUser(req);
    var mainWalletAddress = utils.getMainWalletAddress();

    if (mainWalletAddress != user) {
        return res.json({
            "success":false,
            "message":"This function can only be run by the MAIN wallet"
        });
    }

    var address = req.body.address;
    var amount = req.body.amount;
    var datetime = req.body.datetime;


    var result = utils.getAddressBalance(mainWalletAddress);
    if (!result) {
        return res.json({
            "success":false,
            "message":"Cannot find main wallet"
        });
    }

    console.log("initial ETH balance = " + result.data.ethBalance);
    if (result.data.ethBalance < 1) {
        console.log("Send some ETH to main wallet");
        var unlockResult = veroGlobals.web3.personal.unlockAccount(veroGlobals.gasWallet,veroGlobals.gasWalletPassword);
        if (!unlockResult) {
            return res.json({
                "success":false,
                "message":"Main wallet ETH balance is too low and cannot unlock gas wallet"
            });
        }

        var ethAmount = veroGlobals.web3.toWei(1, "ether");
        veroGlobals.web3.eth.sendTransaction({from: veroGlobals.gasWallet, to: mainWalletAddress, value: ethAmount},function(err, address) {
            console.log('transaction = ' + address);
            utils.executeOnNextBlock(function() {
                return schedulePayment(address,amount,datetime,mainWalletAddress,res, function(scheduledData) {
                    return res.json({
                        "success": true,
                        "data":scheduledData
                    });
                });
            });
        });
    } else {
        return schedulePayment(address,amount,datetime,mainWalletAddress,res, function(scheduledData) {
            return res.json({
                "success":true,
                "data": scheduledData
            });
        });
    }

function schedulePayment(address,amount,datetime,mainWalletAddress,res,callback) {
    veroGlobals.veroInstance.setSchedulePayment(address,amount,datetime,{from:mainWalletAddress,gas:veroGlobals.gas}, function(err, address) {
        console.log("Scheduled payment address = " + address);
        if (err) {
            return res.json({
                "success":false,
                "message":err
            });
        }
        utils.executeOnNextBlock(function() {
            var scheduledPaymentIndex = veroGlobals.veroInstance.getScheduledPaymentIndex.call();
            console.log("Scheduled payment index = " + scheduledPaymentIndex);
            scheduledPaymentIndex--;
            var scheduledData = utils.getScheduledPaymentAtIndex(scheduledPaymentIndex);
            scheduledData.index = scheduledPaymentIndex;
            callback(scheduledData);
        });
    });
}

}
