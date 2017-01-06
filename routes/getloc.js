var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');

var sequelize = new Sequelize('lustran_db', 'lustran_user', 'lustranpass', {
  host: 'localhost',
  dialect: 'mysql',
  logging: true
  // storage: 'path/to/database.sqlite'
});

/* GET users listing. */
router.post('/', function(req, res, next) {
  // res.send('respond with a resource');
  // res.render('orders');
  sequelize.authenticate().then(function() {
      console.log('Connect to DB created!');
      // res.send('Connect to DB created!');
      var locations = sequelize.define('locations', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: Sequelize.TEXT
      });
        locations.sync().then(function() {
          console.log('Success!');
          locations.findOne({
            where: {
              id: req.body.locid
            }
          }).then(function (locations) {
            res.send({err: false, locations: locations});
          }).catch(function (err) {
            console.log('locations err: ' + locations);
            res.send({err: 'locations err: ' + err});
          });
        // }).catch(function(err) {
        //   console.log('Database error: ' + err);
        //   res.send({err: 'Users err: ' + err});
        // });
      }).catch(function(err) {
        console.log('Database error: ' + err);
        res.send({err: 'Database err: ' + err});
      });
  }).catch(function(err) {
      console.log('Connection error: ' + err);
      res.send({err: 'Connection err: ' + err});
  });
});

module.exports = router;
