var app = require('./server');

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
app.timeout = 100000;