var express = require('express');
var veroGlobals = require('./vero-globals');
var utils = require('./functions/utils');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var accountRoutes = require('./functions/account');
var explorerRoutes = require('./functions/explorer');
var distributionRoutes = require('./functions/distribution');

var app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cookieParser("1bd378b5-2fca-4914-bf41-df31da5a79f3"));

app.get('/api/hello', function (req, res) {
    res.send('Hello World!');
});

app.get('/api/account/logout', accountRoutes.logout);
app.post('/api/account/create', accountRoutes.createAccount);
app.post('/api/account/unlock', accountRoutes.unlockAccount);
app.get('/api/account/current', accountRoutes.currentAccount);
app.get('/api/account/download/:address', accountRoutes.downloadAccount);
app.get('/api/account/fund-ether/:address', accountRoutes.fundETH);

app.post('/api/send-vero', accountRoutes.sendVero);
app.post('/api/send-eth', accountRoutes.sendEth);

app.post('/api/distribution/create', distributionRoutes.addScheduledPayment);
app.get('/api/distribution/count', distributionRoutes.getScheduledPaymentActiveCountJSON);
app.get('/api/account/details/:address', accountRoutes.accountDetails);
app.get('/api/network/statistics', explorerRoutes.getStatistics);
app.get('/api/network/transactions', explorerRoutes.getTransactions);
app.get('/api/network/transactions/:transaction', explorerRoutes.getTransaction);


app.get('/api/blockchain/current-block', utils.currentBlock);

//app.get('/api/get-eth-balance/:address',function(req,res) {
//    var address = req.params.address;
//    var balance = veroGlobals.web3.fromWei(veroGlobals.web3.eth.getBalance(address),'ether');
//
//    res.json({"balance":balance});
//});
//
//app.get('/api/get-transactions', function (req,res) {
//    var transactionCount = veroGlobals.web3.eth.getBlockTransactionCount("pending");
//    res.json({
//        "count":transactionCount
//    });
//});

setInterval(function() {
    distributionRoutes.runScheduledPayment();
},60* 1000);

module.exports = app;
