var mapData = require('./data/bezirksgrenzen_topo.json');

class MapEndpoint {

    getMapData(){
        return mapData;
    }
}

module.exports = MapEndpoint