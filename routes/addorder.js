var express = require('express');
var router = express.Router();
var Sequelize = require('sequelize');
const phantom = require('phantom');

var sequelize = new Sequelize('heroku_a5572bedbd1fbe3', 'b816998663244e', 'b23209db', {
  host: 'eu-cdbr-west-01.cleardb.com',
  dialect: 'mysql',
  logging: true
  // storage: 'path/to/database.sqlite'
});

function getDateReadeble(date){
  var readebleTime;//1998-02-03 22:23:00
      readebleTime = ('00' + date.getDate()).slice(-2) + '.' +
        ('00' + (date.getMonth()+1)).slice(-2) + '.' +
        date.getFullYear();
        // ('00' + date.getSeconds()).slice(-2);
      // console.log(now);
      return readebleTime;
};

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (!req.cookies.location) {
    res.redirect('/locations');
  }
  // res.send('respond with a resource');
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
      processed: Sequelize.INTEGER,
      spicifieddate: Sequelize.DATE,
      ordered: Sequelize.INTEGER,
      postponed: Sequelize.INTEGER,
      callstatus: Sequelize.INTEGER,
      issued: Sequelize.INTEGER
    });
    orders.belongsTo(users);
    orders.belongsTo(locations);
    goods.belongsTo(orders);
    // checks.hasOne(users, { as: 'user' });
    // checks.hasOne(locations, { as: 'location' });
    sequelize.sync().then(function() {
      console.log('Success!');
      orders.max('number').then(function (lastorder) {
        // res.send()
        var orderdate = {}
        // console.log('lastorder '+lastorder);
        if (lastorder) {
          orderdate.number = lastorder + 1;
        }else{
          orderdate.number = 1;
        }
        res.render('addorder', {title: 'Добавить заказ', nowdate: getDateReadeble(now), orderdate: orderdate, err: false});
        console.log(lastorder);
      }).catch(function (err) {
        res.render('addorder', {title: 'Добавить заказ', nowdate: getDateReadeble(now), orderdate: orderdate, err: err});
      });
    }).catch(function(err) {
      console.log('Database error: ' + err);
    });
  }).catch(function(err) {
    console.log('Connection error: ' + err);
  });
});

router.get('/printorder:orderid', function(req, res, next) {
  // res.send('respond with a resource');
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
      orders.findOne({
        include: [users, locations, goods],
        where: {
          id: req.params.orderid
        }
      }).then(function (order) {
        console.log({order: order});
        res.render('printorder', {order: order});
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
  // res.send('respond with a resource');
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
    goods.belongsTo(orders);
    sequelize.sync().then(function() {
      console.log('Success!');
      users.findOne({
        where: {
          pin: req.body.yourpin,
          status: {
            $or: ['manager', 'saler']
          }
        }
      }).then(function (user) {
        if (user) {
          orders.create(
            {
              number: req.body.number,
              locationId: req.body.locationid,
              userId: user.id,
              customername: req.body.customername,
              customerphone: req.body.customerphone,
              comment: req.body.comment
            }
          ).then(function (order) {
            var newgoods = [];
            for (var i = 0; i < req.body.goods.length; i++) {
              req.body.goods[i].orderId = order.id;
            };
            newgoods = req.body.goods;
            console.log('newgoods ' + newgoods[0].orderId);
            goods.bulkCreate(newgoods).then(function (addedgoods) {
              console.log(addedgoods);
              res.send({err: false, orderid: order.id});
            }).catch(function (err) {
              res.send(err);
              console.log('goods error: ' + err);
            });
          }).catch(function (err) {
            res.send(err);
            console.log('order error: ' + err);
          });
        }else{
          res.send({
            err: 'Неверный ПИН'
          });
        }
      }).catch(function (err) {
        res.send({err: err});
      });
      // res.send(req.body);
    }).catch(function(err) {
      console.log('Database error: ' + err);
    });
  }).catch(function(err) {
    console.log('Connection error: ' + err);
  });
});

module.exports = router;