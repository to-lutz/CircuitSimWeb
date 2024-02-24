var express = require('express');
var router = express.Router();

const data = require('../../data/api/chips.json');

/* POST simulation_data.json. */
router.post('/', function(req, res, next) {
    console.log(req.body);
    res.header("Content-Type",'application/json');
    res.send("{'error': 'Incomplete functionality!'}");
});

module.exports = router;
