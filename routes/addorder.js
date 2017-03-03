var express = require('express');
var router = express.Router();
var models  = require('../models');
var rubles = require('rubles').rubles;
// console.log(rubles(12.10));

router.get('/', function (req, res, next) {
  if (!req.session.isauth) {
		res.redirect('/login');
	}
  if (!req.cookies.location) {
    res.redirect('/locations');
  }else{
    models.locations.findOne({
      where: {
        id: req.cookies.location
      }
    }).then(function (location) {

      models.orders.findAll().then(function (orders) {
        var numbers = [];
        function getRandomString() {
          var rendomstring;
          rendomstring = Math.random().toString(36);
          rendomstring = rendomstring.split('.')[1];
          rendomstring = rendomstring.substring(0, 4);
          return rendomstring;
        }
        for (var i = 0; i < orders.length; i++) {
          numbers.push(orders[i].number);
        }
        var ordernumber = getRandomString();;
        while (numbers.indexOf(ordernumber) >= 0) {
          ordernumber = getRandomString();
        }
        res.render('addorder', {title: 'Добавить заказ', err: false, location: location, ordernumber: ordernumber});
      }).catch(function (err) {
        console.log(err);
        res.send({err: err});
      });
      // });
    }).catch(function (err) {
      console.log('locations err: ' + err);
      res.send({err: 'locations err: ' + err});
    });

  }
});

router.post('/', function (req, res, nex) {
  // res.send("response responsed text");
  models.users.findOne({
    where: {
      pin: req.body.yourpin,
      $or: [{
        status: "manager"
      },{
        status: "saler"
      },{
        status: "supplier"
      }]
    }
  }).then(function (user) {
    if (user) {
      if (user.active == 1) {
        models.users.findOne({
          where: {
            status: 'starter'
          }
        }).then(function (starter) {
          models.orders.create({
            customername: req.body.order.customername,
            customerphone: req.body.order.customerphone,
            comment: req.body.order.comment,
            userId: user.id,
            locationId: req.body.order.locationid,
            number: req.body.order.number
          }).then(function (order) {
            // res.send({order: order});
            var goods = req.body.goods;
            for (var i = 0; i < goods.length; i++) {
              goods[i].orderId = order.id;
            }
            models.goods.bulkCreate(goods, {
              individualHooks: true
            }).then(function (goods) {
              // res.send({order: order});
              // var procarr = [];
              var goodids = [];
              var setprocessed = {
                userId: starter.id,
                // goodId:
                locationId: req.body.order.locationid,
                statusval: 0,
                alias: 'Не обработан'
              }
              var setspicdate = {
                userId: starter.id,
                // goodId:
                locationId: req.body.order.locationid,
                statusval: null,
                alias: ''
              }
              var setordered = {
                userId: starter.id,
                // goodId:
                locationId: req.body.order.locationid,
                statusval: 0,
                alias: 'Не заказан'
              }
              var setpostponed = {
                userId: starter.id,
                // goodId:
                locationId: req.body.order.locationid,
                statusval: 0,
                alias: 'Не отложен'
              }
              var setcallstatus = {
                userId: starter.id,
                // goodId:
                locationId: req.body.order.locationid,
                statusval: 0,
                alias: 'Не звонили'
              }
              var setissued = {
                userId: starter.id,
                // goodId:
                locationId: req.body.order.locationid,
                statusval: 0,
                alias: 'Не выдан'
              }
              // console.log(' : ');
              // console.log(goods);
              // console.log(' : ');
              var actions = [];
              for (var i = 0; i < goods.length; i++) {
                goodids.push(goods[i].id);
                // processed.goodId = goods[i].id;
                // spicdate.goodId = goods[i].id;
                // ordered.goodId = goods[i].id;
                // postponed.goodId = goods[i].id;
                // callstatus.goodId = goods[i].id;
                // issued.goodId = goods[i].id;
                actions.push({
                  // number: DataTypes.INTEGER,
                  locationId: req.body.order.locationid,
                  userId: user.id,
                  goodId: goods[i].id,
                  statusval: ' ',
                  alias: 'Создан товар',
                  comment: ' '
                });
              }
              console.log(actions);
              processedids = [];
              models.processed.create(setprocessed).then(function (processed) {
                models.spicdate.create(setspicdate).then(function (spicdate) {
                  models.ordered.create(setordered).then(function (ordered) {
                    models.postponed.create(setpostponed).then(function (postponed) {
                      models.callstatus.create(setcallstatus).then(function (callstatus) {
                        models.issued.create(setissued).then(function (issued) {
                          // console.log("processedId: " + processed.id);
                          // console.log("spicdateId: " + spicdate.id);
                          // console.log("orderedId: " + ordered.id);
                          // console.log("postponedId: " + postponed.id);
                          // console.log("callstatusId: " + callstatus.id);
                          // console.log("issuedId: " + issued.id);
                          models.goods.update({
                            processedId: processed.id,
                            spicdateId: spicdate.id,
                            orderedId: ordered.id,
                            postponedId: postponed.id,
                            callstatusId: callstatus.id,
                            issuedId: issued.id
                          },{
                            where: {
                              id: {
                                $in: goodids
                              }
                            }
                          }).then(function (goods) {
                            models.actions.bulkCreate(actions, {
                              individualHooks: true
                            }).then(function (actions) {
                              res.send({goods: goods, order: order});
                            }).catch(function (err) {
                              res.send({err: err});
                              console.log(err);
                            })
                          }).catch(function (err) {
                            res.send({err: err});
                            console.log(err);
                          })
                        }).catch(function (err) {
                          res.send({err: err});
                          console.log(err);
                        });
                      }).catch(function (err) {
                        res.send({err: err});
                        console.log(err);
                      });
                    }).catch(function (err) {
                      res.send({err: err});
                      console.log(err);
                    });
                  }).catch(function (err) {
                    res.send({err: err});
                    console.log(err);
                  });
                }).catch(function (err) {
                  res.send({err: err});
                  console.log(err);
                });
              }).catch(function (err) {
                res.send({err: err});
                console.log(err);
              });
              // КАК ШЕСТЬ РАЗНЫХ НАБОРОВ ЗАПИСАТЬ В ШЕСТЬ ТАБЛИЦ РАЗОМ???

            }).catch(function (err) {
              res.send({err: err});
              console.log(err);
            });
          }).catch(function (err) {
            res.send({err: err});
            console.log(err);
          });
        }).catch(function (err) {
          res.send({err: err});
          console.log(err);
        });
      }else{
        res.send({err: 'Недостаточно прав доступа'});
      }
    }else{
      res.send({err: 'Неверный ПИН'});
    }
  }).catch(function (err) {
    res.send({err: err});
    console.log(err);
  });
});

