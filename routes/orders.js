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
  var now = new Date();
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
    var locations = sequelize.define('locations', {
      id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      name: Sequelize.TEXT
    });
    var orders = sequelize.define('orders', {
      id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      number: Sequelize.INTEGER,
      locationId: Sequelize.INTEGER,
      userId: Sequelize.INTEGER,
      customername: Sequelize.TEXT,
      customerphone: Sequelize.TEXT,
      comment: Sequelize.TEXT
    });
    var goods = sequelize.define('goods', {
      id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      article: Sequelize.TEXT,
      name: Sequelize.TEXT,
      orderId: Sequelize.INTEGER,
      indicativedate: Sequelize.DATE,
      prepayment: Sequelize.TEXT,
      number: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      processed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      spicifieddate: Sequelize.DATE,
      ordered:  {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      postponed:  {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      callstatus:  {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      issued:  {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
    });
    orders.belongsTo(users);
    orders.belongsTo(locations);
    // goods.belongsTo(orders);
    orders.hasMany(goods);
    sequelize.sync().then(function() {
      console.log('Success!');
      // res.send("123");
      orders.findAll({
        include: [users, locations, goods]
      }).then(function (forders) {
        console.log({orders: forders});
        res.render('orders', {orders: forders});
        // res.send({order: order});
      }).catch(function (err) {
        res.send(err);
        console.log('order error: ' + err);
      });
    }).catch(function(err) {
      console.log('Database error: ' + err);
    });
  }).catch(function(err) {
    console.log('Connection error: ' + err);
  });
});

router.post('/', function(req, res, next) {
  if (!req.cookies.location) {
    res.redirect('/locations');
  }
  var now = new Date();
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
    var locations = sequelize.define('locations', {
      id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      name: Sequelize.TEXT
    });
    var orders = sequelize.define('orders', {
      id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      number: Sequelize.INTEGER,
      locationId: Sequelize.INTEGER,
      userId: Sequelize.INTEGER,
      customername: Sequelize.TEXT,
      customerphone: Sequelize.TEXT,
      comment: Sequelize.TEXT
    });
    var goods = sequelize.define('goods', {
      id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      article: Sequelize.TEXT,
      name: Sequelize.TEXT,
      orderId: Sequelize.INTEGER,
      indicativedate: Sequelize.DATE,
      prepayment: Sequelize.TEXT,
      number: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      processed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      spicifieddate: Sequelize.DATE,
      ordered:  {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      postponed:  {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      callstatus:  {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      issued:  {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
    });
    var actions = sequelize.define('actions', {
      id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      userId: Sequelize.INTEGER,
      locationId: Sequelize.INTEGER,
      goodId: Sequelize.INTEGER,
      startstatus: Sequelize.TEXT,
      endstatus: Sequelize.TEXT
    });
    orders.belongsTo(users);
    orders.belongsTo(locations);
    actions.belongsTo(users);
    actions.belongsTo(locations);
    actions.belongsTo(goods);
    // goods.belongsTo(orders);
    orders.hasMany(goods);
    sequelize.sync().then(function() {
      console.log('Success!');
      // res.send("123");
      goods.findOne({
        where: {
          id: req.body.goodid
        }
      }).then(function (good) {
        function getStatusNmae(statustype, statusval) {
          var statusname;
          switch (statustype) {
            case 'processed':
            if (statusval == 0) {
              statusname = "Не обработан";
            }else if(statusval == 1){
              statusname = "В обработке";
            }else{
              statusname = "Обработан";
            }
            break;
            case 'ordered':
            if (statusval == 0) {
              statusname = "Не заказан";
            }else{
              statusname = "Заказан";
            }
            break;
            case 'spicifieddate':
            statusname = new Date(statusval);
            break;
            case 'postponed':
            if (statusval == 0) {
              statusname = "Не отложен";
            }else if(statusval == 1){
              statusname = "Проверен и отложен";
            }else{
              statusname = "Есть деффект";
            }
            break;
            case 'callstatus':
            if (statusval == 0) {
              statusname = "Не звонили";
            }else if(statusval == 1){
              statusname = "Не дозвон";
            }else{
              statusname = "Дозвон";
            }
            break;
            case 'issued':
            if (statusval == 0) {
              statusname = "Не выдвн";
            }else{
              statusname = "Выдвн";
            }
            break;
          }
        }
        var goodupdatedata = {};
        var roles = [];
        var actiondata = {};
        switch (req.body.statustype) {
          case 'processed':
          googupdatedata = {
            processed: req.body.statusval
          };
          roles=['manager', 'supplier'];
          actiondata = {

          }
          break;
          case 'ordered':
          googupdatedata = {
            ordered: req.body.statusval
          };
          roles=['supplier','supplier'];
          actiondata = {

          }
          break;
          case 'spicifieddate':
          googupdatedata = {
            spicifieddate: req.body.statusval
          };
          roles=['supplier','supplier'];
          actiondata = {

          }
          break;
          case 'postponed':
          googupdatedata = {
            postponed: req.body.statusval
          };
          roles=['saler','saler'];
          actiondata = {

          }
          break;
          case 'callstatus':
          googupdatedata = {
            callstatus: req.body.statusval
          };
          roles=['saler','supplier'];
          actiondata = {

          }
          break;
          case 'issued':
          googupdatedata = {
            issued: req.body.statusval
          };
          roles=['saler', 'saler'];
          actiondata = {

          }
          break;
        };
        console.log(googupdatedata);
        users.findOne({
          where: {
            pin: req.body.yourpin,
            status: {
              $or: roles
            }
          }
        }).then(function (user) {
          if (user) {
            goods.update(googupdatedata, {
              where: {
                id: req.body.goodid
              }
            }).then(function (goods) {
              res.send({err:false});
            }).catch(function (err) {
              res.send(err);
            });
          }else{
            res.send({err: 'Неверный ПИН'});
          }
        }).catch(function (err) {
          res.send({err: err});
        });
      }).catch(function (err) {
        res.send({err: err});
        console.log('Database error: ' + err);
      })
    }).catch(function(err) {
      res.send({err: err});
      console.log('Database error: ' + err);
    });
  }).catch(function(err) {
    res.send({err: err});
    console.log('Connection error: ' + err);
  });
});

module.exports = router;
