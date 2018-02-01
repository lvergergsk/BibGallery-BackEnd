var express = require('express');
var app = express();

var port = process.env.PORT || 3000;

app.get('/', function (req, res) {
    res.send('<html><head><h1>Connected...</h1></head></html>')
});

app.get('/person/:id', function (req, res) {
    res.send('<html><head><h1>Person: ' + req.params.id + '</h1></head></html>')
})

app.get('/api', function (req, res) {
    res.json({firstname: 'Michael', lastname: 'Zhang'})
});

console.log("Listening...")
app.listen(port);