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

module.exports = router;
