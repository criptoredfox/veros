var express = require('express');
var exphbs  = require('express-handlebars');
var Identicon = require('identicon.js');
var uuid = require('uuid');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var app = express();
app.set('view engine', 'handlebars');
app.use(express.static('./public'));
app.use(cookieParser("1bd378b5-2fca-4914-bf41-df31da5a79f3"));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var hbs = exphbs.create({
    defaultLayout: 'main',
    partialsDir: [
        'views/partials/'
    ]
});

app.engine('handlebars', hbs.engine);
app.get('/', function (req, res) {
    var address = req.signedCookies.address;
    res.render('explorer', {
        address: address,
        explorerActive:true,
        partials: {
            custom_js: hbs.handlebars.compile(require('fs').readFileSync('./views/partials/js/explorer-js.handlebars', 'utf-8'))
        }
    });
});

app.get('/settings', function(req,res) {
    var address = req.signedCookies.address;
    res.render('explorer', {
        address: address,
        settingsActive:true,
        partials: {
            custom_js: hbs.handlebars.compile(require('fs').readFileSync('./views/partials/js/settings-js.handlebars', 'utf-8'))
        }
    });
});

app.get('/explorer', function (req, res) {

    var address = req.signedCookies.address;
    res.render('explorer', {
        address: address,
        explorerActive:true,
        partials: {
            custom_js: hbs.handlebars.compile(require('fs').readFileSync('./views/partials/js/explorer-js.handlebars', 'utf-8'))
        }
    });
});

app.get('/transaction/:transaction', function (req, res) {

    var transaction = req.params.transaction;
    var address = req.signedCookies.address;
    res.render('transaction', {
        address: address,
        explorerActive:true,
        transaction: transaction,
        partials: {
            custom_js: hbs.handlebars.compile(require('fs').readFileSync('./views/partials/js/transaction-js.handlebars', 'utf-8'))
        }
    });
});

app.get('/address/:address', function (req, res) {

    var address = req.params.address;
    var currentAddress = req.signedCookies.address;
    res.render('address', {
        address: currentAddress,
        explorerActive:true,
        searchAddress: address,
        partials: {
            custom_js: hbs.handlebars.compile(require('fs').readFileSync('./views/partials/js/address-js.handlebars', 'utf-8'))
        }
    });
});

app.get('/wallet', function (req, res) {

    var address = req.signedCookies.address;
    if (!address) {
        return res.redirect('/explorer');
    }
    res.render('wallet', {
        address: address,
        walletActive:true,
        partials: {
            custom_js: hbs.handlebars.compile(require('fs').readFileSync('./views/partials/js/wallet-js.handlebars', 'utf-8'))
        }
    });
});

app.get('/login', function (req, res) {
    res.render('login',{
        layout: false,
        loginPage:true,
        partials: {
            custom_js: hbs.handlebars.compile(require('fs').readFileSync('./views/partials/js/login-js.handlebars', 'utf-8'))
        }
    });
});

app.get('/register', function (req, res) {
    res.render('register',{
        registerPage:true,
        partials: {
            custom_js: hbs.handlebars.compile(require('fs').readFileSync('./views/partials/js/register-js.handlebars', 'utf-8'))
        }
    });
});

app.post('/register', function (req, res) {
    console.log(req.body.password);

    res.send("test");
});


app.get('/avatar/:hash*?', function (req, res) {
    var hash = req.params.hash;
    if (!hash) {
        hash = uuid.v4();
    }
    var data = new Identicon(hash,64).toString();
    res.header('Content-type',"image/png");
    res.end(new Buffer(data,"base64"),'binary');
});

app.listen(8080, function () {
    console.log('Example app listening on port 8080!');
});