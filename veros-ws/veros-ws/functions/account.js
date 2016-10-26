var utils = require('./utils');
var veroGlobals = require('./../vero-globals');

function checkSender (req, res) {
    var address = req.params.address;
    var sender = veroInstance.checkSender.call({from:address});
    console.log(sender);
    res.send(sender);
};

function unlockAccount(req, res) {
    var address = req.body.address;
    var password = req.body.password;

    try {
        var result = veroGlobals.web3.personal.unlockAccount(address.slice(2), password, 60 * 10 * 1000);
    } catch(err) {
        res.status(401);
        return res.json({
            "success":false,
            "message": "Cannot unlock wallet = " + address
        });
    }

    if (result) {
        res.cookie("address", address, {
            expire: new Date() + 60*10*1000,
            signed: true
        });
        return res.json({
            "success": true,
            "message": "Wallet " + address + " unlocked"
        });
    } else {
        return res.json({
            "success": false,
            "message": "Couldn't unlock wallet " + address
        });
    }
};

function createAccount(req, res) {
    var password = req.body.password;

    var address = veroGlobals.web3.personal.newAccount(password);
    veroGlobals.web3.personal.unlockAccount(address,password,60 * 10 * 1000);

    var unlockResult = veroGlobals.web3.personal.unlockAccount(veroGlobals.gasWallet,veroGlobals.gasWalletPassword);
    if (!unlockResult) {
        return res.json({
            "success":false,
            "message":"Cannot unlock gas wallet"
        });
    }
    var registerResult = veroGlobals.veroInstance.registerAddressFromDefault(address,{
        from:veroGlobals.gasWallet,
        gas:veroGlobals.gas,
        gasPrice:veroGlobals.gasPrice
    });

    res.cookie("address", address, {
        expire: new Date() + 60*10*1000,
        signed: true
    });

    res.json({
        "success":true,
        "data": {
            "address": address,
            "register-transaction": registerResult
        }
    });
};

function waitForBalance(callback,address) {
    utils.executeOnNextBlock(function () {
        var ETHBalance = veroGlobals.web3.fromWei(veroGlobals.web3.eth.getBalance(address), 'ether');
        console.log("New block ETH = " + ETHBalance);
        if (ETHBalance > veroGlobals.minETH) {
            waitForBalance(callback,address);
        } else {
            callback();
        }
    });
}

function waitForTransaction(tx,callback) {
    console.log("Listen for next block");
    utils.executeOnNextBlock(function () {
        var transaction = veroGlobals.web3.eth.getTransaction(tx);;
        if (transaction.blockNumber) {
            var transactionReceipt = veroGlobals.web3.eth.getTransactionReceipt(tx);
            callback(transactionReceipt);
        } else {
            waitForTransaction(tx,callback);
        }
    });
}


function registerAddress(address,res) {
    console.log("Register address");
    var registerResult = veroGlobals.veroInstance.registerAddress({from:address,gas:veroGlobals.gas});
    res.cookie("address", address, {
        expire: new Date() + 60*10*1000,
        signed: true
    });

    res.json({
        "success":true,
        "data": {
            "address": address,
            "register-transaction": registerResult,
        }
    });
}

function fundETH(req,res) {
    var address = req.params.address;
    var unlockResult = veroGlobals.web3.personal.unlockAccount(veroGlobals.gasWallet,veroGlobals.gasWalletPassword);
    if (!unlockResult) {
        return res.json({
            "success":false,
            "message":"Cannot unlock gas wallet"
        });
    }

    var amount = veroGlobals.web3.toWei(0.5, "ether");
    veroGlobals.web3.eth.sendTransaction({from: veroGlobals.gasWallet, gas:veroGlobals.gas, to:address, value: amount},function(err, address) {
        console.log(err);
        console.log(address);
        return res.json({
            "from":veroGlobals.gasWallet,
            "gas":veroGlobals.gas,
            "amount":amount,
            "error":err,
            "address":address
        });
    });
}

function currentAccount(req,res) {
    var address = utils.getCurrentUser(req);

    var verosBalance = veroGlobals.veroInstance.getBalance.call(address);
    var ethBalance = veroGlobals.web3.fromWei(veroGlobals.web3.eth.getBalance(address),'ether');
    res.json({
        "success":true,
        "address":address,
        'verosBalance':verosBalance,
        'ethBalance':ethBalance
    })
}

function accountDetails(req,res) {
    var address = req.params.address;
    var verosBalance = veroGlobals.veroInstance.getBalance.call(address);
    var ethBalance = veroGlobals.web3.fromWei(veroGlobals.web3.eth.getBalance(address),'ether');
    res.json({
        "success":address,
        "data": {
            'verosBalance': verosBalance,
            'ethBalance': ethBalance
        }
    });
}

