var express = require('express');
var router = express.Router();

const data = require('../../data/api/chips.json');

/* GET simulation_data.json. */
router.get('/', function(req, res, next) {
    res.header("Content-Type",'application/json');
    res.send("{'error': 'Incomplete functionality!'}");
});

module.exports = router;
