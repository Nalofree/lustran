var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');

var sequelize = new Sequelize('heroku_a5572bedbd1fbe3', 'b816998663244e', 'b23209db', {
  host: 'localhost',
  dialect: 'mysql',
  logging: true
  // storage: 'path/to/database.sqlite'
});

router.post('/', function(req, res, next) {
  // res.send('respond with a resource');
  // res.render('locations');
  sequelize.authenticate().then(function() {
      console.log('Connect to DB created!');
      var users = sequelize.define('users', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: Sequelize.TEXT,
        pin: Sequelize.TEXT,
        status: Sequelize.TEXT,
        active: {
            type: Sequelize.INTEGER,
            defaultValue: 1
        }
      });
      users.sync().then(function() {
        console.log('Success!');
        users.findOne({
          where: {
            pin: req.body.yourpin
          }
        }).then(function (fuser) {
          if (fuser) {
            if (fuser.status == req.body.status) {
              res.send({
                err: false,
                user: fuser
              });
            }else{
              res.send({err: 'Ошибка прав доступа, недостаточно прав'});
            }
          }else{
            res.send({err: 'Неверный пин'});
          }
        }).catch(function (fuser) {
          console.log('Users err: ' + fuser);
          res.send('Users err: ' + fuser);
        });
      }).catch(function(err) {
        console.log('Database error: ' + err);
        res.send('Database error: ' + err);
      });
  }).catch(function(err) {
      console.log('Connection error: ' + err);
      res.send('Connection error: ' + err);
  });
});


module.exports = router;
