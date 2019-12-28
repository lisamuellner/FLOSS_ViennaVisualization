const csv = require('csv-parser');
const fs = require('fs');
const Papa = require("papaparse");
var data = []; 

class DataEndpoint {

    constructor(){
        const csvFile = fs.createReadStream('./server/data/data.csv');
        csvFile.pipe(csv({ separator: ';' }))
        .on('data', (row) => {
            data.push(row);
        })
        .on('end', () => {
          console.log('CSV file successfully processed');
        });
        //other data parsing version - converts csv to json 
        /*Papa.parse(csvFile, {
            complete: function(results) {
                data = results.data;
            }
        });*/
            
    }

    getData(){
        return data;
    }
}

module.exports = DataEndpoint