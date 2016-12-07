var assert = require('assert');
var veros = require('veros-demo');
var config = require('config');

var genesisWalletAddress = config.get('genesisWallet');
var mainWalletAddress = config.get('mainWallet');
var stakingWalletAddress = config.get('stakingWallet');
var stakeholderWalletAddress = config.get('stakeholderWallet');
var investorWalletAddress = config.get('investorWallet');

var blockSize = 100000000;
var decimals = 100000;

describe('Contract check', function() {
    this.timeout(100000);
    it('It should connect to node.', function(done) {
        veros.connectToEthereumNode("http://127.0.0.1:8545",
            config.get("ownerWallet"),
            config.get("ownerWalletPassword"),
            false,
            function(err,blockNumber) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
    });


    it('Check genesis wallet balance', function(done) {
        var balance = veros.getVerosBalance(genesisWalletAddress);
        assert.equal(96 * blockSize * decimals, balance.toString());
        done();
    });

    it('Check main wallet balance', function(done) {
        var balance = veros.getVerosBalance(mainWalletAddress);
        assert.equal(blockSize * decimals,balance.toString());
        done();
    });

    it('Check staking wallet balance', function(done) {
        var balance = veros.getVerosBalance(stakingWalletAddress);
        assert.equal(blockSize * decimals,balance.toString());
        done();
    });

    it('Check stakeholder wallet balance', function(done) {
        var balance = veros.getVerosBalance(stakeholderWalletAddress);
        assert.equal(blockSize * decimals,balance.toString());
        done();
    });

    it('Check investor wallet balance', function(done) {
        var balance = veros.getVerosBalance(investorWalletAddress);
        assert.equal(blockSize * decimals,balance.toString());
        done();
    });

    it('Check total supply', function(done) {
        var balance = veros.getTotalSupply();
        assert.equal(100 * blockSize * decimals,balance.toString());
        done();
    });

    it('Check available supply', function(done) {
        var balance = veros.getAvailableSupply();
        assert.equal(blockSize * decimals,balance.toString());
        done();
    });
});