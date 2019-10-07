const sqlite3 = require('sqlite3').verbose();
const axios = require('axios').default;
const { STOCKS } = require('./constants');
const { formatDate } = require('./utils');

const db = new sqlite3.Database('bist30Prics.db');

function populateStockValues(name) {
    const URL = `http://finans.mynet.com/borsa/ajaxcharts/?type=stock&ticker=${name}&range=3m`;
    return axios.get(URL).then(response => {
        const stmt = db.prepare(`INSERT INTO ${name} VALUES (?, ?, ?, ?)`);
        const volumeData = response.data.Data.Tooltips['Hacim'];
        response.data.Data.ohlc.forEach(value => {
            const timestamp = value[0];
            const price = value[1];
            const volume = volumeData[timestamp];
            const date = formatDate(new Date(timestamp));
            stmt.run(date, price, volume / price, volume);
    
        });
        stmt.finalize();
    })
}

db.serialize(() => {
    const promises = [];
    STOCKS.map(x => {
        db.run(`CREATE TABLE IF NOT EXISTS ${x} (
            date TEXT PRIMARY KEY,
            price REAL,
            volumeLots REAL,
            volumeCurrency REAL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS ${x}_DETAILS (
            date TEXT PRIMARY KEY,
            hourlyData TEXT
        )`)

        promises.push(populateStockValues(x));
    });

    Promise.all(promises).then(() => {
        db.close();
    })
});

