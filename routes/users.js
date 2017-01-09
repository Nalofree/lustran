var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');

var sequelize = new Sequelize('heroku_a5572bedbd1fbe3', 'b816998663244e', 'b23209db', {
  host: 'eu-cdbr-west-01.cleardb.com',
  dialect: 'mysql',
  logging: true
  // storage: 'path/to/database.sqlite'
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (!req.cookies.location) {
    res.redirect('/locations');
  }
  // res.send('respond with a resource');
  sequelize.authenticate().then(function() {
      console.log('Connect to DB created!');
      // res.send('Connect to DB created!');
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
        users.findAll().then(function (users) {
          // res.send(users);
          res.render('users', {users: users, title: "Пользователи"});
        }).catch(function () {
          console.log('Users err: ' + users);
          res.send('Users err: ' + users);
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
  function randomPin(min, max)
  {
    var pin = "", pinElem;
    for (var i = 0; i < 4; i++) {
      pinElem = Math.floor(Math.random() * (max - min + 1)) + min;
      pin += pinElem;
    }
    return pin;
  }
  sequelize.authenticate().then(function() {
      console.log('Connect to DB created!');
      // res.send('Connect to DB created!');
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
              var randomUserPin = randomPin(0,9);
              users.findAll().then(function (fusers) {
                var pins = [];
                for (var i = 0; i < fusers.length; i++) {
                  pins.push(fusers[i].pin);
                }
                console.log(pins);
                while (pins.indexOf(randomUserPin) > 0) {
                  randomUserPin = randomPin(0,9);
                }
                users.create({
                  name: req.body.fio,
                  status: req.body.status,
                  active: 1,
                  pin: randomUserPin
                }).then(function (users) {
                  res.send({err: false, user: users});
                }).catch(function () {
                  console.log('Users err: ' + users);
                  res.send('Users err: ' + users);
                });
              }).catch(function () {
                console.log('Users err: ' + users);
                res.send('Users err: ' + users);
              });
            }else{
              res.redirect("/accesserror");
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

router.post('/banuser', function(req, res, next) {
  sequelize.authenticate().then(function() {
      console.log('Connect to DB created!');
      // res.send('Connect to DB created!');
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
              users.update({
                  active: 0
                },{
                  where: {id: req.body.userid}
                }
              ).then(function () {
                res.send({err: false})
              }).catch(function () {
                res.send({err: true})
              })
            }else{
              res.send({err: 'Ошибка доступа, недостаточно прав'});
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

router.post('/unbanuser', function(req, res, next) {
  sequelize.authenticate().then(function() {
      console.log('Connect to DB created!');
      // res.send('Connect to DB created!');
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
              users.update({
                  active: 1
                },{
                  where: {id: req.body.userid}
                }
              ).then(function () {
                res.send({err: false})
              }).catch(function () {
                res.send({err: true})
              })
            }else{
              res.send({err: 'Ошибка доступа, недостаточно прав'});
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

router.post('/updateuser', function(req, res, next) {
  sequelize.authenticate().then(function() {
      console.log('Connect to DB created!');
      // res.send('Connect to DB created!');
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
        users.sync().then(function() {
          console.log('Success!');
          users.findOne({
            where: {
              pin: req.body.yourpin
            }
          }).then(function (fuser) {
            if (fuser) {
              if (fuser.status == "manager") {
                users.update({
                    name: req.body.fio,
                    status: req.body.status
                  },{
                    where: {id: req.body.userid}
                  }
                ).then(function (user) {
                  res.send({err: false, user: user});
                }).catch(function () {
                  res.send({err: true});
                });
              }else{
                res.send({err: 'Ошибка доступа, недостаточно прав'});
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
        console.log('Database error: ' + err);
        res.send('Database error: ' + err);
      });
  }).catch(function(err) {
      console.log('Connection error: ' + err);
      res.send('Connection error: ' + err);
  });
});

module.exports = router;
