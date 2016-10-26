var request = require('supertest');
var app = require('../server');

describe("First test", function() {

    var thePassword = 'supersecret';
    var theAddress = null;
    var theAgent = request.agent(app);

    it('should create an account', function (done) {
        this.timeout(10000);

        theAgent.post('/account/create')
            .set('Content-Type', 'application/json')
            .send({password: thePassword})
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }


                if (!res.body.data || !res.body.data.address) {
                    return done(new Error('address missing from data block'));
                }

                theAddress = res.body.data.address;
                console.log('The address for this test suite is: ', theAddress);
                done();
            });
    });

    it('should unlock an account with the provided address and password', function (done) {
        this.timeout(10000);
        theAgent.post('/account/unlock')
            .set('Content-Type', 'application/json')
            .send({
                address: theAddress,
                password: thePassword
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }

                if (!res.body.success) {
                    return done(new Error('Cannot unlock account'));
                }
                console.log('Account has been unlocked');
                done();
            });
    });

    it("Should return the current user", function(done) {
        this.timeout(10000);
        theAgent.get('/account/current')
            .set('Content-Type', 'application/json')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }

                if (!res.body.success || !res.body.address || res.body.address != theAddress) {
                    return done(new Error('Cannot get current account.'));
                }

                done();
            });
    });

    it('Should wait for block change', function (done) {
        this.timeout(60000);

        function getBlock(callback) {
            theAgent.get('/blockchain/current-block')
                .set('Content-Type', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }

                    if (!res.body.block) {
                        return done(new Error('Cannot get block'));
                    }

                    return callback(res.body.block);
                });
        }

        var currentBlock = null;

        function continueOrDone(getterFn) {
            setTimeout(function () {
                getterFn(function (newBlock) {
                    if (newBlock == currentBlock) {
                        return continueOrDone(getterFn);
                    }
                    done();
                })
            }, 2500);
        }

        getBlock(function (theBlock) {
            currentBlock = theBlock;
            continueOrDone(getBlock);
        });
    });



});