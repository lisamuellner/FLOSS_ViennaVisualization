var mapData = require('./data/wien-topo.json');

class MapEndpoint {

    getMapData(){
        return mapData;
    }
}

module.exports = MapEndpoint