router.get('/order-:orderid', function (req, res, next) {
  // res.render('printorder', {order: order});
  models.orders.findOne({
    include: [models.users, models.locations, models.goods],
    where: {
      id: req.params.orderid
    }
  }).then(function (order) {
    var summ = 0;
    for (var i = 0; i < order.goods.length; i++) {
      summ = summ + parseFloat(order.goods[i].prepay);
    }
    res.render('printorder', {order: order, summ: rubles(summ)});
    // res.send(order);
    var origin = req.get('origin');
    console.log(origin);
  }).catch(function (err) {
    res.send(err);
    console.log('order error: ' + err);
  });
});
// var Sequelize = require('sequelize');
// const phantom = require('phantom');
//
// var sequelize = new Sequelize('heroku_a5572bedbd1fbe3', 'b816998663244e', 'b23209db', {
//   host: 'eu-cdbr-west-01.cleardb.com',
//   dialect: 'mysql',
//   logging: true
//   // storage: 'path/to/database.sqlite'
// });
//
// function getDateReadeble(date){
//   var readebleTime;//1998-02-03 22:23:00
//       readebleTime = ('00' + date.getDate()).slice(-2) + '.' +
//         ('00' + (date.getMonth()+1)).slice(-2) + '.' +
//         date.getFullYear();
//         // ('00' + date.getSeconds()).slice(-2);
//       // console.log(now);
//       return readebleTime;
// };
//
// /* GET users listing. */
// router.get('/', function(req, res, next) {
//   if (!req.cookies.location) {
//     res.redirect('/locations');
//   }
//   // res.send('respond with a resource');
//   var now = new Date();
//   sequelize.authenticate().then(function() {
//     console.log('Connect to DB created!');
//     var users = sequelize.define('users', {
//       id: {
//           type: Sequelize.INTEGER,
//           primaryKey: true,
//           autoIncrement: true
//       },
//       name: Sequelize.TEXT,
//       pin: Sequelize.TEXT,
//       status: Sequelize.TEXT,
//       active: {
//           type: Sequelize.INTEGER,
//           defaultValue: 1
//       }
//     });
//     var locations = sequelize.define('locations', {
//       id: {
//           type: Sequelize.INTEGER,
//           primaryKey: true,
//           autoIncrement: true
//       },
//       name: Sequelize.TEXT
//     });
//     var orders = sequelize.define('orders', {
//       id: {
//           type: Sequelize.INTEGER,
//           primaryKey: true,
//           autoIncrement: true
//       },
//       number: Sequelize.INTEGER,
//       locationId: Sequelize.INTEGER,
//       userId: Sequelize.INTEGER,
//       customername: Sequelize.TEXT,
//       customerphone: Sequelize.TEXT,
//       comment: Sequelize.TEXT
//     });
//     var goods = sequelize.define('goods', {
//       id: {
//           type: Sequelize.INTEGER,
//           primaryKey: true,
//           autoIncrement: true
//       },
//       article: Sequelize.TEXT,
//       name: Sequelize.TEXT,
//       orderId: Sequelize.INTEGER,
//       indicativedate: Sequelize.DATE,
//       prepayment: Sequelize.TEXT,
//       number: {
//         type: Sequelize.INTEGER,
//         defaultValue: 1
//       },
//       processed: Sequelize.INTEGER,
//       spicifieddate: Sequelize.DATE,
//       ordered: Sequelize.INTEGER,
//       postponed: Sequelize.INTEGER,
//       callstatus: Sequelize.INTEGER,
//       issued: Sequelize.INTEGER
//     });
//     orders.belongsTo(users);
//     orders.belongsTo(locations);
//     goods.belongsTo(orders);
//     // checks.hasOne(users, { as: 'user' });
//     // checks.hasOne(locations, { as: 'location' });
//     sequelize.sync().then(function() {
//       console.log('Success!');
//       orders.max('number').then(function (lastorder) {
//         // res.send()
//         var orderdate = {}
//         // console.log('lastorder '+lastorder);
//         if (lastorder) {
//           orderdate.number = lastorder + 1;
//         }else{
//           orderdate.number = 1;
//         }
//         res.render('addorder', {title: 'Добавить заказ', nowdate: getDateReadeble(now), orderdate: orderdate, err: false});
//         console.log(lastorder);
//       }).catch(function (err) {
//         res.render('addorder', {title: 'Добавить заказ', nowdate: getDateReadeble(now), orderdate: orderdate, err: err});
//       });
//     }).catch(function(err) {
//       console.log('Database error: ' + err);
//     });
//   }).catch(function(err) {
//     console.log('Connection error: ' + err);
//   });
// });
//
// router.get('/printorder:orderid', function(req, res, next) {
//   // res.send('respond with a resource');
//   var now = new Date();
//   sequelize.authenticate().then(function() {
//     console.log('Connect to DB created!');
//     var users = sequelize.define('users', {
//       id: {
//           type: Sequelize.INTEGER,
//           primaryKey: true,
//           autoIncrement: true
//       },
//       name: Sequelize.TEXT,
//       pin: Sequelize.TEXT,
//       status: Sequelize.TEXT,
//       active: {
//           type: Sequelize.INTEGER,
//           defaultValue: 1
//       }
//     });
//     var locations = sequelize.define('locations', {
//       id: {
//           type: Sequelize.INTEGER,
//           primaryKey: true,
//           autoIncrement: true
//       },
//       name: Sequelize.TEXT
//     });
//     var orders = sequelize.define('orders', {
//       id: {
//           type: Sequelize.INTEGER,
//           primaryKey: true,
//           autoIncrement: true
//       },
//       number: Sequelize.INTEGER,
//       locationId: Sequelize.INTEGER,
//       userId: Sequelize.INTEGER,
//       customername: Sequelize.TEXT,
//       customerphone: Sequelize.TEXT,
//       comment: Sequelize.TEXT
//     });
//     var goods = sequelize.define('goods', {
//       id: {
//           type: Sequelize.INTEGER,
//           primaryKey: true,
//           autoIncrement: true
//       },
//       article: Sequelize.TEXT,
//       name: Sequelize.TEXT,
//       orderId: Sequelize.INTEGER,
//       indicativedate: Sequelize.DATE,
//       prepayment: Sequelize.TEXT,
//       number: {
//         type: Sequelize.INTEGER,
//         defaultValue: 1
//       },
//       processed: {
//         type: Sequelize.INTEGER,
//         defaultValue: 0
//       },
//       spicifieddate: Sequelize.DATE,
//       ordered:  {
//         type: Sequelize.INTEGER,
//         defaultValue: 0
//       },
//       postponed:  {
//         type: Sequelize.INTEGER,
//         defaultValue: 0
//       },
//       callstatus:  {
//         type: Sequelize.INTEGER,
//         defaultValue: 0
//       },
//       issued:  {
//         type: Sequelize.INTEGER,
//         defaultValue: 0
//       },
//     });
//     orders.belongsTo(users);
//     orders.belongsTo(locations);
//     // goods.belongsTo(orders);
//     orders.hasMany(goods);
//     sequelize.sync().then(function() {
//       console.log('Success!');
//       // res.send("123");
//       orders.findOne({
//         include: [users, locations, goods],
//         where: {
//           id: req.params.orderid
//         }
//       }).then(function (order) {
//         console.log({order: order});
//         res.render('printorder', {order: order});
//       }).catch(function (err) {
//         res.send(err);
//         console.log('order error: ' + err);
//       });
//     }).catch(function(err) {
//       console.log('Database error: ' + err);
//     });
//   }).catch(function(err) {
//     console.log('Connection error: ' + err);
//   });
// });
//
// router.post('/', function(req, res, next) {
//   // res.send('respond with a resource');
//   var now = new Date();
//   sequelize.authenticate().then(function() {
//     console.log('Connect to DB created!');
//     var users = sequelize.define('users', {
//       id: {
//           type: Sequelize.INTEGER,
//           primaryKey: true,
//           autoIncrement: true
//       },
//       name: Sequelize.TEXT,
//       pin: Sequelize.TEXT,
//       status: Sequelize.TEXT,
//       active: {
//           type: Sequelize.INTEGER,
//           defaultValue: 1
//       }
//     });
//     var locations = sequelize.define('locations', {
//       id: {
//           type: Sequelize.INTEGER,
//           primaryKey: true,
//           autoIncrement: true
//       },
//       name: Sequelize.TEXT
//     });
//     var orders = sequelize.define('orders', {
//       id: {
//           type: Sequelize.INTEGER,
//           primaryKey: true,
//           autoIncrement: true
//       },
//       number: Sequelize.INTEGER,
//       locationId: Sequelize.INTEGER,
//       userId: Sequelize.INTEGER,
//       customername: Sequelize.TEXT,
//       customerphone: Sequelize.TEXT,
//       comment: Sequelize.TEXT
//     });
//     var goods = sequelize.define('goods', {
//       id: {
//           type: Sequelize.INTEGER,
//           primaryKey: true,
//           autoIncrement: true
//       },
//       article: Sequelize.TEXT,
//       name: Sequelize.TEXT,
//       orderId: Sequelize.INTEGER,
//       indicativedate: Sequelize.DATE,
//       prepayment: Sequelize.TEXT,
//       number: {
//         type: Sequelize.INTEGER,
//         defaultValue: 1
//       },
//       processed: {
//         type: Sequelize.INTEGER,
//         defaultValue: 0
//       },
//       spicifieddate: Sequelize.DATE,
//       ordered:  {
//         type: Sequelize.INTEGER,
//         defaultValue: 0
//       },
//       postponed:  {
//         type: Sequelize.INTEGER,
//         defaultValue: 0
//       },
//       callstatus:  {
//         type: Sequelize.INTEGER,
//         defaultValue: 0
//       },
//       issued:  {
//         type: Sequelize.INTEGER,
//         defaultValue: 0
//       },
//     });
//     var actions = sequelize.define('actions', {
//       id: {
//           type: Sequelize.INTEGER,
//           primaryKey: true,
//           autoIncrement: true
//       },
//       userId: Sequelize.INTEGER,
//       locationId: Sequelize.INTEGER,
//       goodId: Sequelize.INTEGER,
//       startstatus: Sequelize.TEXT,
//       endstatus: Sequelize.TEXT
//     });
//     actions.belongsTo(users);
//     actions.belongsTo(locations);
//     actions.belongsTo(goods);
//     orders.belongsTo(users);
//     orders.belongsTo(locations);
//     goods.belongsTo(orders);
//     sequelize.sync().then(function() {
//       console.log('Success!');
//       users.findOne({
//         where: {
//           pin: req.body.yourpin,
//           status: {
//             $or: ['manager', 'saler']
//           }
//         }
//       }).then(function (user) {
//         if (user) {
//           orders.create(
//             {
//               number: req.body.number,
//               locationId: req.body.locationid,
//               userId: user.id,
//               customername: req.body.customername,
//               customerphone: req.body.customerphone,
//               comment: req.body.comment
//             }
//           ).then(function (order) {
//             var newgoods = [];
//             for (var i = 0; i < req.body.goods.length; i++) {
//               req.body.goods[i].orderId = order.id;
//             };
//             newgoods = req.body.goods;
//             // console.log('newgoods ' + newgoods[0].orderId);
//             goods.bulkCreate(newgoods, {individualHooks: true}).then(function (addedgoods) {
//               // console.log('addedgoods '+addedgoods);
//               for (var i = 0; i < addedgoods.length; i++) {
//                 console.log(addedgoods[i].id);
//               }
//               // res.send({err: false, orderid: order.id});
//               actionsarr = [];
//               for (var i = 0; i < addedgoods.length; i++) {
//                 actionsarr.push({
//                   userId: user.id,
//                   locationId: req.body.locationid,
//                   statusname: 'Обработка',
//                   startstatus: 'Не обработан',
//                   endstatus: 'Не обработан',
//                   goodId: addedgoods[i].id
//                 });
//                 actionsarr.push({
//                   userId: user.id,
//                   locationId: req.body.locationid,
//                   statusname: 'Уточненная дата',
//                   startstatus: '0',
//                   endstatus: '0',
//                   goodId: addedgoods[i].id
//                 });
//                 actionsarr.push({
//                   userId: user.id,
//                   locationId: req.body.locationid,
//                   statusname: 'Заказ',
//                   startstatus: 'Не заказан',
//                   endstatus: 'Не заказан',
//                   goodId: addedgoods[i].id
//                 });
//                 actionsarr.push({
//                   userId: user.id,
//                   locationId: req.body.locationid,
//                   statusname: 'Отложен',
//                   startstatus: 'Не отложен',
//                   endstatus: 'Не отложен',
//                   goodId: addedgoods[i].id
//                 });
//                 actionsarr.push({
//                   userId: user.id,
//                   locationId: req.body.locationid,
//                   statusname: 'Дозвон',
//                   startstatus: 'Не звонили',
//                   endstatus: 'Не звонили',
//                   goodId: addedgoods[i].id
//                 });
//                 actionsarr.push({
//                   userId: user.id,
//                   locationId: req.body.locationid,
//                   statusname: 'Выдача',
//                   startstatus: 'Не выдан',
//                   endstatus: 'Не выдан',
//                   goodId: addedgoods[i].id
//                 });
//               }
//               console.log(actionsarr);
//                 actions.bulkCreate(actionsarr).then(function(newactions){
//                   res.send({err: false, orderid: order.id});
//                 }).catch(function(err){
//                   res.send(err);
//                   console.log('actions error: ' + err);
//                 });
//             }).catch(function (err) {
//               res.send(err);
//               console.log('goods error: ' + err);
//             });
//           }).catch(function (err) {
//             res.send(err);
//             console.log('order error: ' + err);
//           });
//         }else{
//           res.send({
//             err: 'Неверный ПИН'
//           });
//         }
//       }).catch(function (err) {
//         res.send({err: err});
//       });
//       // res.send(req.body);
//     }).catch(function(err) {
//       console.log('Database error: ' + err);
//     });
//   }).catch(function(err) {
//     console.log('Connection error: ' + err);
//   });
// });

module.exports = router;
