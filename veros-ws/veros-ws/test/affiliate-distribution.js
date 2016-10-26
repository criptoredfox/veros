var request = require('supertest');
var app = require('../server');
var utils = require('../functions/utils');
var veroGlobals = require('../vero-globals');

describe("Test affiliate distribution", function() {

    var theAddress = null;
    var thePassword = "simplepass";
    var theAgent = request.agent(app);

    it('Create a new address', function (done) {
        this.timeout(10000);

        theAgent.post('/api/account/create')
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

    it('Unlock the main account', function (done) {
        this.timeout(10000);
        theAgent.post('/api/account/unlock')
            .set('Content-Type', 'application/json')
            .send({
                address: utils.getMainWalletAddress(),
                password: veroGlobals.mainWalletPassword
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

    it('Create a new scheduled payment', function (done) {
        this.timeout(900000);

        var currenDateTime = new Date().getTime();
        currenDateTime = Math.floor(currenDateTime/1000);
        var scheduledDateTime = currenDateTime + 60*2;
        console.log("Payment is scheduled at: " + scheduledDateTime);

        theAgent.post('/api/distribution/create')
            .set('Content-Type', 'application/json')
            .send({
                address: theAddress,
                amount:50,
                datetime:scheduledDateTime
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }

                if (!res.body.success) {
                    return done(new Error('Cannot process transaction'));
                }

                done();
            });
    });

    it('Wait for the payment to process', function (done) {
        this.timeout(1000000);
        var currentBalance = 0;

        function getBlock(callback) {
            theAgent.get('/api/account/details/'+theAddress)
                .set('Content-Type', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }

                    if (!res.body.success) {
                        return done(new Error('Cannot get block'));
                    }

                    console.log("Got balance = " + res.body.data.verosBalance);

                    return callback(res.body.data.verosBalance);
                });
        }



        function continueOrDone(getterFn) {
            setTimeout(function () {
                getterFn(function (newBalance) {
                    if (newBalance == currentBalance) {
                        return continueOrDone(getterFn);
                    }
                    done();
                })
            }, 1000 * 20);
        }

        getBlock(function (theBalance) {
            currentBalance = theBalance;
            continueOrDone(getBlock);
        });

    });

    //sleep()



});