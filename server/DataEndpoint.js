const csv = require('csv-parser');
const fs = require('fs');
var data = []; 

class DataEndpoint {

    constructor(){
        const csvFile = fs.createReadStream('./server/data/data_v2.csv');
        csvFile.pipe(csv({ separator: ';' }))
        .on('data', (row) => {
            data.push(row);
        })
        .on('end', () => {
          console.log('CSV file successfully processed');
        }); 
    }

    getData(){
        return data;
    }
}

module.exports = DataEndpoint