function downloadAccount(req,res) {
    var address = req.params.address;
    res.setHeader('Content-disposition', 'attachment; filename=wallet.txt');
    res.send("Address = " + address);
}

function sendVero(req,res) {
    var currentUser = utils.getCurrentUser(req);
    if (!currentUser) {
        return res.json({
            'success':false,
            'message':'You are not logged in'
        });
    }

    var address = req.body.address;
    var amount = req.body.amount;

    var senderETHBalance = veroGlobals.web3.fromWei(veroGlobals.web3.eth.getBalance(currentUser),'ether');
    if (senderETHBalance < veroGlobals.transactionCostETH) {
        console.log("Not enought ETHER. Sending some....");
        var gasWalletUnlockResult = veroGlobals.web3.personal.unlockAccount(veroGlobals.gasWallet,veroGlobals.gasWalletPassword);
        if (!gasWalletUnlockResult) {
            return res.json({
                "success":false,
                "message":"Cannot unlock gas wallet"
            });
        } else {
            var ETHFundAmount = veroGlobals.web3.toWei(parseFloat(veroGlobals.transactionCostETH), "ether");
            var gasTransaction = veroGlobals.web3.eth.sendTransaction({
                from: veroGlobals.gasWallet,
                to: currentUser,
                value: ETHFundAmount,
                gas: veroGlobals.gas,
                gasPrice: veroGlobals.gasPrice
            });
            console.log("GAS transaction = " + gasTransaction);
            res.json({
                "success":true,
                "message":"We sent some ETH to your account and then you can send the VEROS. Pending transaction."
            });

            waitForTransaction(gasTransaction,function(transactionReceipt) {
                console.log("Now we are sending VEROS");
                veroGlobals.veroInstance.sendVeros(address, amount, {
                        from: currentUser,
                        gas: veroGlobals.gas,
                        gasPrice: veroGlobals.gasPrice
                    }, function (err, address) {
                    console.log("Send VERO tx = " + address);
                    waitForTransaction(address,function(transactionReceipt) {
                        var finalSenderETHBalance = veroGlobals.web3.fromWei(veroGlobals.web3.eth.getBalance(currentUser),'ether');
                        var differenceInWei = veroGlobals.web3.toWei(finalSenderETHBalance-senderETHBalance,'ether');
                        var returnAmount = differenceInWei - veroGlobals.minGas * veroGlobals.minGasPrice;

                        console.log("Return amount = " + returnAmount);

                        var returnGasTransaction = veroGlobals.web3.eth.sendTransaction({
                            from: currentUser,
                            to: veroGlobals.gasWallet,
                            value: returnAmount,
                            gas: veroGlobals.minGas,
                            gasPrice: veroGlobals.minGasPrice
                        });

                        console.log("Return gas transaction = " + returnGasTransaction);
                    });
                });


            });
        }
    } else {

        var sendVeroTx = veroGlobals.veroInstance.sendVeros(address, amount, {
            from: currentUser,
            gas: veroGlobals.gas,
            gasPrice: veroGlobals.gasPrice
        }, function (err, address) {
            console.log("Finish sending VEROS directly");
            console.log(err);
            console.log(address);
            if (err) {
                return res.json({
                    'success': false,
                    'message': err
                });
            } else {
                res.json({
                    "success": true,
                    "data": address
                });
            }
        });
    }
}

function sendEth(req,res) {
    var currentUser = utils.getCurrentUser(req);
    if (!currentUser) {
        return res.json({
            'success':false,
            'message':'You are not logged in'
        });
    }

    var address = req.body.address;
    var amount = veroGlobals.web3.toWei(req.body.amount,'ether');

    console.log("Gas = " + veroGlobals.gas);
    console.log("Gas price = " + veroGlobals.gasPrice);
    console.log("Amount = " + amount);
    var total = parseInt(veroGlobals.gas) * parseInt(veroGlobals.gasPrice) + parseInt(amount);

    console.log("Total = " + total);


    veroGlobals.web3.eth.sendTransaction({
        from: currentUser,
        to: address,
        value: amount,
        gas: veroGlobals.gas,
        gasPrice: veroGlobals.gasPrice
    },function(err,address) {
        console.log(err);
        console.log("ETH transaction tx = " + address);
        res.json({
            "success":true,
            "data": {
                "tx":address
            }
        });
    });
}

function logout(req,res) {
    res.clearCookie('address');

    res.json({
        'success':true
    });
}

module.exports = {
    checkSender: checkSender,
    unlockAccount: unlockAccount,
    createAccount: createAccount,
    currentAccount: currentAccount,
    accountDetails: accountDetails,
    sendVero: sendVero,
    sendEth: sendEth,
    downloadAccount: downloadAccount,
    logout:logout,
    fundETH:fundETH
};
