var mapData = require('./data/oesterreich-topo.json');

class MapEndpoint {

    getMapData(){
        return mapData;
    }
}

module.exports = MapEndpoint