var express = require('express');
var config = require('config');
var router = express.Router();

/* GET users listing. */
router.post('/register-receiving-address', function(req, res, next) {
    var ownerAddress = req.body.owner_address;

    res.send('respond with a resource');
});

module.exports = router;