var express = require('express');
var router = express.Router();
var models  = require('../models');

router.post('/', function(req, res, next) {
  models.locations.findOne({
    where: {
      id: req.body.locid
    }
  }).then(function (locations) {
    res.send({err: false, locations: locations});
  }).catch(function (err) {
    console.log('locations err: ' + locations);
    res.send({err: 'locations err: ' + err});
  });
});

module.exports = router;
