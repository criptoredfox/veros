var assert = require('assert');
var veros = require('veros-demo');
var config = require('config');

var _addChildTx;
var _childAddress;

describe('Create user', function() {
    this.timeout(100000);
    it('It should connect to node.', function(done) {
        veros.connectToEthereumNode("http://127.0.0.1:8545",
            config.get("ownerWallet"),
            config.get("ownerWalletPassword"),
            true,
            function(err,blockNumber) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
    });


    it('Create UDEV investor wallet as child of web-wallet', function(done) {
        var password = "test1234";
        veros.addChildrenAddress(
            config.get("ownerWallet"),
            config.get("ownerWalletPassword"),
            config.get("webWallet"),
            password,
            function(err,tx,childAddress) {
                console.log(err);
                console.log(tx);
                console.log(childAddress);
                _addChildTx = childAddress;
                _childAddress = childAddress;
                done();
            }
        );
    });

    it('Wait for transaction to be mined.', function(done) {
        setInterval(function() {
            veros.getWeb3().eth.getTransactionReceipt(addChildTx,function(transaction) {
                if (transaction) {
                    done();
                }
            });
        },3000);
    });

    it("Check if the children address has the right parent",function(done) {
        veros.getChildren(config.get("webWallet"),function(address) {
            if (address == _childAddress) {
                done()
            } else {
                done("The child doesn't have the right parent!");
            }
        });
    });

    it("Get all child addresses of the parent. Make sure the child is between them.",function(done) {
        veros.getChildrenEvents(config.get("webWallet"),function(childrens) {
            childrens.forEach(function(children,index) {
                if (children == _childAddress) {
                    done();
                }
            });
            console.log(childrens);
            done("Could not find children");
        });
    });

});