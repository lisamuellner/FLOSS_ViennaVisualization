var mapData = require('./data/oesterreich.json');

class MapEndpoint {

    getMapData(){
        return mapData;
    }
}

module.exports = MapEndpoint