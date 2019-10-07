const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(bodyParser.json());

const router = express.Router();

let count = 0;

router.get('/', (req, res, next) => {
    try {
        res.json({ data: 'hello' });
    } catch (e) {
        res.status(500).json({message: e.message || 'Something went wrong. Please, try again'});
    }
});

app.use('/', router);

app.listen(3050, (err) => {
    if (err) {
        throw err;
    }
    console.info('Server is listening on port 3050');
});