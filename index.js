const axios = require('axios').default;
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();
const { STOCKS } = require('./constants');
const { normalizeMynetResponse, formatDate } = require('./utils');

const db = new sqlite3.Database('bist30Prics.db');

db.serialize(() => {
    const today = new Date().getDay();
    if (today === 0 || today === 6) return;

    const promises = STOCKS.map(ticker => {
        const URL = `http://finans.mynet.com/borsa/ajaxcharts/?type=stock&ticker=${ticker}&range=d`;
        return axios.get(URL).catch(err => {
            return { ticker, hasError: true, error: err };
        });
    })

    Promise.all(promises).then(responses => {
        responses.forEach(response => {
            if (response.hasError) {
                // handle error here
                return;
            }

            const normalized = normalizeMynetResponse(response.data.Data);
            const lastEntry = normalized[normalized.length - 1];
            const date = formatDate(new Date(lastEntry.timestamp));
            const ticker = response.data.Ticker;
            
            db.run(`INSERT INTO ${ticker}_DETAILS VALUES (?, ?)`, [date, JSON.stringify(normalized)]);

        })
    }).then(() => {
        axios.get('http://finans.mynet.com/borsa/endeks/xu030-bist-30/endekshisseleri/').then(
            response => {
                const $ = cheerio.load(response.data);
                $('.fnNewDataTable tbody tr').each((i, el) => {
                    const row = $(el);
                    const cells = row.find('td');
                    const name = $(cells[0]).text().trim();
                    const lastPrice = parseFloat($(cells[2]).text().trim().replace(',', '.'));
                    const volumeLots = parseFloat($(cells[9]).text().trim()
                        .replace(/\./g, '')
                        .replace(',', '.'));
                    const volumeTL = parseFloat($(cells[10]).text().trim()
                        .replace(/\./g, '')
                        .replace(',', '.'));
    
                        
                    const stmt = db.prepare(`INSERT INTO ${name} VALUES (?, ?, ?, ?)`);
                    stmt.run(new Date().setHours(2, 0, 0, 0), lastPrice, volumeLots, volumeTL);
                    stmt.finalize();
                })
    
                db.close();
            }
        )
    })
})

