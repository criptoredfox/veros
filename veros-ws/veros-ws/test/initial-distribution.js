var request = require('supertest');
var app = require('../server');

describe("Test initial distribution", function() {
    var theAgent = request.agent(app);
    var genesisWalletAddress = "0x02477eba74cae0a0dcdb11139a73af1957dac908";
    var mainWalletAddress = "0x3ddecb1e0ccfe8b30e42429096368bd8125e8260";
    var stakingWalletAddress = "0x3ddecb1e0ccfe8b30e42429096368bd8125e8260";
    var stakeholderWalletAddress = "0x3ddecb1e0ccfe8b30e42429096368bd8125e8260";
    var investorWalletAddress = "0x3ddecb1e0ccfe8b30e42429096368bd8125e8260";

    var blockSize = 100000000;
    var numberOfBlocks = 100;

    var expectedGenesisWalletBalance = blockSize * 99;
    var expectedMainWalletBalance = blockSize;
    var stakingWalletBalance = blockSize;
    var stakeholderWalletBalance = blockSize;
    var investorWalletBalance = blockSize;

    var expectedTotalSupply = blockSize * 100;
    var expectedAvailableSupply = 0;

    it('Check if the initial settings are as expected', function (done) {
        this.timeout(10000);
        theAgent.get('/network/statistics')
            .set('Content-Type', 'application/json')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }

                if (!res.body.success || !res.body.data) {
                    return done(new Error('Cannot get current account.'));
                }


                var totalSupply = res.body.data.totalSupply;
                if (totalSupply != expectedTotalSupply) {
                    return done(new Error('TOTAL SUPPLY is wrong ' + totalSupply));
                }


                var availableSupply = res.body.data.availableSupply;
                if (availableSupply != expectedAvailableSupply) {
                    return done(new Error('AVAILABLE SUPPLY is wrong ' + availableSupply));
                }

                var genesisWalletBalance = res.body.data.genesisWallet.balance;
                if (genesisWalletBalance != expectedGenesisWalletBalance) {
                    return done(new Error('GENESIS WALLET balance is wrong ' + genesisWalletBalance));
                }

                var mainWalletBalance = res.body.data.mainWallet.balance;
                if (mainWalletBalance != expectedMainWalletBalance) {
                    return done(new Error('MAIN WALLET balance is wrong ' + mainWalletBalance));
                }

                done();
            });
    });
});