var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');

var sequelize = new Sequelize('heroku_a5572bedbd1fbe3', 'b816998663244e', 'b23209db', {
  host: 'localhost',
  dialect: 'mysql',
  logging: true
  // storage: 'path/to/database.sqlite'
});

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Главная' });
  sequelize.authenticate().then(function() {
    console.log('Connect to DB created!');
    var checks = sequelize.define('checks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      locationId: Sequelize.INTEGER,
      userId: Sequelize.INTEGER,
      late: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
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
    var locations = sequelize.define('locations', {
      id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      name: Sequelize.TEXT
    });
    checks.belongsTo(users);
    checks.belongsTo(locations);
    // checks.hasOne(users, { as: 'user' });
    // checks.hasOne(locations, { as: 'location' });
    sequelize.sync().then(function() {
      console.log('Success!');
      function getTimeReadeble(date){
        var readebleTime;//1998-02-03 22:23:00
            readebleTime = date.getFullYear() + '-' +
              ('00' + (date.getMonth()+1)).slice(-2) + '-' +
              ('00' + date.getDate()).slice(-2) + ' ' +
              ('00' + date.getHours()).slice(-2) + ':' +
              ('00' + date.getMinutes()).slice(-2);
              // ('00' + date.getSeconds()).slice(-2);
            // console.log(now);
            return readebleTime;
      };
      function getTimeReadebleYesterday(date){
        var readebleTime;//1998-02-03 22:23:00
            date.setDate(date.getDate()-1);
            readebleTime = now.getFullYear() + '-' +
              ('00' + (date.getMonth()+1)).slice(-2) + '-' +
              ('00' + date.getDate()).slice(-2) + ' ' +
              ('00' + date.getHours()).slice(-2) + ':' +
              ('00' + date.getMinutes()).slice(-2);
              // ('00' + date.getSeconds()).slice(-2);
            // console.log(now);
            return readebleTime;
      };
      // var today = getTimeNow());
      // var yesterday = getTimeYesterday();
      checks.findAll({
        include: [ users, locations ],
        // include: [ locations ],
        where: {
          createdAt: {
            $lt: new Date(),
            $gt: new Date(new Date() - 24 * 60 * 60 * 1000)
          }
        }
      }).then(function (checks) {
        // res.send(checks);
        // var now = Date();
        // console.log(now.toString());

        console.log(checks);
        for (var i = 0; i < checks.length; i++) {
          console.log(getTimeReadeble(checks[i].createdAt));
          checks[i].checkTime = getTimeReadeble(checks[i].createdAt);
        }
        res.render('index', { title: 'Главная', checks: checks });
      }).catch(function (err) {
        res.send({err: err, text: 'what'});
        console.log('checks error: ' + err);
      });
    }).catch(function(err) {
      console.log('Database error: ' + err);
    });
  }).catch(function(err) {
    console.log('Connection error: ' + err);
  });
});

router.post('/', function(req, res, next) {
  // res.render('index', { title: 'Главная' });
  sequelize.authenticate().then(function() {
    console.log('Connect to DB created!');
    var checks = sequelize.define('checks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      locationId: Sequelize.INTEGER,
      userId: Sequelize.INTEGER,
      late: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
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
    var locations = sequelize.define('locations', {
      id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      name: Sequelize.TEXT
    });
    checks.belongsTo(users);
    checks.belongsTo(locations);
    // checks.hasOne(users, { as: 'user' });
    // checks.hasOne(locations, { as: 'location' });
    users.sync().then(function() {
      console.log('Success!');
      users.findOne({
        where: {
          pin: req.body.yourpin
        }
      }).then(function (user) {
        // res.send(users);
        //res.render('users', {users: users, title: "Пользователи"});
        if (user) {
          checks.sync().then(function() {
            console.log('Success!');
            var now = new Date();
            var late;
            if ((now.getHours == 9 && now.getMinutes >= 15) || (now.getHours > 9) || (now.getHours < 7)) {
              late = 1;
            }else{
              late = 0;
            }
            checks.create({
              locationId: req.body.locid,
              userId: user.id,
              late: late,
              include: [ users, locations ]
            }).then(function (check) {
              // res.send(checks);
              res.send({
                check: check,
                user: user
              });
            }).catch(function (err) {
              res.send(err);
              console.log('checks error: ' + err);
            });
          }).catch(function(err) {
            console.log('Database error: ' + err);
          });
        }else{
          res.send({
            err: 'Неверный пин'
          });
        }
      }).catch(function (err) {
        console.log('Users err: ' + err);
        res.send('Users err: ' + err);
      })
    }).catch(function(err) {
      console.log('Database error: ' + err);
      res.send('Database error: ' + err);
    });
  }).catch(function(err) {
    console.log('Connection error: ' + err);
  });
});

module.exports = router;
