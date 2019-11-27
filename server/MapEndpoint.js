var mapData = require('./data/bezirksgrenzen.json');

class MapEndpoint {

    getMapData(){
        return mapData;
    }
}

module.exports = MapEndpoint