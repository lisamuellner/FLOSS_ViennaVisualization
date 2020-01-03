var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');

var MapEndpoint = require('./server/MapEndpoint');
var DataEndpoint = require('./server/DataEndpoint');

const dataEndpoint = new DataEndpoint();

app.use(express.static('client'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

app.get('/', function (req, res) {
    res.sendFile( __dirname + "/client/index.html");
});

app.get('/map', (req, res) => {
    const endpoint = new MapEndpoint();
    const data = endpoint.getMapData();
    res.send(data);
});

app.get('/data', (req, res) => {
    const data = dataEndpoint.getData();
    res.send(data);
});

app.get('/*', function (req, res) {
    res.sendFile( __dirname + "/client/index.html");
});


app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});