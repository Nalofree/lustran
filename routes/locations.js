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
router.get('/', function(req, res, next) {
  // res.send('respond with a resource');
  // res.send('respond with a resource');
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
        locations.findAll().then(function (locations) {
          res.render('locations', {locations:locations, title: "Места"});
        }).catch(function () {
          console.log('locations err: ' + users);
          res.send('locations err: ' + users);
        })
      }).catch(function(err) {
        console.log('Database error: ' + err);
        res.send('Database error: ' + err);
      });
  }).catch(function(err) {
      console.log('Connection error: ' + err);
      res.send('Connection error: ' + err);
  });
});

router.post('/', function(req, res, next) {
  // res.send('respond with a resource');
  // res.render('locations');
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
            if (fuser.status == "manager") {
                locations.sync().then(function() {
                  console.log('Success!');
                  locations.create({
                    name: req.body.name
                  }).then(function (locations) {
                    res.send({err: false, locations: locations});
                  }).catch(function () {
                    console.log('Users err: ' + locations);
                    res.send('Users err: ' + locations);
                  });
                }).catch(function(err) {
                  console.log('Database error: ' + err);
                  res.send('Database error: ' + err);
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

router.post('/delloc', function(req, res, next) {
  // res.send('respond with a resource');
  // res.render('locations');
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
            if (fuser.status == "manager") {
                locations.sync().then(function() {
                  console.log('Success!');
                  locations.destroy({
                    where: {
                      id: req.body.id
                    }
                  }).then(function (locations) {
                    res.send({err: false});
                  }).catch(function () {
                    console.log('Users err: ' + locations);
                    res.send('Users err: ' + locations);
                  });
                }).catch(function(err) {
                  console.log('Database error: ' + err);
                  res.send('Database error: ' + err);
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