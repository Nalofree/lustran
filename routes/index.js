var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');

var sequelize = new Sequelize('heroku_a5572bedbd1fbe3', 'b816998663244e', 'b23209db', {
  host: 'eu-cdbr-west-01.cleardb.com',
  dialect: 'mysql',
  logging: true
  // storage: 'path/to/database.sqlite'
});

function getTimeReadeble(date){
  var readebleTime;//1998-02-03 22:23:00
      readebleTime = ('00' + date.getDate()).slice(-2) + '.' +
        ('00' + (date.getMonth()+1)).slice(-2) + '.' +
        date.getFullYear() + ' ' +
        ('00' + date.getHours()).slice(-2) + ':' +
        ('00' + date.getMinutes()).slice(-2);
        // ('00' + date.getSeconds()).slice(-2);
      // console.log(now);
      return readebleTime;
};

function getDateReadeble(date){
  var readebleTime;//1998-02-03 22:23:00
      readebleTime = ('00' + date.getDate()).slice(-2) + '.' +
        ('00' + (date.getMonth()+1)).slice(-2) + '.' +
        date.getFullYear();
        // ('00' + date.getSeconds()).slice(-2);
      // console.log(now);
      return readebleTime;
};

function getTimeReadebleYesterday(date){
  var readebleTime;//1998-02-03 22:23:00
      date.setDate(date.getDate()-1);
      readebleTime = ('00' + date.getDate()).slice(-2) + '.' +
        ('00' + (date.getMonth()+1)).slice(-2) + '.' +
        date.getFullYear() + ' ' +
        ('00' + date.getHours()).slice(-2) + ':' +
        ('00' + date.getMinutes()).slice(-2);
        // ('00' + date.getSeconds()).slice(-2);
      // console.log(now);
      return readebleTime;
};
var days = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Главная' });
  // var now = new Date();
  // var late;
  // if ((now.getHours() == 9 && now.getMinutes() >= 15) || (now.getHours() > 9)) {
  //   late = 1;
  // }else{
  //   late = 0;
  // }
  // console.log("late: " + late);
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
      // var today = getTimeNow());
      // var yesterday = getTimeYesterday();
      checks.findAll({
        include: [ users, locations ],
        // include: [ locations ],
        // group: 'createdAt',
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

        // console.log(checks);
        for (var i = 0; i < checks.length; i++) {
          // console.log(getTimeReadeble(checks[i].createdAt));
          checks[i].checkTime = getTimeReadeble(checks[i].createdAt);
        };
        var now = new Date();
        var nowdate = getDateReadeble(now);
        nowdate = nowdate + ", " + days[now.getDay()];
        console.log(nowdate);
        res.render('index', { title: 'Главная', checks: checks, nowdate: nowdate });
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
          checks.findOne({
            include: [ users, locations ],
            where: {
              createdAt: {
                $lt: new Date(),
                $gt: new Date(new Date() - 24 * 60 * 60 * 1000)
              },
              userId: user.id
            }
          }).then(function (checkuser) {
            var now = new Date();
            console.log(getDateReadeble(now));
            if (checkuser && getDateReadeble(checkuser.createdAt) == getDateReadeble(now)) {
              console.log(getDateReadeble(checkuser.createdAt) + "=" + getDateReadeble(now));
              res.send({
                err: 'Вы уже отмечались сегодня'
              });
            }else{
              checks.sync().then(function() {
                console.log('Success!');
                var now = new Date();
                var late;
                if ((now.getHours() == 9 && now.getMinutes() >= 15) || (now.getHours() > 9)) {
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
                  // check.checkTime = getTimeReadeble(check.createdAt);
                  check.checkTime = getTimeReadeble(check.createdAt);
                  console.log(check.checkTime);
                  res.send({
                    err: false,
                    check: check,
                    user: user
                  });
                }).catch(function (err) {
                  res.send(err);
                  console.log('checks error: ' + err);
                });
              }).catch(function(err) {
                res.send(err);
                console.log('Database error: ' + err);
              });
            }
          }).catch(function (err) {
            res.send(err);
            console.log('checks error: ' + err);
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

router.post('/getcheckorder', function(req, res, next) {
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
    sequelize.sync().then(function() {
      console.log('Success!');
      var whereObject = {
        include: [ users, locations ],
        where: {
          createdAt: {
            $lt: new Date(req.body.enddate),
            $gt: new Date(req.body.startdate)
          }
        }
      };
      if (req.body.latesonly == 1) {
        whereObject.where.late = 1;
      }
      checks.findAll(whereObject).then(function (checks) {
        for (var i = 0; i < checks.length; i++) {
          checks[i].checkTime = getTimeReadeble(checks[i].createdAt);
        };
        var now = new Date();
        var nowdate = getDateReadeble(now);
        nowdate = nowdate + ", " + days[now.getDay()];
        console.log(nowdate);
        res.send({checks: checks, nowdate: nowdate });
      }).catch(function (err) {
        res.send({err: err, text: 'what'});
        console.log('checks error: ' + err);
      });
    }).catch(function(err) {
      res.send({err: err, text: 'what'});
      console.log('Database error: ' + err);
    });
  }).catch(function(err) {
    res.send({err: err, text: 'what'});
    console.log('Connection error: ' + err);
  });
});

module.exports = router;
