var request = require('supertest');
var utils = require('../functions/utils');
var app = require('../server');
var veroGlobals = require('../vero-globals');

var evmCode = veroGlobals.verosEVMCode;

describe("Test deploy contract", function() {

    it('It should deploy the contract', function (done) {
        this.timeout(50000000);
        var unlockResult = veroGlobals.web3.personal.unlockAccount(veroGlobals.gasWallet, veroGlobals.gasWalletPassword);
        if (!unlockResult) {
            return done(new Error('Cannot unlock gas wallet'));
        }


        var randomAddress = "0x" + utils.randomAddress(64);

        veroGlobals.verocoinContract.new(randomAddress,
            veroGlobals.gasWallet,
            veroGlobals.genesisWalletAddress,
            veroGlobals.mainWalletAddress,
            veroGlobals.stakingWalletAddress,
            veroGlobals.stakeholderWalletAddress,
            veroGlobals.investorWalletAddress,{
            from: veroGlobals.gasWallet,
            gas: veroGlobals.gas,
            gasPrice:(veroGlobals.gasPrice * 5),
            data: evmCode
        });

        var createdAtBlock = veroGlobals.web3.eth.blockNumber;
        console.log("Created at block = " +createdAtBlock);

        var Created = veroGlobals.web3.eth.filter({
            topics: [null, randomAddress],
            fromBlock: createdAtBlock,
            toBlock: 'latest'
        });

        Created.watch(function(error, log) {
            if(!error) {
                console.log('Contract created on '+ log.address);
                Created.stopWatching();
                done();
            }
        });
    });
});


