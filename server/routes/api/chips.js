var express = require('express');
var router = express.Router();

const data = require('../../data/api/chips.json');

/* GET chips json. */
router.get('/', function(req, res, next) {
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(data));
});

module.exports = router;
