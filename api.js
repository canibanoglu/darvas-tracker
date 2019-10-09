const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(bodyParser.json());

const router = express.Router();

router.get('/', (req, res, next) => {
    try {
        const { ticker,  } = req.query;

        if (!ticker) throw new Error('No ticker supplied');
        
        const db = new sqlite3.Database('bist30Prics.db');
        db.serialize(() => {
            db.all(`SELECT * FROM ${ticker} ORDER BY date DESC LIMIT 20`, (err, rows) => {
                res.json({ data: rows });
                db.close();
            })
        })
    } catch (e) {
        res.status(500).json({message: e.message || 'Something went wrong. Please, try again'});
    }
});

app.use('/', router);

app.listen(12986, (err) => {
    if (err) {
        throw err;
    }
    console.info('Server is listening on port 12986');
});