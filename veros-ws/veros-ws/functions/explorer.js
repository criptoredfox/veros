var utils = require('./utils');
var veroGlobals = require('./../vero-globals');

module.exports = {
    getStatistics: getStatistics,
    getTransactions: getTransactions,
    getTransaction: getTransaction
};

function getTransactionWithIndex(index) {
    var senderAddress = veroGlobals.veroInstance.getTransactionSenderWithIndex.call(index);
    var recipientAddress = veroGlobals.veroInstance.getTransactionRecipientWithIndex.call(index);
    var datetime = veroGlobals.veroInstance.getTransactionDateWithIndex.call(index);
    var amount = veroGlobals.veroInstance.getTransactionAmountWithIndex.call(index);
    var blockNumber = veroGlobals.veroInstance.getTransactionBlockNumberWithIndex.call(index);
    return {
        'index':index,
        'senderAddress':senderAddress,
        'recipientAddress':recipientAddress,
        'amount':amount,
        'datetime':datetime,
        'blockNumber':blockNumber
    }
}

function getStatistics(req, res) {
    var availableSupply = veroGlobals.veroInstance.getAvailableSupply.call();
    var totalSupply = veroGlobals.veroInstance.getTotalSupply.call();

    var genesisWalletAddress = veroGlobals.veroInstance.getGenesisWalletAddress.call();
    var mainWalletAddress = veroGlobals.veroInstance.getMainWalletAddress.call();
    var stakingWalletAddress = veroGlobals.veroInstance.getStakingWalletAddress.call();
    var stakeholderWalletAddress = veroGlobals.veroInstance.getStakeholderWalletAddress.call();
    var investorWalletAddress = veroGlobals.veroInstance.getInvestorWalletAddress.call();

    var genesisWalletBalance = veroGlobals.veroInstance.getBalance.call(genesisWalletAddress);
    var mainWalletBalance = veroGlobals.veroInstance.getBalance.call(mainWalletAddress);
    var stakingWalletBalance = veroGlobals.veroInstance.getBalance.call(stakingWalletAddress);
    var stakeholderWalletBalance = veroGlobals.veroInstance.getBalance.call(stakeholderWalletAddress);
    var investorWalletBalance = veroGlobals.veroInstance.getBalance.call(investorWalletAddress);

    var transactionCount = veroGlobals.veroInstance.getTransactionCount.call();

    var index = transactionCount;

    res.json({
        'success': true,
        'data': {
            'availableSupply': availableSupply,
            'totalSupply': totalSupply,
            'genesisWallet': {
                'address': genesisWalletAddress,
                'balance': genesisWalletBalance
            },
            'mainWallet': {
                'address': mainWalletAddress,
                'balance': mainWalletBalance
            },
            'stakingWallet': {
                'address': stakingWalletAddress,
                'balance': stakingWalletBalance
            },
            'investorWallet': {
                'address': investorWalletAddress,
                'balance': investorWalletBalance
            },
            'stakeholderWallet': {
                'address': stakeholderWalletAddress,
                'balance': stakeholderWalletBalance
            },
            'transactionCount':transactionCount,
            'lastBlock': {
                "number":veroGlobals.web3.eth.getBlock('latest').number,
                "gas":veroGlobals.gas,
                "gasPrice":veroGlobals.gasPrice
            }
        }
    });
}
function getTransaction(req, res) {
    var transactionIndex = req.params.transaction;
    var transaction = getTransactionWithIndex(transactionIndex);
    res.json({
        'success':true,
        'data':transaction
    });
}

function getTransactions(req, res) {

    var transactionCount = veroGlobals.veroInstance.getTransactionCount.call();

    var index = transactionCount;
    var transactions = [];
    while(index) {
        index--;
        transactions.push(getTransactionWithIndex(index));
    }

    res.json({
        'success': true,
        'data': {
            'count': transactionCount,
            'transactions': transactions
        }
    });
}